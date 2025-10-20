import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {Paper, Box, Typography, TextField, MenuItem, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, Checkbox } from '@mui/material';
import Breadcrumbs from '../Components/Breadcrumbs';
import { api } from '../utils/api';
import TasksheetEntriesDisplay from '../Components/TasksheetEntriesDisplay';

const TasksheetDetailsPage = () => {
  // State declarations
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [quickRange, setQuickRange] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const quickRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'lastMonth', label: 'Last Month' },
  ];

  useEffect(() => {
    // Quick range logic
    if (!quickRange) return;
    const todayDate = new Date();
    let from = '';
    let to = '';
    if (quickRange === 'today') {
      from = to = todayDate.toISOString().slice(0, 10);
    } else if (quickRange === 'yesterday') {
      const y = new Date(todayDate);
      y.setDate(y.getDate() - 1);
      from = to = y.toISOString().slice(0, 10);
    } else if (quickRange === 'lastWeek') {
      const start = new Date(todayDate);
      start.setDate(start.getDate() - start.getDay() - 6);
      const end = new Date(todayDate);
      end.setDate(end.getDate() - end.getDay());
      from = start.toISOString().slice(0, 10);
      to = end.toISOString().slice(0, 10);
    } else if (quickRange === 'lastMonth') {
      const start = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
      const end = new Date(todayDate.getFullYear(), todayDate.getMonth(), 0);
      from = start.toISOString().slice(0, 10);
      to = end.toISOString().slice(0, 10);
    }
    setDateFrom(from);
    setDateTo(to);
  }, [quickRange]);

  useEffect(() => {
    api.get('/api/projects').then(res => setProjects(res.data)).catch(() => setProjects([]));
    api.get('/api/taskCategories').then(res => setCategories(res.data)).catch(() => setCategories([]));
    api.get('/api/users')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  }, []);

  const handleSearch = async () => {
    setHasSearched(true);
    // Build query params for filters (exclude search)
    const params = [];
    if (selectedUsers.length > 0) params.push(`users=${selectedUsers.join(',')}`);
    if (selectedProjects.length > 0) params.push(`projects=${selectedProjects.join(',')}`);
    if (selectedCategories.length > 0) params.push(`categories=${selectedCategories.join(',')}`);
    if (dateFrom) params.push(`from=${dateFrom}`);
    if (dateTo) params.push(`to=${dateTo}`);
    const query = params.length ? `?${params.join('&')}` : '';
    // For multi-user, fetch all and flatten
    let allEntries = [];
    if (selectedUsers.length > 0) {
      await Promise.all(selectedUsers.map(async (uid) => {
        const res = await api.get(`/api/tasksheetEntries/user/${uid}${query}`);
        console.debug(`TasksheetDetailsPage: fetched ${res.data.length} entries for user`, uid, res.data?.[0]);
        allEntries = allEntries.concat(res.data);
      }));
    }
    console.debug('TasksheetDetailsPage: total entries after fetch', allEntries.length);
    setEntries(allEntries);
  };

  const isLoading = users.length === 0 || projects.length === 0 || categories.length === 0;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Tasksheet Details</Typography>
      {isLoading ? (
        <Typography sx={{ mt: 4 }}>Loading data...</Typography>
      ) : (
        <>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
           
            <TextField
              label="Date From"
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ minWidth: 140 }}
            />
            <TextField
              label="Date To"
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ minWidth: 140 }}
            />
           
            <FormControl sx={{ minWidth: 220 }} size="small">
              <InputLabel>Resource (Users)</InputLabel>
              <Select
                multiple
                value={selectedUsers}
                onChange={e => setSelectedUsers(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                label="Resource (Users)"
                renderValue={selected => users.filter(u => selected.includes(u.user_id)).map(u => u.name).join(', ')}
              >
                {users.map(u => (
                  <MenuItem key={u.user_id} value={u.user_id}>
                    <Checkbox checked={selectedUsers.indexOf(u.user_id) > -1} />
                    {u.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 220 }} size="small">
              <InputLabel>Project Name</InputLabel>
              <Select
                multiple
                value={selectedProjects}
                onChange={e => setSelectedProjects(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                label="Project Name"
                renderValue={selected => projects.filter(p => selected.includes(p.id || p.project_id)).map(p => p.name).join(', ')}
              >
                {projects.map(p => (
                  <MenuItem key={p.id || p.project_id} value={p.id || p.project_id}>
                    <Checkbox checked={selectedProjects.indexOf(p.id || p.project_id) > -1} />
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 220 }} size="small">
              <InputLabel>Category</InputLabel>
              <Select
                multiple
                value={selectedCategories}
                onChange={e => setSelectedCategories(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                label="Category"
                renderValue={selected => categories.filter(c => selected.includes(c.id || c.category_id)).map(c => c.name).join(', ')}
              >
                {categories.map(c => (
                  <MenuItem key={c.id || c.category_id} value={c.id || c.category_id}>
                    <Checkbox checked={selectedCategories.indexOf(c.id || c.category_id) > -1} />
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" sx={{ minWidth: 120 }} onClick={handleSearch}>
              Search
            </Button>
          </Stack>
          </Paper>
      
          {/* JSON preview removed */}
          {hasSearched ? (
           <Paper><div></div><TasksheetEntriesDisplay
              entries={entries}
              users={users}
              selectedProjects={selectedProjects}
              selectedCategories={selectedCategories}
              dateFrom={dateFrom}
              dateTo={dateTo}
              search={search}
              userId={selectedUsers.length === 1 ? selectedUsers[0] : ''}
              showActions={false}
            />
            </Paper> 
          ) : (
            <Typography sx={{ mt: 4, color: 'gray' }}>Select filters and click Search to view results.</Typography>
          )}
        </>
      )}
    </Box>
  );
}

export default TasksheetDetailsPage;
