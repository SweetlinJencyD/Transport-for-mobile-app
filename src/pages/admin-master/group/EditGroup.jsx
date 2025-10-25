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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import {
  Home as HomeIcon,
  Group as GroupIcon,
  DirectionsBus as BusIcon,
  Warning as WarningIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import Select from 'react-select';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const EditGroup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [group, setGroup] = useState(location.state?.group || null);
  const [buses, setBuses] = useState([]);
  const [selectedBuses, setSelectedBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [tokenExpired, setTokenExpired] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const [formData, setFormData] = useState({
    id: '',
    group_name: '',
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert('Please Log in to Continue!');
      navigate('/login');
      return;
    }

    if (!group) {
      setMessage("Group data is missing");
      setLoading(false);
      return;
    }

    // Initialize form data
    setFormData({
      id: group.id || '',
      group_name: group.group_name || '',
    });

    // Fetch buses and assigned buses for this group
    fetchBusesForEdit(token);
  }, [group, navigate]);

  const fetchBusesForEdit = async (token) => {
  try {
    const busesRes = await fetch(`${API_BASE_URL}/get_buses_for_edit/${group.id}`, {
  headers: { Authorization: `Bearer ${token}` },
});

      

    if (busesRes.status === 401) {
      setTokenExpired(true);
      localStorage.removeItem('token');
      return;
    }

    if (!busesRes.ok) throw new Error('Failed to fetch buses');

const busesData = await busesRes.json();

const busOptions = (busesData.buses || []).map(bus => ({
  value: parseInt(bus.id, 10),
  label: bus.vehicle_no,
}));

setBuses(busOptions);

const assignedIds = (busesData.assigned_bus_ids || []).map(id => parseInt(id, 10));

// Filter options to preselect
const selected = busOptions.filter(bus => assignedIds.includes(bus.value));

setSelectedBuses(selected);


  } catch (err) {
    console.error(err);
    setMessage('Error fetching buses data.');
  } finally {
    setLoading(false);
  }
};


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

  const validateForm = () => {
    const errors = {};
    if (!formData.group_name.trim()) {
      errors.group_name = 'Group name is required!';
    }
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
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const handleBusSelection = (selectedOptions) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    setSelectedBuses(selectedOptions || []);
    
    // Clear error when user selects buses
    if (formErrors.buses) {
      setFormErrors({
        ...formErrors,
        buses: '',
      });
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

  const errors = validateForm();
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  setLoading(true);
  setMessage('');

  try {
    const token = localStorage.getItem('token');

    const formDataToSend = new FormData();
    formDataToSend.append('id', formData.id);
    formDataToSend.append('group_name', formData.group_name);
    formDataToSend.append('buses', JSON.stringify(selectedBuses.map((bus) => bus.value)));

    const res = await fetch(`${API_BASE_URL}/update_group`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formDataToSend, // no Content-Type header manually set!
    });

    const data = await res.json();

    if (res.ok && data.status === 'success') {
      showSnackbar('Group updated successfully!', 'success');
      setSuccess(true);
      setTimeout(() => navigate('/list-group'), 2000);
    } else {
      showSnackbar(`Failed to update group: ${data.message}`, 'error');
    }

  } catch (err) {
    console.error(err);
    showSnackbar('Error updating group: ' + err.message, 'error');
  } finally {
    setLoading(false);
  }
};


  const SectionHeader = ({ icon: Icon, title }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 2 }}>
      <Icon color="primary" sx={{ mr: 2 }} />
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {title}
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: isMobile ? 2 : 4, px: isMobile ? 2 : 3 }}>
      {/* Token Expired Dialog */}
      <Dialog open={tokenExpired} onClose={handleTokenExpiredClose}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          Session Expired
        </DialogTitle>
        <DialogContent>
          <Typography>Your session has expired. Please login again.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTokenExpiredClose} variant="contained" fullWidth>
            Go to Login
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
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/list-group')}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main',
              }
            }}
          >
            <GroupIcon sx={{ mr: 0.5, fontSize: isMobile ? 'small' : 'medium' }} />
            {!isMobile && 'Groups'}
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
            {isMobile ? 'Edit Group' : 'Edit Group'}
          </Typography>
        </Breadcrumbs>
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Alert 
            severity={success ? "success" : "error"}
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
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <GroupIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Edit Group
            </Typography>
          </Box>

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
            <form onSubmit={handleSubmit}>
              <SectionHeader icon={GroupIcon} title="Group Information" />
              
              <Grid container spacing={isMobile ? 2 : 3}>
                {/* Group Name */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Group Name *"
                    name="group_name"
                    value={formData.group_name || ''}
                    onChange={handleChange}
                    error={!!formErrors.group_name}
                    helperText={formErrors.group_name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <GroupIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                {/* Buses Selection */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <BusIcon sx={{ mr: 1, color: 'primary.main' }} />
                      Bus(es) *
                    </Typography>
                    <Select
                      isMulti
                      options={buses}
                      value={selectedBuses}
                      onChange={handleBusSelection}
                      placeholder="Select bus(es)..."
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '56px',
                          borderColor: formErrors.buses ? '#d32f2f' : '#ccc',
                          '&:hover': {
                            borderColor: formErrors.buses ? '#d32f2f' : '#aaa',
                          },
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: '#666',
                        }),
                      }}
                    />
                    {formErrors.buses && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {formErrors.buses}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

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
                    onClick={() => navigate('/list-group')}
                    variant="outlined"
                    startIcon={<BackIcon />}
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
                        <CircularProgress size={20} color="inherit" />
                        Updating Group...
                      </Box>
                    ) : (
                      'Update Group'
                    )}
                  </Button>
                </motion.div>
              </Box>
            </form>
          </Paper>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
              Complete all required fields (*) to update group information
            </Typography>
          </Box>
        </Card>
      </motion.div>
    </Container>
  );
};

export default EditGroup;