import React from 'react';
import { Breadcrumbs as MUIBreadcrumbs, IconButton, Link, Typography, Box, Stack } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

const Breadcrumbs = ({ pageTitle, userName }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const pathnames = location.pathname.split('/').filter((x) => x);

  // Build visible breadcrumb entries by skipping numeric id segments
  const visibleEntries = (() => {
    const segments = pathnames; // already split
    const entries = [];
    const acc = [];
    segments.forEach((seg) => {
      acc.push(seg);
      if (!/^\d+$/.test(seg)) {
        entries.push({ value: seg, to: `/${acc.join('/')}` });
      }
    });
    return entries;
  })();

  // Define page titles for different routes
  const getPageTitle = () => {
    if (pageTitle) return pageTitle;
    if (userName && location.pathname.startsWith('/user-timesheet/')) return userName;
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
      sx={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Stack
 
  direction="row" sx={{  alignItems: "center",}}>
    <IconButton aria-label="Back"  onClick={() => navigate('/dashboard')}>
  <KeyboardBackspaceIcon />
</IconButton>
      {/* Left side - Page Title */}
      <Typography
        variant="h6"
        component="h1"
        sx={{
          fontWeight: 500,
          fontSize: '1rem',
          color: '#2e2e2e',
          textTransform: 'capitalize',
          margin: 0,
          lineHeight: 1.5
        }}
      >
        {getPageTitle()}
      </Typography>
</Stack>
      {/* Right side - Navigation Path */}
      <MUIBreadcrumbs
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: '#9e9e9e',
            margin: '0 8px'
          },
          '& .MuiBreadcrumbs-ol': {
            alignItems: 'center'
          }
        }}
      >
        <Link
          underline="hover"
          color="#757575"
          onClick={() => navigate('/dashboard')}
          sx={{
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 400,
            textDecoration: 'none',
            '&:hover': {
              color: '#1976d2',
              textDecoration: 'underline'
            }
          }}
        >
       <HomeTwoToneIcon/>
        </Link>

        {visibleEntries.map((entry, index) => {
          const isLast = index === visibleEntries.length - 1;

          // If on /user-timesheet/:userId, show userName for the last visible segment
          if (isLast && userName && entry.value === 'user-timesheet') {
            return (
              <Typography
                color="#1a1a1a"
                key={entry.to}
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textTransform: 'capitalize'
                }}
              >
                {userName}
              </Typography>
            );
          }

          return isLast ? (
            <Typography
              color="#1a1a1a"
              key={entry.to}
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'capitalize'
              }}
            >
              {entry.value.replace(/-/g, ' ')}
            </Typography>
          ) : (
            <Link
              underline="hover"
              color="#757575"
              onClick={() => navigate(entry.to)}
              key={entry.to}
              sx={{
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 400,
                textTransform: 'capitalize',
                textDecoration: 'none',
                '&:hover': {
                  color: '#1976d2',
                  textDecoration: 'underline'
                }
              }}
            >
              {entry.value.replace(/-/g, ' ')}
            </Link>
          );
        })}
      </MUIBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
