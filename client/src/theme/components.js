import { AppBar } from "@mui/material";

export const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        padding: '8px 16px',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
      },
    },
  },
//   MuiAppBar: {
//     styleOverrides: {
//       root: {
//         backgroundColor: '#ffffff', // Deep blue
//         color: '#183874',           // Text color
//       },
//     },
//   },
};
