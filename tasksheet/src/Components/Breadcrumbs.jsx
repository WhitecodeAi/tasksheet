import React from 'react';
import { Breadcrumbs as MUIBreadcrumbs, Link, Typography, Container } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const Breadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const pathnames = location.pathname.split('/').filter((x) => x);

  return (<Container>
    <MUIBreadcrumbs aria-label="breadcrumb" sx={{ py: 3 }}>
      <Link underline="hover" color="inherit" onClick={() => navigate('/dashboard')} sx={{ cursor: 'pointer' }}>
        Home
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return isLast ? (
          <Typography color="text.primary" key={to}>
            {value.replace(/-/g, ' ')}
          </Typography>
        ) : (
          <Link underline="hover" color="inherit" onClick={() => navigate(to)} key={to} sx={{ cursor: 'pointer' }}>
            {value.replace(/-/g, ' ')}
          </Link>
        );
      })}
    </MUIBreadcrumbs>
    </Container>
  );
};

export default Breadcrumbs;
