import React from 'react';
import { Card, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon, color, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05 }}
    >
      <Card
        sx={{
          p: 3,
          height: '100%',
          background: `linear-gradient(135deg, ${color}20, ${color}40)`,
          border: `1px solid ${color}30`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: color }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              color: color,
              opacity: 0.8,
              fontSize: '2.5rem',
            }}
          >
            {icon}
          </Box>
        </Box>
        
        {/* Animated background element */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}30, transparent)`,
            opacity: 0.6,
          }}
        />
      </Card>
    </motion.div>
  );
};

export default StatsCard;