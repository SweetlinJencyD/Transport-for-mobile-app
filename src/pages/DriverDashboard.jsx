import React, { useState, useEffect } from 'react'; // ✅ include useState and useEffect
import { Grid, Typography, Box, useTheme, Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Sample icon images
const ICONS = {
  vehicles: '/assets/icons/glass/vehicle.svg',
  supervisors: '/assets/icons/glass/supervisor.svg',
  drivers: '/assets/icons/glass/driver.svg',
  attendees: '/assets/icons/glass/attendee.svg',
};

const DriverDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [tokenExpired, setTokenExpired] = useState(false);

  // Check token expiration
  const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTokenExpired(true);
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        setTokenExpired(true);
        localStorage.removeItem('token');
      }
      return !isExpired;
    } catch (error) {
      console.error('Error checking token:', error);
      setTokenExpired(true);
      localStorage.removeItem('token');
      return false;
    }
  };

  useEffect(() => {
    checkTokenExpiration();
  }, []);

  const handleTokenExpiredClose = () => {
    setTokenExpired(false);
    navigate('/login');
  };

  // Safe data parsing
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
    { title: 'Total Vehicles', value: '12', color: theme.palette.stats?.totalVehicles || '#000', icon: ICONS.vehicles },
    { title: 'Total Supervisors', value: '5', color: theme.palette.stats?.newUsers || '#000', icon: ICONS.supervisors },
    { title: 'Total Drivers', value: '9', color: theme.palette.stats?.purchaseOrders || '#000', icon: ICONS.drivers },
    { title: 'Total Attendee', value: '4', color: theme.palette.stats?.messages || '#000', icon: ICONS.attendees },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {userData.name}!
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Driver Dashboard
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
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  background: '#FFFFFF',
                  p: { xs: 2.5, sm: 3 },
                  color: '#000',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: '100%',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
                    backgroundColor: theme.palette.primary.main,
                    color: '#fff',
                    '& img': { filter: 'brightness(0) invert(1)' },
                  },
                }}
              >
                <Box sx={{ width: { xs: 50, sm: 55, md: 60 }, height: { xs: 50, sm: 55, md: 60 }, mb: { xs: 1.5, sm: 2 }, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1, position: 'relative' }}>
                  <img src={item.icon} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: { xs: 14, sm: 15, md: 16 }, mb: 1, zIndex: 1, position: 'relative' }}>
                  {item.title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1.5rem', sm: '1.6rem', md: '1.75rem' }, zIndex: 1, position: 'relative' }}>
                  {item.value}
                </Typography>
              </Box>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* --- Token Expired Popup --- */}
      <Dialog open={tokenExpired} onClose={handleTokenExpiredClose}>
        <DialogTitle>Session Expired</DialogTitle>
        <DialogContent>Your session has expired. Please login again.</DialogContent>
        <DialogActions>
          <Button onClick={handleTokenExpiredClose} color="primary" variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DriverDashboard;
