import React from 'react';
import { useNavigate } from 'react-router-dom';
import {  Grid, Paper } from '@mui/material';

 

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <>
    <Grid container spacing={2}>
      <Grid item xs={4}>
  <Paper
    sx={{ p: 2, cursor: 'pointer' }}
    onClick={() => navigate('/users')}
    elevation={2}
  >
    👥  Users <strong>(Add) </strong>
  </Paper>
</Grid>

  
      <Grid item xs={4}>
  <Paper
    sx={{ p: 2, cursor: 'pointer' }}
    onClick={() => navigate('/projects')}
    elevation={2}
  >
   📁  Projects <strong>(Add) </strong>
  </Paper>
</Grid>
  <Grid item xs={4}>
  <Paper
    sx={{ p: 2, }}
   
    elevation={2}
  >
  ✅ Requests <strong>(Coming Soon) </strong>
  </Paper>
</Grid>
      
      
    </Grid>

    
  </>
  );
}

 

export default AdminDashboard;
