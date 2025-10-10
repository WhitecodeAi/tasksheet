import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Select, MenuItem } from '@mui/material';
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

  useEffect(() => {
    api.get(`/api/tasksheetEntries/user/${userId}?filter=${filter}`)
      .then(res => setEntries(res.data))
      .catch(() => setEntries([]));
  }, [userId, filter]);

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
  <Typography variant="h5" mb={2}>{userName ? `Tasksheet for ${userName}` :  "User's Tasksheet"}</Typography>
      <Box mb={2}>
        <Select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          size="small"
        >
          {filterOptions.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
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
