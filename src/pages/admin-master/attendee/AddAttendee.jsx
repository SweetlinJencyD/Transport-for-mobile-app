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
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  CloudUpload as UploadIcon,
  Home as HomeIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AddAttendee = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [tokenExpired, setTokenExpired] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

  // Check token expiration
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setTokenExpired(true);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/verify_token`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          setTokenExpired(true);
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Token validation failed:', err);
        setTokenExpired(true);
        localStorage.removeItem('token');
      }
    };

    verifyToken();
  }, [navigate]);

  const handleTokenExpiredClose = () => {
    setTokenExpired(false);
    navigate('/login');
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    email: '',
    contact_number: '',
    password: '',
    emp_id: '',            // ✅ added
  id_proof_no: '',       // ✅ added
  
  // Additional Information
  attendee_image: null,
  id_proof: null,    
    
   
  });

  const steps = [
    'Basic Information',
    'Additional Details'
  ];
const validateCurrentStep = async () => {
  const errors = {};

  switch (activeStep) {
    case 0:
      if (!formData.name?.trim()) {
        errors.name = 'Name is required!';
      } else {
        const nameExists = await checkNameExists(formData.name);
        if (nameExists) errors.name = 'Username already exists!';
      }

      if (!formData.email?.trim()) {
        errors.email = 'Email is required!';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          errors.email = 'Please enter a valid email address!';
        } else {
          const emailExists = await checkEmailExists(formData.email);
          if (emailExists) errors.email = 'Email already exists!';
        }
      }

      if (!formData.contact_number?.trim()) {
        errors.contact_number = 'Contact number is required!';
      }

      if (!formData.password?.trim()) {
        errors.password = 'Password is required!';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters!';
      }
      break;

    default:
      break;
  }

  return errors;
};

const checkNameExists = async (name) => {
  if (!name.trim()) return false;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/check_name_exists?name=${encodeURIComponent(name)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.exists;
  } catch (err) {
    console.error('Error checking name:', err);
    return false;
  }
};

const checkEmailExists = async (email) => {
  if (!email.trim()) return false;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/check_email_exists?email=${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.exists;
  } catch (err) {
    console.error('Error checking email:', err);
    return false;
  }
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

  const handleNext = async(e) => {
    e.preventDefault(); 
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    const errors = await validateCurrentStep();
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    // Final validation before submission
    const errors = await validateCurrentStep();
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

    // Append all form data
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      if (value !== null && value !== '') {
        if (value instanceof File) {
          submitData.append(key, value);
        } else {
          submitData.append(key, value);
        }
      }
    });

    try {
      const res = await fetch(`${API_BASE_URL}/add_attendee`, {
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
        const errorData = await res.json();
        throw new Error(errorData.detail || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setMessage(data.message || 'Attendee added successfully!');
      setSuccess(true);
      showSnackbar('Attendee added successfully!', 'success');
setTimeout(() => {
  navigate('/list-attendee');
}, 2000);


    } catch (err) {
      console.error('Error saving attendee:', err);
      setMessage('Error saving attendee: ' + err.message);
      setSuccess(false);
      showSnackbar('Error saving attendee: ' + err.message, 'error');
      
      if (err.message.includes('Token expired')) {
        setTokenExpired(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const FileUploadButton = ({ name, label, acceptedFiles = "image/*" }) => (
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
      <SectionHeader icon={PersonIcon} title="Basic Attendee Information" />
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} md={4}>
  <TextField
    fullWidth
    label="Employee ID "
    name="emp_id"
    value={formData.emp_id}
    onChange={handleChange}
    
    error={!!formErrors.emp_id}
    helperText={formErrors.emp_id}
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


        <Grid item xs={12} md={4}>
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

        <Grid item xs={12} md={4}>
        <TextField
  fullWidth
  label="Email"
  name="email"
  type="email"
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

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Contact Number *"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            required
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

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Password *"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
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
      </Grid>
    </Box>
  );

  const renderAdditionalDetails = () => (
    <Box>
      <SectionHeader icon={PersonIcon} title="Additional Details" />
      
      <Grid container spacing={isMobile ? 2 : 3}>
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
  <FileUploadButton 
    name="id_proof" 
    label="ID Proof" 
    acceptedFiles="image/*,application/pdf" 
  />
  {formData.id_proof && (
    <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
      ✓ Selected: {formData.id_proof.name}
    </Typography>
  )}
  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
    Optional: Upload a scanned copy of ID proof
  </Typography>
</Grid>

        <Grid item xs={12}>
          <FileUploadButton 
            name="attendee_image" 
            label="Attendee Image" 
            acceptedFiles="image/*" 
          />
          {formData.attendee_image && (
            <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
              ✓ Selected: {formData.attendee_image.name}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Optional: Upload a profile picture for the attendee
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
        return renderAdditionalDetails();
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: isMobile ? 2 : 4, px: isMobile ? 2 : 3 }}>
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
            <PersonIcon sx={{ mr: 0.5, fontSize: isMobile ? 'small' : 'medium' }} />
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
            <PersonIcon sx={{ mr: 0.5, fontSize: isMobile ? 'small' : 'medium' }} />
            {isMobile ? 'Attendee' : 'Add New Attendee'}
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
              {message || 'Attendee added successfully! Redirecting to attendee list...'}
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
            <form onSubmit={handleSubmit}>
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
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
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

                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  flexWrap: 'wrap',
                  width: isMobile ? '100%' : 'auto'
                }}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => navigate('/attendee/attendee-list')}
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
                            Adding Attendee...
                          </Box>
                        ) : (
                          'Add Attendee'
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
            </form>
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

export default AddAttendee;