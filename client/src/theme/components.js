export const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 500,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.24)',
        },
      },
      containedPrimary: {
        backgroundColor: '#1976d2',
        color: '#ffffff',
        '&:hover': {
          backgroundColor: '#1565c0',
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.32)',
        },
        '&:active': {
          backgroundColor: '#0d47a1',
        },
      },
      outlinedPrimary: {
        borderColor: '#1976d2',
        color: '#1976d2',
        '&:hover': {
          backgroundColor: 'rgba(25, 118, 210, 0.04)',
          borderColor: '#1565c0',
        },
      },
      textPrimary: {
        color: '#1976d2',
        '&:hover': {
          backgroundColor: 'rgba(25, 118, 210, 0.04)',
        },
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

  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: '#ffffff',
        color: '#183874',
      },
    },
  },

  // ✅ Core input styling (TextField, Number, Date, Time, Comments)
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        backgroundColor: 'rgb(248, 250, 252)',
        minHeight: '48px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        '& .MuiOutlinedInput-input': {
          padding: '14px 14px',
          fontSize: '0.95rem',
          fontWeight: '500',
          lineHeight: '1.5',
        },
        '& textarea.MuiOutlinedInput-input': {
          padding: '0 !important',
          fontSize: '0.95rem',
          fontWeight: '500',
          lineHeight: '1.5',
          resize:'vertical',
          overflow: 'auto',
          boxSizing: 'content-box',
        },
      '&.no-resize textarea.MuiOutlinedInput-input': {
        resize: 'none',
      },
        '& .MuiOutlinedInput-input[type=number]': {
          MozAppearance: 'textfield',
        },
        '& .MuiOutlinedInput-input::-webkit-outer-spin-button, & .MuiOutlinedInput-input::-webkit-inner-spin-button': {
          WebkitAppearance: 'none',
          margin: 0,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#999',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#1976d2',
        },
      },
      notchedOutline: {
        borderColor: '#ccc',
      },
    },
  },

  // ✅ Label styling — vertically centered
  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontSize: '0.85rem',
        color: '#555',
        transform: 'translate(14px, 16px) scale(1)',
        '&.MuiInputLabel-shrink': {
          transform: 'translate(14px, -6px) scale(0.75)',
        },
        '&.Mui-focused': {
          color: '#1976d2',
        },
      },
    },
  },

  // ✅ Helper text styling
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        fontSize: '0.75rem',
        marginLeft: 0,
      },
    },
  },

  // ✅ Autocomplete alignment (Project Name, Task Category)
  MuiAutocomplete: {
    styleOverrides: {
      inputRoot: {
        minHeight: '48px',
        padding: '0 !important',
        display: 'flex',
        alignItems: 'center',
      },
      input: {
        padding: '14px 14px !important',
        fontSize: '0.95rem',
        fontWeight: '500',
        lineHeight: '1.5',
      },
      endAdornment: {
        top: '50%',
        transform: 'translateY(-50%)',
      },
    },
  },

  // ✅ Input adornment (for DatePicker icons etc.)
  MuiInputAdornment: {
    styleOverrides: {
      root: {
        marginRight: '8px',
      },
    },
  },
};
