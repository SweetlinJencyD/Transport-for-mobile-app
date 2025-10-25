import React from 'react';
import { Grid, Typography, Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const ICONS = {
  vehicles: '/assets/icons/glass/vehicle.svg',
  drivers: '/assets/icons/glass/driver.svg',
  schedule: '/assets/icons/glass/schedule.svg',
  reports: '/assets/icons/glass/reports.svg',
};

const SupervisorDashboard = () => {
  const theme = useTheme();
  
  const getUserData = () => {
    try {
      return JSON.parse(localStorage.getItem('userData') || '{}');
    } catch (error) {
      console.error('Error parsing user data:', error);
      return {};
    }
  };

  const userData = getUserData();

  const stats = [
    {
      title: 'Assigned Vehicles',
      value: '8',
      color: theme.palette.stats?.totalVehicles || '#000000',
      icon: ICONS.vehicles,
    },
    {
      title: 'Assigned Drivers',
      value: '6',
      color: theme.palette.stats?.newUsers || '#000000',
      icon: ICONS.drivers,
    },
    {
      title: 'Today Schedule',
      value: '12',
      color: theme.palette.stats?.purchaseOrders || '#000000',
      icon: ICONS.schedule,
    },
    {
      title: 'Pending Reports',
      value: '3',
      color: theme.palette.stats?.messages || '#000000',
      icon: ICONS.reports,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, Supervisor {userData.name}!
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Supervisor Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((item, index) => (
          <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Box
                sx={{
                  borderRadius: 2,
                  background: '#FFFFFF',
                  p: 3,
                  color: '#000',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
                    backgroundColor: theme.palette.primary.main,
                    color: '#fff',
                    '& img': {
                      filter: 'brightness(0) invert(1)',
                    },
                  },
                }}
              >
                <Box sx={{ width: 60, height: 60, mb: 2, mx: 'auto' }}>
                  <img
                    src={item.icon}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </Box>
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {item.value}
                </Typography>
              </Box>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SupervisorDashboard;