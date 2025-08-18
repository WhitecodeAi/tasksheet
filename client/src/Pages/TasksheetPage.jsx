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
  ListItemText
} from '@mui/material';
import { Search, Add, FilterList, ViewColumn, FileDownload, Settings } from '@mui/icons-material';
import { api } from '../utils/api';

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
  const [dataGridFilters, setDataGridFilters] = useState([]);
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
                  color: (showHorizontalFilters || dataGridFilters.length > 0) ? '#1976d2' : '#9e9e9e',
                  backgroundColor: (showHorizontalFilters || dataGridFilters.length > 0) ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
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
        onClose={() => setColumnMenuAnchor(null)}
        PaperProps={{
          sx: { width: 200, maxHeight: 300 }
        }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2" fontWeight={600}>
            Show/Hide Columns
          </Typography>
        </MenuItem>
        <Divider />
        {[
          { field: 'entry_date', label: 'Date' },
          { field: 'project_name', label: 'Project Name' },
          { field: 'category_name', label: 'Task Category' },
          { field: 'task_name', label: 'Task Details' },
          { field: 'total_time', label: 'Total Efforts' },
          { field: 'comments', label: 'Comments' },
          { field: 'actions', label: 'Actions' },
        ].map(({ field, label }) => (
          <MenuItem
            key={field}
            onClick={() => {
              if (taskListRef.current?.toggleColumnVisibility) {
                taskListRef.current.toggleColumnVisibility(field);
              }
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={taskListRef.current?.columnVisibility?.[field] ?? true}
                  size="small"
                />
              }
              label={label}
              sx={{ margin: 0, width: '100%' }}
            />
          </MenuItem>
        ))}
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
