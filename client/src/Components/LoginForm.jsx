import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const LoginForm = ({ email, password, error, onEmailChange, onPasswordChange, onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          width: 400,
          borderRadius: 3,
          boxShadow: '0px 8px 40px rgba(0,0,0,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" gutterBottom sx={{ color: '#673ab7', fontWeight: 600 }}>
            Hi, Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575' }}>
            Enter your credentials to continue
          </Typography>
        </Box>

        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={onEmailChange}
        />
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={password}
          onChange={onPasswordChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {error && <Typography color="error">{error}</Typography>}

        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{
            mt: 3,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 500,
          }}
          onClick={onLogin}
        >
          Sign In
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginForm;
