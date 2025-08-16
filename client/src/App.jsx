import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useState } from 'react';
import { CssBaseline } from '@mui/material';

import LoginPage from './Pages/LoginPage';
import ProjectsPage from './Pages/ProjectsPage';
import DashboardPage from './Pages/DashboardPage';
import TasksheetPage from './Pages/TasksheetPage';
import UsersPage from './Pages/UsersPage';

import Layout from './Layouts/Layout';

const AppContent = ({ handleLogin, handleLogout }) => {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <>
      <CssBaseline />
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login page without layout */}
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        {/* Protected routes with layout */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <Layout onLogout={handleLogout} showBreadcrumbs={false}>
                <DashboardPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/projects"
          element={
            isLoggedIn ? (
              <Layout onLogout={handleLogout}>
                <ProjectsPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/tasksheet-entry"
          element={
            isLoggedIn ? (
              <Layout onLogout={handleLogout} takeFullWidth={true} >
                <TasksheetPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/users"
          element={
            isLoggedIn ? (
              <Layout onLogout={handleLogout}>
                <UsersPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </>
  );
};

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
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
