// src/components/Navbar.tsx
import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { ColorModeContext, ColorModeContextType } from '../App';

const Navbar: React.FC = () => {
  const theme = useTheme();
  // Tell TS exactly what comes out of the context
  const colorMode = useContext<ColorModeContextType>(ColorModeContext);

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: 56,
        background: theme.palette.background.paper,
      }}
    >
      <RouterLink to="/">Home</RouterLink>
      <IconButton
        sx={{ ml: 1 }}
        onClick={colorMode.toggleColorMode}
        color="inherit"
        aria-label="toggle light/dark mode"
      >
        {theme.palette.mode === 'dark' ? '🌞' : '🌜'}
      </IconButton>
    </nav>
  );
};

export default Navbar;
