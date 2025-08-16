import React, { useState } from 'react';
import axios from 'axios';
import LoginForm from '../Components/LoginForm';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

  console.log('Login Page');
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
const navigate = useNavigate(); 

 
const handleLogin = async () => {
  console.log('🔐 Login clicked');
  console.log('📧 Email:', email);
  console.log('🌐 API Base URL:', api.defaults.baseURL);

  try {
    console.log('📤 Sending login request...');
    const response = await api.post('/api/login', { email, password });
    console.log('✅ Login successful:', response.data);

    localStorage.setItem('token', response.data.token);

    onLogin(response.data.user);
    navigate('/dashboard');
  } catch (err) {
    console.error('❌ Login error:', err);
    console.error('📄 Error response:', err.response?.data);
    console.error('🔢 Status code:', err.response?.status);
    setError('Invalid credentials');
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
