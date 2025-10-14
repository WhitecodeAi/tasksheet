import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Container, Autocomplete, TextField, Chip } from '@mui/material';
import Breadcrumbs from '../Components/Breadcrumbs';
import { api } from '../utils/api';
import dayjs from 'dayjs';
import TasksheetEntriesDisplay from '../Components/TasksheetEntriesDisplay';

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
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week

  useEffect(() => {
    api.get('/api/users').then(res => setUsers(res.data));
  }, []);

  // Week options: last 4 weeks
  const weekOptions = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < 4; i++) {
      const start = dayjs().startOf('week').subtract(i, 'week');
      const end = start.endOf('week');
      weeks.push({
        label: `${start.format('DD MMM')} To ${end.format('DD MMM')}`,
        start,
        end,
      });
    }
    return weeks;
  }, []);

  useEffect(() => {
    if (users.length === 0) return;
    const week = weekOptions[selectedWeek];
    // Ensure week starts with Monday
    const monday = week.start.day() === 0 ? week.start.add(1, 'day') : week.start.day(1);
    const datesArray = [];
    for (let i = 0; i < 7; i++) {
      datesArray.push(monday.add(i, 'day').format('YYYY-MM-DD'));
    }
    Promise.all(
      users.map(u =>
        api.get(`/api/tasksheetEntries/user/${u.user_id}?filter=week`)
          .then(res => ({ user: u, entries: res.data }))
          .catch(() => ({ user: u, entries: [] }))
      )
    ).then(results => {
      const summary = results.map(({ user, entries }) => {
        const daily = datesArray.map(date => {
          const dayEntries = entries.filter(e => dayjs(e.entry_date).format('YYYY-MM-DD') === date);
          const hours = dayEntries.reduce((sum, e) => sum + Number(e.hours || 0) + Number(e.minutes || 0) / 60, 0);
          return { date, hours: hours.toFixed(2) };
        });
        return { user, daily };
      });
      setWeeklySummary(summary);
    });
  }, [users, selectedWeek, weekOptions]);

  return (
    <>
      <Typography variant="h4" sx={{ mt: 2, mb: 2, display: 'inline-block' }}>Teams Tasksheet</Typography>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 2 }}>
        <Typography variant="h6" sx={{ mr: 1 }}>Week :</Typography>
        <Select
          value={selectedWeek}
          onChange={e => setSelectedWeek(e.target.value)}
          sx={{ minWidth: 180, mr: 2 }}
        >
          {weekOptions.map((w, idx) => (
            <MenuItem key={idx} value={idx}>{w.label}</MenuItem>
          ))}
        </Select>
        <TextField
          placeholder="Search.."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />
      </Box>
      <Box mt={4}>
        <Grid container spacing={3}>
          {weeklySummary
            .filter(({ user }) =>
              !search.trim() || user.name.toLowerCase().includes(search.trim().toLowerCase())
            )
            .map(({ user, daily }) => (
              <Grid item size={{ xs: 12, md: 6 }} key={user.user_id}>
                <Box sx={{ background: '#fff', borderRadius: 2, boxShadow: 1, p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>{user.name}</Typography>
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
      </Box>
      <Box mb={4}>
        <Autocomplete
          multiple
          options={users}
          getOptionLabel={option => option.name}
          value={selectedUsers}
          onChange={(e, val) => setSelectedUsers(val)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option.name} {...getTagProps({ index })} key={option.user_id} />
            ))
          }
          renderInput={params => (
            <TextField {...params} label="Select Users" placeholder="Choose team members" />
          )}
          sx={{ minWidth: 320, maxWidth: 480, mb: 2 }}
        />
        {selectedUsers.length > 0 && (
          <TasksheetEntriesDisplay entries={entries} showActions={false} />
        )}
      </Box>
    </>
  );
};

export default TeamsTasksheetPage;
