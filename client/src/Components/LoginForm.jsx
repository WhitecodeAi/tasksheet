import React from 'react';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';
 
const LoginForm = ({ email, password, error, onEmailChange, onPasswordChange, onLogin }) => {
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
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={onPasswordChange}
        />
        {error && <Typography color="error">{error}</Typography>}

        <Button
          variant="contained"
          fullWidth
         
          style={{ marginTop: 20 }}
          onClick={onLogin}
        >
          Login
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginForm;
