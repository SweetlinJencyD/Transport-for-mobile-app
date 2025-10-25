import React, { useState, useEffect } from 'react';
import {
  Card,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Container,
  Divider,
  useMediaQuery,
  useTheme,
  Snackbar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const EditAttendee = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact_number: '',
    password: '',
    emp_id: '',
    id_proof_no: '',
    attendee_image: null,
    id_proof: null,
  });
  const [attendeeFiles, setAttendeeFiles] = useState({
    attendee_image_url: null,
    id_proof_url: null,
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const attendeeId = location.state?.id || null;

  const steps = ['Basic Information', 'Additional Details'];
useEffect(() => {
  if (!attendeeId) return;

  const fetchAttendee = async () => {
    const token = localStorage.getItem('token');
    try {
      // ✅ Fetch all attendees
      const res = await fetch(`${API_BASE_URL}/attendees`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        // handle token expired
        return;
      }

      const result = await res.json();

      // ✅ Find the attendee with matching ID
      const attendee = result.data.find(a => a.user_id === attendeeId);

      if (attendee) {
        setFormData({
          name: attendee.name || '',
          email: attendee.email || '',
          contact_number: attendee.contact_number || '',
          password: '',
          emp_id: attendee.emp_id || '',
          id_proof_no: attendee.id_proof_no || '',
          attendee_image: null,
          id_proof: null,
        });
        setAttendeeFiles({
          attendee_image_url: attendee.attendee_img || null,
          id_proof_url: attendee.id_proof || null,
        });
      }
    } catch (err) {
      console.error('Error fetching attendee:', err);
    }
  };

  fetchAttendee();
}, [attendeeId, API_BASE_URL]);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = e => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] || null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNext = async (e) =>  {
    e.preventDefault();
    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  }
  const handleBack = () => setActiveStep(prev => Math.max(prev - 1, 0));
const handleSubmit = async e => {
  e.preventDefault();
  setLoading(true);
  const token = localStorage.getItem('token');
  const submitData = new FormData();

  
  submitData.append('name', formData.name || '');
  submitData.append('email', formData.email || '');
  submitData.append('contact_number', formData.contact_number || '');

  // ✅ Optional
  if (formData.password) submitData.append('password', formData.password);
  if (formData.attendee_image) submitData.append('attendee_img', formData.attendee_image);
  if (formData.id_proof) submitData.append('id_proof', formData.id_proof);
  if (formData.emp_id) submitData.append('emp_id', formData.emp_id || '');
 if (formData.id_proof_no) submitData.append('id_proof_no', formData.id_proof_no || '');


  try {
    const res = await fetch(`${API_BASE_URL}/update_attendee/${attendeeId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }, // do NOT set Content-Type for FormData
      body: submitData,
    });

    if (!res.ok) {
      const errorData = await res.json(); // get backend error
      throw new Error(errorData.detail || `HTTP error! ${res.status}`);
    }

    const data = await res.json();
    showSnackbar(data.message || 'Attendee updated successfully!', 'success');
    setTimeout(() => navigate('/list-attendee'), 2000);
  } catch (err) {
    console.error('Submit error:', err);
    showSnackbar(err.message, 'error');
  } finally {
    setLoading(false);
  }
};

  const FileUploadButton = ({ name, label, acceptedFiles = 'image/*' }) => (
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
          backgroundColor: formData[name] ? 'success.light' : 'action.hover',
        },
      }}
    >
      {formData[name] ? 'Change File' : `Upload ${label}`}
      <input type="file" name={name} hidden accept={acceptedFiles} onChange={handleChange} />
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
          <TextField fullWidth label="Employee ID" name="emp_id" value={formData.emp_id} onChange={handleChange} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Full Name *" name="name" value={formData.name} onChange={handleChange} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Contact Number *" name="contact_number" value={formData.contact_number} onChange={handleChange} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            placeholder="Leave blank to keep old password"
            value={formData.password}
            onChange={handleChange}
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
          <TextField fullWidth label="ID Proof Number" name="id_proof_no" value={formData.id_proof_no} onChange={handleChange} />
        </Grid>
        <Grid item xs={12} md={6}>
          <FileUploadButton name="id_proof" label="ID Proof" acceptedFiles="image/*,application/pdf" />
          {!formData.id_proof && attendeeFiles.id_proof_url && (
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              Current file: {attendeeFiles.id_proof_url}
            </Typography>
          )}
          {formData.id_proof && (
            <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
              ✓ Selected: {formData.id_proof.name}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12}>
          <FileUploadButton name="attendee_image" label="Attendee Image" acceptedFiles="image/*" />
          {!formData.attendee_image && attendeeFiles.attendee_image_url && (
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              Current image: {attendeeFiles.attendee_image_url}
            </Typography>
          )}
          {formData.attendee_image && (
            <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
              ✓ Selected: {formData.attendee_image.name}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );

  const getStepContent = step => (step === 0 ? renderBasicInformation() : renderAdditionalDetails());

  return (
    <Container maxWidth="lg" sx={{ py: isMobile ? 2 : 4 }}>
      <Card sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Stepper activeStep={activeStep}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {getStepContent(activeStep)}
          <Divider sx={{ my: 3 }} />
          <Box display="flex" justifyContent="space-between">
            <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Updating...' : 'Update Attendee'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </form>
      </Card>
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Container>
  );
};

export default EditAttendee;
