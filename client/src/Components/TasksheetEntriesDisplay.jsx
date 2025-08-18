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
  activeFilters = {},
  showFilters = false,
  showColumnMenu = false,
  showDataGridFilters = false,
  onFiltersChange,
  onColumnMenuChange
}, ref) => {

  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const apiRef = useGridApiRef();
  // filterRange is now passed as prop
  const [projects, setProjects] = useState([]);
  const [taskCategories, setTaskCategories] = useState([]);
const [showToast, setShowToast] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    entry_date: true,
    project_name: true,
    category_name: true,
    task_name: true,
    total_time: true,
    comments: true,
    actions: true,
  });
  const [sortModel, setSortModel] = useState([{ field: 'entry_date', sort: 'desc' }]);
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

  // Handle DataGrid filter panel visibility
  useEffect(() => {
    if (apiRef.current) {
      if (showDataGridFilters) {
        apiRef.current.showFilterPanel();
      } else {
        apiRef.current.hideFilterPanel();
      }
    }
  }, [showDataGridFilters]);

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

    // Apply advanced filters
    if (activeFilters) {
      // Date range filter
      if (activeFilters.dateRange?.from || activeFilters.dateRange?.to) {
        filtered = filtered.filter((entry) => {
          const entryDate = dayjs(entry.entry_date);
          const fromDate = activeFilters.dateRange?.from ? dayjs(activeFilters.dateRange.from) : null;
          const toDate = activeFilters.dateRange?.to ? dayjs(activeFilters.dateRange.to) : null;

          if (fromDate && entryDate.isBefore(fromDate, 'day')) return false;
          if (toDate && entryDate.isAfter(toDate, 'day')) return false;
          return true;
        });
      }

      // Hours range filter
      if (activeFilters.hoursRange?.min || activeFilters.hoursRange?.max) {
        filtered = filtered.filter((entry) => {
          const totalHours = entry.hours + (entry.minutes / 60);
          const minHours = parseFloat(activeFilters.hoursRange?.min) || 0;
          const maxHours = parseFloat(activeFilters.hoursRange?.max) || Infinity;

          return totalHours >= minHours && totalHours <= maxHours;
        });
      }

      // Project filter (if needed later)
      if (activeFilters.projects?.length > 0) {
        filtered = filtered.filter((entry) =>
          activeFilters.projects.includes(entry.project_id)
        );
      }

      // Category filter (if needed later)
      if (activeFilters.categories?.length > 0) {
        filtered = filtered.filter((entry) =>
          activeFilters.categories.includes(entry.task_category_id)
        );
      }
    }

    return filtered.sort(
      (a, b) => dayjs(b.entry_date).valueOf() - dayjs(a.entry_date).valueOf()
    );
  };

  // Export to CSV functionality
  const exportToCSV = () => {
    const filteredData = getFilteredEntries();
    const csvHeaders = ['Date', 'Project Name', 'Task Category', 'Task Details', 'Total Efforts', 'Comments'];
    const csvData = filteredData.map(entry => [
      dayjs(entry.entry_date).format('DD MMM YYYY'),
      getProjectName(entry.project_id),
      getCategoryName(entry.task_category_id),
      entry.task_name?.replace(/\n/g, ' ') || '',
      `${Math.floor(entry.hours)}:${entry.minutes.toString().padStart(2, '0')}`,
      entry.comments?.replace(/\n/g, ' ') || ''
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasksheet-entries-${dayjs().format('YYYY-MM-DD')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Column management
  const toggleColumnVisibility = (field) => {
    setColumnVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Expose functions to parent
  React.useImperativeHandle(ref, () => ({
    refreshEntries: fetchEntries,
    exportToCSV,
    toggleColumnVisibility,
    columnVisibility,
  }), [fetchEntries, columnVisibility]);

  // Define DataGrid columns
  const columns = [
    {
      field: 'entry_date',
      headerName: 'Date',
      width: 120,
      type: 'date',
      valueFormatter: (value) => dayjs(value).format('DD MMM YYYY'),
      sortable: true,
      filterable: true,
      hide: !columnVisibility.entry_date,
    },
    {
      field: 'project_name',
      headerName: 'Project Name',
      width: 200,
      type: 'string',
      valueGetter: (value, row) => getProjectName(row.project_id),
      sortable: true,
      filterable: true,
      hide: !columnVisibility.project_name,
    },
    {
      field: 'category_name',
      headerName: 'Task Category',
      width: 150,
      type: 'string',
      valueGetter: (value, row) => getCategoryName(row.task_category_id),
      sortable: true,
      filterable: true,
      hide: !columnVisibility.category_name,
    },
    {
      field: 'task_name',
      headerName: 'Task Details',
      width: 300,
      type: 'string',
      sortable: true,
      filterable: true,
      hide: !columnVisibility.task_name,
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
      type: 'string',
      valueGetter: (value, row) => `${Math.floor(row.hours)}:${row.minutes.toString().padStart(2, '0')}`,
      sortable: true,
      filterable: true,
      hide: !columnVisibility.total_time,
    },
    {
      field: 'comments',
      headerName: 'Comments',
      width: 200,
      type: 'string',
      sortable: true,
      filterable: true,
      hide: !columnVisibility.comments,
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
      hide: !columnVisibility.actions,
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
            ref={apiRef}
            rows={getFilteredEntries()}
            columns={columns}
            autoHeight
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
            pageSizeOptions={[10, 25, 50, 100]}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            filterMode="client"
            slotProps={{
              filterPanel: {
                sx: {
                  width: 400,
                  '& .MuiDataGrid-filterForm': {
                    padding: 2,
                  },
                  '& .MuiDataGrid-filterFormDeleteIcon': {
                    color: '#d32f2f',
                  },
                  '& .MuiDataGrid-filterFormAddIcon': {
                    color: '#1976d2',
                  },
                },
              },
            }}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 25,
                },
              },
              sorting: {
                sortModel: [{ field: 'entry_date', sort: 'desc' }],
              },
              filter: {
                filterModel: {
                  items: [],
                },
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
