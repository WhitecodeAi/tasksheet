import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography, Container
} from '@mui/material';
import dayjs from 'dayjs';

const TasksheetEntryForm = ({ user, projects, taskCategories }) => {
  const [form, setForm] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    projectName: '',
    category: '',
    task: '',
    hours: '',
    minutes: '',
    totalEffort: '',
    developerName: user?.email || '',
    comments: '',
  });

 

  // 🧮 Calculate total effort automatically
  useEffect(() => {
    const h = parseFloat(form.hours || 0);
    const m = parseFloat(form.minutes || 0);
    const total = h + m / 60;
    setForm((prev) => ({ ...prev, totalEffort: total.toFixed(2) }));
  }, [form.hours, form.minutes]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    entry_date: form.date,
    user_id: user?.id, // assuming you pass `user.id` from parent
    project_id: form.projectName,
    task_category_id: form.category,
    task: form.task,
    hours: parseInt(form.hours || 0),
    minutes: parseInt(form.minutes || 0),
    comments: form.comments
  };

  try {
    const response = await fetch('http://localhost:3001/api/tasksheetEntries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (response.ok) {
      alert('✅ Tasksheet submitted successfully!');
      console.log('Submitted:', data);
      // Reset form if needed:
      setForm({
        date: dayjs().format('YYYY-MM-DD'),
        projectName: '',
        category: '',
        task: '',
        hours: '',
        minutes: '',
        totalEffort: '',
        developerName: user?.email || '',
        comments: '',
      });
    } else {
      alert(`❌ Submission failed: ${data.error}`);
      console.error(data);
    }
  } catch (err) {
    alert('🚨 Error submitting form');
    console.error('Error:', err);
  }
};


  return (<>
<Container style={{width:'90%'}}>
    <Box display="flex" justifyContent="center" mt={4}>
      <Paper elevation={3} sx={{ p: 4, width: 700 }}>
        <Typography variant="h6" gutterBottom>
          Enter Today's Timesheet
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={3} >
              <TextField
                label="Date"
                type="date"
                fullWidth
                name="date"
                value={form.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          
            <Grid size={4} >
              <TextField
                select
                label="Project Name"
                fullWidth
                name="projectName"
                value={form.projectName}
                onChange={handleChange}
              >
   {projects?.map((project) => (
  <MenuItem key={project.id} value={project.id}>
    {project.name}
  </MenuItem>
))}
              </TextField>
            </Grid>

            <Grid size={4} >
              <TextField
                select
                label="Task Category"
                fullWidth
                name="category"
                value={form.category}
                onChange={handleChange}
              >
               {taskCategories?.map((taskCategories) => (
  <MenuItem key={taskCategories.id} value={taskCategories.id}>
    {taskCategories.name}
  </MenuItem>
))}
              </TextField>
            </Grid>

            <Grid size={12}>
              <TextField
                label="Task"
                fullWidth
                name="task"
                value={form.task}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={2}>
              <TextField
                label="Hrs"
                fullWidth
                name="hours"
                type="number"
                value={form.hours}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={2}>
              <TextField
                label="Min"
                fullWidth
                name="minutes"
                type="number"
                value={form.minutes}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={2}>
              <TextField
                label="Total Efforts"
                fullWidth
                name="totalEffort"
                value={form.totalEffort}
                InputProps={{ readOnly: true }}
              />
            </Grid>

         

            <Grid size={12}>
              <TextField
                label="Comments"
                fullWidth
                multiline
                rows={3}
                name="comments"
                value={form.comments}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" fullWidth>
                Submit Tasksheet 
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  </Container>  
    </>
  );
};

export default TasksheetEntryForm;
