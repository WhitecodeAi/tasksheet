import React, { useState } from 'react';
import axios from 'axios';
import LoginForm from '../Components/LoginForm';
import { useNavigate } from 'react-router-dom';
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
const navigate = useNavigate(); 
 // inside handleLogin
const handleLogin = async () => {
  console.log("Login clicked");
  try {
    const response = await axios.post(
      'http://localhost:3001/api/login',
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    localStorage.setItem('token', response.data.token);
    onLogin(response.data.user);
    navigate('/dashboard');
  } catch (err) {
    setError('Invalid credentials');
    console.error('Login error:', err);
  }
};


  return (
    <LoginForm
      email={email}
      password={password}
      error={error}
      onEmailChange={(e) => setEmail(e.target.value)}
      onPasswordChange={(e) => setPassword(e.target.value)}
      onLogin={handleLogin}
    />
  );
};

export default LoginPage;
