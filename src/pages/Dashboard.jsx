import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, useTheme, CircularProgress, Dialog, 
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

const Dashboard = () => {
  const theme = useTheme();
   const navigate = useNavigate(); // ✅ define navigate
 
   const [tokenExpired, setTokenExpired] = useState(false); // ✅ define state

  const [statsData, setStatsData] = useState({
    vehicles: 0,
    supervisors: 0,
    drivers: 0,
    attendees: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
    if (!checkTokenExpiration()) return;
    fetchDashboardData();
  }, []);

  const handleTokenExpiredClose = () => {
    setTokenExpired(false);
    navigate('/login');
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTokenExpired(true);
      setLoading(false);
      return;
    }

    try {
      // Fetch vehicles count
      const vehiclesRes = await fetch(`${API_BASE_URL}/vehicle_list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const vehiclesData = await vehiclesRes.json();
      
      // Fetch supervisors count
      const supervisorsRes = await fetch(`${API_BASE_URL}/supervisor_list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const supervisorsData = await supervisorsRes.json();
      
      // Fetch drivers count
      const driversRes = await fetch(`${API_BASE_URL}/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const driversData = await driversRes.json();
      
      // Fetch attendees count
      const attendeesRes = await fetch(`${API_BASE_URL}/attendees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const attendeesData = await attendeesRes.json();

      setStatsData({
        vehicles: Array.isArray(vehiclesData) ? vehiclesData.length : 0,
        supervisors: Array.isArray(supervisorsData) ? supervisorsData.length : 0,
        drivers: Array.isArray(driversData) ? driversData.length : 0,
        attendees: attendeesData.data && Array.isArray(attendeesData.data) ? attendeesData.data.length : 0
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Vehicles',
      value: statsData.vehicles.toString(),
      color: theme.palette.stats.totalVehicles,
      icon: ICONS.vehicles,
    },
    {
      title: 'Total Supervisors',
      value: statsData.supervisors.toString(),
      color: theme.palette.stats.newUsers,
      icon: ICONS.supervisors,
    },
    {
      title: 'Total Drivers',
      value: statsData.drivers.toString(),
      color: theme.palette.stats.purchaseOrders,
      icon: ICONS.drivers,
    },
    {
      title: 'Total Attendee',
      value: statsData.attendees.toString(),
      color: theme.palette.stats.messages,
      icon: ICONS.attendees,
    },
  ];

  if (loading && !tokenExpired) {
    return (

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
{/* Token Expired Modal */}
<Dialog
  open={tokenExpired}
  onClose={handleTokenExpiredClose}
  maxWidth="xs"
  fullWidth
>
  <DialogTitle>Session Expired</DialogTitle>
  <DialogContent>
    <Typography>Your session has expired. Please login again.</Typography>
  </DialogContent>
  <DialogActions>
    <Button variant="contained" color="primary" onClick={handleTokenExpiredClose}>
      OK
    </Button>
  </DialogActions>
</Dialog>

      {/* --- Responsive Grid --- */}
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
                  position: 'relative', // important: for ::after to stay inside this card
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
                    backgroundColor: theme.palette.primary.main, // crimson red on hover
                    color: '#fff', // change text to white for contrast
                    '& img': {
                      filter: 'brightness(0) invert(1)', // make icon white-ish on hover
                    },
                  },
                  // '&::after': {
                  //   content: '""',
                  //   position: 'absolute',
                  //   top: 0,
                  //   left: 0,
                  //   width: '100%',
                  //   height: '100%',
                  //   backgroundImage: item.pattern,
                  //   backgroundSize: '20px 20px',
                  //   pointerEvents: 'none',
                  //   zIndex: 0,
                  // },
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: { xs: 50, sm: 55, md: 60 },
                    height: { xs: 50, sm: 55, md: 60 },
                    mb: { xs: 1.5, sm: 2 },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1, // above pattern
                    position: 'relative',
                  }}
                >
                  <img
                    src={item.icon}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </Box>

                {/* Title */}
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: 14, sm: 15, md: 16 },
                    mb: 1,
                    zIndex: 1,
                    position: 'relative',
                  }}
                >
                  {item.title}
                </Typography>

                {/* Value */}
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    fontSize: { xs: '1.5rem', sm: '1.6rem', md: '1.75rem' },
                    zIndex: 1,
                    position: 'relative',
                  }}
                >
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

export default Dashboard;