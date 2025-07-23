import React from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');      // Remove token
    // If you're maintaining user state, reset it here
    navigate('/login');                    // Redirect to login
  };

  return (
    <Button color="error" variant="outlined" onClick={handleLogout}>
      Logout
    </Button>
  );
};

 


// Dummy data for now – later this will come from backend
const last5Days = [
  { date: '2025-07-17', hours: 7.5 },
  { date: '2025-07-16', hours: 6 },
  { date: '2025-07-15', hours: 8 },
  { date: '2025-07-14', hours: 5 },
  { date: '2025-07-13', hours: 7 },
];

const DashboardPage = () => {
  return (
    <Box p={4}>

 

      <Typography variant="h4" gutterBottom>
        Welcome, Ganesh!
      </Typography>

      <Typography variant="h6" gutterBottom>
        Time Summary (Last 5 Days)
      </Typography>

      <Grid container spacing={2}>
        {last5Days.map((day, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper elevation={2} style={{ padding: 16 }}>
              <Typography variant="subtitle1">{day.date}</Typography>
              <Typography variant="body1">Hours: {day.hours}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box mt={4}>
        <Button variant="contained" color="primary" href="/timesheet-entry">
          Enter Today’s Timesheet
        </Button>
      </Box>
    </Box>
  );
};

export default DashboardPage;
