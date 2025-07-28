import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

const EmployeeDashboard = () => (
  <Box >
    {/* <Typography variant="h5" gutterBottom>Hello, Employee</Typography> */}

    <Grid container spacing={2}>
      <Grid item xs={6}><Paper sx={{ p: 2 }}>📝 View Important Tasks</Paper></Grid>
      <Grid item xs={6}><Paper sx={{ p: 2 }}>📅 View My Projects</Paper></Grid>
    </Grid>

    {/* <Box mt={4}>
      <Typography variant="h6">Reminders</Typography>
      <Paper sx={{ p: 2, mt: 2 }}>⏰ You haven’t filled today’s tasksheet!</Paper>
    </Box> */}
  </Box>
);

export default EmployeeDashboard;
