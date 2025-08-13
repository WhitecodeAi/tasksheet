import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Box, Paper, Grid, TextField, Button,
  Typography, Container, Autocomplete
} from '@mui/material';
import dayjs from 'dayjs';
import { api } from '../utils/api';

const TasksheetEntryForm = forwardRef(({ user, projects, taskCategories, onSuccess }, ref) => {
  const [form, setForm] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    projectName: '',
    category: '',
    task_name: '',
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

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit({ preventDefault: () => {} });
    }
  }));

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.date) newErrors.date = 'Date is required';
    if (!form.projectName) newErrors.projectName = 'Project name is required';
    if (!form.category) newErrors.category = 'Task category is required';
    if (!form.task_name?.trim()) newErrors.task_name = 'Task name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      task_name: form.task_name,
      hours: parseInt(form.hours || 0),
      minutes: parseInt(form.minutes || 0),
      comments: form.comments
    };

    try {
      await api.post('/api/tasksheetEntries', payload);
      alert('Tasksheet submitted successfully!');
      if (onSuccess) onSuccess();

      setForm({
        date: '',
        projectName: '',
        category: '',
        task_name: '',
        hours: '',
        minutes: '',
        comments: '',
        totalEffort: '0.00'
      });

    } catch (error) {
      console.error('❌ Submission error:', error);
      const message = error.response?.data?.message || 'There was an error submitting the tasksheet.';
      alert(message);
    }
  };

  return (
    <Container >
      <Box display="flex" justifyContent="center"  >
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

              <Grid item size={12} spacing={2} direction={{ xs: 'column', sm: 'row' }} container>
                <Grid item size={6}>
             <Autocomplete
  options={projects}
  getOptionLabel={(option) => option.name}
  isOptionEqualToValue={(option, value) => option.id === value.id}
  getOptionDisabled={(option) => !option.id}
  renderOption={(props, option) => (
    <li {...props} key={option.id}>
      {option.name}
    </li>
  )}
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

              <Grid item size={6}>
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
            </Grid>
              <Grid item size={12}>
                <TextField
                  label="Task"
                  name="task_name"
                  fullWidth
                  value={form.task_name}
                  onChange={handleChange}
                  required
                  error={!!errors.task_name}
                  helperText={errors.task_name}
                  multiline
                  rows={8}
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
                  className='no-resize'
                  value={form.comments}
                  onChange={handleChange}
                InputProps={{
    className: 'no-resize',
  }}
                />
              </Grid>

              {/* <Grid item xs={12}>
                <Button type="submit" variant="contained" fullWidth>
                  Submit Tasksheet
                </Button>
              </Grid> */}
            </Grid>
          </form>
        </Box>
    </Container>
  );
});

export default TasksheetEntryForm;

 