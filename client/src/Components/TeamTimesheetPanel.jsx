import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Stack, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

// Fetch users from backend API
const fetchUsers = async () => {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  return await res.json();
};

// Fetch timesheet for all users for a specific date
const fetchUserTimesheet = async (date) => {
  const res = await fetch(`/api/tasksheetEntries/team-summary?date=${date.format('YYYY-MM-DD')}`);
  if (!res.ok) throw new Error('Failed to fetch timesheet');
  return await res.json();
};

const getInitials = (name) => {
  if (!name) return '';
  return name[0].toUpperCase();
};

const dateOptions = [
  { label: 'Today', value: 0 },
  { label: 'One day before', value: 1 },
  { label: 'Two days before', value: 2 },
  { label: 'Three days before', value: 3 },
  { label: 'Four days before', value: 4 },
];

const TeamTimesheetPanel = () => {
  const [users, setUsers] = useState([]);
  const [timesheet, setTimesheet] = useState([]);
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers().then(setUsers).catch(console.error);
  }, []);

  useEffect(() => {
    const date = dayjs().subtract(selectedDayOffset, 'day');
    fetchUserTimesheet(date).then(setTimesheet).catch(console.error);
  }, [users, selectedDayOffset]); // Fetch timesheet after users are loaded or day changes

  // Filter users by search query (name or email)
  const filteredUsers = users.filter(user => {
    const query = search.trim().toLowerCase();
    return (
      !query ||
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query))
    );
  });

  return (
    <Box mt={9}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Team Timesheet</Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="day-select-label">Day</InputLabel>
          <Select
            labelId="day-select-label"
            id="day-select"
            value={selectedDayOffset}
            label="Day"
            onChange={e => setSelectedDayOffset(e.target.value)}
          >
            {dateOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {/* Search box between title and list */}
      <Box mb={2}>
        <TextField
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email"
          size="small"
          sx={{
            width: "100%",
            backgroundColor: "#f8fafc",
            borderRadius: 2,
            boxShadow: "none"
          }}
        />
      </Box>
      {/* List with fixed width and vertical scrollbar */}
      <Box sx={{   maxHeight: "400px", overflowY: "auto" }}>
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.100' }}>
                <TableCell>User</TableCell>
                <TableCell align="center">Total Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map(user => {
                const entry = timesheet.find(t => t.user_id === user.user_id);
                return (
                  <TableRow
                    key={user.user_id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/user-timesheet/${user.user_id}`)}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                          {getInitials(user.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      {entry ? entry.totalTime : '0h'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default TeamTimesheetPanel;