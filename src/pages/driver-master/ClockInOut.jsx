import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Box,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Container,
  Alert,
  Snackbar,
  Avatar,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  QrCodeScanner as QrCodeIcon,
  CameraAlt as CameraIcon,
  PlayArrow as ClockInIcon,
  Stop as ClockOutIcon,
  CheckCircle as SuccessIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
  PhotoCamera as PhotoIcon,
  Refresh as ResetIcon,
  Person as PersonIcon,
  AccessTime as TimerIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

// Custom QR Scanner Component
const QrScanner = ({ onScan, onError }) => {
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    if (scannerRef.current && !html5QrcodeScannerRef.current) {
      try {
        html5QrcodeScannerRef.current = new Html5QrcodeScanner(
          "qr-scanner",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            supportedScanTypes: []
          },
          false
        );

        html5QrcodeScannerRef.current.render(
          (decodedText) => {
            onScan(decodedText);
          },
          (error) => {
            if (error.includes('NotFoundException')) return;
            console.log('QR Scanner error:', error);
          }
        );
      } catch (err) {
        console.error('Error initializing QR scanner:', err);
        onError?.('Failed to initialize camera. Please check permissions.');
      }
    }

    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner", error);
        });
        html5QrcodeScannerRef.current = null;
      }
    };
  }, [onScan, onError]);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box
        id="qr-scanner"
        ref={scannerRef}
        sx={{
          '& > div:first-of-type': {
            display: 'flex',
            justifyContent: 'center',
            '& > div': {
              border: '3px solid #6366F1 !important',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
            }
          }
        }}
      />

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, opacity: 0.8 }}>
        Position QR code within the frame to scan
      </Typography>
    </Box>
  );
};

// Timer Component with Glass Morphism
const LiveTimer = ({ startTime }) => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getElapsedTime = () => {
    if (!startTime) return { hours: 0, minutes: 0, seconds: 0 };

    const elapsed = Math.floor((currentTime - new Date(startTime)) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    return { hours, minutes, seconds };
  };

  const { hours, minutes, seconds } = getElapsedTime();

  

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="timer-container"
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: theme.palette.primary.main,
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <TimerIcon sx={{ color: theme.palette.primary.main , mr: 1 }} />
          <Typography variant="h6" fontWeight="600" color="text.primary">
            Trip Duration
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          <TimeUnit value={hours} label="HOURS" />
          <Colon />
          <TimeUnit value={minutes} label="MINUTES" />
          <Colon />
          <TimeUnit value={seconds} label="SECONDS" />
        </Box>
      </Box>
    </motion.div>
  );
};

const TimeUnit = ({ value, label }) =>{
  const theme = useTheme();
  return(
  <Box sx={{ textAlign: 'center' }}>
    <Box
      sx={{
        background: theme.palette.primary.main  ,
        borderRadius: '12px',
        padding: '12px 8px',
        minWidth: '60px',
        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
      }}
    >
      <Typography
        variant="h4"
        fontWeight="700"
        color="white"
        sx={{
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          fontFeatureSettings: '"tnum"'
        }}
      >
        {value.toString().padStart(2, '0')}
      </Typography>
    </Box>
    <Typography
      variant="caption"
      sx={{
        color: 'text.secondary',
        fontWeight: '600',
        fontSize: '0.7rem',
        mt: 0.5,
        display: 'block'
      }}
    >
      {label}
    </Typography>
  </Box>
);
}

const Colon = () => (
  <Typography
    variant="h4"
    fontWeight="700"
    sx={{
      color: '#6366F1',
      alignSelf: 'center',
      mt: 1
    }}
  >
    :
  </Typography>
);

