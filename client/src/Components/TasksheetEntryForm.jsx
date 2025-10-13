import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import confetti from 'canvas-confetti';
import {
  Box, Paper, Grid, TextField, Button,
  Typography, Container, Autocomplete
} from '@mui/material';
import dayjs from 'dayjs';
import { api } from '../utils/api';
import Popper from '@mui/material/Popper';
import { styled } from '@mui/material/styles';

const CustomPopper = styled(Popper)(({ theme }) => ({
  // This sets the dropdown container width
  [`& .MuiAutocomplete-paper`]: {
    width: '400px', // ✅ Wider than input
  },
}));

const CustomPopperT = styled(Popper)(({ theme }) => ({
  '& .MuiAutocomplete-paper': {
    width: '400px',
    transform: 'translateX(-200px)', // ✅ Shift dropdown 300px to the left
    zIndex: 1300, // Ensure it's above other elements
  },
}));

 


 
const TasksheetEntryForm = forwardRef(({ user, projects, taskCategories, editMode, selectedEntry, onSuccess }, ref) => {
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

  // ✅ Prefill form on edit
  useEffect(() => {
    if (editMode && selectedEntry) {
      setForm({
        date: dayjs(selectedEntry.entry_date).format('YYYY-MM-DD'),
        projectName: selectedEntry.project_id || '',
        category: selectedEntry.task_category_id || '',
        task_name: selectedEntry.task_name || '',
        hours: selectedEntry.hours || '',
        minutes: selectedEntry.minutes || '',
        totalEffort: '',
        developerName: user?.email || '',
        comments: selectedEntry.comments || '',
      });
    }
  }, [editMode, selectedEntry, user]);

  // ✅ Calculate total effort
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
    const { name, value } = e.target;
    const parsedValue = ['hours', 'minutes'].includes(name) ? Number(value) : value;
    setForm((prev) => ({ ...prev, [name]: parsedValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
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
      let isFirstEntryToday = false;
      if (!editMode) {
        // Check if this is the first entry for today
        const res = await api.get(`/api/tasksheetEntries/user/${user.id}?date=${form.date}`);
        if (Array.isArray(res.data) && res.data.length === 0) {
          isFirstEntryToday = true;
        }
      }
      if (editMode && selectedEntry?.id) {
        await api.put(`/api/tasksheetEntries/${selectedEntry.id}`, payload);
      } else {
        await api.post('/api/tasksheetEntries', payload);
      }

  if (onSuccess) onSuccess(isFirstEntryToday);

      setForm({
        date: dayjs().format('YYYY-MM-DD'),
        projectName: '',
        category: '',
        task_name: '',
        hours: '',
        minutes: '',
        comments: '',
        totalEffort: '0.00',
        developerName: user?.email || ''
      });

      // Fire confetti if first entry of the day
      if (isFirstEntryToday) {
        setTimeout(() => {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            resize: true,
            useWorker: true
          });
        }, 300);
      }

    } catch (error) {
      console.error('❌ Submission error:', error);
      const message = error.response?.data?.message || 'There was an error submitting the tasksheet.';
      alert(message);
    }
  };

  return (
    <Container>
      <Typography variant="h5" sx={{'font-size': '1.6rem'}} mb={2}>
        My Timesheet Entries
      </Typography>
      <Box display="flex" justifyContent="center">
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{xs:12, md:6}}>
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
   <Grid container size={12} spacing={2}>
            <Grid  size={{xs:12, md:6}}>
              <Autocomplete
                options={projects}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={projects.find(p => p.id === form.projectName) || null}
              slots={{ popper: CustomPopper }}
                onChange={(e, value) => {
                  setForm(prev => ({ ...prev, projectName: value?.id || '' }));
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
               
      {option.name}
    
                  </li>
                )}
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

            <Grid size={{xs:12, md:6}}>
              <Autocomplete
                options={taskCategories}
                getOptionLabel={(option) => option.name}
                
                  slots={{ popper: CustomPopperT }}
   PopperProps={{
    disablePortal: true, // ✅ Keeps dropdown inside parent container
  }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={taskCategories.find(tc => tc.id === form.category) || null}
                onChange={(e, value) => {
                  setForm(prev => ({ ...prev, category: value?.id || '' }));
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.name}
                  </li>
                )}
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
            <Grid size={{xs:12, md:12}}>
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
<Grid container>
            <Grid size={{xs:12, md:4}}>
              <TextField
                label="Hrs"
                name="hours"
                type="number"
                fullWidth
                value={form.hours}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{xs:12, md:4}}>
              <TextField
                label="Min"
                name="minutes"
                type="number"
                fullWidth
                value={form.minutes}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{xs:12, md:4}}>
              <TextField
                label="Total Efforts"
                name="totalEffort"
                fullWidth
                value={form.totalEffort}
                InputProps={{ readOnly: true }}
              />
            </Grid>
</Grid>
            <Grid size={{xs:12, md:12}}>
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
          </Grid>
        </form>
      </Box>
    </Container>
  );
});

export default TasksheetEntryForm;
