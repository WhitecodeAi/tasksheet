// src/Components/Header.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Header = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout(); // Clears localStorage and redirects
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          TaskSheet
        </Typography>
        <Button color="inherit" onClick={handleLogoutClick}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
