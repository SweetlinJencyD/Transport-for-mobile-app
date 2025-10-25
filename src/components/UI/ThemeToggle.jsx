import React, { useContext } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4 as DarkIcon, Brightness7 as LightIcon } from '@mui/icons-material';
import { ThemeContext } from '../../App';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { mode, toggleColorMode } = useContext(ThemeContext);

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <IconButton onClick={toggleColorMode} color="inherit">
          {mode === 'light' ? <DarkIcon /> : <LightIcon />}
        </IconButton>
      </motion.div>
    </Tooltip>
  );
};

export default ThemeToggle;