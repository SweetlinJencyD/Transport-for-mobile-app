import React, { useState, useEffect } from 'react';
import {
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  InputAdornment,
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
  Person as PersonIcon,
  DirectionsBus as BusIcon,
  Assignment as AssignmentIcon,
  Home as HomeIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AssignDriver = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTokenExpired(true);
      return;
    }

    const fetchData = async () => {
      try {
        const driversRes = await fetch(`${API_BASE_URL}/supervisor/drivers`, {
  headers: { Authorization: `Bearer ${token}` },
});
const driversJson = await driversRes.json();
setDrivers(
  driversJson.data
    ? driversJson.data.map((d) => ({ value: d.user_id, label: d.name }))
    : []
);

const busesRes = await fetch(`${API_BASE_URL}/supervisor/vehicles`, {
  headers: { Authorization: `Bearer ${token}` },
});
const busesJson = await busesRes.json();
setBuses(
  busesJson.data
    ? busesJson.data.map((b) => ({ value: b.id, label: b.vehicle_no }))
    : []
);


      } catch (err) {
        console.error('Error fetching data:', err);
        showSnackbar('Error fetching available data', 'error');
      }
    };

    fetchData();
  }, [navigate]);

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

  const handleTokenExpiredClose = () => {
    setTokenExpired(false);
    navigate('/login');
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const [formData, setFormData] = useState({
    // Driver Selection
    driver_id: '',
    
    // Bus Assignment
    bus_id: '',

    // Assignment Details
    assignment_date: '',
    notes: '',
  });

  const validateForm = () => {
    const errors = {};

    if (!formData.driver_id) {
      errors.driver_id = 'Please select a driver!';
    }

    if (!formData.bus_id) {
      errors.bus_id = 'Please select a bus!';
    }

    // if (!formData.assignment_date) {
    //   errors.assignment_date = 'Assignment date is required!';
    // }

    return errors;
  };

  const handleChange = (e) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const getErrorMessage = (error) => {
    if (!error) return 'Unknown error';
    if (typeof error === 'string') return error;

    if (Array.isArray(error)) {
      return error.map(e => e.msg || JSON.stringify(e)).join(', ');
    }

    if (error.detail) return error.detail;
    if (error.message) return error.message;

    try {
      return JSON.stringify(error);
    } catch {
      return 'Unexpected error format';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setMessage('');
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('Unauthorized! Please login again.');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        driver_id: parseInt(formData.driver_id, 10),
        bus_id: parseInt(formData.bus_id, 10),
        assignment_date: formData.assignment_date,
        notes: formData.notes || '',
      };

      console.log('Submitting data:', submitData);

      const res = await fetch(`${API_BASE_URL}/assign_driver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (res.status === 401) {
        setTokenExpired(true);
        localStorage.removeItem('token');
        throw new Error('Token expired. Please login again.');
      }

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { detail: `HTTP error! status: ${res.status}` };
        }
        throw new Error(getErrorMessage(errorData));
      }

      const data = await res.json();
      setMessage(data.message || 'Driver assigned successfully!');
      setSuccess(true);
      showSnackbar('Driver assigned successfully!', 'success');

      setTimeout(() => {
        navigate('/list-driver');
      }, 2000);

    } catch (err) {
      console.error('Error assigning driver:', err);
      const errorMessage = getErrorMessage(err);
      setMessage('Error assigning driver: ' + errorMessage);
      setSuccess(false);
      showSnackbar('Error assigning driver: ' + errorMessage, 'error');

      if (err.message.includes('Token expired')) {
        setTokenExpired(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <Icon color="primary" sx={{ mr: 2, fontSize: isMobile ? '1.5rem' : '2rem' }} />
      <Box>
        <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );

  const getSelectedDriver = () => {
    return drivers.find(driver => driver.value === parseInt(formData.driver_id));
  };

  const getSelectedBus = () => {
    return buses.find(bus => bus.value === parseInt(formData.bus_id));
  };

  return (
    <Container maxWidth="lg" sx={{ py: isMobile ? 2 : 4, px: isMobile ? 2 : 3 }}>
    
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

    
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Breadcrumbs Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            mb: 3,
            '& .MuiBreadcrumbs-ol': {
              flexWrap: 'wrap',
            },
          }}
        >
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main',
              }
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: isMobile ? 'small' : 'medium' }} />
            {!isMobile && 'Dashboard'}
          </Link>
          <Typography
            color="primary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 'bold',
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}
          >
            <PersonIcon sx={{ mr: 0.5, fontSize: isMobile ? 'small' : 'medium' }} />
            {!isMobile && 'Driver'}
          </Typography>
          <Typography
            color="primary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 'bold',
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}
          >
            <AssignmentIcon sx={{ mr: 0.5, fontSize: isMobile ? 'small' : 'medium' }} />
            {isMobile ? 'Assign' : 'Assign Driver'}
          </Typography>
        </Breadcrumbs>
      </motion.div>

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Alert
            severity="success"
            sx={{
              mb: 3,
              borderRadius: 2,
            }}
          >
            <Typography variant={isMobile ? "body2" : "body1"}>
              {message || 'Driver assigned successfully! Redirecting to driver list...'}
            </Typography>
          </Alert>
        </motion.div>
      )}

      {message && !success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
            }}
          >
            <Typography variant={isMobile ? "body2" : "body1"}>
              {message}
            </Typography>
          </Alert>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card
          sx={{
            p: isMobile ? 2 : 4,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid',
            borderColor: 'divider',
            "&:hover": {
              transform: "none",
            },
          }}
        >
          <SectionHeader 
            icon={AssignmentIcon} 
            title="Assign Driver to Bus" 
            subtitle="Select a driver and assign them to an available bus"
          />

          <Paper
            elevation={0}
            sx={{
              p: isMobile ? 2 : 3,
              mb: 3,
              borderRadius: 2,
              backgroundColor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Grid container spacing={isMobile ? 2 : 3}>
              {/* Driver Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.driver_id} sx={{ mb: 3 }}>
                  <InputLabel id="driver-select-label">Select Driver *</InputLabel>
                  <Select
                    labelId="driver-select-label"
                    name="driver_id"
                    value={formData.driver_id}
                    onChange={handleChange}
                    label="Select Driver *"
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">Select a driver</MenuItem>
                    {drivers.map((driver) => (
                      <MenuItem key={driver.value} value={driver.value}>
                        {driver.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.driver_id && (
                    <FormHelperText>{formErrors.driver_id}</FormHelperText>
                  )}
                </FormControl>

                {formData.driver_id && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Selected Driver: <strong>{getSelectedDriver()?.label}</strong>
                      <br />
                      {/* Employee ID: <strong>{getSelectedDriver()?.emp_id}</strong> */}
                    </Typography>
                  </Alert>
                )}
              </Grid>

              {/* Bus Assignment */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.bus_id} sx={{ mb: 3 }}>
                  <InputLabel id="bus-select-label">Select Bus *</InputLabel>
                  <Select
                    labelId="bus-select-label"
                    name="bus_id"
                    value={formData.bus_id}
                    onChange={handleChange}
                    label="Select Bus *"
                    startAdornment={
                      <InputAdornment position="start">
                        <BusIcon color="primary" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">Select a bus</MenuItem>
                    {buses.map((bus) => (
                      <MenuItem key={bus.value} value={bus.value}>
                        {bus.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.bus_id && (
                    <FormHelperText>{formErrors.bus_id}</FormHelperText>
                  )}
                </FormControl>

                {formData.bus_id && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Selected Bus: <strong>{getSelectedBus()?.label}</strong>
                    </Typography>
                  </Alert>
                )}
              </Grid>

              {/* Assignment Date */}
              {/* <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Assignment Date *"
                  name="assignment_date"
                  type="date"
                  value={formData.assignment_date}
                  onChange={handleChange}
                  error={!!formErrors.assignment_date}
                  helperText={formErrors.assignment_date}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
              </Grid> */}

              {/* Notes */}
              {/* <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="Add any additional notes about this assignment..."
                  sx={{ mb: 3 }}
                />
              </Grid> */}

              {/* Assignment Summary */}
              {/* {(formData.driver_id || formData.bus_id) && (
                <Grid item xs={12}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      backgroundColor: 'success.light',
                      border: '1px solid',
                      borderColor: 'success.main',
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, color: 'success.dark' }}>
                      Assignment Summary
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body1">
                        <strong>Driver:</strong> {getSelectedDriver()?.label || 'Not selected'} 
                        {getSelectedDriver()?.emp_id && ` (ID: ${getSelectedDriver()?.emp_id})`}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Bus:</strong> {getSelectedBus()?.label || 'Not selected'}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Assignment Date:</strong> {formData.assignment_date || 'Not set'}
                      </Typography>
                      {formData.notes && (
                        <Typography variant="body1">
                          <strong>Notes:</strong> {formData.notes}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              )} */}
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Action Buttons */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              flexDirection: isMobile ? 'column-reverse' : 'row'
            }}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate('/list-driver')}
                  size={isMobile ? "medium" : "large"}
                  fullWidth={isMobile}
                  sx={{
                    minWidth: isMobile ? 'auto' : 120,
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  Cancel
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ width: isMobile ? '100%' : 'auto' }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  onClick={handleSubmit}
                  size={isMobile ? "medium" : "large"}
                  fullWidth={isMobile}
                  sx={{
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                    minWidth: isMobile ? 'auto' : 160,
                    width: isMobile ? '100%' : 'auto',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    fontWeight: 'bold',
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        ⟳
                      </motion.div>
                      Assigning Driver...
                    </Box>
                  ) : (
                    'Assign Driver'
                  )}
                </Button>
              </motion.div>
            </Box>
          </Paper>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
              Complete all required fields (*) to assign driver
            </Typography>
          </Box>
        </Card>
      </motion.div>
    </Container>
  );
};

export default AssignDriver;