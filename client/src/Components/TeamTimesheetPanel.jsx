import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Stack, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { api } from '../utils/api';

// Fetch users from backend API using axios instance with auth
const fetchUsers = async () => {
  const res = await api.get('/api/users');
  return res.data;
};

// Fetch timesheet for all users for a specific date using axios instance with auth
const fetchUserTimesheet = async (date) => {
  const res = await api.get(`/api/tasksheetEntries/team-summary?date=${date.format('YYYY-MM-DD')}`);
  return res.data;
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
  const [userEntries, setUserEntries] = useState({}); // { userId: [entries] }
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers().then(setUsers).catch(console.error);
  }, []);

  useEffect(() => {
    if (users.length === 0) return;
    const today = dayjs().format('YYYY-MM-DD');
    Promise.all(
      users.map(u =>
        api.get(`/api/tasksheetEntries/user/${u.user_id}?date=${today}`)
          .then(res => ({ userId: u.user_id, entries: res.data }))
          .catch(() => ({ userId: u.user_id, entries: [] }))
      )
    ).then(results => {
      const entriesMap = {};
      results.forEach(r => { entriesMap[r.userId] = r.entries; });
      setUserEntries(entriesMap);
    });
  }, [users]);

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
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} gap={2}>
        <Typography variant="h6">Team's Tasksheet</Typography>
        <a
          href="#"
          style={{
            display: 'inline-block',
            padding: '8px 24px',
            borderRadius: '8px',
            background: '#1976d2',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1rem',
            minHeight: '32px',
            textTransform: 'none',
            fontWeight: 400,
            textDecoration: 'none',
            boxShadow: '0px 2px 4px rgba(25, 118, 210, 0.08)',
          }}
          onClick={e => { e.preventDefault(); /* TODO: Add navigation or modal logic here */ }}
        >
          View Details
        </a>
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
                <TableCell align="center">Today's Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map(user => {
                const entries = userEntries[user.user_id] || [];
                const totalMinutes = entries.reduce((sum, entry) => sum + Number(entry.hours || 0) * 60 + Number(entry.minutes || 0), 0);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                return (
                  <TableRow key={user.user_id} hover>
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
                      {hours || minutes ? `${hours}:${minutes.toString().padStart(2, '0')}` : '0h'}
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