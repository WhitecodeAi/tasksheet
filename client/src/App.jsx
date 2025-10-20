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
import UserTimesheetPage from './Pages/UserTimesheetPage';
import TeamsTasksheetPage from './Pages/TeamsTasksheetPage';
import TasksheetDetailsPage from './Pages/TasksheetDetailsPage';

import Layout from './Layouts/Layout';

const AppContent = ({ handleLogin, handleLogout }) => {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <>
      <CssBaseline />
      <Routes>
        <Route
          path="/teams-tasksheet"
          element={
            isLoggedIn ? (
              <Layout onLogout={handleLogout} takeFullWidth={true} pageTitle={"Teams Tasksheet"}>
                <TeamsTasksheetPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/tasksheet-details/:userId"
          element={
            isLoggedIn ? (
              <Layout onLogout={handleLogout} takeFullWidth={true} pageTitle={"Tasksheet Details"}>
                <TasksheetDetailsPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
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
              <Layout onLogout={handleLogout} takeFullWidth={true} pageTitle={"My Tasksheet"}>
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
        <Route
          path="/user-timesheet/:userId"
          element={
            <Layout onLogout={handleLogout} takeFullWidth={true}>
              <TasksheetPage />
            </Layout>
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
