import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import TeamTimesheetPanel from '../../Components/TeamTimesheetPanel';
// Dummy data and fetch function for demo
const teamMembers = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  // ...add more members
];

const fetchTimesheet = async (date) => {
  // Replace with API call
  return [
    { userId: 1, totalTime: '5h' },
    { userId: 2, totalTime: '3h' },
    // ...
  ];
};
const ManagerDashboard = ({ showTeamPanel=true  }) => (
  <Box >
    
    

    <Grid container spacing={2}>
      <Grid item xs={6}><Paper sx={{ p: 2 }}>🕒 My Weekly Hours</Paper></Grid>
      <Grid item xs={6}><Paper sx={{ p: 2 }}>📊 Project Breakdown</Paper></Grid>
      <Grid item xs={6}><Paper sx={{ p: 2 }}>📊 Team's Timesheet</Paper></Grid>
    </Grid>
 
  </Box>
);

export default ManagerDashboard;
