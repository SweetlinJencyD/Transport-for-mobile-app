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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  DirectionsCar as CarIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Build as BuildIcon,
  Description as DescriptionIcon,
  LocalOffer as FeaturesIcon,
  DocumentScanner as DocumentIcon,
  QrCode2 as QrCodeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ViewVehicle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const printRef = useRef();
  const qrCodeRef = useRef();
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Get vehicle ID from location state or URL params
  const vehicleId = location.state?.vehicle?.id || location.state?.vehicleId;

  useEffect(() => {
    const fetchVehicleData = async () => {
      // If vehicle data is passed via location state, use it directly
      if (location.state?.vehicle) {
        setVehicle(location.state.vehicle);
        setLoading(false);
        return;
      }

      // If we have vehicleId but no full vehicle data, fetch from API
      if (vehicleId) {
        try {
          const response = await fetch('/vehicle_list');
          if (!response.ok) {
            throw new Error('Failed to fetch vehicle data');
          }
          const vehicles = await response.json();
          
          // Find the specific vehicle by ID
          const foundVehicle = vehicles.find(v => v.id === vehicleId);
          if (foundVehicle) {
            setVehicle(foundVehicle);
          } else {
            throw new Error('Vehicle not found');
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setError('No vehicle ID provided');
        setLoading(false);
      }
    };

    fetchVehicleData();
  }, [vehicleId, location.state]);

  const handlePrint = () => window.print();

  const handleDownloadDocument = async (url, filename) => {
  if (!url) return;

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading document:', error);
  }
};

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

  pdf.save(`vehicle-${vehicle.vehicle_no}-details.pdf`);
};


  const handleDownloadDocumentImage = async (url, filename) => {
  if (!url) return;

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const imageUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(imageUrl);
  } catch (error) {
    console.error('Error downloading document image:', error);
  }
};

  const handleDownloadQRCode = async () => {
    if (!vehicle.qrcode_url) return;

    setQrLoading(true);
    try {
      const response = await fetch(vehicle.qrcode_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${vehicle.vehicle_no}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    } finally {
      setQrLoading(false);
    }
  };

  const handleBack = () => navigate('/list-vehicle');

  if (loading) {
    return (
      <Container sx={{ py: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading vehicle details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !vehicle) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'No vehicle data found. Please go back and select a vehicle.'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Vehicle List
        </Button>
      </Container>
    );
  }

  const getServiceStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'idle':
        return 'warning';
      case 'on service':
        return 'success';
      case 'active':
        return 'primary';
      case 'maintenance':
        return 'error';
      default:
        return 'default';
    }
  };

  const getVehicleStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const SectionHeader = ({ icon: Icon, title }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 4 }}>
      <Icon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
      <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {title}
      </Typography>
    </Box>
  );
  const FieldItem = ({ label, value, isMoney }) => {
  // Hide if null, undefined, empty, zero, "0.00", "0000-00-00"
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    value === 0 ||
    value === '0' ||
    value === '0.00' ||
    value === '0000-00-00'
  ) return null;

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
          {isMoney ? `₹ ${parseFloat(value).toLocaleString('en-IN')}` : value}
        </Typography>
      </Box>
    </Grid>
  );
};

  // QR Code Section
  const renderQRCodeSection = () => (
    <Box>
      <SectionHeader icon={QrCodeIcon} title="QR Code" />
      <Paper sx={{ p: 3, borderRadius: 1, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
        {vehicle.qrcode_url ? (
          <Box>
            <Box
              ref={qrCodeRef}
              sx={{
                display: 'inline-block',
                p: 2,
                backgroundColor: 'white',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                mb: 2
              }}
            >
              <img
                src={vehicle.qrcode_url}
                alt={`QR Code for ${vehicle.vehicle_no}`}
                style={{
                  width: '200px',
                  height: '200px',
                  objectFit: 'contain',
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadQRCode}
                disabled={qrLoading}
                sx={{ borderRadius: 2 }}
              >
                {qrLoading ? <CircularProgress size={20} /> : 'Download QR Code'}
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ width: '100%', mt: 1 }}>
                Vehicle ID: {vehicle.vehicle_id}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            QR Code not available for this vehicle.
          </Typography>
        )}
      </Paper>
    </Box>
  );

  // Basic Information Section
  const renderBasicInformation = () => (
    <Box>
      <SectionHeader icon={CarIcon} title="Basic Vehicle Information" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          {vehicle.vehicle_id && <FieldItem label="Vehicle ID" value={vehicle.vehicle_id} />}
          {vehicle.vehicle_no && <FieldItem label="Vehicle Number" value={vehicle.vehicle_no} />}
          {vehicle.bus_number && <FieldItem label="Route Number" value={vehicle.bus_number} />}
          {vehicle.tax && <FieldItem label="Tax Amount" value={vehicle.tax} />}
          {vehicle.service_status && <FieldItem label="Service Status" value={vehicle.service_status} />}
          {vehicle.driver_name && <FieldItem label="Driver" value={vehicle.driver_name} />}
          {vehicle.group_name && <FieldItem label="Group" value={vehicle.group_name} />}
          {vehicle.supervisor_name && <FieldItem label="Supervisor" value={vehicle.supervisor_name} />}
        </Grid>
      </Paper>
    </Box>
  );

  // Registration & Insurance Section
  const renderRegistrationInsurance = () => (
    <Box>
      <SectionHeader icon={DocumentIcon} title="Registration & Insurance" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          {vehicle.rc_number && <FieldItem label="RC Number" value={vehicle.rc_number} />}
          {vehicle.insurance_number && <FieldItem label="Insurance Number" value={vehicle.insurance_number} />}
          {vehicle.insurance_expiry && <FieldItem label="Insurance Expiry" value={vehicle.insurance_expiry} />}
        </Grid>
      </Paper>
    </Box>
  );

  // Certificates & Permits Section
  const renderCertificatesPermits = () => (
    <Box>
      <SectionHeader icon={DescriptionIcon} title="Certificates & Permits" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          {vehicle.permit_no && <FieldItem label="Permit Number" value={vehicle.permit_no} />}
          {vehicle.permit_expiry && <FieldItem label="Permit Expiry" value={vehicle.permit_expiry} />}
          {vehicle.emission_certificate_no && <FieldItem label="Emission Certificate No" value={vehicle.emission_certificate_no} />}
          {vehicle.emission_expiry && <FieldItem label="Emission Expiry" value={vehicle.emission_expiry} />}
          {vehicle.fitness_certificate_no && <FieldItem label="Fitness Certificate No" value={vehicle.fitness_certificate_no} />}
          {vehicle.fitness_expiry && <FieldItem label="Fitness Expiry" value={vehicle.fitness_expiry} />}
        </Grid>
      </Paper>
    </Box>
  );

  // Loan & Financial Section
  const renderLoanFinancial = () => (
    <Box>
      <SectionHeader icon={MoneyIcon} title="Loan & Financial Details" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          {vehicle.loan_status && <FieldItem label="Loan Status" value={vehicle.loan_status} />}
          {vehicle.loan_provider && <FieldItem label="Loan Provider" value={vehicle.loan_provider} />}
          {vehicle.loan_amount && <FieldItem label="Loan Amount" value={vehicle.loan_amount} />}
          {vehicle.loan_emi_amount && <FieldItem label="Loan EMI Amount" value={vehicle.loan_emi_amount} />}
          {vehicle.loan_start_date && <FieldItem label="Loan Start Date" value={vehicle.loan_start_date} />}
          {vehicle.loan_end_date && <FieldItem label="Loan End Date" value={vehicle.loan_end_date} />}
        </Grid>
      </Paper>
    </Box>
  );

  // Maintenance & Features Section
  const renderMaintenanceFeatures = () => (
    <Box>
      <SectionHeader icon={BuildIcon} title="Maintenance & Features" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          {vehicle.gps && <FieldItem label="GPS Installed" value={vehicle.gps} />}
          {vehicle.cameras && <FieldItem label="Cameras Installed" value={vehicle.cameras} />}
          {vehicle.battery_sts && <FieldItem label="Battery Status" value={vehicle.battery_sts} />}
          {vehicle.diesel_per_km && <FieldItem label="Diesel per KM" value={vehicle.diesel_per_km} />}
          {vehicle.dlf_filling && <FieldItem label="DLF Filling" value={vehicle.dlf_filling} />}
          {vehicle.service_date && <FieldItem label="Service Date" value={vehicle.service_date} />}
          {vehicle.wheel_alignment_date && <FieldItem label="Wheel Alignment Date" value={vehicle.wheel_alignment_date} />}
          {vehicle.tyre_count && <FieldItem label="Tyre Count" value={vehicle.tyre_count} />}
          {vehicle.front_left_tyre_status && <FieldItem label="Front Left Tyre Status" value={vehicle.front_left_tyre_status} />}
          {vehicle.front_right_tyre_status && <FieldItem label="Front Right Tyre Status" value={vehicle.front_right_tyre_status} />}
          {vehicle.rear_left_tyre_status && <FieldItem label="Rear Left Tyre Status" value={vehicle.rear_left_tyre_status} />}
          {vehicle.rear_right_tyre_status && <FieldItem label="Rear Right Tyre Status" value={vehicle.rear_right_tyre_status} />}
        </Grid>
      </Paper>
    </Box>
  );

  // Additional Details Section
  const renderAdditionalDetails = () => (
    <Box>
      <SectionHeader icon={FeaturesIcon} title="Additional Details" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          {vehicle.others && (
            <Grid item xs={12}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>
                  Remarks:
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {vehicle.others}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
  const renderDocuments = () => (
  <Box>
    <SectionHeader icon={DescriptionIcon} title="Documents" />
    <Paper sx={{ p: 3, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
      <Grid container spacing={2}>
        {vehicle.rc_document && (
         <Grid item xs={12} sm={6} md={3} lg={3}>

            <Box sx={{ textAlign: 'center', p: 1 }}>
              <img
                src={vehicle.rc_document}
                alt={`RC Document ${vehicle.vehicle_no}`}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  borderRadius: 4
                }}
              />
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadDocumentImage(vehicle.rc_document, `RC-${vehicle.vehicle_no}.png`)}
                sx={{ mt: 1, borderRadius: 2 }}
              >
                Download RC
              </Button>
            </Box>
          </Grid>
        )}

        {vehicle.insurance_document && (
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <img
                src={vehicle.insurance_document}
                alt={`Insurance Document ${vehicle.vehicle_no}`}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  borderRadius: 4
                }}
              />
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadDocumentImage(vehicle.insurance_document, `Insurance-${vehicle.vehicle_no}.png`)}
                sx={{ mt: 1, borderRadius: 2 }}
              >
                Download Insurance
              </Button>
            </Box>
          </Grid>
        )}

        {vehicle.emission_certificate_doc && (
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <img
                src={vehicle.emission_certificate_doc}
                alt={`Emission Certificate ${vehicle.vehicle_no}`}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  borderRadius: 4
                }}
              />
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadDocumentImage(vehicle.emission_certificate_doc, `Emission-${vehicle.vehicle_no}.png`)}
                sx={{ mt: 1, borderRadius: 2 }}
              >
                Download Emission
              </Button>
            </Box>
          </Grid>
        )}

        {vehicle.fitness_certificate_doc && (
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <img
                src={vehicle.fitness_certificate_doc}
                alt={`Fitness Certificate ${vehicle.vehicle_no}`}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  borderRadius: 4
                }}
              />
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadDocumentImage(vehicle.fitness_certificate_doc, `Fitness-${vehicle.vehicle_no}.png`)}
                sx={{ mt: 1, borderRadius: 2 }}
              >
                Download Fitness Certificate
              </Button>
            </Box>
          </Grid>
        )}

        {vehicle.permit_doc && (
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <img
                src={vehicle.permit_doc}
                alt={`Permit Certificate ${vehicle.vehicle_no}`}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  borderRadius: 4
                }}
              />
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadDocumentImage(vehicle.permit_doc, `Permit-${vehicle.vehicle_no}.png`)}
                sx={{ mt: 1, borderRadius: 2 }}
              >
                Download Permit Certificate
              </Button>
            </Box>
          </Grid>
        )}
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
              Vehicle Details
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Complete information for {vehicle.vehicle_no}
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

      {/* Vehicle Details Card */}
      <div ref={printRef} id="printable-area">
        <Card
          sx={{
            p: 4,
            borderRadius: 0,
            backgroundColor: 'background.paper',
          }}
        >
          {/* Vehicle Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}
            >
              {vehicle.vehicle_no}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              {vehicle.service_status && (
                <Chip
                  label={`Service: ${vehicle.service_status}`}
                  color={getServiceStatusColor(vehicle.service_status)}
                  sx={{ fontWeight: 'bold' }}
                />
              )}
              {vehicle.vehicle_status && (
                <Chip
                  label={`Status: ${vehicle.vehicle_status}`}
                  color={getVehicleStatusColor(vehicle.vehicle_status)}
                  sx={{ fontWeight: 'bold' }}
                />
              )}
            </Box>
          </Box>

          {/* Vehicle Image */}
          {vehicle.vehicle_image && (
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <img
                src={vehicle.vehicle_image}
                alt="Vehicle"
                style={{
                  maxWidth: '400px',
                  maxHeight: '300px',
                  objectFit: 'cover',
                  borderRadius: '0px',
                  border: '2px solid #e0e0e0',
                }}
              />
            </Box>
          )}

          {/* Render all sections including QR Code */}
          {renderQRCodeSection()}
          {renderBasicInformation()}
          {renderRegistrationInsurance()}
          {renderCertificatesPermits()}
          {renderLoanFinancial()}
          {renderMaintenanceFeatures()}
          {renderAdditionalDetails()}
          {renderDocuments()}
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

export default ViewVehicle;