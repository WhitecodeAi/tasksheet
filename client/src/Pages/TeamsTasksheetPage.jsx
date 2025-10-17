import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Container, Autocomplete, TextField, Chip, Stack } from '@mui/material';
import { CircularProgress } from '@mui/material';
import Breadcrumbs from '../Components/Breadcrumbs';
import { api } from '../utils/api';
import dayjs from 'dayjs';
import TasksheetEntriesDisplay from '../Components/TasksheetEntriesDisplay';
import { useNavigate } from 'react-router-dom';

// Color logic from DashboardPage
const getPaperStyle = (hours) => {
  if (hours > 5) {
    return {
      background:'#ebf9eb',
      color: '#127627'
    };
  } else if (hours >= 2 && hours <= 5) {
    return {
      background: '#fffae1',
      color:'#946900'
    };
  } else if (hours < 1) {
    return {
      background: '#fef1ee',
      color:'#b23015'
    };
  } else {
    return {
      background: 'linear-gradient(to bottom, #ffffff, #f7f9f9)'
    };
  }
};

import { Select, MenuItem } from '@mui/material';
import { useMemo } from 'react';

const TeamsTasksheetPage = () => {
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState({});
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week

  // Week options: current week and previous 3 weeks
  const weekOptions = Array.from({ length: 4 }).map((_, idx) => {
    const start = dayjs().startOf('week').subtract(idx, 'week');
    const end = start.endOf('week');
    return {
      label: idx === 0 ? 'This Week' : `${start.format('MMM D')} - ${end.format('MMM D')}`,
      start,
      end
    };
  });

  // Fetch users on mount
  useEffect(() => {
    api.get('/api/users')
      .then(res => {
        // Only update users if changed
        setUsers(prev => {
          const prevIds = prev.map(u => u.user_id).join(',');
          const newIds = res.data.map(u => u.user_id).join(',');
          return prevIds === newIds ? prev : res.data;
        });
      })
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    if (!users.length) return;
    const week = weekOptions[selectedWeek];
    // Ensure week starts with Monday
    const monday = week.start.day() === 0 ? week.start.add(1, 'day') : week.start.day(1);
    const datesArray = [];
    for (let i = 0; i < 7; i++) {
      datesArray.push(monday.add(i, 'day').format('YYYY-MM-DD'));
    }
    const cacheKey = `${selectedWeek}-${users.map(u => u.user_id).join(',')}`;
    if (cache[cacheKey]) {
      setWeeklySummary(cache[cacheKey]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(
      users.map(u =>
        api.get(`/api/tasksheetEntries/user/${u.user_id}?filter=week`)
          .then(res => ({ user: u, entries: res.data }))
          .catch(() => ({ user: u, entries: [] }))
      )
    )
      .then(results => {
        const summary = results.map(({ user, entries }) => {
          const daily = datesArray.map(date => {
            const dayEntries = entries.filter(e => dayjs(e.entry_date).format('YYYY-MM-DD') === date);
            const hours = dayEntries.reduce((sum, e) => sum + Number(e.hours || 0) + Number(e.minutes || 0) / 60, 0);
            return { date, hours: hours.toFixed(2) };
          });
          return { user, daily };
        });
        setWeeklySummary(summary);
        setCache(prev => ({ ...prev, [cacheKey]: summary }));
        setLoading(false);
      })
      .catch(() => {
        setWeeklySummary([]);
        setLoading(false);
      });
  }, [users, selectedWeek, weekOptions, cache]);

  return (
    <>
      <Typography variant="h4" sx={{ mt: 2, mb: 2, display: 'inline-block' }}>Teams Tasksheet</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mr: 1 }}>Week:</Typography>
        <Select
          value={selectedWeek}
          onChange={e => setSelectedWeek(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          {weekOptions.map((w, idx) => (
            <MenuItem key={idx} value={idx}>{w.label}</MenuItem>
          ))}
        </Select>
        <TextField
          placeholder="Search team members..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
          size="small"
        />
        <button
          type="button"
          style={{
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
            border: 'none',
            boxShadow: '0px 2px 4px rgba(25, 118, 210, 0.08)',
            marginLeft: 8
          }}
          onClick={() => {
            const filtered = users.filter(u => !search.trim() || u.name.toLowerCase().includes(search.trim().toLowerCase()));
            const targetUser = filtered.length > 0 ? filtered[0] : users[0];
            if (targetUser) navigate(`/tasksheet-details/${targetUser.user_id}`);
          }}
        >
          View Detailed Tasksheet
        </button>
      </Box>
      <Box mt={4}>
        {loading && users.length > 0 && weeklySummary.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>Loading team timesheet overview...</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress color="primary" size={40} thickness={4} />
              </Box>
            </Box>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {weeklySummary
              .filter(({ user }) =>
                !search.trim() || user.name.toLowerCase().includes(search.trim().toLowerCase())
              )
              .map(({ user, daily }) => (
                <Grid item xs={12} md={6} key={user.user_id}>
                  <Box sx={{ background: '#fff', borderRadius: 2, boxShadow: 1, p: 2, height: '100%', cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 } }}
                    onClick={() => navigate(`/tasksheet-details/${user.user_id}`)}>
                    <Stack direction="row" sx={{justifyContent:'space-between', alignItems:'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>{user.name}</Typography>
                    
                    </Stack>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {daily.map((day, idx) => (
                        <Box key={day.date} sx={{ px: 2, py: 1, borderRadius: 1, minWidth: 70, textAlign: 'center', ...getPaperStyle(Number(day.hours)) }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, fontSize: '.7rem' }}>
                            {dayjs(day.date).format('DD/ddd')}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1.15rem', color: getPaperStyle(Number(day.hours)).color }}>{day.hours}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Grid>
              ))}
          </Grid>
        )}
      </Box>
      {/* Removed user select and tasksheet entries grid */}
    </>
  );
}

export default TeamsTasksheetPage;
