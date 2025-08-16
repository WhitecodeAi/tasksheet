// src/Components/Header.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
 

const Footer = ({ onLogout }) => {
  return (
    <Box component="footer"   sx={{ p: 2, textAlign: 'right',  }}>
    <Typography variant="body2" color="textSecondary" >Footer comes here 2025</Typography>
    </Box>
  );
};

export default Footer;
