import React from 'react';
import { Box, Grid, Paper } from '@mui/material';

const ManagerDashboard = () => (
  <Box >
    {/* <Typography variant="h4" gutterBottom>Welcome, Manager</Typography> */}

    <Grid container spacing={2}>
      <Grid item xs={6}><Paper sx={{ p: 2 }}>🕒 My Weekly Hours</Paper></Grid>
      <Grid item xs={6}><Paper sx={{ p: 2 }}>📊 Project Breakdown</Paper></Grid>
      <Grid item xs={6}><Paper sx={{ p: 2 }}>📊 Team's Timesheet</Paper></Grid>
    </Grid>

    {/* <Box mt={4}>
      <Typography variant="h6">Team Timesheet</Typography>
      <Paper sx={{ p: 2, mt: 2 }}>
        <ul>
          <li>Amit - Project A - 14h</li>
          <li>Simran - Project B - 9h</li>
        </ul>
      </Paper>
    </Box> */}
  </Box>
);

export default ManagerDashboard;
