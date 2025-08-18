import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TasksheetEntryForm from '../Components/TasksheetEntryForm';
import TasksheetEntriesDisplay from '../Components/TasksheetEntriesDisplay';
import {
  Grid,
  Drawer,
  Button,
  Box,
  Typography,
  Divider,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  Stack,
  Paper,
  Fab,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { Search, Add, FilterList, ViewColumn, FileDownload, Settings } from '@mui/icons-material';
import { api } from '../utils/api';
import dayjs from 'dayjs';

const TasksheetPage = () => {
  const [projects, setProjects] = useState([]);
  const [taskCategories, setTaskCategories] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRange, setFilterRange] = useState('TODAY');
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [showHorizontalFilters, setShowHorizontalFilters] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    entry_date: true,
    project_name: true,
    category_name: true,
    task_name: true,
    total_time: true,
    comments: true,
    actions: true,
  });
  const [columnSearchQuery, setColumnSearchQuery] = useState('');
  const [singleFilter, setSingleFilter] = useState({
    column: 'project_name',
    operator: 'contains',
    value: '',
    fromDate: '',
    toDate: '',
    isActive: false
  });
  const [activeFilters, setActiveFilters] = useState({
    projects: [],
    categories: [],
    dateRange: null,
    hoursRange: { min: '', max: '' }
  });

  const taskListRef = useRef();
  const formRef = useRef(); // 👈 Ref to trigger form submit
  const loggedInUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    api.get('/api/projects')
      .then((res) => setProjects(res.data))
      .catch((err) => console.error('Error fetching projects:', err));
  }, []);

  useEffect(() => {
    api.get('/api/taskCategories')
      .then((res) => setTaskCategories(res.data))
      .catch((err) => console.error('Failed to fetch task categories', err));
  }, []);

  // Debug columnVisibility changes
  useEffect(() => {
    console.log('TasksheetPage columnVisibility changed:', columnVisibility);
  }, [columnVisibility]);

  const handleSuccessfulSubmit = (isEdit = false) => {
    setDrawerOpen(false); // 👈 Close drawer on success
    setEditMode(false);
    setSelectedEntry(null);

    // Show appropriate snackbar message
    const message = isEdit ? 'Edited Successfully' : 'Added Successfully';
    setSnackbar({ open: true, message, severity: 'success' });

    if (taskListRef.current?.refreshEntries) {
      taskListRef.current.refreshEntries(); // 🔄 Refresh grid
    }
  };

  const handleEditClick = (entry) => {
    setSelectedEntry(entry);
    setEditMode(true);
    setDrawerOpen(true);
  };

  const handleDeleteSuccess = () => {
    setSnackbar({ open: true, message: 'Deleted Successfully', severity: 'success' });
  };

    const handleDrawerClose = () => {
    setDrawerOpen(false);
    setEditMode(false);
    setSelectedEntry(null);
  }

  
  return (
    <>
      {/* 🔍 Search, Filter & Add Controls - Berry Dashboard Style */}
      <Paper
        sx={{
          p: 2,
          mb: 0,
          borderRadius: '12px 12px 0 0',
          border: '1px solid #f0f0f0',
          borderBottom: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          {/* Left: Search Field */}
          <TextField
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f8fafc'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#9e9e9e', fontSize: '1.2rem' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Center: Filter Buttons */}
          <Stack direction="row" spacing={1}>
            {[
              { label: "Today", value: "TODAY" },
              { label: "This Week", value: "WEEK" },
              { label: "This Month", value: "MONTH" },
              { label: "All", value: "ALL" },
            ].map(({ label, value }) => (
              <Button
                key={value}
                onClick={() => setFilterRange(value)}
                variant={filterRange === value ? "contained" : "outlined"}
                color={filterRange === value ? "primary" : "inherit"}
                size="small"
                sx={{
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 3,
                  py: 1,
                  minHeight: '32px'
                }}
              >
                {label}
              </Button>
            ))}
          </Stack>

          {/* Center-Right: DataGrid Actions */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="Filter & Sort">
              <IconButton
                size="small"
                onClick={() => setShowHorizontalFilters(!showHorizontalFilters)}
                sx={{
                  color: (showHorizontalFilters || singleFilter.isActive) ? '#1976d2' : '#9e9e9e',
                  backgroundColor: (showHorizontalFilters || singleFilter.isActive) ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    color: '#1976d2'
                  }
                }}
              >
                <FilterList fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Manage Columns">
              <IconButton
                size="small"
                onClick={(event) => setColumnMenuAnchor(event.currentTarget)}
                sx={{
                  color: columnMenuAnchor ? '#1976d2' : '#9e9e9e',
                  backgroundColor: columnMenuAnchor ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    color: '#1976d2'
                  }
                }}
              >
                <ViewColumn fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Export Data">
              <IconButton
                size="small"
                onClick={() => {
                  if (taskListRef.current?.exportToCSV) {
                    taskListRef.current.exportToCSV();
                  }
                }}
                sx={{
                  color: '#9e9e9e',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    color: '#1976d2'
                  }
                }}
              >
                <FileDownload fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Right: Add Button */}
          <Tooltip title="Add Tasksheet Entry">
            <Fab
              color="primary"
              size="small"
              onClick={() => {
                setDrawerOpen(true);
                setEditMode(false);
                setSelectedEntry(null);
              }}
            >
              <Add />
            </Fab>
          </Tooltip>
        </Box>
      </Paper>

      {/* 🔍 Horizontal Filter Panel */}
      {showHorizontalFilters && (
        <Paper
          sx={{
            p: 2,
            mb: 0,
            border: '1px solid #f0f0f0',
            borderTop: 'none',
            borderBottom: 'none',
            backgroundColor: '#f8fafc',
            boxShadow: 'none'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Filter:
            </Typography>

            {/* Column Selection */}
            <FormControl size="small" sx={{ minWidth: 150, '& .MuiInputBase-root': { minHeight: '32px' } }}>
              <InputLabel>Column</InputLabel>
              <Select
                value={singleFilter.column}
                label="Column"
                onChange={(e) => setSingleFilter(prev => ({
                  ...prev,
                  column: e.target.value,
                  isActive: prev.value.trim() !== ''
                }))}
              >
                <MenuItem value="entry_date">Date</MenuItem>
                <MenuItem value="project_name">Project Name</MenuItem>
                <MenuItem value="category_name">Task Category</MenuItem>
                <MenuItem value="task_name">Task Details</MenuItem>
                <MenuItem value="total_time">Total Efforts</MenuItem>
                <MenuItem value="comments">Comments</MenuItem>
              </Select>
            </FormControl>

            {/* Operator Selection */}
            <FormControl size="small" sx={{ minWidth: 120, '& .MuiInputBase-root': { minHeight: '32px' } }}>
              <InputLabel>Operator</InputLabel>
              <Select
                value={singleFilter.operator}
                label="Operator"
                onChange={(e) => setSingleFilter(prev => ({
                  ...prev,
                  operator: e.target.value,
                  isActive: prev.value.trim() !== ''
                }))}
              >
                <MenuItem value="contains">contains</MenuItem>
                <MenuItem value="equals">equals</MenuItem>
                <MenuItem value="startsWith">starts with</MenuItem>
                <MenuItem value="endsWith">ends with</MenuItem>
                {singleFilter.column === 'entry_date' && [
                  <MenuItem key="is" value="is">is</MenuItem>,
                  <MenuItem key="after" value="after">is after</MenuItem>,
                  <MenuItem key="before" value="before">is before</MenuItem>
                ]}
              </Select>
            </FormControl>

            {/* Value Input - Show date range for Date column, single input for others */}
            {singleFilter.column === 'entry_date' ? (
              <>
                <TextField
                  size="small"
                  label="From Date"
                  type="date"
                  value={singleFilter.fromDate}
                  onChange={(e) => setSingleFilter(prev => ({
                    ...prev,
                    fromDate: e.target.value,
                    isActive: (e.target.value.trim() !== '' || prev.toDate.trim() !== '')
                  }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    minWidth: 140,
                    '& .MuiInputBase-root': { minHeight: '32px' }
                  }}
                />
                <TextField
                  size="small"
                  label="To Date"
                  type="date"
                  value={singleFilter.toDate}
                  onChange={(e) => setSingleFilter(prev => ({
                    ...prev,
                    toDate: e.target.value,
                    isActive: (prev.fromDate.trim() !== '' || e.target.value.trim() !== '')
                  }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    minWidth: 140,
                    '& .MuiInputBase-root': { minHeight: '32px' }
                  }}
                />
              </>
            ) : (
              <TextField
                size="small"
                label="Value"
                type="text"
                value={singleFilter.value}
                onChange={(e) => setSingleFilter(prev => ({
                  ...prev,
                  value: e.target.value,
                  isActive: e.target.value.trim() !== ''
                }))}
                sx={{
                  minWidth: 150,
                  '& .MuiInputBase-root': { minHeight: '32px' }
                }}
              />
            )}

            {/* Clear Button */}
            <Button
              size="small"
              color="error"
              onClick={() => setSingleFilter(prev => ({
                ...prev,
                value: '',
                fromDate: '',
                toDate: '',
                isActive: false
              }))}
              disabled={singleFilter.column === 'entry_date' ?
                (!singleFilter.fromDate && !singleFilter.toDate) :
                !singleFilter.value
              }
              sx={{ px: 3, py: 1, minHeight: '32px' }}
            >
              Clear
            </Button>

            {/* Show active filter */}
            {singleFilter.isActive && (
              (singleFilter.column === 'entry_date' ? (singleFilter.fromDate || singleFilter.toDate) : singleFilter.value)
            ) && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  backgroundColor: '#e3f2fd',
                  border: '1px solid #1976d2',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  ml: 'auto'
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1976d2' }}>
                  {singleFilter.column === 'entry_date' ? (
                    `Date: ${singleFilter.fromDate ? dayjs(singleFilter.fromDate).format('DD MMM') : 'Start'} - ${singleFilter.toDate ? dayjs(singleFilter.toDate).format('DD MMM') : 'End'}`
                  ) : (
                    `${singleFilter.column} ${singleFilter.operator} "${singleFilter.value}"`
                  )}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {/* 📋 Grid Display */}
      <Grid container>
        <Grid item size={12}>
          <TasksheetEntriesDisplay
            userId={loggedInUser?.id}
            ref={taskListRef}
            onEdit={handleEditClick}
            onDeleteSuccess={handleDeleteSuccess}
            searchQuery={searchQuery}
            filterRange={filterRange}
            activeFilters={activeFilters}
            singleFilter={singleFilter}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            showFilters={showFilters}
            showColumnMenu={showColumnMenu}
            onFiltersChange={setShowFilters}
            onColumnMenuChange={setShowColumnMenu}
          />
        </Grid>
      </Grid>

      {/* 🧾 Drawer with Header, Scrollable Body, and Footer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400, md: 500 },
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
        }}
      >
        {/* 🔹 Header */}
        <Box sx={{ p: 2 }}>
          <Typography variant="h6"> {editMode ? 'Edit Tasksheet Entry' : 'Add Tasksheet Entry'}</Typography>
        </Box>
        <Divider />

        {/* 🔸 Scrollable Body */}
        <Box sx={{ flex: 1, overflowY: 'auto', py: 2, px:0}}>
          <TasksheetEntryForm
            ref={formRef}
            projects={projects}
            user={loggedInUser}
            taskCategories={taskCategories}
            onSuccess={() => handleSuccessfulSubmit(editMode)}
            initialValues={selectedEntry}
            editMode={editMode}
            selectedEntry={selectedEntry}
          />
        </Box>

        <Divider />

        {/* 🔻 Footer */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={handleDrawerClose}
            color="secondary"
            size="small"
            sx={{ px: 3, py: 1, minHeight: '32px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => formRef.current?.submitForm()}
            size="small"
            sx={{ px: 3, py: 1, minHeight: '32px' }}
          >
            Submit
          </Button>
        </Box>
      </Drawer>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
        PaperProps={{
          sx: { width: 300, maxHeight: 400 }
        }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2" fontWeight={600}>
            Filter Options
          </Typography>
        </MenuItem>
        <Divider />

        {/* Date Range Filter */}
        <MenuItem disabled>
          <Typography variant="body2" fontWeight={500} color="text.secondary">
            Date Range
          </Typography>
        </MenuItem>
        <Box sx={{ px: 2, pb: 1 }}>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              type="date"
              label="From"
              value={activeFilters.dateRange?.from || ''}
              onChange={(e) => setActiveFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, from: e.target.value }
              }))}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              type="date"
              label="To"
              value={activeFilters.dateRange?.to || ''}
              onChange={(e) => setActiveFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, to: e.target.value }
              }))}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Stack>
        </Box>

        {/* Hours Range Filter */}
        <MenuItem disabled>
          <Typography variant="body2" fontWeight={500} color="text.secondary">
            Hours Range
          </Typography>
        </MenuItem>
        <Box sx={{ px: 2, pb: 1 }}>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              type="number"
              label="Min Hours"
              value={activeFilters.hoursRange.min}
              onChange={(e) => setActiveFilters(prev => ({
                ...prev,
                hoursRange: { ...prev.hoursRange, min: e.target.value }
              }))}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              type="number"
              label="Max Hours"
              value={activeFilters.hoursRange.max}
              onChange={(e) => setActiveFilters(prev => ({
                ...prev,
                hoursRange: { ...prev.hoursRange, max: e.target.value }
              }))}
              sx={{ flex: 1 }}
            />
          </Stack>
        </Box>

        <Divider />

        {/* Clear Filters */}
        <MenuItem
          onClick={() => {
            setActiveFilters({
              projects: [],
              categories: [],
              dateRange: null,
              hoursRange: { min: '', max: '' }
            });
            setFilterMenuAnchor(null);
          }}
        >
          <Typography color="error">Clear All Filters</Typography>
        </MenuItem>

        <MenuItem onClick={() => setFilterMenuAnchor(null)}>
          <Typography color="primary">Apply Filters</Typography>
        </MenuItem>
      </Menu>

      {/* Column Management Menu */}
      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={() => {
          setColumnMenuAnchor(null);
          setColumnSearchQuery('');
        }}
        PaperProps={{
          sx: {
            width: 280,
            maxHeight: '70vh',
            overflowY: 'auto'
          }
        }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2" fontWeight={600}>
            Show/Hide Columns
          </Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />

        {/* Search Field */}
        <Box sx={{ p: 1 }} onClick={(e) => e.stopPropagation()}>
          <TextField
            size="small"
            placeholder="Search columns..."
            value={columnSearchQuery}
            onChange={(e) => {
              console.log('Search query changed:', e.target.value);
              setColumnSearchQuery(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: '1rem', color: '#9e9e9e' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                minHeight: '32px',
                fontSize: '0.875rem'
              }
            }}
          />
        </Box>

        {/* Select/Unselect All */}
        <MenuItem
          onClick={() => {
            const allColumns = ['entry_date', 'project_name', 'category_name', 'task_name', 'total_time', 'comments', 'actions'];
            const filteredColumns = allColumns.filter(field => {
              const columnData = [
                { field: 'entry_date', label: 'Date' },
                { field: 'project_name', label: 'Project Name' },
                { field: 'category_name', label: 'Task Category' },
                { field: 'task_name', label: 'Task Details' },
                { field: 'total_time', label: 'Total Efforts' },
                { field: 'comments', label: 'Comments' },
                { field: 'actions', label: 'Actions' },
              ].find(col => col.field === field);
              return columnData?.label.toLowerCase().includes(columnSearchQuery.toLowerCase());
            });

            const allVisible = filteredColumns.every(field => columnVisibility[field]);
            const newVisibility = { ...columnVisibility };
            filteredColumns.forEach(field => {
              newVisibility[field] = !allVisible;
            });
            setColumnVisibility(newVisibility);
          }}
          sx={{ py: 0.5 }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={(() => {
                  const allColumns = ['entry_date', 'project_name', 'category_name', 'task_name', 'total_time', 'comments', 'actions'];
                  const filteredColumns = allColumns.filter(field => {
                    const columnData = [
                      { field: 'entry_date', label: 'Date' },
                      { field: 'project_name', label: 'Project Name' },
                      { field: 'category_name', label: 'Task Category' },
                      { field: 'task_name', label: 'Task Details' },
                      { field: 'total_time', label: 'Total Efforts' },
                      { field: 'comments', label: 'Comments' },
                      { field: 'actions', label: 'Actions' },
                    ].find(col => col.field === field);
                    return columnData?.label.toLowerCase().includes(columnSearchQuery.toLowerCase());
                  });
                  return filteredColumns.length > 0 && filteredColumns.every(field => columnVisibility[field]);
                })()}
                indeterminate={(() => {
                  const allColumns = ['entry_date', 'project_name', 'category_name', 'task_name', 'total_time', 'comments', 'actions'];
                  const filteredColumns = allColumns.filter(field => {
                    const columnData = [
                      { field: 'entry_date', label: 'Date' },
                      { field: 'project_name', label: 'Project Name' },
                      { field: 'category_name', label: 'Task Category' },
                      { field: 'task_name', label: 'Task Details' },
                      { field: 'total_time', label: 'Total Efforts' },
                      { field: 'comments', label: 'Comments' },
                      { field: 'actions', label: 'Actions' },
                    ].find(col => col.field === field);
                    return columnData?.label.toLowerCase().includes(columnSearchQuery.toLowerCase());
                  });
                  const visibleCount = filteredColumns.filter(field => columnVisibility[field]).length;
                  return visibleCount > 0 && visibleCount < filteredColumns.length;
                })()}
                size="small"
              />
            }
            label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Select All</Typography>}
            sx={{ margin: 0, width: '100%' }}
          />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        {/* Column List */}
        {[
          { field: 'entry_date', label: 'Date' },
          { field: 'project_name', label: 'Project Name' },
          { field: 'category_name', label: 'Task Category' },
          { field: 'task_name', label: 'Task Details' },
          { field: 'total_time', label: 'Total Efforts' },
          { field: 'comments', label: 'Comments' },
          { field: 'actions', label: 'Actions' },
        ]
        .filter(({ label }) => label.toLowerCase().includes(columnSearchQuery.toLowerCase()))
        .map(({ field, label }) => (
          <MenuItem
            key={field}
            onClick={() => {
              setColumnVisibility(prev => ({
                ...prev,
                [field]: !prev[field]
              }));
            }}
            sx={{ py: 0.5 }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={columnVisibility[field]}
                  size="small"
                />
              }
              label={<Typography variant="body2">{label}</Typography>}
              sx={{ margin: 0, width: '100%' }}
            />
          </MenuItem>
        ))}

        {/* No results message */}
        {columnSearchQuery && [
          { field: 'entry_date', label: 'Date' },
          { field: 'project_name', label: 'Project Name' },
          { field: 'category_name', label: 'Task Category' },
          { field: 'task_name', label: 'Task Details' },
          { field: 'total_time', label: 'Total Efforts' },
          { field: 'comments', label: 'Comments' },
          { field: 'actions', label: 'Actions' },
        ].filter(({ label }) => label.toLowerCase().includes(columnSearchQuery.toLowerCase())).length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No columns found
            </Typography>
          </MenuItem>
        )}
      </Menu>

      {/* Snackbar for Add/Edit operations */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TasksheetPage;
