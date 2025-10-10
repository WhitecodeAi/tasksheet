// Components/Layout.jsx
import { Box, Container, Grow } from '@mui/material';
import Header from './../Components/Header';
import Breadcrumbs from './../Components/Breadcrumbs';
import Footer from './../Components/Footer';
import { useLocation } from 'react-router-dom';

const Layout = ({ children, onLogout, showBreadcrumbs = true, takeFullWidth = false, pageTitle }) => {
  const location = useLocation();

  // If viewing user timesheet, always show 'Tasksheet Entries' in breadcrumb
  let effectivePageTitle = pageTitle;
  if (location.pathname.startsWith('/user-timesheet/')) {
    effectivePageTitle = 'Tasksheet Entries';
  }

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <div className='container-headerAndMain' style={{ flexGrow: 1, display: 'flex' }}>
        <Box flex={1}>
          <Header onLogout={onLogout} />
          <Container maxWidth={takeFullWidth ? false : 'lg'}>
            <Box component="main" flex="1" px={3} py={2}>
              {showBreadcrumbs && <Breadcrumbs pageTitle={effectivePageTitle} />}
              <Box>{children}</Box>
            </Box>
          </Container>
        </Box>
      </div>
      <div sx={{ flexGrow: 0 }}>
        <Footer />
      </div>
    </Box>
  );
};

export default Layout;
