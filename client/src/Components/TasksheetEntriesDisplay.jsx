import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Paper,
  Typography,
  Button,
  ButtonGroup,
  CircularProgress,
  Stack,
  Snackbar,
  Alert,
  Box,
  Tooltip
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import dayjs from "dayjs";
import { api } from "../utils/api";

const TasksheetEntriesDisplay = forwardRef(({
  userId,
  onEdit,
  onDeleteSuccess,
  searchQuery = '',
  filterRange = 'TODAY',
  showFilters = false,
  showColumnMenu = false,
  onFiltersChange,
  onColumnMenuChange
}, ref) => {

  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // filterRange is now passed as prop
  const [projects, setProjects] = useState([]);
  const [taskCategories, setTaskCategories] = useState([]);
const [showToast, setShowToast] = useState(false);
  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/api/tasksheetEntries/user/${userId}`);
      const sortedEntries = res.data
        .map((entry) => ({
          ...entry,
          entry_date: dayjs(entry.entry_date).format("YYYY-MM-DDTHH:mm:ss"),
          created_at: dayjs(entry.created_at),
        }))
        .sort((a, b) => b.created_at.valueOf() - a.created_at.valueOf());
      setEntries(sortedEntries);
    } catch (err) {
      console.error("Failed to fetch tasksheet entries", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useImperativeHandle(ref, () => ({
    refreshEntries: fetchEntries,
  }));

  const fetchReferenceData = async () => {
    try {
      const [projectRes, categoryRes] = await Promise.all([
        api.get("/api/projects"),
        api.get("/api/taskCategories"),
      ]);
      setProjects(projectRes.data);
      setTaskCategories(categoryRes.data);
    } catch (error) {
      console.error("Error fetching reference data:", error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [userId]);

  // applyDateFilter is now handled by parent component

  const getProjectName = (id) => {
    const project = projects.find((p) => String(p.id) === String(id));
    return project ? project.name : `Unknown (${id})`;
  };

  const getCategoryName = (id) => {
    const category = taskCategories.find((c) => String(c.id) === String(id));
    return category ? category.name : `Unknown (${id})`;
  };

  const getFilteredEntries = () => {
    const now = dayjs();
    let filtered = [];

    // First apply date filter
    switch (filterRange) {
      case "TODAY":
        filtered = entries.filter((e) =>
          dayjs(e.entry_date).isSame(now, "day")
        );
        break;
      case "WEEK":
        filtered = entries.filter((e) =>
          dayjs(e.entry_date).isAfter(now.subtract(7, "day"))
        );
        break;
      case "MONTH":
        filtered = entries.filter((e) =>
          dayjs(e.entry_date).isAfter(now.subtract(1, "month"))
        );
        break;
      case "3MONTH":
        filtered = entries.filter((e) =>
          dayjs(e.entry_date).isAfter(now.subtract(3, "month"))
        );
        break;
      case "6MONTH":
        filtered = entries.filter((e) =>
          dayjs(e.entry_date).isAfter(now.subtract(6, "month"))
        );
        break;
      default:
        filtered = [...entries];
        break;
    }

    // Then apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((entry) => {
        const projectName = getProjectName(entry.project_id).toLowerCase();
        const categoryName = getCategoryName(entry.task_category_id).toLowerCase();
        const taskName = (entry.task_name || '').toLowerCase();
        const comments = (entry.comments || '').toLowerCase();

        return (
          projectName.includes(query) ||
          categoryName.includes(query) ||
          taskName.includes(query) ||
          comments.includes(query)
        );
      });
    }

    return filtered.sort(
      (a, b) => dayjs(b.entry_date).valueOf() - dayjs(a.entry_date).valueOf()
    );
  };

  // Define DataGrid columns
  const columns = [
    {
      field: 'entry_date',
      headerName: 'Date',
      width: 120,
      valueFormatter: (value) => dayjs(value).format('DD MMM YYYY'),
      sortable: true,
    },
    {
      field: 'project_name',
      headerName: 'Project Name',
      width: 200,
      valueGetter: (value, row) => getProjectName(row.project_id),
      sortable: true,
    },
    {
      field: 'category_name',
      headerName: 'Task Category',
      width: 150,
      valueGetter: (value, row) => getCategoryName(row.task_category_id),
      sortable: true,
    },
    {
      field: 'task_name',
      headerName: 'Task Details',
      width: 300,
      sortable: true,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Box sx={{ whiteSpace: 'pre-line', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {params.value}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: 'total_time',
      headerName: 'Total Efforts',
      width: 120,
      valueGetter: (value, row) => `${Math.floor(row.hours)}:${row.minutes.toString().padStart(2, '0')}`,
      sortable: true,
    },
    {
      field: 'comments',
      headerName: 'Comments',
      width: 200,
      sortable: true,
      renderCell: (params) => (
        <Tooltip title={params.value || ''}>
          <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {params.value || ''}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <ButtonGroup variant="text" size="small">
          <Button
            onClick={() => handleEdit(params.row)}
            sx={{ px: 2, py: 1, minHeight: '32px' }}
          >
            Edit
          </Button>
          <Button
            color="error"
            onClick={() => handleDelete(params.row)}
            sx={{ px: 2, py: 1, minHeight: '32px' }}
          >
            Delete
          </Button>
        </ButtonGroup>
      ),
    },
  ];

  const handleEdit = (entry) => {
  if (onEdit) {
    onEdit(entry); // delegate to parent
  }
};


  const handleDelete = async (entry) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the entry dated ${dayjs(entry.entry_date).format("DD MMM YYYY")}?`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/tasksheetEntries/${entry.id}`);
      await fetchEntries(); // refresh grid
      if (onDeleteSuccess) {
        onDeleteSuccess(); // notify parent
      } else {
        setShowToast(true); // fallback to local toast
      }
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  };

  return (
    <>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading entries...
          </Typography>
        </Box>
      ) : (
        <Paper
          sx={{
            mt: 0,
            borderRadius: '0 0 12px 12px',
            border: '1px solid #f0f0f0',
            borderTop: 'none',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            backgroundColor: '#ffffff'
          }}
        >
          <DataGrid
            rows={getFilteredEntries()}
            columns={columns}
            autoHeight
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
            pageSizeOptions={[10, 25, 50, 100]}
            filterMode="client"
            disableColumnFilter={!showFilters}
            disableColumnSelector={!showColumnMenu}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 25,
                },
              },
              filter: {
                filterModel: {
                  items: [],
                },
              },
              columns: {
                columnVisibilityModel: {},
              },
            }}
            slots={{
              toolbar: showFilters || showColumnMenu ? GridToolbarContainer : null,
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: false,
                showExport: true,
              },
            }}
            sx={{
              border: 'none',
              backgroundColor: '#ffffff',
              '& .MuiDataGrid-main': {
                backgroundColor: '#ffffff',
              },
              '& .MuiDataGrid-virtualScroller': {
                backgroundColor: '#ffffff',
              },
              '& .MuiDataGrid-cell': {
                fontSize: '0.875rem',
                py: 1,
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
              },
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: '#f8fafc',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              },
              '& .MuiDataGrid-row': {
                backgroundColor: '#ffffff',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f5f5f5',
              },
              '& .MuiDataGrid-footer': {
                borderTop: '1px solid #f0f0f0',
                backgroundColor: '#ffffff',
              },
              // Sticky Actions column
              '& .MuiDataGrid-columnHeader[data-field="actions"]': {
                position: 'sticky',
                right: 0,
                backgroundColor: '#f8fafc',
                zIndex: 1,
                borderLeft: '1px solid #f0f0f0',
              },
              '& .MuiDataGrid-cell[data-field="actions"]': {
                position: 'sticky',
                right: 0,
                backgroundColor: '#ffffff',
                zIndex: 1,
                borderLeft: '1px solid #f0f0f0',
              },
              '& .MuiDataGrid-row:hover .MuiDataGrid-cell[data-field="actions"]': {
                backgroundColor: '#f5f5f5',
              },
            }}
            slots={{
              noRowsOverlay: () => (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '200px'
                }}>
                  <Typography variant="body1">
                    No entries found for this period.
                  </Typography>
                </Box>
              ),
            }}
          />
        </Paper>
      )}
      <Snackbar
  open={showToast}
  autoHideDuration={3000}
  onClose={() => setShowToast(false)}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
>
  <Alert onClose={() => setShowToast(false)} severity="success" sx={{ width: '100%' }}>
    Deleted Successfully
  </Alert>
</Snackbar>
    </>
  );
});

export default TasksheetEntriesDisplay;
