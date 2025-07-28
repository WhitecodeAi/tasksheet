import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Grid, TextField, Button,
  Typography, Container, Autocomplete
} from '@mui/material';
import dayjs from 'dayjs';

const TasksheetEntryForm = ({ user, projects, taskCategories, onSuccess }) => {
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

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const h = parseFloat(form.hours || 0);
    const m = parseFloat(form.minutes || 0);
    const total = h + m / 60;
    setForm((prev) => ({ ...prev, totalEffort: total.toFixed(2) }));
  }, [form.hours, form.minutes]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.date) newErrors.date = 'Date is required';
    if (!form.projectName) newErrors.projectName = 'Project name is required';
    if (!form.category) newErrors.category = 'Task category is required';
    if (!form.task?.trim()) newErrors.task = 'Task name is required';
   // if (!form.hours || parseFloat(form.hours) <= 0) newErrors.hours = 'Hours must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Check for zero effort before anything else
  const totalEffort = (parseInt(form.hours) || 0) * 60 + (parseInt(form.minutes) || 0);

if (totalEffort === 0) {
  alert('Please enter time (hours or minutes)');
  return;
}


  if (!validateForm()) return;

  const payload = {
    entry_date: form.date,
    user_id: user.id,
    project_id: form.projectName,
    task_category_id: form.category,
    task_name: form.task,
    hours: parseInt(form.hours || 0),
    minutes: parseInt(form.minutes || 0),
    comments: form.comments
  };

  try {
    const response = await fetch('http://localhost:3001/api/tasksheetEntries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Failed to submit tasksheet');
    const data = await response.json();
    console.log('✅ Submitted successfully:', data);
    alert('Tasksheet submitted successfully!');
    if (onSuccess) onSuccess();

     // 🔄 Reset the entire form cleanly
    setForm({
      date: '',
      projectName: '',
      category: '',
      task: '',
      hours: '',
      minutes: '',
      comments: '',
      totalEffort: '0.00'
    });
     
  } catch (error) {
    console.error('❌ Submission error:', error);
    alert('There was an error submitting the tasksheet.');
  }
};

  return (
    <Container style={{ width: '90%' }}>
      <Box display="flex" justifyContent="center" mt={4}>
        <Paper elevation={3} sx={{ p: 4, width: 700 }}>
          <Typography variant="h6" gutterBottom>Enter Today's Timesheet</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Date"
                  type="date"
                  name="date"
                  fullWidth
                  value={form.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!!errors.date}
                  helperText={errors.date}
                />
              </Grid>

            

              <Grid item size={12}>
                <Autocomplete
                  options={projects}
                  getOptionLabel={(option) => option.name}
                  value={projects.find(p => p.id === form.projectName) || null}
                  onChange={(e, value) => {
                    setForm(prev => ({ ...prev, projectName: value?.id || '' }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Project Name"
                      required
                      error={!!errors.projectName}
                      helperText={errors.projectName}
                    />
                  )}
                />
              </Grid>

                <Grid item size={12}>
                <Autocomplete
                  options={taskCategories}
                  getOptionLabel={(option) => option.name}
                  value={taskCategories.find(tc => tc.id === form.category) || null}
                  onChange={(e, value) => {
                    setForm(prev => ({ ...prev, category: value?.id || '' }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Task Category"
                      required
                      error={!!errors.category}
                      helperText={errors.category}
                    />
                  )}
                />
              </Grid>
   <Grid item size={12}>
                <TextField
                  label="Task"
                  name="task"
                  fullWidth
                  value={form.task}
                  onChange={handleChange}
                  required
                  error={!!errors.task}
                  helperText={errors.task}
                  multiline // turns it into a textarea
                  rows={4}  // adjust height (optional)
                />
              </Grid>
                <Grid item size={4}>
                <TextField
                  label="Hrs"
                  name="hours"
                  type="number"
                  fullWidth
                  value={form.hours}
                  onChange={handleChange}
                    
                />
              </Grid>

                <Grid item size={4}>
                <TextField
                  label="Min"
                  name="minutes"
                  type="number"
                  fullWidth
                  value={form.minutes}
                  onChange={handleChange}
                />
              </Grid>

                <Grid item size={4}>
                <TextField
                  label="Total Efforts"
                  name="totalEffort"
                  fullWidth
                  value={form.totalEffort}
                  InputProps={{ readOnly: true }}
                />
              </Grid>

               <Grid item size={12}>
                <TextField
                  label="Comments"
                  name="comments"
                  fullWidth
                  multiline
                  rows={1}
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
  );
};

export default TasksheetEntryForm;
