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
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/api/tasksheetEntries/user/${userId}?filter=${filter}`)
      .then(res => setEntries(res.data))
      .catch(() => setEntries([]));
  }, [userId, filter]);

  useEffect(() => {
    api.get('/api/users')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    api.get(`/api/users/${userId}`)
      .then(res => {
        // Prefer name, fallback to username, fallback to userId
        let name = res.data.name || res.data.username || userId;
        // If name contains email, strip it
        if (name && typeof name === 'string') {
          // Remove anything in parentheses (e.g. email)
          name = name.replace(/\s*\([^)]*\)/g, '').trim();
        }
        setUserName(name);
      })
  .catch(() => setUserName(userId));
  }, [userId]);

  return (
    <Box>
  <Breadcrumbs pageTitle={userName ? `${userName}'s Tasksheet` : "User's Tasksheet"} />
  <Typography variant="h5" sx={{'font-size': '1.6rem'}} mb={2}>{userName ? `Tasksheet for ${userName}` :  "User's Tasksheet"}</Typography>
      <Box mb={2} display="flex" gap={2}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="user-select-label">Select User</InputLabel>
          <Select
            labelId="user-select-label"
            value={userId || ''}
            label="Select User"
            onChange={e => navigate(`/user-timesheet/${e.target.value}`)}
          >
            {users.map(user => (
              <MenuItem key={user.user_id} value={user.user_id}>{user.name}</MenuItem>
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
