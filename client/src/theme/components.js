export const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '10px 24px',
        fontWeight: 500,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(103, 58, 183, 0.3)',
        },
      },
      containedPrimary: {
        background: 'linear-gradient(135deg, #673ab7 0%, #9c88ff 100%)',
        color: '#fff',
        '&:hover': {
          background: 'linear-gradient(135deg, #5e35b1 0%, #8c7ae6 100%)',
        },
      },
    },
  },

  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(224, 224, 224, 0.5)',
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
          borderColor: '#673ab7',
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
          color: '#673ab7',
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
