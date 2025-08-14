// Components/Layout.jsx
import { Box, Container } from '@mui/material';
import Header from './../Components/Header';
import Breadcrumbs from './../Components/Breadcrumbs';
import Footer from './../Components/Footer';
import { useLocation } from 'react-router-dom';

const Layout = ({ children, onLogout, showBreadcrumbs = true, takeFullWidth = false }) => {
  const location = useLocation();
  const isTasksheetRoute = location.pathname === '/tasksheet-entry';
 
  return (
 <>
      <Header onLogout={onLogout} />
<Container maxWidth={takeFullWidth ? false : 'lg'}>
      <Box component="main" flex="1" px={3} py={2}>
        {showBreadcrumbs &&  <Breadcrumbs isTasksheetRoute={isTasksheetRoute} />}
       
        <Box>{children}</Box>
      </Box>
    </Container>
      <Footer />
    </>

  );
};

export default Layout;
