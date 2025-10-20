import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { DataGrid, QuickFilter, QuickFilterTrigger, QuickFilterControl, QuickFilterClear, ToolbarButton, useGridApiRef } from '@mui/x-data-grid';
import { api } from '../utils/api';
import {Tooltip, Button,  Paper, Snackbar , Alert, Box } from '@mui/material';
const TasksheetEntriesDisplay = forwardRef(({
  entries: entriesProp = null,
  users = [],
  selectedProjects = [],
  selectedCategories = [],
  dateFrom,
  dateTo,
  search,
  userId = '',
  activeFilters = {},
  singleFilter = {},
  onEdit,
  onDeleteSuccess,
  columnVisibility = {},
  onColumnVisibilityChange,
  showActions = false,
  showFilters = false,
  showColumnMenu = false,
  onFiltersChange,
  onColumnMenuChange
  ,
  showResource = true,
}, ref) => {
  const [entries, setEntries] = useState(entriesProp || []);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [taskCategories, setTaskCategories] = useState([]);
  const [fetchedUsers, setFetchedUsers] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [sortModel, setSortModel] = useState([{ field: 'entry_date', sort: 'desc' }]);
  const apiRef = useGridApiRef();
  useEffect(() => {
    fetchReferenceData();
  }, []);

  // Fetch entries for the given userId when provided (child can refresh itself)
  const fetchEntries = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/api/tasksheetEntries/user/${userId}`);
      let payload = res.data;
      if (!payload) payload = [];
      if (payload && payload.rows && Array.isArray(payload.rows)) payload = payload.rows;
      if (payload && payload.data && Array.isArray(payload.data)) payload = payload.data;
      if (!Array.isArray(payload)) payload = [];
      // normalize incoming rows slightly (user_name fallback, ensure hours/minutes)
      const normalized = payload.map((e) => {
        // try to resolve the resource name using available user lists (getResourceName will fallback to id if necessary)
        const userName = e.user_name || e.name || e.username || (e.user && (e.user.name || e.user.username)) || getResourceName(e);
        const hours = Number(e.hours || e.h || e.total_hours || 0);
        const minutes = Number(e.minutes || e.m || 0);
        // if total_hours is present as decimal (e.g. 1.5) convert to hours/minutes
        if ((!e.hours && !e.minutes) && e.total_hours) {
          const total = Number(e.total_hours);
          const h = Math.floor(total);
          const m = Math.round((total - h) * 60);
          return { ...e, user_name: userName, hours: h, minutes: m };
        }
        return { ...e, user_name: userName, hours, minutes };
      });
      setEntries(normalized);
    } catch (err) {
      console.error('Failed to fetch entries for user', userId, err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (entriesProp) {
      const normalized = entriesProp.map(e => {
        // Try several shapes, then fall back to the users list by user_id
        let userName = e.user_name || e.name || e.username || (e.user && (e.user.name || e.user.username));
        if (!userName && e.user_id) {
          const match = users.find(u => String(u.user_id) === String(e.user_id) || String(u.id) === String(e.user_id));
          if (match) userName = match.name || match.username || match.user_name || String(e.user_id);
        }
        if (!userName) userName = e.user_id ? String(e.user_id) : '';
        return { ...e, user_name: userName };
      });
      setEntries(normalized);
    }
  }, [entriesProp]);

  // When we fetch users (or the parent passes users) re-run a quick enrichment to fill missing user_name
  useEffect(() => {
    const hasUserData = (Array.isArray(users) && users.length) || (Array.isArray(fetchedUsers) && fetchedUsers.length);
    if (!hasUserData) return;
    setEntries(prev => {
      const updated = prev.map(e => {
        // if entry already has a non-empty user_name, keep it
        if (e.user_name && String(e.user_name).trim()) return e;
        const resolved = getResourceName(e);
        return { ...e, user_name: resolved };
      });
      // Only update if anything changed (avoid re-setting same objects)
      const changed = updated.length !== prev.length || updated.some((item, idx) => {
        const p = prev[idx] || {};
        return String(item.user_name || '') !== String(p.user_name || '') || item.hours !== p.hours || item.minutes !== p.minutes;
      });
      return changed ? updated : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedUsers, users]);

  // Debug columnVisibility
  useEffect(() => {
    try {
      console.debug('TasksheetEntriesDisplay columnVisibility (stringified):', JSON.stringify(columnVisibility));
      console.debug('TasksheetEntriesDisplay columnVisibility keys:', Object.keys(columnVisibility || {}));
    } catch (e) {
      console.debug('TasksheetEntriesDisplay columnVisibility (raw):', columnVisibility);
    }
  }, [columnVisibility]);

  const fetchReferenceData = async () => {
    try {
      const [projectRes, categoryRes, usersRes] = await Promise.all([
        api.get('/api/projects'),
        api.get('/api/taskCategories'),
        // users endpoint is optional - used to resolve resource names when parent doesn't provide users
        api.get('/api/users').catch(() => ({ data: [] })),
      ]);
      setProjects(projectRes.data);
      setTaskCategories(categoryRes.data);
      setFetchedUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  // Remove userId-based fetching, now entries come from parent

  // applyDateFilter is now handled by parent component

  const getProjectName = (id) => {
    const project = projects.find((p) => String(p.id) === String(id));
    return project ? project.name : `Unknown (${id})`;
  };

  const getCategoryName = (id) => {
    const category = taskCategories.find((c) => String(c.id) === String(id));
    return category ? category.name : `Unknown (${id})`;
  };

  // Resolve resource / user name from a variety of possible API shapes
  const getResourceName = (rowOrId) => {
    // If a primitive id was passed, try to resolve from users prop
    if (rowOrId == null) return '';
  const combinedUsers = (Array.isArray(users) && users.length) ? users : (Array.isArray(fetchedUsers) ? fetchedUsers : []);
    if (typeof rowOrId !== 'object') {
      const id = rowOrId;
      const match = combinedUsers.find(u => String(u.user_id) === String(id) || String(u.id) === String(id));
      if (match) return match.name || match.username || match.user_name || `${match.first_name || ''} ${match.last_name || ''}`.trim();
      return String(id);
    }

    const row = rowOrId;
    // Common name fields
    if (row.user_name) return row.user_name;
    if (row.resource_name) return row.resource_name;
    if (row.name) return row.name;
    if (row.username) return row.username;
    if (row.full_name) return row.full_name;

    // Nested objects
    if (row.user && (row.user.name || row.user.username || row.user.full_name)) {
      return row.user.name || row.user.username || row.user.full_name;
    }
    if (row.resource && (row.resource.name || row.resource.full_name)) {
      return row.resource.name || row.resource.full_name;
    }

    // First/last name
    if (row.user && row.user.first_name && row.user.last_name) {
      return `${row.user.first_name} ${row.user.last_name}`;
    }
    if (row.first_name && row.last_name) {
      return `${row.first_name} ${row.last_name}`;
    }

    // Try id-based lookup (user_id, resource_id, id) or primitive user/resource field
    const id = row.user_id ?? row.resource_id ?? row.user?.id ?? row.resource?.id ?? row.id;
    if (id) {
      const match = combinedUsers.find(u => String(u.user_id) === String(id) || String(u.id) === String(id));
      if (match) return match.name || match.username || match.user_name || `${match.first_name || ''} ${match.last_name || ''}`.trim();
      // Not found - log for debugging
      console.debug('getResourceName: unresolved id', id, 'row sample', row);
      return String(id);
    }

    // If row.user or row.resource is a primitive id (e.g. user: 3)
    if (row.user && (typeof row.user === 'string' || typeof row.user === 'number')) {
      const match = combinedUsers.find(u => String(u.user_id) === String(row.user) || String(u.id) === String(row.user));
      if (match) return match.name || match.username || String(row.user);
      return String(row.user);
    }
    if (row.resource && (typeof row.resource === 'string' || typeof row.resource === 'number')) {
      const match = combinedUsers.find(u => String(u.user_id) === String(row.resource) || String(u.id) === String(row.resource));
      if (match) return match.name || match.username || String(row.resource);
      return String(row.resource);
    }

    return '';
  };

  const getFilteredEntries = () => {
    let filtered = [...entries];
    // DEBUG: log entries to ensure we have expected data
    console.debug('getFilteredEntries: entries count', entries?.length);
    if (entries && entries.length > 0) {
      console.debug('getFilteredEntries: first entry sample', entries[0]);
    }
    // Multi-select project filter
    if (selectedProjects && selectedProjects.length > 0) {
      filtered = filtered.filter(e => {
        const pid = String(e.project_id ?? e.id);
        return selectedProjects.includes(pid);
      });
    }
    // Multi-select category filter
    if (selectedCategories && selectedCategories.length > 0) {
      filtered = filtered.filter(e => selectedCategories.includes(String(e.task_category_id)));
    }
    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(e => dayjs(e.entry_date).isSameOrAfter(dayjs(dateFrom), 'day'));
    }
    if (dateTo) {
      filtered = filtered.filter(e => dayjs(e.entry_date).isSameOrBefore(dayjs(dateTo), 'day'));
    }
    // Search filter
    if (search && search.trim()) {
      const query = search.toLowerCase();
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

    // Apply single filter
    if (singleFilter?.isActive) {
      filtered = filtered.filter((entry) => {
        // Handle date range filtering
        if (singleFilter.column === 'entry_date' && (singleFilter.fromDate || singleFilter.toDate)) {
          const entryDate = dayjs(entry.entry_date);

          if (singleFilter.fromDate && singleFilter.toDate) {
            // Both dates provided - filter between dates (inclusive)
            const fromDate = dayjs(singleFilter.fromDate);
            const toDate = dayjs(singleFilter.toDate);
            return (entryDate.isAfter(fromDate) || entryDate.isSame(fromDate, 'day')) &&
                   (entryDate.isBefore(toDate) || entryDate.isSame(toDate, 'day'));
          } else if (singleFilter.fromDate) {
            // Only from date - filter from this date onwards
            const fromDate = dayjs(singleFilter.fromDate);
            return entryDate.isAfter(fromDate) || entryDate.isSame(fromDate, 'day');
          } else if (singleFilter.toDate) {
            // Only to date - filter up to this date
            const toDate = dayjs(singleFilter.toDate);
            return entryDate.isBefore(toDate) || entryDate.isSame(toDate, 'day');
          }
          return true;
        }

        // Handle other column filtering
        if (!singleFilter.value) return true;

        let fieldValue = '';
        switch (singleFilter.column) {
          case 'project_name':
            fieldValue = getProjectName(entry.project_id);
            break;
          case 'category_name':
            fieldValue = getCategoryName(entry.task_category_id);
            break;
          case 'task_name':
            fieldValue = entry.task_name || '';
            break;
          case 'total_time':
            fieldValue = `${Math.floor(entry.hours)}:${entry.minutes.toString().padStart(2, '0')}`;
            break;
          case 'comments':
            fieldValue = entry.comments || '';
            break;
          default:
            return true;
        }

        const filterValue = singleFilter.value.toLowerCase();
        const cellValue = fieldValue.toLowerCase();

        switch (singleFilter.operator) {
          case 'contains':
            return cellValue.includes(filterValue);
          case 'equals':
            return cellValue === filterValue;
          case 'startsWith':
            return cellValue.startsWith(filterValue);
          case 'endsWith':
            return cellValue.endsWith(filterValue);
          default:
            return true;
        }
      });
    }

    return filtered.sort(
      (a, b) => dayjs(b.entry_date).valueOf() - dayjs(a.entry_date).valueOf()
    );
  };
const StyledQuickFilter = styled(QuickFilter)({
  display: 'grid',
  alignItems: 'center',
});

const StyledToolbarButton = styled(ToolbarButton)(({ theme, ownerState }) => ({
  gridArea: '1 / 1',
  width: 'min-content',
  height: 'min-content',
  zIndex: 1,
  opacity: ownerState.expanded ? 0 : 1,
  pointerEvents: ownerState.expanded ? 'none' : 'auto',
  transition: theme.transitions.create(['opacity']),
}));

const StyledTextField = styled(TextField)(({ theme, ownerState }) => ({
  gridArea: '1 / 1',
  overflowX: 'clip',
  width: ownerState.expanded ? 260 : 'var(--trigger-width)',
  opacity: ownerState.expanded ? 1 : 0,
  transition: theme.transitions.create(['width', 'opacity']),
}));

function CustomToolbar() {
  const [exportMenuOpen, setExportMenuOpen] = React.useState(false);
  const exportMenuTriggerRef = React.useRef(null);

  return (
    <Toolbar>
      <Typography fontWeight="medium" sx={{ flex: 1, mx: 0.5 }}>
        Toolbar
      </Typography>

      <Tooltip title="Columns">
        <ColumnsPanelTrigger render={<ToolbarButton />}>
          <ViewColumnIcon fontSize="small" />
        </ColumnsPanelTrigger>
      </Tooltip>

      <Tooltip title="Filters">
        <FilterPanelTrigger
          render={(props, state) => (
            <ToolbarButton {...props} color="default">
              <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                <FilterListIcon fontSize="small" />
              </Badge>
            </ToolbarButton>
          )}
        />
      </Tooltip>
 
      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
      <Tooltip title="Export">
        <ToolbarButton
          ref={exportMenuTriggerRef}
          id="export-menu-trigger"
          aria-controls="export-menu"
          aria-haspopup="true"
          aria-expanded={exportMenuOpen ? 'true' : undefined}
          onClick={() => setExportMenuOpen(true)}
        >
          <FileDownloadIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>

      <Menu
        id="export-menu"
        anchorEl={exportMenuTriggerRef.current}
        open={exportMenuOpen}
        onClose={() => setExportMenuOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          list: {
            'aria-labelledby': 'export-menu-trigger',
          },
        }}
      >
        <ExportPrint render={<MenuItem />} onClick={() => setExportMenuOpen(false)}>
          Print
        </ExportPrint>
        <ExportCsv render={<MenuItem />} onClick={() => setExportMenuOpen(false)}>
          Download as CSV
        </ExportCsv>
        {/* Available to MUI X Premium users */}
        {/* <ExportExcel render={<MenuItem />}>
           Download as Excel
          </ExportExcel> */}
      </Menu>

      <StyledQuickFilter>
        <QuickFilterTrigger
          render={(triggerProps, state) => (
            <Tooltip title="Search" enterDelay={0}>
              <StyledToolbarButton
                {...triggerProps}
                ownerState={{ expanded: state.expanded }}
                color="default"
                aria-disabled={state.expanded}
              >
                <SearchIcon fontSize="small" />
              </StyledToolbarButton>
            </Tooltip>
          )}
        />
        <QuickFilterControl
          render={({ ref, ...controlProps }, state) => (
            <StyledTextField
              {...controlProps}
              ownerState={{ expanded: state.expanded }}
              inputRef={ref}
              aria-label="Search"
              placeholder="Search..."
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: state.value ? (
                    <InputAdornment position="end">
                      <QuickFilterClear
                        edge="end"
                        size="small"
                        aria-label="Clear search"
                        material={{ sx: { marginRight: -0.75 } }}
                      >
                        <CancelIcon fontSize="small" />
                      </QuickFilterClear>
                    </InputAdornment>
                  ) : null,
                  ...controlProps.slotProps?.input,
                },
                ...controlProps.slotProps,
              }}
            />
          )}
        />
      </StyledQuickFilter>
    </Toolbar>
  );
}

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

  const StyledGridOverlay = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  '& .no-rows-primary': {
    fill: '#3D4751',
    ...theme.applyStyles('light', {
      fill: '#AEB8C2',
    }),
  },
  '& .no-rows-secondary': {
    fill: '#1D2126',
    ...theme.applyStyles('light', {
      fill: '#E8EAED',
    }),
  },
}));
  // Expose functions to parent
  React.useImperativeHandle(ref, () => ({
    exportToCSV,
    refreshEntries: fetchEntries,
  }), [fetchReferenceData]);

  // Open/hide the DataGrid filter panel when parent toggles showFilters
  useEffect(() => {
    if (!apiRef || !apiRef.current) return;
    try {
      if (showFilters) {
        apiRef.current.showFilterPanel?.();
      } else {
        apiRef.current.hideFilterPanel?.();
      }
    } catch (e) {
      // ignore if API not available
    }
  }, [showFilters, apiRef]);

  // Define DataGrid columns
  const columns = [];

  // Resource column is optional (showResource prop)
  if (showResource) {
    columns.push({
      field: 'resource',
      headerName: 'Resource',
      width: 180,
      type: 'string',
      valueGetter: (params) => {
        const row = params && params.row ? params.row : params;
        return getResourceName(row);
      },
      renderCell: (params) => {
        const value = params.value || getResourceName(params.row) || '';
        return <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</Box>;
      },
      filterable: true,
      sortable: true,
    });
  }

  columns.push(
    {
      field: 'entry_date',
      headerName: 'Date',
      width: 80,
      type: 'date',
      valueFormatter: (value) => dayjs(value).format('DD MMM'),
      sortable: true,
      filterable: true,
    },
    {
      field: 'project_name',
      headerName: 'Project Name',
      width: 200,
      type: 'string',
      valueGetter: (value, row) => getProjectName(row.project_id),
      sortable: true,
      filterable: true,
    },
    {
      field: 'category_name',
      headerName: 'Task Category',
      width: 150,
      type: 'string',
      valueGetter: (value, row) => getCategoryName(row.task_category_id),
      sortable: true,
      filterable: true,
    },
    {
      field: 'task_name',
      headerName: 'Task Details',
      width: 300,
      flex: 1,
      type: 'string',
      sortable: true,
      filterable: true,
      renderCell: (params) => (
        <Box sx={{
          whiteSpace: 'pre-line',
          wordWrap: 'break-word',
          overflow: 'visible',
          width: '100%',
           height: '100%',
          display: 'flex',
          alignItems: 'center',
        }}>
          {params.value}
        </Box>
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
    },
    {
      field: 'comments',
      headerName: 'Comments',
      width: 200,
      type: 'string',
      sortable: true,
      filterable: true,
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
      headerName: '',
      width: 140,
      flex: 0,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        // Disable edit/delete if not own timesheet
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        const isOwnTimesheet = !userId || String(userId) === String(loggedInUser?.id);
        return (
          <Box sx={{ display: 'flex',}}>
            <Button
              variant="text"
              size="small"
              onClick={() => isOwnTimesheet ? handleEdit(params.row) : null}
              disabled={!isOwnTimesheet}
              sx={{
                px: 1,
                py: 1,
                minHeight: '32px',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Edit
            </Button>
            <Button
              variant="text"
              size="small"
              color="error"
              onClick={() => isOwnTimesheet ? handleDelete(params.row) : null}
              disabled={!isOwnTimesheet}
              sx={{
                px: 2,
                py: 1,
                minHeight: '32px',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                  backgroundColor: 'rgba(211, 47, 47, 0.04)'
                }
              }}
            >
              Delete
            </Button>
          </Box>
        );
      },
    }
  );

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
      <Paper
        sx={{
          mt: 0,
          borderRadius: '0 0 12px 12px',
          border: '1px solid #f0f0f0',
          borderTop: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}
      >
        <DataGrid
          apiRef={apiRef}
          rows={getFilteredEntries()}
          columns={columns.map(col => ({ ...col, filterable: true }))}
          autoHeight
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
          pageSizeOptions={[10, 25, 50, 100]}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          getRowHeight={() => 'auto'}
          rowHeight={32}
          columnVisibilityModel={columnVisibility}
          onColumnVisibilityModelChange={(newModel) => {
            if (onColumnVisibilityChange) {
              onColumnVisibilityChange(newModel);
            }
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
            columns: {
              columnVisibilityModel: columnVisibility,
            },
          }}
          sx={{
            m: 0,
            minHeight: '400px',
            border: 'none',
            backgroundColor: '#ffffff',
            '& .MuiDataGrid-main': {
              backgroundColor: '#ffffff',
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: '#ffffff',
            },
            '& .MuiDataGrid-cell': {
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              padding: '4px 6px',
            },
            '& .MuiDataGrid-columnHeaders': {
              minHeight: '45px !important',
              maxHeight: '45px !important',
            },
            '& .MuiDataGrid-columnHeader': {
              minHeight: '42px !important',
              maxHeight: '42px !important',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              fontSize: '0.875rem',
              fontWeight: 600,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            },
            '& .MuiDataGrid-cell[data-field="task_name"]': {
              alignItems: 'flex-start',
              whiteSpace: 'normal',
              lineHeight: 'normal',
            },
            '& .MuiDataGrid-row': {
              minHeight: 'auto !important',
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
              backgroundColor: '#f8fafc !important',
              zIndex: 100,
              borderLeft: '1px solid #f0f0f0',
              boxShadow: '-4px 0 8px -2px rgba(0, 0, 0, 0.1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#f8fafc',
                zIndex: -1,
              },
            },
            '& .MuiDataGrid-cell[data-field="actions"]': {
              position: 'sticky',
              right: 0,
              backgroundColor: '#ffffff !important',
              zIndex: 100,
              borderLeft: '1px solid #f0f0f0',
              boxShadow: '-4px 0 8px -2px rgba(0, 0, 0, 0.1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#ffffff',
                zIndex: -1,
              },
            },
            '& .MuiDataGrid-row:hover .MuiDataGrid-cell': {
              backgroundColor: '#f5f5f5 !important',
              '&::before': {
                backgroundColor: '#f5f5f5',
              },
            },
          }}
          slots={{
            toolbar: CustomToolbar,
            noRowsOverlay: () => (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '300px',
              }}>
                <StyledGridOverlay>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    width={96}
                    viewBox="0 0 452 257"
                    aria-hidden
                    focusable="false"
                  >
                    <path
                      className="no-rows-primary"
                      d="M348 69c-46.392 0-84 37.608-84 84s37.608 84 84 84 84-37.608 84-84-37.608-84-84-84Zm-104 84c0-57.438 46.562-104 104-104s104 46.562 104 104-46.562 104-104 104-104-46.562-104-104Z"
                    />
                    <path
                      className="no-rows-primary"
                      d="M308.929 113.929c3.905-3.905 10.237-3.905 14.142 0l63.64 63.64c3.905 3.905 3.905 10.236 0 14.142-3.906 3.905-10.237 3.905-14.142 0l-63.64-63.64c-3.905-3.905-3.905-10.237 0-14.142Z"
                    />
                    <path
                      className="no-rows-primary"
                      d="M308.929 191.711c-3.905-3.906-3.905-10.237 0-14.142l63.64-63.64c3.905-3.905 10.236-3.905 14.142 0 3.905 3.905 3.905 10.237 0 14.142l-63.64 63.64c-3.905 3.905-10.237 3.905-14.142 0Z"
                    />
                    <path
                      className="no-rows-secondary"
                      d="M0 10C0 4.477 4.477 0 10 0h380c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 20 0 15.523 0 10ZM0 59c0-5.523 4.477-10 10-10h231c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 69 0 64.523 0 59ZM0 106c0-5.523 4.477-10 10-10h203c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 153c0-5.523 4.477-10 10-10h195.5c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 200c0-5.523 4.477-10 10-10h203c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 247c0-5.523 4.477-10 10-10h231c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10Z"
                    />
                  </svg>
                  <Box sx={{ mt: 2 }}>No rows</Box>
                </StyledGridOverlay>
              </Box>
            ),
          }}
          slotProps={{
            loadingOverlay: {
              variant: 'linear-progress',
              noRowsVariant: 'skeleton',
            },
          }}
        />
      </Paper>
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
