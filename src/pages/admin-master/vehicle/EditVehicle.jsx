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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Build as BuildIcon,
  Description as DescriptionIcon,
  LocalOffer as FeaturesIcon,
  DocumentScanner as DocumentIcon,
  CloudUpload as UploadIcon,
  Home as HomeIcon,
  DirectionsBus as BusIcon,
  ArrowBack as BackIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const EditVehicle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [tyreCount, setTyreCount] = useState(0);
  const [loanStatus, setLoanStatus] = useState('');
  const [tokenExpired, setTokenExpired] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const [formData, setFormData] = useState({
    id: '',
    // Basic Information (Required Fields)
    vehicle_no: '',
    bus_number: '',

    // Vehicle Registration
    rc_number: '',
    rc_document: null,

    // Insurance Details
    insurance_number: '',
    insurance_document: null,
    insurance_expiry: '',

    // Tax & Permit
    tax: '',
    permit_no: '',
    permit_doc: null,
    permit_expiry: '',

    // Certificates
    emission_certificate_no: '',
    emission_certificate_doc: null,
    emission_expiry: '',
    fitness_certificate_no: '',
    fitness_certificate_doc: null,
    fitness_expiry: '',

    // Loan Details
    loan_status: '',
    loan_provider: '',
    loan_amount: '',
    loan_emi_amount: '',
    loan_start_date: '',
    loan_end_date: '',

    // Vehicle Maintenance
    gps: '',
    cameras: '',
    battery_sts: '',
    diesel_per_km: '',
    dlf_filling: '',
    service_date: '',
    wheel_alignment_date: '',

    // Tyre Status
    tyre_count: '',
    front_left_tyre_status: '',
    front_right_tyre_status: '',
    rear_left_tyre_status: '',
    rear_right_tyre_status: '',

    // Additional Details
    others: '',
    service_status: '',
    vehicle_image: null,
    vehicle_status: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please Log in to Continue!');
      navigate('/login');
    }

    // Set initial form data from location state
    if (location.state?.vehicle) {
      const vehicle = location.state.vehicle;
      console.log('Received vehicle data:', vehicle); // Debug log
      
      setFormData(prev => ({
        ...prev,
        ...vehicle,
        id: vehicle.id // Ensure ID is included
      }));
      setTyreCount(vehicle.tyre_count || 0);
      setLoanStatus(vehicle.loan_status || '');
    }
  }, [navigate, location]);

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
    'Registration & Insurance',
    'Certificates & Permits',
    'Loan & Financial',
    'Maintenance & Features',
    'Additional Details'
  ];

  const validateCurrentStep = () => {
    const errors = {};

    switch (activeStep) {
      case 0: // Basic Information
        if (!formData.vehicle_no?.trim()) {
          errors.vehicle_no = 'Vehicle number is required!';
        }
        if (!formData.bus_number?.trim()) {
          errors.bus_number = 'Route number is required!';
        }
        break;
      
      case 1: // Registration & Insurance
        // No required fields in this step
        break;
      
      case 2: // Certificates & Permits
        // No required fields in this step
        break;
      
      case 3: // Loan & Financial
        if (formData.loan_status === 'On Going') {
          if (!formData.loan_provider?.trim()) {
            errors.loan_provider = 'Loan provider is required when loan status is "On Going"!';
          }
          if (!formData.loan_amount && formData.loan_amount !== 0) {
            errors.loan_amount = 'Loan amount is required when loan status is "On Going"!';
          }
        }
        break;
      
      case 4: // Maintenance & Features
        // No required fields in this step
        break;
      
      case 5: // Additional Details
        // No required fields in this step
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
  }else if (name === 'tyre_count') {
  const count = parseInt(value) || 0;
  const additionalCount = Math.max(count - 4, 0);
  let stepneyValues = formData.additional_tyres
    ? JSON.parse(formData.additional_tyres)
    : [];
  while (stepneyValues.length < additionalCount) stepneyValues.push('');
  if (stepneyValues.length > additionalCount)
    stepneyValues = stepneyValues.slice(0, additionalCount);
  setFormData({
    ...formData,
    tyre_count: value,
    additional_tyres: JSON.stringify(stepneyValues),
  });
}

else if (name.startsWith('stepney_') && name.endsWith('_status')) {
  const idx = parseInt(name.split('_')[1], 10) - 1;
  const stepneyValues = formData.additional_tyres
    ? [...JSON.parse(formData.additional_tyres)]
    : [];
  stepneyValues[idx] = value;
  setFormData({
    ...formData,
    additional_tyres: JSON.stringify(stepneyValues),
  });
}


 else if (name === 'loan_status') {
    setLoanStatus(value);
    setFormData({
      ...formData,
      [name]: value,
    });
  } 
  // Stepney / Additional tyres handling
  else if (name.startsWith("stepney_") && name.endsWith("_status")) {
  const idx = parseInt(name.split("_")[1], 10) - 1;
  const stepneyValues = formData.additional_tyres
    ? [...JSON.parse(formData.additional_tyres)]
    : [];

  stepneyValues[idx] = value; // update the specific stepney value
  setFormData({
    ...formData,
    additional_tyres: JSON.stringify(stepneyValues),
  });
}
 else {
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

  // Helper function to extract error message
// Helper function to extract error message
const getErrorMessage = (error) => {
  if (Array.isArray(error)) {
    // Handle array of errors - extract messages from each object
    return error.map(err => {
      if (typeof err === 'string') return err;
      if (err?.message) return err.message;
      if (err?.detail) return err.detail;
      if (err?.msg) return err.msg;
      return JSON.stringify(err);
    }).join(', ');
  }
  
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.detail) return error.detail;
  if (error?.msg) return error.msg;
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
  e?.preventDefault();

  if (!checkTokenExpiration()) {
    setTokenExpired(true);
    return;
  }

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

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const submitData = new FormData();

  // Append vehicle ID first
  submitData.append('id', formData.id);

  // Append ALL fields including empty ones for required fields
// Append all form data except excluded fields
Object.keys(formData).forEach(key => {
  if (key !== 'id' && key !== 'created_at' && key !== 'status') {
    const value = formData[key];
    
    // Skip file fields that still have URL strings (not new files)
    const fileFields = [
      'rc_document', 'insurance_document', 'permit_doc', 
      'emission_certificate_doc', 'fitness_certificate_doc', 'vehicle_image'
    ];
    
    // If it's a file field and the value is a string (URL), skip it
    if (fileFields.includes(key) && typeof value === 'string') {
      console.log(`Skipping file field ${key} with URL: ${value}`);
      return; // Skip this field
    }
    
    // For required fields, always send them (even if empty)
    if (key === 'vehicle_no' || key === 'bus_number') {
      submitData.append(key, value || '');
    }
    // For file fields with actual File objects
    else if (value instanceof File) {
      submitData.append(key, value);
    }
    // For other fields, send if they have values
    else if (value !== null && value !== '' && value !== undefined) {
      submitData.append(key, value);
    }
    // For optional fields that might be empty but expected by backend
    else if (key === 'loan_status' || key === 'service_status' || key === 'vehicle_status') {
      submitData.append(key, value || '');
    }
  }
});if (formData.additional_tyres) {
  try {
    const stepneyList = JSON.parse(formData.additional_tyres);
    stepneyList.forEach((status, i) => {
      const fieldName = `stepney_${i + 1}_status`;
      submitData.append(fieldName, status);
    });
  } catch (err) {
    console.error("Failed to parse additional_tyres JSON:", err);
  }
}

  // Debug: Log FormData contents
  console.log('=== FORM DATA BEING SENT ===');
  for (let pair of submitData.entries()) {
    console.log(pair[0] + ':', pair[1]);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/update_vehicle`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: submitData,
    });

    console.log('Response status:', res.status);

    // Get the response text first to see what's coming back
    const responseText = await res.text();
    console.log('Raw response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error(`Server returned invalid JSON: ${responseText}`);
    }

    if (res.status === 422) {
      console.log('422 Validation errors:', data);
      // FastAPI validation errors are usually in data.detail
      if (data.detail) {
        throw data.detail; // This should contain the validation errors
      }
      throw data;
    }

    if (res.status === 401) {
      setTokenExpired(true);
      localStorage.removeItem('token');
      throw new Error('Token expired. Please login again.');
    }

    if (!res.ok) {
      throw new Error(data.detail || data.message || `HTTP error! status: ${res.status}`);
    }

    setMessage(data.message || 'Vehicle updated successfully!');
    setSuccess(true);
    showSnackbar('Vehicle updated successfully!', 'success');

    setTimeout(() => {
      navigate('/list-vehicle');
    }, 2000);

  } catch (err) {
    console.error('Full error object:', err);
    
    // Improved error message extraction
    let errorMessage = 'Unknown error occurred';
    
    if (Array.isArray(err)) {
      errorMessage = err.map(errorObj => {
        if (errorObj.loc && errorObj.msg) {
          return `${errorObj.loc.join('.')}: ${errorObj.msg}`;
        }
        return JSON.stringify(errorObj);
      }).join('; ');
    } else if (err.detail) {
      if (Array.isArray(err.detail)) {
        errorMessage = err.detail.map(d => d.msg).join('; ');
      } else {
        errorMessage = err.detail;
      }
    } else if (err.message) {
      errorMessage = err.message;
    } else {
      errorMessage = JSON.stringify(err);
    }
    
    setMessage('Error updating vehicle: ' + errorMessage);
    setSuccess(false);
    showSnackbar('Error updating vehicle: ' + errorMessage, 'error');
  } finally {
    setLoading(false);
  }
};

  const FileUploadButton = ({ name, label, acceptedFiles = "image/*,application/pdf", currentFile }) => (
    <Box>
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
      {currentFile && !formData[name] && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Current: {typeof currentFile === 'string' ? 'File attached' : currentFile.name}
        </Typography>
      )}
      {formData[name] && (
        <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
          ✓ Selected: {formData[name].name}
        </Typography>
      )}
    </Box>
  );

  const SectionHeader = ({ icon: Icon, title }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 2 }}>
      <Icon color="primary" sx={{ mr: 2 }} />
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {title}
      </Typography>
    </Box>
  );

  const selectStyles = {
    '& .MuiSelect-select': {
      minWidth: '200px !important',
    }
  };

const renderBasicInformation = () => (
  <Box>
    <SectionHeader icon={CarIcon} title="Basic Vehicle Information" />
    <Grid container spacing={isMobile ? 2 : 3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Vehicle Number *"
          name="vehicle_no"
          value={formData.vehicle_no || ''}
          onChange={handleChange}
          required
          error={!!formErrors.vehicle_no}
          helperText={formErrors.vehicle_no}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CarIcon color="primary" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Route Number *"
          name="bus_number"
          value={formData.bus_number || ''}
          onChange={handleChange}
          required
          error={!!formErrors.bus_number}
          helperText={formErrors.bus_number}
          sx={{ mb: 2 }}
        />
      </Grid>

      {/* Add this tax field - it was missing */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Tax Amount"
          name="tax"
          value={formData.tax || ''}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Vehicle Service Status"
          name="service_status"
          select
          value={formData.service_status || ''}
          onChange={handleChange}
          sx={{ ...selectStyles, mb: 2 }}
        >
          <MenuItem value="">Select Status</MenuItem>
          <MenuItem value="On Service">On Service</MenuItem>
          <MenuItem value="Idle">Idle</MenuItem>
        
        </TextField>
      </Grid>

          </Grid>
  </Box>
);

  const renderRegistrationInsurance = () => (
    <Box>
      <SectionHeader icon={DocumentIcon} title="Registration & Insurance" />
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="RC Number"
            name="rc_number"
            value={formData.rc_number || ''}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FileUploadButton 
            name="rc_document" 
            label="RC Document" 
            currentFile={location.state?.vehicle?.rc_document}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Insurance Number"
            name="insurance_number"
            value={formData.insurance_number || ''}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FileUploadButton 
            name="insurance_document" 
            label="Insurance Document" 
            currentFile={location.state?.vehicle?.insurance_document}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Insurance Expiry Date"
            name="insurance_expiry"
            type="date"
            value={formData.insurance_expiry || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarIcon color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderCertificatesPermits = () => (
    <Box>
      <SectionHeader icon={DescriptionIcon} title="Certificates & Permits" />
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Permit Number"
            name="permit_no"
            value={formData.permit_no || ''}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FileUploadButton 
            name="permit_doc" 
            label="Permit Document" 
            currentFile={location.state?.vehicle?.permit_doc}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Permit Expiry Date"
            name="permit_expiry"
            type="date"
            value={formData.permit_expiry || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Emission Certificate No"
            name="emission_certificate_no"
            value={formData.emission_certificate_no || ''}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FileUploadButton 
            name="emission_certificate_doc" 
            label="Emission Certificate" 
            currentFile={location.state?.vehicle?.emission_certificate_doc}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Emission Expiry Date"
            name="emission_expiry"
            type="date"
            value={formData.emission_expiry || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Fitness Certificate No"
            name="fitness_certificate_no"
            value={formData.fitness_certificate_no || ''}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FileUploadButton 
            name="fitness_certificate_doc" 
            label="Fitness Certificate" 
            currentFile={location.state?.vehicle?.fitness_certificate_doc}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Fitness Expiry Date"
            name="fitness_expiry"
            type="date"
            value={formData.fitness_expiry || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
const renderLoanFinancial = () => (
  <Box>
    <SectionHeader icon={MoneyIcon} title="Loan & Financial Details" />
    <Grid container spacing={isMobile ? 2 : 3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          select
          label="Loan Status"
          name="loan_status"
          value={formData.loan_status || ''}
          onChange={handleChange}
          sx={{ ...selectStyles, mb: 2 }}
        >
          <MenuItem value="">Select Loan Status</MenuItem>
          <MenuItem value="Not applicable">Not Applicable</MenuItem>
          <MenuItem value="On Going">On Going</MenuItem>
          <MenuItem value="Cleared">Cleared</MenuItem>
        </TextField>
      </Grid>

      {/* Show only when Loan Status = "On Going" */}
      {formData.loan_status === 'On Going' && (
        <>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Loan Provider *"
              name="loan_provider"
              value={formData.loan_provider || ''}
              onChange={handleChange}
              placeholder="Bank / Finance Company"
              error={!!formErrors.loan_provider}
              helperText={formErrors.loan_provider}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Loan Amount *"
              name="loan_amount"
              type="number"
              value={formData.loan_amount || ''}
              onChange={handleChange}
              placeholder="0.00"
              error={!!formErrors.loan_amount}
              helperText={formErrors.loan_amount}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Loan EMI Amount"
              name="loan_emi_amount"
              type="number"
              value={formData.loan_emi_amount || ''}
              onChange={handleChange}
              placeholder="0.00"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          </Grid>
        </>
      )}

      {/* Hide Loan Dates when Not Applicable or Empty */}
      {formData.loan_status !== 'Not applicable' && formData.loan_status !== '' && (
        <>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Loan Start Date"
              name="loan_start_date"
              type="date"
              value={formData.loan_start_date || ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Loan End Date"
              name="loan_end_date"
              type="date"
              value={formData.loan_end_date || ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
          </Grid>
        </>
      )}
    </Grid>
  </Box>
);
const renderMaintenanceFeatures = () => {
  const additionalTyresCount = Math.max((formData.tyre_count || 0) - 4, 0);
  const stepneyValues = formData.additional_tyres ? JSON.parse(formData.additional_tyres) : [];

  return (
    <Box>
      <SectionHeader icon={BuildIcon} title="Maintenance & Features" />
      <Grid container spacing={isMobile ? 2 : 3}>
        {/* GPS Installed */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="GPS Installed"
            name="gps"
            value={formData.gps || ''}
            onChange={handleChange}
            sx={{ ...selectStyles, mb: 2 }}
          >
            <MenuItem value="">Select Option</MenuItem>
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </TextField>
        </Grid>

        {/* Cameras Installed */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Cameras Installed"
            name="cameras"
            value={formData.cameras || ''}
            onChange={handleChange}
            placeholder="Yes / No / Count"
            sx={{ mb: 2 }}
          />
        </Grid>

        {/* Battery Status */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Battery Status"
            name="battery_sts"
            value={formData.battery_sts || ''}
            onChange={handleChange}
            sx={{ ...selectStyles, mb: 2 }}
          >
            <MenuItem value="">Select Status</MenuItem>
            <MenuItem value="Good">Good</MenuItem>
            <MenuItem value="Replaced">Replaced</MenuItem>
          </TextField>
        </Grid>

            <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Diesel per KM (km/l)"
                    name="diesel_per_km"
                    type="number"
                    value={formData.diesel_per_km}
                    onChange={handleChange}
                    placeholder="e.g., 4.5"
                    sx={{ mb: 2 }}
                  />
                </Grid>
        
                {/* DLF Filling */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="DLF Filling (Litres)"
                    name="dlf_filling"
                    type="number"
                    value={formData.dlf_filling}
                    onChange={handleChange}
                    placeholder="e.g., 50 Litres"
                    sx={{ mb: 2 }}
                  />
                </Grid>
        
                {/* Last Service Date */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Service Date"
                    name="service_date"
                    type="date"
                    value={formData.service_date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
        
                {/* Wheel Alignment Date */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Wheel Alignment Date"
                    name="wheel_alignment_date"
                    type="date"
                    value={formData.wheel_alignment_date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
        
            

        {/* Number of Tyres */}
       {/* Number of Tyres */}
<Grid item xs={12} md={6}>
  <TextField
    fullWidth
    label="Number of Tyres (including spare / stepney)"
    name="tyre_count"
    type="number"
    value={formData.tyre_count || ''}
    onChange={handleChange}
    inputProps={{ min: 4, max: 10 }}
    helperText="Total tyres including spare/stepney (minimum 4)"
    sx={{ mb: 2 }}
  />
</Grid>

{/* Tyre Status header */}
<Grid item xs={12}>
  <Typography
    variant="subtitle1"
    sx={{ mb: 2, color: 'text.secondary', fontWeight: 'bold' }}
  >
    Tyre Status
  </Typography>
</Grid>

{/* First 4 tyres (Always visible) */}
{['front_left', 'front_right', 'rear_left', 'rear_right'].map((tyre) => (
  <Grid item xs={12} md={6} key={tyre}>
    <TextField
      fullWidth
      select
      label={`${tyre.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Tyre`}
      name={`${tyre}_tyre_status`}
      value={formData[`${tyre}_tyre_status`] || ''}
      onChange={handleChange}
      sx={{ mb: 2 }}
    >
      <MenuItem value="">Select Status</MenuItem>
      <MenuItem value="Good">Good</MenuItem>
      <MenuItem value="Replace">Replace</MenuItem>
    </TextField>
  </Grid>
))}

{/* Additional Tyres (Stepney 1, Stepney 2, etc.) */}
{(() => {
  const tyreCount = parseInt(formData.tyre_count || 4);
  const extraTyres = Math.max(tyreCount - 4, 0);
  const stepneyValues = formData.additional_tyres
    ? JSON.parse(formData.additional_tyres)
    : [];

  return (
    <>
      {Array.from({ length: extraTyres }).map((_, idx) => (
        <Grid item xs={12} md={6} key={`stepney_${idx}`}>
          <TextField
            fullWidth
            select
            label={`Stepney ${idx + 1}`}
            name={`stepney_${idx + 1}_status`}
            value={stepneyValues[idx] || ''}
            onChange={handleChange}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Select Status</MenuItem>
            <MenuItem value="Good">Good</MenuItem>
            <MenuItem value="Replace">Replace</MenuItem>
          </TextField>
        </Grid>
      ))}
    </>
  );
})()}

      </Grid>
    </Box>
  );
};

  const renderAdditionalDetails = () => (
    <Box>
      <SectionHeader icon={FeaturesIcon} title="Additional Details" />
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Others / Remarks"
            name="others"
            value={formData.others || ''}
            onChange={handleChange}
            placeholder="Enter any additional remarks, notes, or special instructions about the vehicle..."
            sx={{ mb: 3 }}
          />
        </Grid>

        <Grid item xs={12}>
          <FileUploadButton 
            name="vehicle_image" 
            label="Vehicle Image" 
            acceptedFiles="image/*"
            currentFile={location.state?.vehicle?.vehicle_image}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Recommended: High-quality images of the vehicle (front, side, rear views)
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
        return renderRegistrationInsurance();
      case 2:
        return renderCertificatesPermits();
      case 3:
        return renderLoanFinancial();
      case 4:
        return renderMaintenanceFeatures();
      case 5:
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
            onClick={() => navigate('/list-vehicle')}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main',
              }
            }}
          >
            <BusIcon sx={{ mr: 0.5, fontSize: isMobile ? 'small' : 'medium' }} />
            {!isMobile && 'Vehicle'}
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
            <CarIcon sx={{ mr: 0.5, fontSize: isMobile ? 'small' : 'medium' }} />
            {isMobile ? 'Edit Vehicle' : 'Edit Vehicle'}
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
              {message || 'Vehicle updated successfully! Redirecting to vehicle list...'}
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
            {/* Remove the form tag - handle submission separately */}
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
                    type="button"
                    variant="outlined"
                    onClick={() => navigate('/list-vehicle')}
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
                      type="button" // Change to button type
                      variant="contained"
                      disabled={loading}
                      onClick={handleSubmit} // Call handleSubmit directly
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
                          Updating Vehicle...
                        </Box>
                      ) : (
                        'Update Vehicle'
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

export default EditVehicle;