import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import dayjs from 'dayjs';
import { api } from '../utils/api';
import Breadcrumbs from '../Components/Breadcrumbs';

const filterOptions = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: 'last_3_months' },
  { label: 'Last 6 Months', value: 'last_6_months' },
];

const UserTimesheetPage = () => {
  const { userId } = useParams();
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('today');
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get logged in user from localStorage
    const user = localStorage.getItem('user');
    setLoggedInUser(user ? JSON.parse(user) : null);
    console.log('[UserTimesheetPage] Fetching entries for userId:', userId, 'filter:', filter);
    api.get(`/api/tasksheetEntries/user/${userId}?filter=${filter}`)
      .then(res => {
        console.log('[UserTimesheetPage] Entries response:', res.data);
        setEntries(res.data);
      })
      .catch((err) => {
        console.error('[UserTimesheetPage] Error fetching entries:', err);
        setEntries([]);
      });
  }, [userId, filter]);

  useEffect(() => {
    api.get('/api/users')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    if (users.length === 0) return; // Wait for users to load
    const userIdStr = String(userId);
    const foundUser = users.find(u => String(u.user_id) === userIdStr);
    if (foundUser && foundUser.name) {
      setUserName(foundUser.name);
    } else {
      api.get(`/api/users/${userIdStr}`)
        .then(res => {
          let name = res.data.name || res.data.username || userIdStr;
          if (name && typeof name === 'string') {
            name = name.replace(/\s*\([^)]*\)/g, '').trim();
          }
          setUserName(name);
        })
        .catch(() => setUserName(userIdStr));
    }
  }, [userId, users]);

  return (
    <Box>
      <Breadcrumbs pageTitle={userName ? `${userName}'s Tasksheet` : "User's Tasksheet"} />
      <Typography variant="h5" sx={{'font-size': '1.6rem'}} mb={2}>
        {`Tasksheet Entries for ${userName}`}
      </Typography>
      <Box mb={2} display="flex" gap={2}>
        {/* User selection dropdown for managers/admins */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="user-select-label">Select User</InputLabel>
          <Select
            labelId="user-select-label"
            value={String(userId) || ''}
            label="Select User"
            onChange={e => navigate(`/user-timesheet/${String(e.target.value)}`)}
          >
            {users.map(user => (
              <MenuItem key={user.user_id} value={String(user.user_id)}>{user.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="day-filter-label">Day Filter</InputLabel>
          <Select
            labelId="day-filter-label"
            value={filter}
            label="Day Filter"
            onChange={e => setFilter(e.target.value)}
          >
            {filterOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {entries.length === 0 ? (
        <Typography>No entries found.</Typography>
      ) : (
        entries.map(entry => (
          <Paper key={entry.id} sx={{ p: 2, mb: 2 }}>
            <Typography><strong>Date:</strong> {entry.entry_date}</Typography>
            <Typography><strong>Hours:</strong> {entry.hours}</Typography>
            <Typography><strong>Minutes:</strong> {entry.minutes}</Typography>
            <Typography><strong>Task:</strong> {entry.task_name}</Typography>
            <Typography><strong>Comments:</strong> {entry.comments}</Typography>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default UserTimesheetPage;
