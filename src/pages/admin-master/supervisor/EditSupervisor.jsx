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
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  VpnKey as PasswordIcon,
  Group as GroupIcon,
  Home as HomeIcon,
  ArrowBack as BackIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';

const EditSupervisor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [supervisor, setSupervisor] = useState(location.state?.supervisor || null);
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert('Please Log in to Continue!');
      navigate('/login');
      return;
    }

    if (!supervisor) {
      setError("Supervisor data is missing");
      setLoading(false);
      return;
    }

    // Initialize form data
    setFormData({
      id: supervisor.user_id || '',
      emp_id: supervisor.emp_id || '',
      name: supervisor.name || '',
      email: supervisor.email || '',
      password: '',
    });

    // Fetch groups for this supervisor from backend
    fetchGroupsForEdit(token);
  }, [supervisor, navigate]);

  const [formData, setFormData] = useState({
    id: '',
    emp_id: '',
    name: '',
    email: '',
    password: '',
  });

  const fetchGroupsForEdit = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/get_groups_for_edit/${supervisor.user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch groups');

      const data = await res.json();
      const groupList = data.data || [];
      const assignedIds = data.assigned_group_ids || [];

      // Show all groups
      setGroups(groupList);

      // Preselect assigned groups
      const selected = groupList
        .filter((g) => assignedIds.includes(g.id))
        .map((g) => ({ value: g.id, label: g.group_name }));

      setSelectedGroups(selected);
    } catch (err) {
      console.error(err);
      setError('Error fetching groups.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
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

  const validateForm = () => {
    const errors = {};

    // if (!formData.emp_id?.trim()) {
    //   errors.emp_id = 'Employee ID is required!';
    // }
    if (!formData.name?.trim()) {
      errors.name = 'Supervisor name is required!';
    }
    // if (!formData.email?.trim()) {
    //   errors.email = 'Email is required!';
    // } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    //   errors.email = 'Email is invalid!';
    // }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        id: formData.id,
        emp_id: formData.emp_id,
        name: formData.name,
        email: formData.email,
        password: formData.password?.trim() || undefined,
        group_ids: selectedGroups.map((g) => g.value),
      };

      const res = await fetch(`${API_BASE_URL}/update_supervisor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setMessage(data.message || 'Supervisor updated successfully!');
        setSuccess(true);
        
        setTimeout(() => {
          navigate('/list-supervisor');
        }, 2000);
      } else {
        setMessage(data.message || 'Failed to update supervisor');
        setSuccess(false);
      }

    } catch (err) {
      console.error(err);
      setMessage('Error updating supervisor');
      setSuccess(false);
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
            onClick={() => navigate('/list-supervisor')}
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
            {!isMobile && 'Supervisors'}
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
            {isMobile ? 'Edit Supervisor' : 'Edit Supervisor'}
          </Typography>
        </Breadcrumbs>
      </motion.div>

      {error && (
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
              {error}
            </Typography>
          </Alert>
        </motion.div>
      )}

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
            <PersonIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Edit Supervisor
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
              <SectionHeader icon={PersonIcon} title="Supervisor Information" />
              
              <Grid container spacing={isMobile ? 2 : 3}>
                {/* Employee ID */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Employee ID *"
                    name="emp_id"
                    value={formData.emp_id || ''}
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

                {/* Supervisor Name */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Supervisor Name *"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    
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

                {/* Email */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email *"
                    type="email"
                    name="email"
                    value={formData.email || ''}
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

                {/* Password */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    name="password"
                    placeholder="Leave blank to keep current password"
                    value={formData.password || ''}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PasswordIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Leave password field blank to keep the current password
                  </Typography>
                </Grid>

                {/* Groups */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
                      Group(s) *
                    </Typography>
                    <Select
                      isMulti
                      options={groups.map((g) => ({ value: g.id, label: g.group_name }))}
                      value={selectedGroups}
                      onChange={(selectedOptions) => setSelectedGroups(selectedOptions || [])}
                      placeholder="Select group(s)..."
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '56px',
                          borderColor: formErrors.groups ? '#d32f2f' : '#ccc',
                          '&:hover': {
                            borderColor: formErrors.groups ? '#d32f2f' : '#aaa',
                          },
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: '#666',
                        }),
                      }}
                    />
                    {formErrors.groups && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {formErrors.groups}
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
                    onClick={() => navigate('/list-supervisor')}
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
                        Updating Supervisor...
                      </Box>
                    ) : (
                      'Update Supervisor'
                    )}
                  </Button>
                </motion.div>
              </Box>
            </form>
          </Paper>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
              Complete all required fields (*) to update supervisor information
            </Typography>
          </Box>
        </Card>
      </motion.div>
    </Container>
  );
};

export default EditSupervisor;