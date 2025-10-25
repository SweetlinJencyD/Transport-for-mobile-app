import React, { useState, useEffect } from 'react';
import {
  Card,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  MenuItem,
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
  Chip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material';
import {
  SupervisorAccount as SupervisorIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Badge as BadgeIcon,
  Group as GroupIcon,
  Home as HomeIcon,
  Warning as WarningIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AddSupervisor = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [tokenExpired, setTokenExpired] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
    }
    fetchGroups();
  }, []);

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

  const fetchGroups = async () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    const token = localStorage.getItem('token');
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    try {
      const res = await fetch(`${API_BASE_URL}/get_groups`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setTokenExpired(true);
        localStorage.removeItem('token');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setGroups(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      showSnackbar('Error fetching groups', 'error');
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
    name: '',
    emp_id: '',
    email: '',
    password: '',
    group_ids: [],
  });

  const validateForm = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = 'Supervisor name is required!';
    }
    
    // Email validation
    if (!formData.email?.trim()) {
      errors.email = 'Email is required!';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address!';
    }
    
    if (!formData.password?.trim()) {
      errors.password = 'Password is required!';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters!';
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

  const handleGroupChange = (event) => {
    const {
      target: { value },
    } = event;

    setFormData({
      ...formData,
      group_ids: typeof value === 'string' ? value.split(',') : value,
    });

    if (formErrors.group_ids) {
      setFormErrors({
        ...formErrors,
        group_ids: '',
      });
    }
  };

  // Helper function to extract error message
  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.detail) return error.detail;
    if (typeof error === 'object') {
      try {
        return JSON.stringify(error);
      } catch {
        return 'An unknown error occurred';
      }
    }
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
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('Unauthorized! Please login again.');
      setLoading(false);
      return;
    }

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    try {
      const res = await fetch(`${API_BASE_URL}/add_supervisor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
      setMessage(data.message || 'Supervisor added successfully!');
      setSuccess(true);
      showSnackbar('Supervisor added successfully!', 'success');

      // Reset form
      setFormData({
        name: '',
        emp_id: '',
        email: '',
        password: '',
        group_ids: [],
      });

      setTimeout(() => {
        navigate('/list-supervisor');
      }, 2000);

    } catch (err) {
      console.error('Error saving supervisor:', err);
      const errorMessage = getErrorMessage(err);
      setMessage('Error saving supervisor: ' + errorMessage);
      setSuccess(false);
      showSnackbar('Error saving supervisor: ' + errorMessage, 'error');
      
      if (err.message.includes('Token expired')) {
        setTokenExpired(true);
      }
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

  return (
    <Container maxWidth="md" sx={{ py: isMobile ? 2 : 4, px: isMobile ? 2 : 3 }}>
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
            <SupervisorIcon sx={{ mr: 0.5, fontSize: isMobile ? 'small' : 'medium' }} />
            {!isMobile && 'Supervisor'}
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
            <SupervisorIcon sx={{ mr: 0.5, fontSize: isMobile ? 'small' : 'medium' }} />
            {isMobile ? 'Add' : 'Add New Supervisor'}
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
              {message || 'Supervisor added successfully! Redirecting...'}
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
          }}
        >
          <SectionHeader icon={SupervisorIcon} title="Add New Supervisor" />

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
              <Grid container spacing={isMobile ? 2 : 3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Supervisor Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    // required prop remove pannirukkom
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SupervisorIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    name="emp_id"
                    value={formData.emp_id}
                    onChange={handleChange}
                    error={!!formErrors.emp_id}
                    helperText={formErrors.emp_id}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    // required prop remove pannirukkom
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Password *"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    // required prop remove pannirukkom
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                </Grid>

               <Grid item xs={12}>
  <Box sx={{ width: { xs: '100%', sm: '100%', md: 400 }, mx: { xs: 0, md: 'auto' } }}>
    <FormControl fullWidth error={!!formErrors.group_ids} sx={{ mb: 2 }}>
      <InputLabel>Assigned Groups</InputLabel>
      <Select
        multiple
        name="group_ids"
        value={formData.group_ids}
        onChange={handleGroupChange}
        input={<OutlinedInput label="Assigned Groups" />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => {
              const group = groups.find(g => g.id === value);
              return (
                <Chip
                  key={value}
                  label={group?.group_name || value}
                  size="small"
                />
              );
            })}
          </Box>
        )}
      >
        {groups.map((group) => (
          <MenuItem key={group.id} value={group.id}>
            <Checkbox checked={formData.group_ids.indexOf(group.id) > -1} />
            <ListItemText primary={group.group_name} />
          </MenuItem>
        ))}
      </Select>
      {formErrors.group_ids && (
        <Typography variant="caption" color="error" sx={{ ml: 2 }}>
          {formErrors.group_ids}
        </Typography>
      )}
    </FormControl>
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
                    type="button"
                    variant="outlined"
                    onClick={() => navigate('/list-supervisor')}
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
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          ⟳
                        </motion.div>
                        Adding Supervisor...
                      </Box>
                    ) : (
                      'Add Supervisor'
                    )}
                  </Button>
                </motion.div>
              </Box>
            </form>
          </Paper>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
              Fill all required fields (*) to add a new supervisor
            </Typography>
          </Box>
        </Card>
      </motion.div>
    </Container>
  );
};

export default AddSupervisor;