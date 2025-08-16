import React from 'react';
import { Breadcrumbs as MUIBreadcrumbs, Link, Typography, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const Breadcrumbs = ({ pageTitle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const pathnames = location.pathname.split('/').filter((x) => x);

  // Define page titles for different routes
  const getPageTitle = () => {
    if (pageTitle) return pageTitle;

    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/projects':
        return 'Projects';
      case '/tasksheet-entry':
        return 'Tasksheet Entries';
      case '/users':
        return 'Users';
      default:
        return pathnames[pathnames.length - 1]?.replace(/-/g, ' ') || 'Dashboard';
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={3}
      py={2}
    >
      {/* Left side - Page Title */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 600,
          fontSize: '1.75rem',
          color: 'text.primary',
          textTransform: 'capitalize'
        }}
      >
        {getPageTitle()}
      </Typography>

      {/* Right side - Navigation Path */}
      <MUIBreadcrumbs
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: 'text.secondary',
          }
        }}
      >
        <Link
          underline="hover"
          color="text.secondary"
          onClick={() => navigate('/dashboard')}
          sx={{
            cursor: 'pointer',
            fontSize: '0.875rem',
            '&:hover': {
              color: 'primary.main'
            }
          }}
        >
          Home
        </Link>

        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          return isLast ? (
            <Typography
              color="text.primary"
              key={to}
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'capitalize'
              }}
            >
              {value.replace(/-/g, ' ')}
            </Typography>
          ) : (
            <Link
              underline="hover"
              color="text.secondary"
              onClick={() => navigate(to)}
              key={to}
              sx={{
                cursor: 'pointer',
                fontSize: '0.875rem',
                textTransform: 'capitalize',
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              {value.replace(/-/g, ' ')}
            </Link>
          );
        })}
      </MUIBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
