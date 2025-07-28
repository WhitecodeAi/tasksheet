import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import AdminDashboard from './Dashboard/AdminDashboard';

export const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Remove user details if stored
    navigate('/login');
  };

  return (
    <Button color="error" variant="outlined" onClick={handleLogout}>
      Logout
    </Button>
  );
};

const DashboardPage = () => {
  const [summary, setSummary] = useState([]);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userId = user.id;


 const getPaperStyle = (hours) => {
  if (hours > 5) {
    return {
      background:'#ebf9eb',
    color: ' #127627'

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
      background: 'linear-gradient(to bottom, #ffffff, #f7f9f9)' // white to neutral gray
    };
  }
};


  useEffect(() => {
    const endDate = dayjs();
    const datesArray = [];

    for (let i = 4; i >= 0; i--) {
      datesArray.push(endDate.subtract(i, 'day').format('YYYY-MM-DD'));
    }

    axios
      .get(`http://localhost:3001/api/tasksheetEntries/user/${userId}`)
      .then((res) => {
        const entries = res.data;
        const summaryData = datesArray.map((date) => {
          const dailyEntries = entries.filter(
            (entry) => dayjs(entry.entry_date).format('YYYY-MM-DD') === date
          );
          const totalHours = dailyEntries.reduce(
            (sum, entry) => sum + Number(entry.hours || 0),
            0
          );
          return { date, hours: totalHours };
        });
        setSummary(summaryData);
      })
      .catch((err) => {
        console.error('Error fetching timesheet entries:', err);
        // Set default empty data if fetch fails
        setSummary(datesArray.map((date) => ({ date, hours: 0 })));
      });
  }, [userId]);

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.name || 'User'}!{user.role}
      </Typography>

    
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Time Summary (Last 5 Days)
      </Typography>

     <Grid container spacing={2}>
 {[...summary].reverse().map((day, index) => (
    <Grid item xs={12} sm={6} md={4} key={index}>
      <Paper elevation={1} sx={{ p: 2, ...getPaperStyle(day.hours) }}>
  <Typography variant="subtitle1">{day.date}</Typography>
  <Typography variant="body1">
    <strong>Hours: {day.hours.toFixed(1)}</strong>
  </Typography>
</Paper>

    </Grid>
  ))}
</Grid>


      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          href={`/tasksheet-entry?date=${dayjs().format('YYYY-MM-DD')}`}
        >
          Enter Today’s Tasksheet
        </Button>
      </Box>

    </Box>
  );
};

export default DashboardPage;
