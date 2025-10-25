import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  DirectionsBus as VehicleIcon,
  SupervisedUserCircle as SupervisorIcon,
  Person as DriverIcon,
  Commute as GroupIcon,
  PeopleAlt as AttendeeIcon,
  Add as AddIcon,
  List as ListIcon,
  ExpandLess,
  ExpandMore,
  Schedule as ScheduleIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  SupportAgent as SupportIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const userRole = localStorage.getItem('userRole');
  // single state to track which dropdown is open
  const [openMenu, setOpenMenu] = useState(null);

  const handleMenuClick = (menuName) => {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  };

  const adminMenuItems  = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },

    {
      text: 'Vehicle',
      icon: <VehicleIcon />,
      name: 'vehicle',
      children: [
        { text: 'Add Vehicle', icon: <AddIcon />, path: '/add-vehicle' },
        { text: 'List Vehicle', icon: <ListIcon />, path: '/list-vehicle' },
      ],
    },
    {
      text: 'Group',
      icon: <GroupIcon />,
      name: 'group',
      children: [
        { text: 'Add Group', icon: <AddIcon />, path: '/add-group' },
        { text: 'List Group', icon: <ListIcon />, path: '/list-group' },
      ],
    },
    {
      text: 'Supervisor',
      icon: <SupervisorIcon />,
      name: 'supervisor',
      children: [
        { text: 'Add Supervisor', icon: <AddIcon />, path: '/add-supervisor' },
        { text: 'List Supervisor', icon: <ListIcon />, path: '/list-supervisor' },
      ],
    },
    {
      text: 'Driver',
      icon: <DriverIcon />,
      name: 'driver',
      children: [
        { text: 'Add Driver', icon: <AddIcon />, path: '/add-driver' },
        { text: 'List Driver', icon: <ListIcon />, path: '/list-driver' },
      ],
    },
    {
      text: 'Attendee',
      icon: <AttendeeIcon />,
      name: 'attendee',
      children: [
        { text: 'Add Attendee', icon: <AddIcon />, path: '/add-attendee' },
        { text: 'List Attendee', icon: <ListIcon />, path: '/list-attendee' },
      ],
    },
    {
      text: 'Reports',
      icon: <AttendeeIcon />,
      name: 'Reports',
      children: [
        { text: 'Driver Clock In Report', icon: <AddIcon />, path: '/report-driverClockInReport' },
        { text: 'Driver Ticket Raising', icon: <ListIcon />, path: '/report-driverTicket' },
      ],
    },
  ];

  // Driver menu items (role 3)
  const driverMenuItems = [
    // { text: 'Dashboard', icon: <DashboardIcon />, path: '/driver-dashboard' },
    { text: 'Clock In/Out', icon: <LoginIcon />, path: '/driver-clockInOut' },
    { text: 'Fuel Logging', icon: <LoginIcon />, path: '/driver-Fuel-Logging' },
    {
      text: 'Ticket',
      icon: <AttendeeIcon />,
      name: 'Ticket',
      children: [
        { text: 'Ticket Raise', icon: <AddIcon />, path: '/driver-ticketRaise' },
        { text: 'Ticket History', icon: <ListIcon />, path: '/driver-ticketHistory' },
      ],
    },
    { text: 'My Schedule', icon: <ScheduleIcon />, path: '/driver-schedule' },
    { text: 'Vehicle Info', icon: <VehicleIcon />, path: '/driver-vehicleInfo' },
  ];

// Supervisor Menu Items (role 2)
const supervisorMenuItems = [
  // { text: 'Dashboard', icon: <DashboardIcon />, path: '/supervisor-dashboard' },
  {
    text: 'Assign Buses to Drivers',
    icon: <DriverIcon />,
    name: 'Drivers',
    children: [
      { text: 'Assign Driver', icon: <ListIcon />, path: '/assign-driver' },
      { text: 'List Assign Driver', icon: <ScheduleIcon />, path: '/list-assignDriver' },
    ],
  },
   {
    text: 'Assign Buses to Attendees',
    icon: <DriverIcon />,
    name: 'Attendees',
    children: [
      { text: 'Assign Attendee', icon: <ListIcon />, path: '/assign-attendee' },
      { text: 'List Assign Driver', icon: <ScheduleIcon />, path: '/list-assignAttendee' },
    ],
  },
  {
    text: 'Reports',
    icon: <AttendeeIcon />,
    name: 'reports',
    children: [
      { text: 'Driver Clock In', icon: <AddIcon />, path: '/report-driverClockInReport' },
       { text: 'Driver Ticket Raising', icon: <AddIcon />, path: '/report-driverTicket' },
    ],
  },
];

// Select menu items based on user role
let menuItems = [];

