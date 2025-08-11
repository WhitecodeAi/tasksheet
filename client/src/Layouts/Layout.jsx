// Components/Layout.jsx
import { Box } from '@mui/material';
import Header from './../Components/Header';
import Breadcrumbs from './../Components/Breadcrumbs';
import Footer from './../Components/Footer';
import { useLocation } from 'react-router-dom';

const Layout = ({ children, onLogout }) => {
  const location = useLocation();
  const isTasksheetRoute = location.pathname === '/tasksheet-entry';

  return (
 <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      bgcolor="background.default"
    >
      <Header onLogout={onLogout} />

      <Box component="main" flex="1" px={3} py={2}>
        <Breadcrumbs isTasksheetRoute={isTasksheetRoute} />
        <Box>{children}</Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default Layout;
