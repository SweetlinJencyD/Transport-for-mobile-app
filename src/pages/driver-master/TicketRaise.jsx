import React, { useState, useEffect } from 'react';
import {
  Card,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Container,
  Paper,
  Divider,
  Breadcrumbs,
  Link,
  useMediaQuery,
  useTheme,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Home as HomeIcon,
  BugReport as BugReportIcon,
  Description as DescriptionIcon,
  PhotoCamera as PhotoIcon,
  PriorityHigh as PriorityIcon,
  Category as CategoryIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TicketRaise = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [previewImages, setPreviewImages] = useState([]);
  const [viewImageDialog, setViewImageDialog] = useState({ open: false, image: '' });
  const [tokenExpired, setTokenExpired] = useState(false);

  const issueTypes = [
    'Engine',
    'Brakes',
    'Tyre',
    'Electrical',
    'Transmission',

    'Fuel System',

    'Steering',
    'Battery',
    'Lights',

    'Body Damage',
    'Other'
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'success' },
    { value: 'medium', label: 'Medium', color: 'warning' },
    { value: 'high', label: 'High', color: 'error' },
    { value: 'critical', label: 'Critical', color: 'error' },
  ];

  const [formData, setFormData] = useState({
    issueType: '',
    priority: 'medium',
     otherIssue: '',
    description: '',
    photos: [],
    vehicleId: '',
    driverId: '',
  });

  useEffect(() => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    const storedDriverId = sessionStorage.getItem('driverId');
    const storedVehicleId = sessionStorage.getItem('vehicleId');

    setFormData(prev => ({
      ...prev,
      driverId: storedDriverId || '',
      vehicleId: storedVehicleId || '',
    }));
  }, []);

  useEffect(() => {
    if (formData.driverId) sessionStorage.setItem('driverId', formData.driverId);
    if (formData.vehicleId) sessionStorage.setItem('vehicleId', formData.vehicleId);
  }, [formData.driverId, formData.vehicleId]);


  const steps = [
    'Issue Details',
    'Description & Photos',
    'Review & Submit'
  ];

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (e) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePhotoUpload = (e) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    const files = Array.from(e.target.files);
    const newPhotos = [...formData.photos];
    const newPreviews = [...previewImages];

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        newPhotos.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target.result);
          setPreviewImages([...newPreviews]);
        };
        reader.readAsDataURL(file);
      }
    });

    setFormData(prev => ({
      ...prev,
      photos: newPhotos
    }));
  };

  const removePhoto = (index) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      photos: newPhotos
    }));
    setPreviewImages(newPreviews);
  };

  const validateCurrentStep = () => {
    const errors = {};

    switch (activeStep) {
      case 0:
        if (!formData.issueType) {
    errors.issueType = 'Issue type is required!';
  }
 
        if (!formData.issueType) {
          errors.issueType = 'Issue type is required!';
        }
        if (!formData.priority) {
          errors.priority = 'Priority level is required!';
        }
        break;

      case 1:
        if (!formData.description?.trim()) {
          errors.description = 'Description is required!';
        } else if (formData.description.length < 10) {
          errors.description = 'Description must be at least 10 characters long!';
        }
        break;

      case 2:
        // Final validation - all required fields
        if (!formData.issueType) errors.issueType = 'Issue type is required!';
        if (!formData.description) errors.description = 'Description is required!';
        break;

      default:
        break;
    }

    return errors;
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

    if (activeStep !== steps.length - 1) return;

    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Unauthorized! Please login again.');
        setLoading(false);
        return;
      }
      // Prepare FormData
      const formDataToSend = new FormData();
      formDataToSend.append("issue_type", formData.issueType);
      formDataToSend.append("priority", formData.priority);
      formDataToSend.append("description", formData.description);
      if (formData.vehicleId) formDataToSend.append("vehicle_id", formData.vehicleId);
      if (formData.driverId) formDataToSend.append("driver_id", formData.driverId);
      if (formData.issueType === "Other" && formData.otherIssue.trim()) {
  formDataToSend.append("otherIssue", formData.otherIssue.trim());
}

      // Attach photos
      formData.photos.forEach((photo) => {
        formDataToSend.append("photos", photo);
      });


      const response = await fetch("http://127.0.0.1:8000/submit_ticket", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      if (response.status === 401) {
        setTokenExpired(true);
        localStorage.removeItem('token');
        throw new Error('Token expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error("Failed to submit ticket");
      }

      const data = await response.json();
      showSnackbar(data.message || "Ticket submitted successfully!", "success");
      setSuccess(true);
      setMessage(data.message);

      // Reset after success
      setTimeout(() => {
        setFormData({
          issueType: "",
          priority: "medium",
          description: "",
          photos: [],
          vehicleId: "",
          driverId: "",
        });
        setPreviewImages([]);
        setActiveStep(0);
        setSuccess(false);
      }, 3000);

    } catch (err) {
      console.error("Error submitting ticket:", err);
      showSnackbar("Error reporting issue. Please try again.", "error");
      setMessage("Error reporting issue. Please try again.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const FileUploadArea = () => (
    <Box
      sx={{
        border: '2px dashed',
        borderColor: formData.photos.length > 0 ? 'success.main' : 'grey.300',
        borderRadius: 2,
        p: 3,
        textAlign: 'center',
        backgroundColor: formData.photos.length > 0 ? 'success.light' : 'background.default',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'action.hover',
        }
      }}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handlePhotoUpload}
        style={{ display: 'none' }}
        id="photo-upload"
      />
      <label htmlFor="photo-upload">
        <Box sx={{ cursor: 'pointer' }}>
          <UploadIcon
            sx={{
              fontSize: 48,
              color: formData.photos.length > 0 ? 'success.main' : 'grey.400',
              mb: 2
            }}
          />
          <Typography variant="h6" gutterBottom>
            {formData.photos.length > 0 ? 'Add More Photos' : 'Upload Issue Photos'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag & drop or click to upload images (Max 5 photos)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Supported formats: JPG, PNG, GIF
          </Typography>
        </Box>
      </label>
    </Box>
  );

  const PhotoPreviewGrid = () => (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {previewImages.map((preview, index) => (
        <Grid item xs={6} sm={4} md={3} key={index}>
          <Paper
            sx={{
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: 2,
            }}
          >
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              style={{
                width: '100%',
                height: '120px',
                objectFit: 'cover',
                cursor: 'pointer',
              }}
              onClick={() => setViewImageDialog({ open: true, image: preview })}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                gap: 1,
              }}
            >
              <IconButton
                size="small"
                onClick={() => setViewImageDialog({ open: true, image: preview })}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                }}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => removePhoto(index)}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3, mt: 2 }}>
      <Icon color="primary" sx={{ mr: 2, mt: 0.5 }} />
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
const renderIssueDetails = () => (
  <Box>
    <SectionHeader
      icon={CategoryIcon}
      title="Issue Information"
      subtitle="Select the type and priority of the issue you're reporting"
    />
    <Grid container spacing={isMobile ? 2 : 3}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth sx={{ mb: 3 }} error={!!formErrors.issueType}>
          <Select
            labelId="issue-type-label"
            name="issueType"
            value={formData.issueType}
            onChange={handleChange}
            displayEmpty
          >
            <MenuItem value="">
              <Box sx={{ whiteSpace: 'nowrap' }}>Select Issue Type</Box>
            </MenuItem>
            {issueTypes.map(type => (
              <MenuItem key={type} value={type}>
                <Box sx={{ whiteSpace: 'nowrap' }}>{type}</Box>
              </MenuItem>
            ))}
          </Select>
          {formErrors.issueType && <FormHelperText>{formErrors.issueType}</FormHelperText>}
        </FormControl>
      </Grid>

      {/* Priority */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth sx={{ mb: 3 }} error={!!formErrors.priority}>
          <InputLabel id="priority-label">Priority Level *</InputLabel>
          <Select
            labelId="priority-label"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            label="Priority Level *"
          >
            {priorityLevels.map(level => (
              <MenuItem key={level.value} value={level.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PriorityIcon sx={{ color: `${level.color}.main` }} />
                  {level.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
          {formErrors.priority && <FormHelperText>{formErrors.priority}</FormHelperText>}
        </FormControl>
      </Grid>

      {/* Show textarea if "Other" is selected */}
      {formData.issueType === 'Other' && (
        <Grid item xs={12}>
          <TextField
  fullWidth
  type="text"
  label="Please specify the issue"
  name="otherIssue"
  value={formData.otherIssue || ''}
  onChange={handleChange}
  error={!!formErrors.otherIssue}
  helperText={formErrors.otherIssue}
  placeholder="Describe your issue here..."
/>

        </Grid>
      )}

      <Grid item xs={12}>
        <Chip
          icon={<PriorityIcon />}
          label={`Priority: ${priorityLevels.find(p => p.value === formData.priority)?.label || 'Medium'}`}
          color={priorityLevels.find(p => p.value === formData.priority)?.color || 'warning'}
          variant="filled"
          sx={{ fontWeight: 'bold', mb: 2 }}
        />
      </Grid>
    </Grid>
  </Box>
);

  const renderDescriptionPhotos = () => (
    <Box>
      <SectionHeader
        icon={DescriptionIcon}
        title="Description & Evidence"
        subtitle="Provide detailed description and upload photos of the issue"
      />
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Issue Description *"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please provide a detailed description of the issue. Include when it started, symptoms, and any relevant details that can help our team understand and fix the problem..."
            error={!!formErrors.description}
            helperText={formErrors.description || `${formData.description.length}/500 characters`}
            inputProps={{ maxLength: 500 }}
            sx={{ mb: 3 }}
          />
        </Grid>

        <Grid item xs={12}>
          {/* <SectionHeader
            icon={PhotoIcon}
            title="Photo Evidence"
            subtitle="Upload clear photos of the issue (optional but recommended)"
          /> */}
          <FileUploadArea />
          {previewImages.length > 0 && <PhotoPreviewGrid />}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {formData.photos.length}/5 photos uploaded
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  const renderReviewSubmit = () => (
    <Box>
      <SectionHeader
        icon={BugReportIcon}
        title="Review & Submit"
        subtitle="Please review all information before submitting the issue"
      />

      <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Issue Type
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
              {formData.issueType}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Priority Level
            </Typography>
            <Chip
              label={priorityLevels.find(p => p.value === formData.priority)?.label || 'Medium'}
              color={priorityLevels.find(p => p.value === formData.priority)?.color || 'warning'}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
              {formData.description || 'No description provided'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Photos ({formData.photos.length})
            </Typography>
            {previewImages.length > 0 ? (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {previewImages.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => setViewImageDialog({ open: true, image: preview })}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No photos uploaded
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <Typography variant="body2">
          After submission, our support team will review your issue and contact you within 24 hours.
          You can track the status of your ticket in the "My Tickets" section.
        </Typography>
      </Alert>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderIssueDetails();
      case 1:
        return renderDescriptionPhotos();
      case 2:
        return renderReviewSubmit();
      default:
        return null;
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

  const handleTokenExpiredClose = () => {
    setTokenExpired(false);
    navigate('/login');
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

      {/* Image Preview Dialog */}
      <Dialog
        open={viewImageDialog.open}
        onClose={() => setViewImageDialog({ open: false, image: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Photo Preview
        </DialogTitle>
        <DialogContent>
          <img
            src={viewImageDialog.image}
            alt="Full size preview"
            style={{ width: '100%', height: 'auto', borderRadius: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewImageDialog({ open: false, image: '' })}>
            Close
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
            <BugReportIcon sx={{ mr: 0.5, fontSize: isMobile ? 'small' : 'medium' }} />
            {isMobile ? 'Report Issue' : 'Report New Issue'}
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
              {message || 'Issue reported successfully! Our team will review it shortly.'}
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

              <Box sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                width: isMobile ? '100%' : 'auto'
              }}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard')}
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
                          Submitting...
                        </Box>
                      ) : (
                        'Submit Issue'
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

export default TicketRaise;