if (userRole === '3') {
  menuItems = driverMenuItems; // Driver
} else if (userRole === '2') {
  menuItems = supervisorMenuItems; // Supervisor
} else {
  menuItems = adminMenuItems; // Admin
}

  const activeBg = theme.palette.primary.main;
  const activeText = '#fff';
  const hoverBg = '#fff';
  const hoverText = theme.palette.primary.main;

  const renderMenuItem = (item) => {
    const isActive = location.pathname === item.path;

    // If item has children, render as dropdown (for both admin and driver)
    if (item.children) {
      const open = openMenu === item.name;

      return (
        <React.Fragment key={item.text}>
          <ListItemButton
            onClick={() => handleMenuClick(item.name)}
            sx={{
              borderRadius: 2,
              mb: 1,
              color: 'white',
              backgroundColor: open ? 'rgba(255,255,255,0.1)' : 'transparent',
              transition: 'all 0.35s ease',
              '&:hover': {
                backgroundColor: hoverBg,
                color: hoverText,
                transform: 'translateX(4px)',
                '& .MuiSvgIcon-root': { color: hoverText },
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                minWidth: 40,
                transition: 'color 0.3s ease',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: open ? 700 : 500,
                fontSize: '0.95rem',
              }}
            />
            {open ? (
              <ExpandLess sx={{ color: 'rgba(255,255,255,0.9)' }} />
            ) : (
              <ExpandMore sx={{ color: 'rgba(255,255,255,0.7)' }} />
            )}
          </ListItemButton>

          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => {
                const isChildActive = location.pathname === child.path;
                return (
                  <ListItemButton
                    key={child.text}
                    onClick={() => navigate(child.path)}
                    selected={isChildActive}
                    sx={{
                      pl: 4,
                      borderRadius: 2,
                      mb: 1,
                      color: isChildActive ? activeText : 'rgba(255, 255, 255, 0.8)',
                      backgroundColor: isChildActive ? activeBg : 'transparent',
                      transition: 'all 0.35s ease',
                      '&:hover': {
                        backgroundColor: hoverBg,
                        color: hoverText,
                        transform: 'translateX(6px)',
                        '& .MuiSvgIcon-root': { color: hoverText },
                      },
                      '&.Mui-selected': {
                        backgroundColor: activeBg,
                        color: activeText,
                        '& .MuiSvgIcon-root': { color: activeText },
                        '&:hover': {
                          backgroundColor: activeBg,
                          color: activeText,
                          transform: 'translateX(0)',
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'inherit',
                        minWidth: 40,
                        '& .MuiSvgIcon-root': { fontSize: '1.2rem' },
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {child.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={child.text}
                      primaryTypographyProps={{
                        fontWeight: isChildActive ? 600 : 400,
                        fontSize: '0.85rem',
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        </React.Fragment>
      );
    } else {
      // Regular menu item without children
      return (
        <ListItemButton
          key={item.text}
          onClick={() => navigate(item.path)}
          selected={isActive}
          sx={{
            borderRadius: 2,
            mb: 1,
            color: isActive ? activeText : 'white',
            backgroundColor: isActive ? activeBg : 'transparent',
            transition: 'all 0.35s ease',
            '&:hover': {
              backgroundColor: hoverBg,
              color: hoverText,
              transform: 'translateX(6px)',
              '& .MuiSvgIcon-root': { color: hoverText },
            },
            '&.Mui-selected': {
              backgroundColor: activeBg,
              color: activeText,
              '& .MuiSvgIcon-root': { color: activeText },
              '&:hover': {
                backgroundColor: activeBg,
                color: activeText,
                transform: 'translateX(0)',
              },
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: isActive ? activeText : 'rgba(255, 255, 255, 0.9)',
              minWidth: 40,
              transition: 'color 0.3s ease',
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            primaryTypographyProps={{
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.95rem',
            }}
          />
        </ListItemButton>
      );
    }
  };

  const drawer = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        background: theme.palette.sidebar.main,
        color: theme.palette.sidebar.contrastText,
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FFFFFF, #FFB6C1)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontSize: { xs: '1.5rem', sm: '2rem' },
              textShadow: '0 2px 10px rgba(255, 255, 255, 0.3)',
            }}
          >
            TMS
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              mt: 0.5,
              fontWeight: 500,
            }}
          >
            {userRole === '3' ? 'Driver Portal' : 'Transport Management'}
          </Typography>
        </motion.div>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

      {/* Menu Items */}
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => renderMenuItem(item))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            background: theme.palette.sidebar.main,
            color: theme.palette.sidebar.contrastText,
            border: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: 280,
            border: 'none',
            background: theme.palette.sidebar.main,
            color: theme.palette.sidebar.contrastText,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Sidebar;