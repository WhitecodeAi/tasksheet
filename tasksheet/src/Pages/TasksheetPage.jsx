import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TasksheetEntryForm from '../Components/TasksheetEntryForm';
import TasksheetEntriesDisplay from '../Components/TasksheetEntriesDisplay';
import { Grid, Container } from '@mui/material';

const TasksheetPage = () => {
  const [projects, setProjects] = useState([]);
  const [taskCategories, setTaskCategories] = useState([]);
  const taskListRef = useRef();
  const loggedInUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    axios.get('http://localhost:3001/api/projects')
      .then((res) => setProjects(res.data))
      .catch((err) => console.error('Error fetching projects:', err));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3001/api/taskCategories')
      .then((res) => setTaskCategories(res.data))
      .catch((err) => console.error('Failed to fetch task categories', err));
  }, []);

  const handleSuccessfulSubmit = () => {
    if (taskListRef.current && typeof taskListRef.current.refreshEntries === 'function') {
      taskListRef.current.refreshEntries(); // 🔄 Refresh right panel
    }
  };

  return (
    <>
      <Grid container spacing={0}>
 
           <Grid size={{ md: 4,}}>
          <TasksheetEntryForm
            projects={projects}
            user={loggedInUser}
            taskCategories={taskCategories}
            onSuccess={handleSuccessfulSubmit}
          />
        </Grid>

      
        <Grid size={{ md: 8,}}>
          <TasksheetEntriesDisplay
            userId={loggedInUser?.id}
            ref={taskListRef}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default TasksheetPage;
