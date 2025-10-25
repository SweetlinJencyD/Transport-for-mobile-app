import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import ThemeToggle from '../UI/ThemeToggle';
import { useNavigate, useLocation } from 'react-router-dom';

const Topbar = ({ onMenuClick, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userRole = localStorage.getItem('userRole');

  // State for profile menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Function to get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (userRole === '3') { // Driver
      switch(path) {
        case '/driver-dashboard':
          return 'Driver Dashboard';
        case '/driver-clockin':
          return 'Clock In';
        case '/driver-clockout':
          return 'Clock Out';
        case '/driver-ticket':
          return 'Ticket Raise';
        case '/driver-schedule':
          return 'My Schedule';
        case '/driver-vehicle':
          return 'Vehicle Info';
        default:
          return 'Driver Dashboard';
      }
    } else { // Admin/Other users
      switch(path) {
        case '/dashboard':
          return 'Dashboard';
        case '/add-vehicle':
        case '/list-vehicle':
          return 'Vehicle Management';
        case '/add-group':
        case '/list-group':
          return 'Group Management';
        case '/add-supervisor':
        case '/list-supervisor':
          return 'Supervisor Management';
        case '/add-driver':
        case '/list-driver':
          return 'Driver Management';
        case '/add-attendee':
        case '/list-attendee':
          return 'Attendee Management';
        default:
          return 'Dashboard';
      }
    }
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    localStorage.removeItem("isLoggedIn");
    handleClose();
    window.location.href = "/login";
  };

  const iconColor = theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.secondary.main;

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: `1px solid ${theme.palette.divider}`,
        marginLeft: { sm: '280px' },
        width: { sm: 'calc(100% - 280px)' },
      }}
    >
      <Toolbar>
        {/* Menu icon for mobile */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon sx={{ color: iconColor }} />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {getPageTitle()}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Profile menu */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconButton onClick={handleProfileClick} sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: iconColor }}>
                {userData?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </motion.div>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {userData?.name || 'User Name'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userData?.email || 'user@example.com'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userRole === '3' ? 'Driver' : 
                 userRole === '2' ? 'Supervisor' : 
                 userRole === '1' ? 'Admin' : 'Attendee'}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
              <LogoutIcon sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;