import React, { useState, useEffect } from 'react';
import {
  Card,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  Container,
  Paper,
  Divider,
  Breadcrumbs,
  Link,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  Home as HomeIcon,
  Group as GroupIcon,
  DirectionsBus as BusIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import Select from 'react-select';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AddGroup = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [tokenExpired, setTokenExpired] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [buses, setBuses] = useState([]);
  const [selectedBuses, setSelectedBuses] = useState([]);

  const [formData, setFormData] = useState({
    group_name: '',
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
    } else {
      fetchBuses();
    }
  }, []);

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
      setTokenExpired(true);
      localStorage.removeItem('token');
      return false;
    }
  };

  const handleTokenExpiredClose = () => {
    setTokenExpired(false);
    navigate('/login');
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchBuses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setTokenExpired(true);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/get_buses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        setTokenExpired(true);
        localStorage.removeItem('token');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to fetch buses');
      }

      const data = await res.json();
      const busOptions = data.map((bus) => ({
        value: bus.id,
        label: bus.vehicle_no,
      }));
      setBuses(busOptions);
    } catch (err) {
      showSnackbar('Error fetching buses: ' + err.message, 'error');
    }
  };
const validateGroupName = async (name) => {
  if (!name.trim()) return 'Group name is required!';
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/check_group_exists?group_name=${encodeURIComponent(name)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.exists) return 'Group name already exists!';
  } catch (err) {
    console.error('Error checking group:', err);
  }
  return null;
};

const validateForm = async () => {
  const errors = {};
  const groupError = await validateGroupName(formData.group_name);
  if (groupError) errors.group_name = groupError;
  if (selectedBuses.length === 0) {
    errors.buses = 'Please select at least one bus!';
  }
  return errors;
};

  const handleChange = (e) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleBusSelection = (selectedOptions) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    setSelectedBuses(selectedOptions || []);
    if (formErrors.buses) {
      setFormErrors({ ...formErrors, buses: '' });
    }
  };

  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.detail) return error.detail;
    return 'An unknown error occurred';
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!checkTokenExpiration()) {
    setTokenExpired(true);
    return;
  }

  const errors = await validateForm();
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

   

    setLoading(true);
    setMessage('');
    const token = localStorage.getItem('token');

    const submitData = new FormData();
    submitData.append('group_name', formData.group_name);
    submitData.append('buses', JSON.stringify(selectedBuses.map((b) => b.value)));

    try {
      const res = await fetch(`${API_BASE_URL}/store_group`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });

      if (res.status === 401) {
        setTokenExpired(true);
        localStorage.removeItem('token');
        throw new Error('Token expired. Please login again.');
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(getErrorMessage(errData));
      }

      const data = await res.json();
      setMessage(data.message || 'Group created successfully!');
      setSuccess(true);
      showSnackbar('Group created successfully!', 'success');
      setTimeout(() => navigate('/list-group'), 2000);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setMessage('Error creating group: ' + errorMessage);
      setSuccess(false);
      showSnackbar('Error creating group: ' + errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: isMobile ? 2 : 4 }}>
      {/* Token Expired Dialog */}
      
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

      
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      {/* Breadcrumbs */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} />
            Dashboard
          </Link>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/list-group')}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <GroupIcon sx={{ mr: 0.5 }} />
            Groups
          </Link>
          <Typography color="primary" sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
            <GroupIcon sx={{ mr: 0.5 }} />
            Add Group
          </Typography>
        </Breadcrumbs>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card sx={{ p: isMobile ? 2 : 4, borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={isMobile ? 2 : 3} alignItems="center">
              {/* Group Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Group Name *"
                  name="group_name"
                  value={formData.group_name}
                  onChange={handleChange}
                  error={!!formErrors.group_name}
                  helperText={formErrors.group_name}
                />
              </Grid>

              {/* Multi Select Dropdown */}
              <Grid item xs={12} md={6}>
                <Box sx={{ position: 'relative' }}>
                  <Select
                    isMulti
                    options={buses}
                    value={selectedBuses}
                    onChange={handleBusSelection}
                    placeholder="Select Buses *"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: formErrors.buses ? 'red' : base.borderColor,
                      }),
                    }}
                  />
                  {formErrors.buses && (
                    <Typography variant="caption" color="error">
                      {formErrors.buses}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box
              sx={{
                display: 'flex',
                justifyContent: isMobile ? 'center' : 'flex-end',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate('/list-group')}
                fullWidth={isMobile}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth={isMobile}
              >
                {loading ? 'Creating Group...' : 'Create Group'}
              </Button>
            </Box>
          </form>
        </Card>
      </motion.div>
    </Container>
  );
};

export default AddGroup;
