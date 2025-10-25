import React from 'react';
import { Card, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'Jan', vehicles: 400, revenue: 2400 },
  { name: 'Feb', vehicles: 300, revenue: 1398 },
  { name: 'Mar', vehicles: 200, revenue: 9800 },
  { name: 'Apr', vehicles: 278, revenue: 3908 },
  { name: 'May', vehicles: 189, revenue: 4800 },
  { name: 'Jun', vehicles: 239, revenue: 3800 },
  { name: 'Jul', vehicles: 349, revenue: 4300 },
];

const Chart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card sx={{ p: 3, height: 400 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Vehicle Analytics
        </Typography>
        <Box sx={{ height: 350, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: 8,
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="vehicles" 
                stroke="#DC143C" 
                strokeWidth={3}
                dot={{ fill: '#DC143C', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#DC143C' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#2D3748" 
                strokeWidth={3}
                dot={{ fill: '#2D3748', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#2D3748' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Card>
    </motion.div>
  );
};

export default Chart;