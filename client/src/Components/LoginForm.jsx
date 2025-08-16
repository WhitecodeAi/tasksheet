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
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper elevation={3} style={{ padding: 30, width: 400 }}>
        <Typography variant="h5" gutterBottom>Login to TaskSheet</Typography>

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
