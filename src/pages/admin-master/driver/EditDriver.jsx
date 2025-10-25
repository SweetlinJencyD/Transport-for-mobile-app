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
  Stepper,
  Step,
  StepLabel,
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
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  DirectionsBus as BusIcon,
  Description as DocumentIcon,
  CloudUpload as UploadIcon,
  Home as HomeIcon,
  Warning as WarningIcon,
  DriveEta as LicenseIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const EditDriver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [driver, setDriver] = useState(location.state?.driver || null);
  const [activeStep, setActiveStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [buses, setBuses] = useState([]);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    if (!driver) {
      setMessage("Driver data is missing");
      setLoading(false);
      return;
    }

    // Initialize form data with driver data
    setFormData({
      user_id: driver.user_id || '',
      emp_id: driver.emp_id || '',
      name: driver.name || '',
      email: driver.email || '',
      password: '',
      contact_number: driver.contact_number || '',
      bus_id: driver.bus_id || '',
      id_proof_no: driver.id_proof_no || '',
      driving_license_no: driver.driving_license_no || '',
      id_proof: null,
      driving_license: null,
      image: null,
    });

    // Fetch buses and driver documents
    fetchBusesAndDocuments();
  }, [driver, navigate]);

  const [formData, setFormData] = useState({
    id: '',
    emp_id: '',
    name: '',
    email: '',
    password: '',
    contact_number: '',
    bus_id: '',
    id_proof: null,
    id_proof_no: '',
    driving_license: null,
    driving_license_no: '',
    image: null,
  });

