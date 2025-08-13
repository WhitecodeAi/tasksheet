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
  Divider
} from '@mui/material';
import { api } from '../utils/api';

const TasksheetPage = () => {
  const [projects, setProjects] = useState([]);
  const [taskCategories, setTaskCategories] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const handleSuccessfulSubmit = () => {
    setDrawerOpen(false); // 👈 Close drawer on success
    if (taskListRef.current?.refreshEntries) {
      taskListRef.current.refreshEntries(); // 🔄 Refresh grid
    }
  };

  return (
    <>
      {/* 🔘 Add Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={() => setDrawerOpen(true)}>
          Add
        </Button>
      </Box>

      {/* 📋 Grid Display */}
      <Grid container >
        <Grid item size={12}>
          <TasksheetEntriesDisplay
            userId={loggedInUser?.id}
            ref={taskListRef}
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
          <Typography variant="h6">Add Tasksheet Entry</Typography>
        </Box>
        <Divider />

        {/* 🔸 Scrollable Body */}
        <Box sx={{ flex: 1, overflowY: 'auto', py: 2, px:0}}>
          <TasksheetEntryForm
            ref={formRef}
            projects={projects}
            user={loggedInUser}
            taskCategories={taskCategories}
            onSuccess={handleSuccessfulSubmit}
          />
        </Box>

        <Divider />

        {/* 🔻 Footer */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button   onClick={() => setDrawerOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button variant="contained" onClick={() => formRef.current?.submitForm()}>
            Submit
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default TasksheetPage;
