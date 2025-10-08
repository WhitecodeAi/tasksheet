// src/Components/Header.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
 

const Footer = ({ onLogout }) => {
  return (
    <Box component="footer"   sx={{ p: 2, textAlign: 'right',  }}>
    <Typography variant="body2" color="textSecondary" >Tasksheet V 1.0 | All rights reserved | 2025</Typography>
    </Box>
  );
};

export default Footer;
