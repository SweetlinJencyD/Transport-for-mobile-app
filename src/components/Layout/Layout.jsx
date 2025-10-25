import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get user role from localStorage on component mount
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  // Check if user is a driver (role_id = 3)
  const isDriver = userRole === '3';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Show sidebar for ALL users including drivers - Sidebar component handles the menu based on role */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            marginLeft: { 
              xs: 0, 
              sm: '280px' // Keep margin for ALL users since sidebar is always visible
            },
            width: {
              xs: '100%',
              sm: 'calc(100% - 280px)' // Same width for all users
            },
            transition: 'all 0.3s ease',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;