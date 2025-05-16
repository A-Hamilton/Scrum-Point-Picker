// src/theme.ts
import { createTheme } from '@mui/material/styles';

// Example: a simple dark‐mode theme.
// Feel free to tweak colors, typography, breakpoints, etc.
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',    // light blue
    },
    secondary: {
      main: '#f48fb1',    // pink-ish
    },
    background: {
      default: '#121212',
      paper:   '#1e1e1e',
    },
  },
});

export default theme;
