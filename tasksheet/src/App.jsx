import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { CssBaseline, Box } from '@mui/material';
import LoginPage from './Pages/LoginPage';
import ProjectsPage from './Pages/ProjectsPage';
import DashboardPage from './Pages/DashboardPage';
import TasksheetPage from './Pages/TasksheetPage';
import Header from './Components/Header';
import Breadcrumbs from './Components/Breadcrumbs';

const AppContent = ({ handleLogin, handleLogout }) => {
  const location = useLocation(); // ✅ use inside Router context
  const isLoggedIn = !!localStorage.getItem('token'); // ✅ define this
  const hideHeaderOnPaths = ['/login'];
  const shouldShowHeader = !hideHeaderOnPaths.includes(location.pathname) && isLoggedIn;

  return (
    <>
      <CssBaseline />
     
      {shouldShowHeader && <Header onLogout={handleLogout} />}
      {shouldShowHeader && <Breadcrumbs />}
      
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/tasksheet-entry" element={<TasksheetPage />} />
      </Routes>
    </>
  );
};

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.token); // Optional: store token
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <AppContent handleLogin={handleLogin} handleLogout={handleLogout} />
    </Router>
  );
}

export default App;
