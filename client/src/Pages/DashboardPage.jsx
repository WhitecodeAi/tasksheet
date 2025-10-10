import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button, Container } from '@mui/material';
import { useNavigate, Navigate } from 'react-router-dom';
import TeamTimesheetPanel from '../Components/TeamTimesheetPanel';
import axios from 'axios';
import dayjs from 'dayjs';
import { api } from '../utils/api';

import AdminDashboard from './Dashboard/AdminDashboard';
import ManagerDashboard from './Dashboard/ManagerDashboard';
import EmployeeDashboard from './Dashboard/EmployeeDashboard';

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

    api
      .get(`/api/tasksheetEntries/user/${userId}`)
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


  
  let roleBasedDashboard = null;

switch (user.role) {
  case 'admin':
    roleBasedDashboard = <AdminDashboard />;
    break;
  case 'manager':
    roleBasedDashboard = <ManagerDashboard />;
    break;
  case 'employee':
    roleBasedDashboard = <EmployeeDashboard />;
    break;
  default:
    roleBasedDashboard = <div>No dashboard available for this role.</div>;
}


  return (<Container>  
    
    <>


<Grid container spacing={2}>
  <Grid size={7}  >
   <Typography variant="h4" sx={{mt:2}} gutterBottom>
        Welcome, {user.name || 'User'}! <span style={{fontSize:'23px'}}>({user.role})</span>
      </Typography>
      <br/>
{roleBasedDashboard}
 

      {/* Panels side by side using flex */}
      <Box display="flex" flexDirection="row" gap={1} alignItems="flex-start" flexWrap="nowrap" width="100%" mt={2}>
        {/* Time Summary Panel */}
        <Box sx={{ minWidth: 350, maxWidth: 650, flex: 1,  p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            My Time Summary (Last 5 Days)
          </Typography>
          <Box>
            <Box display="flex" flexWrap="wrap" gap={2}>
              {[...summary].reverse().map((day, index) => (
                <Paper key={index} elevation={1} sx={{ p: 2, ...getPaperStyle(day.hours), minWidth: 120, mb: 2 }}>
                  <Typography variant="subtitle1">{day.date}</Typography>
                  <Typography variant="body1">
                    <strong>Hours: {day.hours.toFixed(1)}</strong>
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
          <Box mt={4}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{
                px: 3,
                py: 1,
                minHeight: '32px',
                textTransform: 'none',
                borderRadius: '8px',
              }}
              href={`/tasksheet-entry?date=${dayjs().format('YYYY-MM-DD')}`}
            >
              Enter Today’s Tasksheet
            </Button>
          </Box>
        </Box>
       
      </Box> 
  </Grid>
  <Grid size={5} >
    {/* Team Timesheet Panel */}
      {user.role=='employee' ? null :  
          <TeamTimesheetPanel/>
        }
  </Grid>
  
</Grid>

   
  
    </> 
    </Container>
  );
};

export default DashboardPage;
