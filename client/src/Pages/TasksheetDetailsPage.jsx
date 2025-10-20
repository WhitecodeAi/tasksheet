import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {Paper, Box, Typography, TextField, MenuItem, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, Checkbox, IconButton, Tooltip } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import Breadcrumbs from '../Components/Breadcrumbs';
import { api } from '../utils/api';
import sortByName from '../utils/sortByName';
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
  const [showFilters, setShowFilters] = useState(false);
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
    api.get('/api/projects')
      .then(res => setProjects(sortByName(res.data)))
      .catch(() => setProjects([]));

    api.get('/api/taskCategories')
      .then(res => setCategories(sortByName(res.data)))
      .catch(() => setCategories([]));

    api.get('/api/users')
      .then(res => setUsers(sortByName(res.data)))
      .catch(() => setUsers([]));
  }, []);

  // Shared MenuProps to reduce vertical spacing between items in Select menus
  const compactMenuProps = {
    PaperProps: {
      sx: {
        '& .MuiMenuItem-root': {
          py: 0.25,
          minHeight: 26,
          '& .MuiListItemIcon-root': { minWidth: 32 },
          '& .MuiMenuItem-root .MuiCheckbox-root': { padding: '2px' }
        },
        '& .MuiList-root': {
          paddingTop: 2,
          paddingBottom: 2,
        },
        '& .MuiMenuItem-root .MuiTypography-root': {
          fontSize: '0.875rem'
        }
      }
    }
  };

  // Max width for select closed-display area (truncation)
  const DISPLAY_MAX = 500;

  // Sentinel value used for the in-menu "All" option
  const ALL_VALUE = '__ALL__';

  // Precompute id lists and "all selected" flags for each multi-select
  const allUserIds = users.map(u => u.user_id ?? u.id).filter(Boolean);
  const usersAllSelected = allUserIds.length > 0 && allUserIds.every(id => selectedUsers.includes(id));
  const allProjectIds = projects.map(p => p.id ?? p.project_id).filter(Boolean);
  const projectsAllSelected = allProjectIds.length > 0 && allProjectIds.every(id => selectedProjects.includes(id));
  const allCategoryIds = categories.map(c => c.id ?? c.category_id).filter(Boolean);
  const categoriesAllSelected = allCategoryIds.length > 0 && allCategoryIds.every(id => selectedCategories.includes(id));

  const handleUsersChange = (e) => {
    const val = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
    if (val.includes(ALL_VALUE)) {
      // Toggle all
      setSelectedUsers(usersAllSelected ? [] : allUserIds);
      return;
    }
    setSelectedUsers(val);
  };

  const handleProjectsChange = (e) => {
    const val = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
    if (val.includes(ALL_VALUE)) {
      setSelectedProjects(projectsAllSelected ? [] : allProjectIds);
      return;
    }
    setSelectedProjects(val);
  };

  const handleCategoriesChange = (e) => {
    const val = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
    if (val.includes(ALL_VALUE)) {
      setSelectedCategories(categoriesAllSelected ? [] : allCategoryIds);
      return;
    }
    setSelectedCategories(val);
  };

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
    // If no users explicitly selected, search across all known users
    const targets = (selectedUsers.length > 0) ? selectedUsers : users.map(u => u.user_id ?? u.id);
    await Promise.all(targets.map(async (uid) => {
      const res = await api.get(`/api/tasksheetEntries/user/${uid}${query}`);
      console.debug(`TasksheetDetailsPage: fetched ${Array.isArray(res.data) ? res.data.length : 0} entries for user`, uid, res.data?.[0]);
      if (Array.isArray(res.data)) allEntries = allEntries.concat(res.data);
    }));
    console.debug('TasksheetDetailsPage: total entries after fetch', allEntries.length);
    setEntries(allEntries);
  };

  const isLoading = users.length === 0 || projects.length === 0 || categories.length === 0;

  return (
    <Box>
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
                onChange={handleUsersChange}
                label="Resource (Users)"
                renderValue={selected => {
                  if (usersAllSelected) return 'All';
                  const names = users.filter(u => selected.includes(u.user_id ?? u.id)).map(u => u.name);
                  if (names.length === 0) return '';
                  if (names.length === 1) return (
                    <Box sx={{ maxWidth: DISPLAY_MAX, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{names[0]}</Box>
                  );
                  // show count and provide tooltip for full list
                  return (
                    <Tooltip title={names.join(', ')}>
                      <Box sx={{ maxWidth: DISPLAY_MAX, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{`${names.length} selected`}</Box>
                    </Tooltip>
                  );
                }}
                MenuProps={compactMenuProps}
              >
                <MenuItem value={ALL_VALUE}>
                  <Checkbox size="small" checked={usersAllSelected} />
                  All
                </MenuItem>
                {users.map(u => (
                  <MenuItem key={u.user_id} value={u.user_id}>
                    <Checkbox size="small" checked={selectedUsers.indexOf(u.user_id) > -1} />
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
                onChange={handleProjectsChange}
                label="Project Name"
                renderValue={selected => {
                  if (projectsAllSelected) return 'All';
                  const names = projects.filter(p => selected.includes(p.id ?? p.project_id)).map(p => p.name);
                  if (names.length === 0) return '';
                  if (names.length === 1) return (
                    <Box sx={{ maxWidth: DISPLAY_MAX, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{names[0]}</Box>
                  );
                  return (
                    <Tooltip title={names.join(', ')}>
                      <Box sx={{ maxWidth: DISPLAY_MAX, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{`${names.length} selected`}</Box>
                    </Tooltip>
                  );
                }}
                MenuProps={{
                  ...compactMenuProps,
                  PaperProps: {
                    ...compactMenuProps.PaperProps,
                    sx: {
                      ...compactMenuProps.PaperProps.sx,
                      maxWidth: 500,
                    }
                  }
                }}
              >
                <MenuItem value={ALL_VALUE}>
                  <Checkbox size="small" checked={projectsAllSelected} />
                  All
                </MenuItem>
                {projects.map(p => (
                  <MenuItem key={p.id || p.project_id} value={p.id || p.project_id}>
                    <Checkbox size="small" checked={selectedProjects.indexOf(p.id || p.project_id) > -1} />
                    <Box sx={{ maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 220 }} size="small">
              <InputLabel>Category</InputLabel>
              <Select
                multiple
                value={selectedCategories}
                onChange={handleCategoriesChange}
                label="Category"
                renderValue={selected => {
                  if (categoriesAllSelected) return 'All';
                  const names = categories.filter(c => selected.includes(c.id ?? c.category_id)).map(c => c.name);
                  if (names.length === 0) return '';
                  if (names.length === 1) return (
                    <Box sx={{ maxWidth: DISPLAY_MAX, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{names[0]}</Box>
                  );
                  return (
                    <Tooltip title={names.join(', ')}>
                      <Box sx={{ maxWidth: DISPLAY_MAX, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{`${names.length} selected`}</Box>
                    </Tooltip>
                  );
                }}
                MenuProps={compactMenuProps}
              >
                <MenuItem value={ALL_VALUE}>
                  <Checkbox size="small" checked={categoriesAllSelected} />
                  All
                </MenuItem>
                {categories.map(c => (
                  <MenuItem key={c.id || c.category_id} value={c.id || c.category_id}>
                    <Checkbox size="small" checked={selectedCategories.indexOf(c.id || c.category_id) > -1} />
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" sx={{ minWidth: 120 }} onClick={handleSearch}>
              Get Data
            </Button>
          </Stack>
          </Paper>
      
          {/* JSON preview removed */}
          {hasSearched ? (
           <>
            <Paper sx={{ p: 2, borderBottomLeftRadius:0,  borderBottomRightRadius:0,   }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  placeholder="Search entries..."
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ minWidth: 300, backgroundColor: '#fff' }}
                />
                <Tooltip title="Filters">
                  <IconButton
                    onClick={() => setShowFilters(prev => !prev)}
                    color={showFilters ? 'primary' : 'default'}
                    size="small"
                    aria-label="Toggle filters"
                  >
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Paper>
            <Paper>
              <TasksheetEntriesDisplay
                entries={entries}
                users={users}
                selectedProjects={selectedProjects}
                selectedCategories={selectedCategories}
                dateFrom={dateFrom}
                dateTo={dateTo}
                search={search}
                userId={selectedUsers.length === 1 ? selectedUsers[0] : ''}
                showActions={false}
                showFilters={showFilters}
              />
            </Paper>
           </>
          ) : (
            <Typography sx={{ mt: 4, color: 'gray' }}>Select filters and click Search to view results.</Typography>
          )}
        </>
      )}
    </Box>
  );
}

export default TasksheetDetailsPage;
