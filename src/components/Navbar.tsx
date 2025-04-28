import React, { useContext } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { ColorModeContext } from '../context/ThemeContext';
import { useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
        >
          Agile Ticket Voter
        </Typography>
        <Button component={Link} to="/create" color="inherit">
          Create
        </Button>
        <Button component={Link} to="/join" color="inherit" sx={{ ml: 2 }}>
          Join
        </Button>
        <IconButton
          onClick={colorMode.toggleColorMode}
          color="inherit"
          sx={{ ml: 2 }}
          aria-label="toggle theme"
        >
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
