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
  Group as GroupIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AssignAttendee = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [attendees, setAttendees] = useState([]);
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
        // Fetch attendees data
        const attendeesRes = await fetch(`${API_BASE_URL}/admin/assign-bus-data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const attendeesJson = await attendeesRes.json();
        console.log('Attendees data:', attendeesJson);
        
        setAttendees(
          attendeesJson.bo_users
            ? attendeesJson.bo_users.map((a) => ({ 
                value: a.id, 
                label: a.name,
                emp_id: a.emp_id 
              }))
            : []
        );

        // Fetch buses data
        const busesRes = await fetch(`${API_BASE_URL}/admin/vehicle-show`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const busesJson = await busesRes.json();
        console.log('Buses data:', busesJson);
        
        setBuses(
          busesJson.vehicles
            ? busesJson.vehicles.map((b) => ({ 
                value: b.id, 
                label: b.vehicle_no 
              }))
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
    // Attendee Selection
    attendee_id: '',
    
    // Bus Assignment
    bus_id: '',

    // Assignment Details
   
  });

  const validateForm = () => {
    const errors = {};

    if (!formData.attendee_id) {
      errors.attendee_id = 'Please select an attendee!';
    }

    if (!formData.bus_id) {
      errors.bus_id = 'Please select a bus!';
    }

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
        attendee_id: parseInt(formData.attendee_id, 10),
        vehicle_id: parseInt(formData.bus_id, 10),
        // assignment_date: formData.assignment_date,
        // notes: formData.notes || '',
      };

      console.log('Submitting data:', submitData);

      const res = await fetch(`${API_BASE_URL}/admin/assign-vehicle`, {
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
      setMessage(data.message || 'Attendee assigned successfully!');
      setSuccess(true);
      showSnackbar('Attendee assigned successfully!', 'success');

      setTimeout(() => {
        navigate('/list-assignAttendee');
      }, 2000);

    } catch (err) {
      console.error('Error assigning attendee:', err);
      const errorMessage = getErrorMessage(err);
      setMessage('Error assigning attendee: ' + errorMessage);
      setSuccess(false);
      showSnackbar('Error assigning attendee: ' + errorMessage, 'error');

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

  const getSelectedAttendee = () => {
    return attendees.find(attendee => attendee.value === parseInt(formData.attendee_id));
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
            <GroupIcon sx={{ mr: 0.5, fontSize: isMobile ? 'small' : 'medium' }} />
            {!isMobile && 'Attendee'}
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
            {isMobile ? 'Assign' : 'Assign Attendee'}
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
              {message || 'Attendee assigned successfully! Redirecting to attendee list...'}
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
            title="Assign Attendee to Bus" 
            subtitle="Select an attendee and assign them to an available bus"
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
              {/* Attendee Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.attendee_id} sx={{ mb: 3 }}>
                  <InputLabel id="attendee-select-label">Select Attendee *</InputLabel>
                  <Select
                    labelId="attendee-select-label"
                    name="attendee_id"
                    value={formData.attendee_id}
                    onChange={handleChange}
                    label="Select Attendee *"
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">Select an attendee</MenuItem>
                    {attendees.map((attendee) => (
                      <MenuItem key={attendee.value} value={attendee.value}>
                        {attendee.label} {attendee.emp_id && `(${attendee.emp_id})`}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.attendee_id && (
                    <FormHelperText>{formErrors.attendee_id}</FormHelperText>
                  )}
                </FormControl>

                {formData.attendee_id && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Selected Attendee: <strong>{getSelectedAttendee()?.label}</strong>
                      <br />
                      {getSelectedAttendee()?.emp_id && (
                        <>Employee ID: <strong>{getSelectedAttendee()?.emp_id}</strong></>
                      )}
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

              {/* Assignment Summary */}
              {/* {(formData.attendee_id || formData.bus_id) && (
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
                        <strong>Attendee:</strong> {getSelectedAttendee()?.label || 'Not selected'} 
                        {getSelectedAttendee()?.emp_id && ` (ID: ${getSelectedAttendee()?.emp_id})`}
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
                  onClick={() => navigate('/list-attendee')}
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
                      Assigning Attendee...
                    </Box>
                  ) : (
                    'Assign Attendee'
                  )}
                </Button>
              </motion.div>
            </Box>
          </Paper>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
              Complete all required fields (*) to assign attendee
            </Typography>
          </Box>
        </Card>
      </motion.div>
    </Container>
  );
};

export default AssignAttendee;