const fetchBusesAndDocuments = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    setTokenExpired(true);
    return;
  }

  try {
    const userId = driver?.user_id;
    if (!userId) return showSnackbar("Driver ID missing", "error");

    const busRes = await fetch(`${API_BASE_URL}/available_buses_for_driver?user_id=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
    });

   const busData = await busRes.json();
setBuses(busData.buses.map(b => ({ value: b.id, label: b.vehicle_no })));

// Preselect assigned bus
setFormData(prev => ({
  ...prev,
  bus_id: busData.assigned_vehicle_id || '',
}));

  } catch (err) {
    console.error('Error fetching data:', err);
    showSnackbar('Error fetching driver data', 'error');
  } finally {
    setLoading(false);
  }
};

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

  const steps = [
    'Basic Information',
    'Contact & Assignment',
    'Documents & Verification'
  ];

  const validateCurrentStep = () => {
    const errors = {};

    switch (activeStep) {
      case 0: // Basic Information
        if (!formData.name?.trim()) {
          errors.name = 'Name is required!';
        }
        break;

      case 1: // Contact & Assignment
        if (!formData.email?.trim()) {
          errors.email = 'Email is required!';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = 'Please enter a valid email address!';
        }
        break;

      case 2: // Documents & Verification
        // Documents are optional in this implementation
        break;

      default:
        break;
    }

    return errors;
  };

  const handleChange = (e) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0] || null,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const handleNext = () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    const errors = validateCurrentStep();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  };

  const handleBack = () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
    setFormErrors({});
  };

  const handleStepClick = (stepIndex) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    if (stepIndex < activeStep) {
      setActiveStep(stepIndex);
      setFormErrors({});
    }
  };

 const getErrorMessage = (error) => {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;

  if (Array.isArray(error)) {
    return error.map(e => e.msg || JSON.stringify(e)).join(', ');
  }

  if (error.detail) return JSON.stringify(error.detail);
  if (error.message) return error.message;

  // Fallback: stringify any object safely
  return JSON.stringify(error, null, 2);
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only submit if we're on the last step
    if (activeStep !== steps.length - 1) {
      return; // Don't do anything if not on last step
    }

    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    // Final validation before submission
    const errors = validateCurrentStep();
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

    const submitData = new FormData();

    Object.keys(formData).forEach(key => {
      let value = formData[key];

      // Only append non-empty fields
      if (value !== null && value !== '') {
        // Convert bus_id to integer if it exists
        if (key === 'bus_id' && value !== '') {
          value = parseInt(value, 10);
        }
        
        // For file fields, only append if a new file was selected
        if (['id_proof', 'driving_license', 'image'].includes(key)) {
          if (value instanceof File) {
            submitData.append(key, value);
          }
        } else {
          submitData.append(key, value);
        }
      }
    });

    try {
      for (let pair of submitData.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      const res = await fetch(`${API_BASE_URL}/update_driver`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData,
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
      setMessage(data.message || 'Driver updated successfully!');
      setSuccess(true);
      showSnackbar('Driver updated successfully!', 'success');

      setTimeout(() => {
        navigate('/list-driver');
      }, 2000);

    } catch (err) {
      console.error('Error updating driver:', err);
      const errorMessage = getErrorMessage(err);
      setMessage('Error updating driver: ' + errorMessage);
      setSuccess(false);
      showSnackbar('Error updating driver: ' + errorMessage, 'error');

      if (err.message.includes('Token expired')) {
        setTokenExpired(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const FileUploadButton = ({ name, label, acceptedFiles = "image/*,application/pdf" }) => (
    <Button
      variant="outlined"
      component="label"
      fullWidth
      startIcon={<UploadIcon />}
      sx={{
        height: '56px',
        borderStyle: 'dashed',
        borderWidth: '2px',
        backgroundColor: formData[name] ? 'success.light' : 'background.paper',
        '&:hover': {
          borderStyle: 'dashed',
          borderWidth: '2px',
          backgroundColor: formData[name] ? 'success.light' : 'action.hover',
        }
      }}
    >
      {formData[name] ? 'Change File' : `Upload ${label}`}
      <input
        type="file"
        name={name}
        hidden
        accept={acceptedFiles}
        onChange={handleChange}
      />
    </Button>
  );

  const SectionHeader = ({ icon: Icon, title }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 2 }}>
      <Icon color="primary" sx={{ mr: 2 }} />
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {title}
      </Typography>
    </Box>
  );

  const renderBasicInformation = () => (
    <Box>
      <SectionHeader icon={PersonIcon} title="Basic Driver Information" />
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Employee ID *"
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
            label="Full Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            error={!!formErrors.name}
            helperText={formErrors.name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
            sx={{ mb: 2 }}
          />
          <Typography variant="caption" color="text.secondary">
            Leave password field blank to keep the current password
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  const renderContactAssignment = () => (
    <Box>
      <SectionHeader icon={EmailIcon} title="Contact & Bus Assignment" />
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email Address *"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
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
            label="Contact Number *"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            error={!!formErrors.contact_number}
            helperText={formErrors.contact_number}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
        <TextField
  fullWidth
  select
  label="Assign Bus *"
  name="bus_id"
  value={formData.bus_id}  // this controls preselection
  onChange={handleChange}
  error={!!formErrors.bus_id}
  helperText={formErrors.bus_id}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <BusIcon color="primary" />
      </InputAdornment>
    ),
  }}
  sx={{ mb: 2 }}
>
  <MenuItem value="">Select a bus</MenuItem>
  {buses.map((bus) => (
    <MenuItem key={bus.value} value={bus.value}>
      {bus.label}
    </MenuItem>
  ))}
</TextField>

        </Grid>
      </Grid>
    </Box>
  );

  const renderDocumentsVerification = () => (
    <Box>
      <SectionHeader icon={DocumentIcon} title="Documents & Verification" />
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} md={6}>
          <FileUploadButton name="id_proof" label="ID Proof Document" />
          {formData.id_proof && (
            <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
              ✓ Selected: {formData.id_proof.name}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Leave blank to keep current document
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="ID Proof Number"
            name="id_proof_no"
            value={formData.id_proof_no}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FileUploadButton name="driving_license" label="Driving License" />
          {formData.driving_license && (
            <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
              ✓ Selected: {formData.driving_license.name}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Leave blank to keep current document
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="License Number"
            name="driving_license_no"
            value={formData.driving_license_no}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LicenseIcon color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12}>
          <FileUploadButton
            name="image"
            label="Driver Photo"
            acceptedFiles="image/*"
          />
          {formData.image && (
            <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
              ✓ Selected: {formData.image.name}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Optional: Upload a new photo or leave blank to keep current photo
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBasicInformation();
      case 1:
        return renderContactAssignment();
      case 2:
        return renderDocumentsVerification();
      default:
        return null;
    }
  };

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
      <Dialog
        open={tokenExpired}
        onClose={handleTokenExpiredClose}
        aria-labelledby="token-expired-dialog"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          Session Expired
        </DialogTitle>
        <DialogContent>
          <Typography>
            Your session has expired. Please login again to continue.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleTokenExpiredClose}
            variant="contained"
            color="primary"
            fullWidth
          >
            Go to Login
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
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/list-driver')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main',
              }
            }}
          >
            <PersonIcon sx={{ mr: 0.5, fontSize: isMobile ? 'small' : 'medium' }} />
            {!isMobile && 'Drivers'}
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
            {isMobile ? 'Edit Driver' : 'Edit Driver'}
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
            "&:hover": {
              transform: "none",
            },
          }}
        >

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PersonIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Edit Driver
            </Typography>
          </Box>

          <Stepper
            activeStep={activeStep}
            sx={{
              mb: 4,
              '& .MuiStepLabel-root .Mui-completed': {
                color: 'success.main',
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: 'primary.main',
              },
            }}
            orientation={isMobile ? "vertical" : "horizontal"}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  onClick={() => handleStepClick(index)}
                  sx={{
                    cursor: index <= activeStep ? 'pointer' : 'default',
                    '& .MuiStepLabel-label': {
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                    }
                  }}
                >
                  {isMobile ? `Step ${index + 1}` : label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Paper
            elevation={0}
            sx={{
              p: isMobile ? 2 : 3,
              mb: 3,
              borderRadius: 2,
              backgroundColor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'auto',
            }}
          >
            {getStepContent(activeStep)}

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
                  onClick={() => navigate('/list-driver')}
                  variant="outlined"
                  
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

              <Box sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                width: isMobile ? '100%' : 'auto'
              }}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                    startIcon={<BackIcon />}
                    size={isMobile ? "medium" : "large"}
                    fullWidth={isMobile}
                    sx={{
                      minWidth: isMobile ? 'auto' : 120,
                      width: isMobile ? '100%' : 'auto'
                    }}
                  >
                    Back
                  </Button>
                </motion.div>

                {activeStep === steps.length - 1 ? (
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
                          <CircularProgress size={20} color="inherit" />
                          Updating Driver...
                        </Box>
                      ) : (
                        'Update Driver'
                      )}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ width: isMobile ? '100%' : 'auto' }}
                  >
                    <Button
                      type="button"
                      variant="contained"
                      onClick={handleNext}
                      size={isMobile ? "medium" : "large"}
                      fullWidth={isMobile}
                      sx={{
                        minWidth: isMobile ? 'auto' : 120,
                        width: isMobile ? '100%' : 'auto',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        fontWeight: 'bold',
                      }}
                    >
                      Next
                    </Button>
                  </motion.div>
                )}
              </Box>
            </Box>
          </Paper>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
              Step {activeStep + 1} of {steps.length} • Complete all required fields (*)
            </Typography>
          </Box>
        </Card>
      </motion.div>
    </Container>
  );
};

export default EditDriver;