const ClockInOut = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // States
  const [activeStep, setActiveStep] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [clockedIn, setClockedIn] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [cameraDialog, setCameraDialog] = useState(false);
  const [photoDialog, setPhotoDialog] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [photoType, setPhotoType] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [driverAssignedBus, setDriverAssignedBus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validatingVehicle, setValidatingVehicle] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    startKm: '',
    endKm: '',
    vehicleId: '',
    vehicleNo: '',
  });

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  

  // Get current driver info
  useEffect(() => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    const fetchDriverInfo = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/user-details`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setCurrentDriver(userData);

          const driverResponse = await fetch(`${API_BASE_URL}/drivers`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (driverResponse.ok) {
            const drivers = await driverResponse.json();
            const currentDriverData = drivers.find(driver => driver.user_id === userData.id);

            if (currentDriverData?.vehicle_id) {
              const busResponse = await fetch(`${API_BASE_URL}/vehicle_list`, {
                headers: { 'Authorization': `Bearer ${token}` },
              });

              if (busResponse.ok) {
                const buses = await busResponse.json();
                const assignedBus = buses.find(bus => bus.id === currentDriverData.vehicle_id);
                if (assignedBus) {
                  setDriverAssignedBus({
                    id: assignedBus.id,
                    vehicle_no: assignedBus.vehicle_no,
                    vehicle_id: assignedBus.vehicle_id
                  });
                }
              }
            }
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching driver info:', error);
        showSnackbar('Error loading driver information', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverInfo();
  }, [navigate, API_BASE_URL]);

  // Check for existing clock-in session
 // Check for existing clock-in session after login
useEffect(() => {
  const fetchActiveTrip = async () => {
    if (!currentDriver?.id) return;
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE_URL}/driver_active_trip`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.activeTrip) {
          setCurrentTrip(data.activeTrip);
          setClockedIn(true);
          setFormData(prev => ({
            ...prev,
            vehicleId: data.activeTrip.vehicleId,
            vehicleNo: data.activeTrip.vehicleNo,
            startKm: data.activeTrip.startKm,
            endKm: data.activeTrip.endKm || ''
          }));
          setActiveStep(2); // Automatically go to clock-out step
        }
      }
    } catch (err) {
      console.error("Error fetching active trip:", err);
    }
  };

  fetchActiveTrip();
}, [currentDriver]);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // QR Code Scan Handler
  const onQrCodeScan = async (decodedText) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    if (decodedText) {
      try {
        setValidatingVehicle(true);

        let vehicleData;
        try {
          vehicleData = JSON.parse(decodedText);
        } catch (jsonError) {
          if (decodedText.startsWith('VEH')) {
            vehicleData = {
              vehicleId: decodedText,
              vehicleNo: `Vehicle ${decodedText}`
            };
          } else {
            throw new Error('Invalid QR code format');
          }
        }

        if (vehicleData.vehicleId) {
          const token = localStorage.getItem('token');
          const validationResponse = await fetch(`${API_BASE_URL}/validate_driver_vehicle`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              vehicle_id: vehicleData.vehicleId,
              driver_id: currentDriver?.id
            }),
          });

          if (validationResponse.ok) {
            const validationResult = await validationResponse.json();

            if (validationResult.valid) {
              setFormData(prev => ({
                ...prev,
                vehicleId: vehicleData.vehicleId,
                vehicleNo: validationResult.vehicle_no || vehicleData.vehicleNo
              }));
              setScanning(false);
              setCameraDialog(false);
              setActiveStep(1);
              showSnackbar('Vehicle validated successfully! 🎉', 'success');
            } else {
              showSnackbar(validationResult.message || 'Vehicle not assigned to you.', 'error');
            }
          } else {
            showSnackbar('Error validating vehicle assignment', 'error');
          }
        }
      } catch (error) {
        console.error('QR code parsing error:', error);
        showSnackbar('Invalid QR code. Please try again.', 'error');
      } finally {
        setValidatingVehicle(false);
      }
    }
  };

  // Manual vehicle entry
  const handleManualVehicleEntry = () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    if (driverAssignedBus) {
      setFormData(prev => ({
        ...prev,
        vehicleId: driverAssignedBus.vehicle_id,
        vehicleNo: driverAssignedBus.vehicle_no
      }));
      setCameraDialog(false);
      setActiveStep(1);
      showSnackbar('Using your assigned vehicle', 'info');
    } else {
      showSnackbar('No vehicle assigned. Contact administrator.', 'warning');
    }
  };

  // Start KM Handler
  const handleStartKmSubmit = () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    if (!formData.startKm || isNaN(formData.startKm)) {
      showSnackbar('Please enter valid start kilometer reading', 'error');
      return;
    }
    setActiveStep(2);
    setPhotoType('start');
    setPhotoDialog(true);
  };

  // Handle file selection for photo
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showSnackbar('Please select an image file', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('Image size should be less than 5MB', 'error');
        return;
      }

      setPhotoFile(file);
      const photoUrl = URL.createObjectURL(file);
      setCurrentPhoto(photoUrl);
    }
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };
const handleUsePhoto = async () => {
  if (!photoFile || !currentPhoto) {
    showSnackbar('Please capture a photo first', 'error');
    return;
  }

  try {
    setLoading(true);

    const token = localStorage.getItem('token');

    // Upload photo first
    const tripId = clockedIn && currentTrip ? currentTrip.tripId : `TRIP${Date.now()}`;
    const photoRes = await uploadPhoto(photoFile, tripId, photoType);
    const photoUrl = photoRes.photoUrl;
            const now = new Date();
const localTimeStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;


    if (photoType === 'start') {
      // 🟢 CLOCK-IN
      const tripData = {
        action: 'clock_in',
        tripId,
        vehicleId: formData.vehicleId,
        vehicleNo: formData.vehicleNo,
        startKm: formData.startKm,

startTime: localTimeStr,

        startPhoto: photoUrl,
        driverId: currentDriver?.id,
        driverName: currentDriver?.name,
      };

      const response = await fetch(`${API_BASE_URL}/trip_action`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) throw new Error('Clock-in failed');
      const result = await response.json();
      

   localStorage.setItem(`currentTrip_${formData.driverId}`, JSON.stringify(tripData));
 setCurrentTrip(tripData);
      setClockedIn(true);
      setActiveStep(3);
      showSnackbar(result.message || 'Clock-in successful!', 'success');
    } else if (photoType === 'end') {
      // 🔴 CLOCK-OUT
      const endKm = formData.endKm;
      const totalKm = endKm - (currentTrip?.startKm || 0);
       const now = new Date();
const localTimeStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;



      const tripData = {
        action: 'clock_out',
        tripId: currentTrip?.tripId,
        endKm,
        totalKm,
        endTime: localTimeStr,
        endPhoto: photoUrl,
        driverId: currentDriver?.id,
        driverName: currentDriver?.name,
      };

      const response = await fetch(`${API_BASE_URL}/trip_action`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) throw new Error('Clock-out failed');
      const result = await response.json();

      localStorage.removeItem('currentTrip');
      setCurrentTrip(null);
      setClockedIn(false);
      setFormData({ startKm: '', endKm: '', vehicleId: '', vehicleNo: '' });
      setActiveStep(0);
      showSnackbar(result.message || 'Clock-out successful!', 'success');
    }

    setPhotoDialog(false);
  } catch (error) {
    console.error('Trip action error:', error);
    showSnackbar('Error performing trip action', 'error');
  } finally {
    setLoading(false);
  }
};

  // Clock-In Handler
  const handleClockIn = () => {
    if (!driverAssignedBus) {
      showSnackbar('No vehicle assigned. Contact administrator.', 'warning');
      return;
    }
    setScanning(true);
    setCameraDialog(true);
  };

  // Clock-Out Handler
  const handleClockOut = async () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    if (!formData.endKm || isNaN(formData.endKm)) {
      showSnackbar('Please enter valid end kilometer reading', 'error');
      return;
    }
    setPhotoType('end');
    setPhotoDialog(true);
  };

  // Upload photo to server
  const uploadPhoto = async (file, tripId, photoType) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('tripId', tripId);
      formData.append('photoType', photoType);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/upload_trip_photo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload photo');
      return await response.json();
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    }
  };

  // Complete Clock-Out Process
 const completeClockOut = async () => {
  if (!checkTokenExpiration()) {
    setTokenExpired(true);
    return;
  }

  try {
    setLoading(true);

    let endPhotoUrl = null;
    if (currentTrip?.endPhotoFile) {
      try {
        const uploadRes = await uploadPhoto(currentTrip.endPhotoFile, currentTrip.tripId, 'end');
        endPhotoUrl = uploadRes.photoUrl;
        showSnackbar('End photo uploaded successfully', 'success');
      } catch (err) {
        console.error('Photo upload failed:', err);
        showSnackbar('End photo upload failed, proceeding...', 'warning');
      }
    }

    const clockOutData = {
      action: 'clock_out',
      tripId: currentTrip.tripId,
      endKm: formData.endKm,
      totalKm: formData.endKm - currentTrip.startKm,
      endTime: new Date().toISOString(),
      endPhoto: endPhotoUrl || currentTrip.endPhoto,
      vehicleId: currentTrip.vehicleId,
      vehicleNo: currentTrip.vehicleNo,
      driverId: currentDriver?.id,
      driverName: currentDriver?.name,
    };

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/trip_action`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clockOutData),
    });

    if (!response.ok) throw new Error('Clock-out failed');
    const result = await response.json();

    localStorage.removeItem('currentTrip');
    setCurrentTrip(null);
    setClockedIn(false);
    setFormData({ startKm: '', endKm: '', vehicleId: '', vehicleNo: '' });
    setActiveStep(0);
    setCurrentPhoto(null);
    setPhotoFile(null);

    showSnackbar(result.message || 'Clock-out successful!', 'success');
  } catch (error) {
    console.error('Clock-out error:', error);
    showSnackbar('Error completing clock-out: ' + error.message, 'error');
  } finally {
    setLoading(false);
  }
};

  // Reset Process
  const handleReset = () => {
    setActiveStep(0);
    setFormData({ startKm: '', endKm: '', vehicleId: '', vehicleNo: '' });
    setCurrentPhoto(null);
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Close photo dialog
  const handleClosePhotoDialog = () => {
    setPhotoDialog(false);
    setCurrentPhoto(null);
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const steps = [
    'Scan QR Code',
    'Enter Start KM',
    'Take Odometer Photo',
    'Complete Clock-In'
  ];

  // Render current status card with Glass Morphism
  const renderStatusCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          p: 3,
          mb: 3,
          background: clockedIn
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: theme.palette.primary.main,
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Avatar
              sx={{
                background: theme.palette.primary.main,
                width: 64,
                height: 64,
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
              }}
            >
              {clockedIn ? <ClockOutIcon /> : <ClockInIcon />}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight="700" color="text.primary">
                {clockedIn ? 'Currently On Trip' : 'Ready to Clock In'}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {clockedIn
                  ? `Driving ${currentTrip?.vehicleNo}`
                  : driverAssignedBus
                    ? `Assigned: ${driverAssignedBus.vehicle_no}`
                    : 'No vehicle assigned'
                }
              </Typography>
              {clockedIn && currentTrip?.startTime && (
                <LiveTimer startTime={currentTrip.startTime} />
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Chip
              label={clockedIn ? 'ON TRIP' : 'OFF DUTY'}
              sx={{
                background: clockedIn
                  ? 'linear-gradient(135deg, #22C55E, #10B981)'
                  : 'linear-gradient(135deg, #6B7280, #4B5563)',
                color: 'white',
                fontWeight: '800',
                fontSize: isMobile ? '0.7rem' : '0.8rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            {currentDriver && (
              <Chip
                icon={<PersonIcon sx={{ color: 'white !important' }} />}
                label={isMobile ? currentDriver.name.split(' ')[0] : currentDriver.name}
                sx={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: '#6366F1',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  fontWeight: '600',
                  fontSize: isMobile ? '0.7rem' : '0.8rem',
                }}
              />
            )}
          </Box>
        </Box>
      </Card>
    </motion.div>
  );

  // Render clock-in process
  const renderClockInProcess = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{
        p: isMobile ? 2 : 4,
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}>
        <Stepper
          activeStep={activeStep}
          sx={{ mb: 4 }}
          orientation={isMobile ? "vertical" : "horizontal"}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontWeight: '600',
                    color: 'text.primary',
                  }
                }}
              >
                {isMobile ? label.split(' ')[0] : label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                    borderRadius: '20px',
                    mb: 3,
                  }}
                >
                  <QrCodeIcon
                    sx={{
                      fontSize: 80,
                      color: theme.palette.primary.main,
                    }}
                  />
                </Box>
                <Typography variant="h5" gutterBottom fontWeight="700" color="text.primary">
                  Scan Vehicle QR Code
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                  {driverAssignedBus
                    ? `Your assigned vehicle: ${driverAssignedBus.vehicle_no}`
                    : 'No vehicle assigned to your account'
                  }
                </Typography>

                {driverAssignedBus ? (
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {/* <Button
                      variant="outlined"
                      onClick={handleManualVehicleEntry}
                      sx={{
                        px: 3,
                        borderRadius: '12px',
                        border: '2px solid #6366F1',
                        color: '#6366F1',
                        fontWeight: '600',
                        '&:hover': {
                          border: '2px solid #6366F1',
                          background: 'rgba(99, 102, 241, 0.1)',
                        }
                      }}
                    >
                      Use My Vehicle
                    </Button> */}
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<QrCodeIcon />}
                      onClick={handleClockIn}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        borderRadius: '12px',
                        background: theme.palette.primary.main,
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                        '&:hover': {
                          boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Scan QR Code
                    </Button>
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ mt: 2, borderRadius: '12px', maxWidth: 400, mx: 'auto' }}>
                    <Typography variant="body2" fontWeight="500">
                      No vehicle assigned. Please contact administrator for vehicle assignment.
                    </Typography>
                  </Alert>
                )}
              </Box>
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    padding: '16px',
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                    borderRadius: '16px',
                    mb: 3,
                  }}
                >
                  <SuccessIcon
                    sx={{
                      fontSize: 60,
                      color: '#22C55E',
                    }}
                  />
                </Box>
                <Typography variant="h6" gutterBottom fontWeight="700" color="text.primary">
                  Vehicle Identified Successfully
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Vehicle: <strong style={{ color: theme.palette.primary.main }}>{formData.vehicleNo}</strong>
                </Typography>

                <TextField
                  fullWidth
                  label="Start Kilometer Reading"
                  type="number"
                  value={formData.startKm}
                  onChange={(e) => setFormData(prev => ({ ...prev, startKm: e.target.value }))}
                  InputProps={{
                    startAdornment: <SpeedIcon sx={{ mr: 1, color: theme.palette.primary.main }} />,
                  }}
                  sx={{
                    mb: 3,
                    maxWidth: 300,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main
                      },
                    }
                  }}
                />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    startIcon={<ResetIcon />}
                    sx={{ borderRadius: '12px', fontWeight: '600' }}
                  >
                    Start Over
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleStartKmSubmit}
                    startIcon={<CameraIcon />}
                    sx={{
                      borderRadius: '12px',
                      fontWeight: '600',
                      background: theme.palette.primary.main,
                      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    Continue to Photo
                  </Button>
                </Box>
              </Box>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                    borderRadius: '20px',
                    mb: 3,
                  }}
                >
                  <SuccessIcon
                    sx={{
                      fontSize: 80,
                      color: '#22C55E',
                    }}
                  />
                </Box>
                <Typography variant="h5" gutterBottom fontWeight="700" color="#22C55E">
                  Clock-In Successful!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  You are now clocked in and ready to start your trip.
                </Typography>

                <Paper sx={{
                  p: 3,
                  mb: 3,
                  textAlign: 'left',
                  maxWidth: 400,
                  mx: 'auto',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.1)',
                }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="700" color="text.primary">
                    Trip Details:
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">Vehicle:</Typography>
                    <Typography fontWeight="600" color="text.primary">{currentTrip?.vehicleNo}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">Start KM:</Typography>
                    <Typography fontWeight="600" color="text.primary">{currentTrip?.startKm}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Start Time:</Typography>
                    <Typography fontWeight="600" color="text.primary">
                      {new Date(currentTrip?.startTime).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Paper>

                <Button
                  variant="contained"
                  onClick={() => setActiveStep(0)}
                  sx={{
                    mr: 2,
                    borderRadius: '12px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #6366F1, #A855F7)',
                  }}
                >
                  Done
                </Button>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );

  // Render clock-out section
  const renderClockOutSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card sx={{
        p: isMobile ? 2 : 4,
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              display: 'inline-flex',
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
              borderRadius: '16px',
              mb: 2,
            }}
          >
            <ClockOutIcon
              sx={{
                fontSize: 60,
                color: '#EF4444',
              }}
            />
          </Box>
          <Typography variant="h5" gutterBottom fontWeight="700" color="text.primary">
            Complete Your Trip
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter end kilometer reading and capture odometer photo to clock out
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="End Kilometer Reading"
              type="number"
              value={formData.endKm}
              onChange={(e) => setFormData(prev => ({ ...prev, endKm: e.target.value }))}
              InputProps={{
                startAdornment: <SpeedIcon sx={{ mr: 1, color: '#EF4444' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: '#EF4444',
                  },
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<PhotoIcon />}
                onClick={() => {
                  setPhotoType('end');
                  setPhotoDialog(true);
                }}
                sx={{
                  height: 56,
                  borderRadius: '12px',
                  border: '2px solid #EF4444',
                  color: '#EF4444',
                  fontWeight: '600',
                  '&:hover': {
                    border: '2px solid #EF4444',
                    background: 'rgba(239, 68, 68, 0.1)',
                  }
                }}
              >
                {currentTrip?.endPhoto ? 'Retake End Photo' : 'Take End Photo'}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {currentTrip?.endPhoto && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="body2" color="#22C55E" gutterBottom fontWeight="600">
              ✓ End odometer photo captured
            </Typography>
            <Box
              component="img"
              src={currentTrip.endPhoto}
              sx={{
                maxWidth: 200,
                maxHeight: 150,
                borderRadius: '12px',
                border: '3px solid #22C55E',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
              }}
              alt="End odometer"
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            startIcon={<ResetIcon />}
            sx={{ borderRadius: '12px', fontWeight: '600' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={completeClockOut}
            startIcon={<ClockOutIcon />}
            disabled={!formData.endKm || !currentTrip?.endPhoto || loading}
            sx={{
              borderRadius: '12px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
              '&:hover': {
                boxShadow: '0 12px 32px rgba(239, 68, 68, 0.4)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: '#9CA3AF',
                boxShadow: 'none',
                transform: 'none',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Complete Clock-Out'}
          </Button>
        </Box>
      </Card>
    </motion.div>
  );

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
          sx={{
            borderRadius: '12px',
            fontWeight: '500',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* QR Scanner Dialog */}
      <Dialog
        open={cameraDialog}
        onClose={() => setCameraDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCodeIcon sx={{ color: '#6366F1' }} />
            <Typography variant="h6" fontWeight="600">
              Scan Vehicle QR Code
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {driverAssignedBus && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: '12px' }}>
              Your assigned vehicle: <strong>{driverAssignedBus.vehicle_no}</strong>
            </Alert>
          )}
          {validatingVehicle && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
              <CircularProgress size={24} sx={{ mr: 2, color: '#6366F1' }} />
              <Typography>Validating vehicle assignment...</Typography>
            </Box>
          )}
          <QrScanner
            onScan={onQrCodeScan}
            onError={(message) => showSnackbar(message, 'error')}
          />
        </DialogContent>
        <DialogActions>
          {/* <Button
            onClick={handleManualVehicleEntry}
            sx={{ fontWeight: '600' }}
          >
            Use My Vehicle
          </Button> */}
          <Button
            onClick={() => setCameraDialog(false)}
            sx={{ fontWeight: '600' }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Photo Capture Dialog */}
      <Dialog
        open={photoDialog}
        onClose={handleClosePhotoDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CameraIcon sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" fontWeight="600">
              {photoType === 'start' ? 'Start Odometer Photo' : 'End Odometer Photo'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {photoType === 'start'
                ? 'Capture a clear photo of the vehicle odometer showing start kilometer reading'
                : 'Capture a clear photo of the vehicle odometer showing end kilometer reading'
              }
            </Typography>

            {/* Hidden file inputs */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<PhotoIcon />}
                sx={{ borderRadius: '12px', fontWeight: '600' }}
              >
                Choose from Gallery
              </Button>
              <Button
                variant="contained"
                onClick={handleCameraCapture}
                startIcon={<CameraIcon />}
                sx={{
                  borderRadius: '12px',
                  fontWeight: '600',
                  background: theme.palette.primary.main,
                }}
              >
                Take Photo
              </Button>
            </Box>

            {currentPhoto && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="#22C55E" gutterBottom fontWeight="600">
                  ✓ Photo captured successfully
                </Typography>
                <Box
                  component="img"
                  src={currentPhoto}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    borderRadius: '16px',
                    border: '3px solid #22C55E',
                    boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)',
                  }}
                  alt="Odometer reading"
                />
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  File: {photoFile?.name} • {(photoFile?.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClosePhotoDialog}
            sx={{ fontWeight: '600' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUsePhoto}
            disabled={!currentPhoto}
            sx={{
              fontWeight: '600',
              borderRadius: '12px',
              background: theme.palette.primary.main,
            }}
          >
            Use Photo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            fontWeight="800"
            gutterBottom
            sx={{
              fontSize: isMobile ? '2rem' : '3rem',
              background: theme.palette.primary.main,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              // textShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            Clock In / Clock Out
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              fontWeight: '500',
              opacity: 0.8,
            }}
          >
            Manage your trips with seamless QR scanning and real-time tracking
          </Typography>
        </Box>
      </motion.div>

      {/* Loading State */}
      {loading && !clockedIn && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress size={40} sx={{ color: '#6366F1' }} />
          <Typography sx={{ ml: 2, fontWeight: '600' }}>Loading driver information...</Typography>
        </Box>
      )}

      {/* Status Card */}
      {!loading && renderStatusCard()}

      {/* Main Content */}
      {!loading && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={clockedIn ? 6 : 12}>
            {!clockedIn ? renderClockInProcess() : renderClockOutSection()}
          </Grid>

          {clockedIn && (
            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card sx={{
                  p: isMobile ? 2 : 4,
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  height: '100%',
                }}>
                  <Typography variant="h6" gutterBottom fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon sx={{ color: theme.palette.primary.main  }} />
                    Current Trip Summary
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ space: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography color="text.secondary">Trip ID:</Typography>
                      <Typography fontWeight="600" color="text.primary">{currentTrip?.tripId}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography color="text.secondary">Vehicle:</Typography>
                      <Typography fontWeight="600" color="text.primary">{currentTrip?.vehicleNo}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography color="text.secondary">Start KM:</Typography>
                      <Typography fontWeight="600" color="text.primary">{currentTrip?.startKm}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography color="text.secondary">Start Time:</Typography>
                      <Typography fontWeight="600" color="text.primary">
                        {new Date(currentTrip?.startTime).toLocaleTimeString()}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography color="text.secondary">Duration:</Typography>
                      <Typography fontWeight="600" color="text.primary">
                        {Math.round((new Date() - new Date(currentTrip?.startTime)) / (1000 * 60))} minutes
                      </Typography>
                    </Box>
                  </Box>

                  {currentTrip?.startPhoto && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="600">
                        Start Odometer Photo:
                      </Typography>
                      <Box
                        component="img"
                        src={currentTrip.startPhoto}
                        sx={{
                          width: '100%',
                          maxHeight: 200,
                          borderRadius: '12px',
                          objectFit: 'cover',
                          border: '2px solid rgba(99, 102, 241, 0.2)',
                        }}
                        alt="Start odometer"
                      />
                    </Box>
                  )}
                </Card>
              </motion.div>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
};

export default ClockInOut;