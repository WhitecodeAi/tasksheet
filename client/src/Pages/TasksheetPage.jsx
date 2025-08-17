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
  Paper
} from '@mui/material';
import { Search } from '@mui/icons-material';
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

          {/* Right: Add Button */}
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              px: 3,
              py: 1
            }}
            onClick={() => {
              setDrawerOpen(true);
              setEditMode(false);
              setSelectedEntry(null);
            }}
          >
            Add New
          </Button>
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
