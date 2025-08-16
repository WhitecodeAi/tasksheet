import { createTheme } from '@mui/material/styles';
import { palette } from './palette';
import { typography } from './typography';
import { components } from './components';

const theme = createTheme({
  palette,
  typography,
  components,
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0,0,0,0.12)',
    '0px 2px 6px rgba(0,0,0,0.08)',
    '0px 4px 12px rgba(0,0,0,0.08)',
    '0px 6px 18px rgba(0,0,0,0.08)',
    '0px 8px 24px rgba(0,0,0,0.08)',
    '0px 12px 32px rgba(0,0,0,0.08)',
    '0px 16px 40px rgba(0,0,0,0.08)',
    '0px 20px 48px rgba(0,0,0,0.08)',
    // Add remaining shadow levels...
    ...Array(15).fill('0px 24px 56px rgba(0,0,0,0.08)')
  ],
});

export default theme;
