import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Paper,
  Container,
  IconButton,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Groups as GroupIcon,
  DirectionsCar as CarIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  QrCode2 as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Build as ServiceIcon,
  Pause as IdleIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ViewGroup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const printRef = useRef();
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get group data from location state
  const groupData = location.state?.group;

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        // If group data is passed via location state, use it directly
        if (groupData) {
          setGroup(groupData);
        } else {
          throw new Error('No group data provided');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupData]);

  const handlePrint = () => window.print();

const handleDownloadPDF = async () => {
  const element = printRef.current;
  const canvas = await html2canvas(element, {
    scale: 2, 
    useCORS: true,
    logging: false,
    scrollY: -window.scrollY, // capture full content
    windowWidth: document.documentElement.offsetWidth,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.7); // compress image
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // Add first page
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  // Add remaining pages if needed
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(`group-${group.group}-details.pdf`);
};

  const handleBack = () => navigate('/list-group');

  if (loading) {
    return (
      <Container sx={{ py: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading group details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !group) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'No group data found. Please go back and select a group.'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Group List
        </Button>
      </Container>
    );
  }

  const SectionHeader = ({ icon: Icon, title }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 4 }}>
      <Icon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
      <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {title}
      </Typography>
    </Box>
  );

  const FieldItem = ({ label, value }) => {
    if (!value || value === '' || value === 0 || value === '0') return null;

    return (
      <Grid item xs={12} sm={6} md={4}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 2, minHeight: '80px' }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: 'text.secondary', minWidth: '140px', flexShrink: 0, mr: 2 }}
          >
            {label}:
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: 'bold', flex: 1, wordBreak: 'break-word' }}
          >
            {value}
          </Typography>
        </Box>
      </Grid>
    );
  };

  // Get display name for vehicle
  const getVehicleDisplayName = (bus) => {
    if (bus.vehicle_no && bus.vehicle_no !== '' && bus.vehicle_no !== '0') {
      return bus.vehicle_no;
    }
    if (bus.vehicle_id && bus.vehicle_id !== '' && bus.vehicle_id !== '0') {
      return `Vehicle ID: ${bus.vehicle_id}`;
    }
    return 'Unknown Vehicle';
  };

  // Calculate vehicle statistics
  const calculateVehicleStats = () => {
    if (!group.buses || group.buses.length === 0) {
      return { total: 0, onService: 0, idle: 0 };
    }

    const total = group.buses.length;
    
    // Mock data for service status - in real app, this would come from your API
    // For now, we'll randomly assign status for demonstration
    const onService = Math.floor(total * 0.6); // 60% on service
    const idle = total - onService; // Remaining idle

    return { total, onService, idle };
  };

  const vehicleStats = calculateVehicleStats();

  // Vehicles in Group Section - Display in 3 columns grid
  const renderVehiclesList = () => (
    <Box>
      <SectionHeader icon={CarIcon} title="Vehicles in Group" />
      <Paper sx={{ p: 3, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        {group.buses && group.buses.length > 0 ? (
          <Grid container spacing={2}>
            {group.buses.map((bus, index) => (
              <Grid item xs={12} sm={6} md={4} key={bus.vehicle_id || index}>
                <Card
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CarIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                      {getVehicleDisplayName(bus)}
                    </Typography>
                    <CheckCircleIcon color="success" />
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 'auto' }}>
                    {bus.vehicle_no && bus.vehicle_no !== '' && bus.vehicle_no !== '0' && (
                      <Chip
                        label={`No: ${bus.vehicle_no}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {bus.vehicle_id && bus.vehicle_id !== '' && bus.vehicle_id !== '0' && (
                      <Chip
                        label={`ID: ${bus.vehicle_id}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                    {/* Mock service status - replace with actual data from your API */}
                    <Chip
                      label={Math.random() > 0.4 ? "On Service" : "Idle"}
                      size="small"
                      color={Math.random() > 0.4 ? "success" : "warning"}
                      variant="filled"
                    />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CancelIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No vehicles assigned to this group
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Add vehicles to this group to see them listed here
            </Typography>
          </Box>
        )}
        
        {/* {group.buses && group.buses.length > 0 && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
              Total Vehicles: {group.buses.length}
            </Typography>
          </Box>
        )} */}
      </Paper>
    </Box>
  );

  // Group Summary Section with enhanced statistics
  const renderGroupSummary = () => (
    <Box>
      <SectionHeader icon={DescriptionIcon} title="Group Summary" />
      <Paper sx={{ p: 3, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {vehicleStats.total}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Vehicles
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <ServiceIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {vehicleStats.onService}
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                On Service
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <IdleIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {vehicleStats.idle}
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Idle
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
        className="no-print"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconButton
              onClick={handleBack}
              color="primary"
              sx={{
                backgroundColor: 'primary.light',
                color: 'white',
                '&:hover': { backgroundColor: 'primary.main' },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </motion.div>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Group Details
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Complete information for {group.group_name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ borderRadius: 2 }}
            >
              Print
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              startIcon={<PdfIcon />}
              onClick={handleDownloadPDF}
              sx={{ borderRadius: 2 }}
            >
              Download PDF
            </Button>
          </motion.div>
        </Box>
      </Box>

      {/* Group Details Card */}
      <div ref={printRef} id="printable-area">
        <Card
          sx={{
            p: 4,
            borderRadius: 0,
            backgroundColor: 'background.paper',
          }}
        >
          {/* Group Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}
            >
              {group.group_name}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Chip
                label={`Total Vehicles: ${vehicleStats.total}`}
                color="primary"
                sx={{ fontWeight: 'bold' }}
              />
              <Chip
                label={`On Service: ${vehicleStats.onService}`}
                color="success"
                sx={{ fontWeight: 'bold' }}
              />
              <Chip
                label={`Idle: ${vehicleStats.idle}`}
                color="warning"
                sx={{ fontWeight: 'bold' }}
              />
              {group.created_at && (
                <Chip
                  label={`Created: ${new Date(group.created_at).toLocaleDateString()}`}
                  color="secondary"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
            </Box>
          </Box>

          {/* Render all sections */}
          {renderGroupSummary()}
          {renderVehiclesList()}

        </Card>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-area, #printable-area * {
              visibility: visible;
            }
            #printable-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
    </Container>
  );
};

export default ViewGroup;