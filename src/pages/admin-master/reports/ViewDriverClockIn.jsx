import React, { useRef } from 'react';
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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Badge as BadgeIcon,
  PhotoCamera as PhotoIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ViewDriverClockIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const report = location.state?.report;
  const printRef = useRef();

  if (!report) {
    return (
      <Container sx={{ py: 5 }}>
        {/* <Alert severity="error" sx={{ mb: 2 }}>
          No driver clock report data found. Please go back and select a report.
        </Alert> */}
        {/* <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/report-driverClockInReport')}
        >
          Back to Driver Reports
        </Button> */}
      </Container>
    );
  }

  const handleDownloadImage = async (url, filename) => {
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
      console.error('Error downloading image:', error);
    }
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.offsetWidth,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.7);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`driver-report-${report.trip_id}-details.pdf`);
  };

  const handleBack = () => navigate('/report-driverClockInReport');

  const SectionHeader = ({ icon: Icon, title }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 4 }}>
      <Icon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
      <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {title}
      </Typography>
    </Box>
  );

  const FieldItem = ({ label, value }) => (
    <Grid item xs={12} sm={6} md={4}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          p: 2,
          minHeight: '80px',
          borderRadius: 0,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ 
            fontWeight: 600, 
            color: 'text.secondary',
            minWidth: '140px',
            flexShrink: 0,
            mr: 2
          }}
        >
          {label}:
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 'bold', 
            flex: 1,
            wordBreak: 'break-word'
          }}
        >
          {value || '-'}
        </Typography>
      </Box>
    </Grid>
  );

  const getStatusChip = (status) => {
    if (!status) return <Chip label="Unknown" color="default" sx={{ fontWeight: 'bold' }} />;
    
    const statusLower = status.toString().toLowerCase();
    if (statusLower === 'active' || statusLower === 'completed' || statusLower === '1') {
      return <Chip label="Active" color="success" sx={{ fontWeight: 'bold' }} />;
    } else if (statusLower === 'in progress' || statusLower === 'started') {
      return <Chip label="In Progress" color="warning" sx={{ fontWeight: 'bold' }} />;
    } else {
      return <Chip label="Inactive" color="error" sx={{ fontWeight: 'bold' }} />;
    }
  };

  const formatDateTime = (date, time) => {
    if (!date || date === 'N/A') return 'Not Available';
    return `${date} ${time ? time : ''}`.trim();
  };

  // Trip Information Section
  const renderTripInformation = () => (
    <Box>
      <SectionHeader icon={BadgeIcon} title="Trip Information" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          <FieldItem label="Trip ID" value={report.trip_id} />
          <FieldItem label="Driver Name" value={report.driver_name} />
          <FieldItem label="Vehicle Number" value={report.vehicle_no} />
          <FieldItem label="Status" value={getStatusChip(report.status)} />
        </Grid>
      </Paper>
    </Box>
  );

  // Clock In Information Section
  const renderClockInInformation = () => (
    <Box>
      <SectionHeader icon={EventIcon} title="Clock In Information" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          <FieldItem 
            label="Clock In Date" 
            value={report.clock_in_date || 'Not Available'} 
          />
          <FieldItem 
            label="Clock In Time" 
            value={report.clock_in_time || 'Not Available'} 
          />
          <FieldItem 
            label="Full Clock In" 
            value={formatDateTime(report.clock_in_date, report.clock_in_time)} 
          />
        </Grid>
      </Paper>
    </Box>
  );

  // Clock Out Information Section
  const renderClockOutInformation = () => (
    <Box>
      <SectionHeader icon={ScheduleIcon} title="Clock Out Information" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          <FieldItem 
            label="Clock Out Date" 
            value={report.clock_out_date || 'Not Available'} 
          />
          <FieldItem 
            label="Clock Out Time" 
            value={report.clock_out_time || 'Not Available'} 
          />
          <FieldItem 
            label="Full Clock Out" 
            value={formatDateTime(report.clock_out_date, report.clock_out_time)} 
          />
        </Grid>
      </Paper>
    </Box>
  );

  // Photos Section - Modified to show all photos in one row
  const renderPhotos = () => (
    <Box>
      <SectionHeader icon={PhotoIcon} title="Trip Photos" />
      <Paper
        sx={{
          p: 3,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Grid container spacing={3} alignItems="stretch">
          {/* Start Photo */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Start Photo
              </Typography>
              {report.start_photo ? (
                <>
                  <img
                    src={report.start_photo}
                    alt={`Start photo for trip ${report.trip_id}`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '2px solid #e0e0e0',
                    }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() =>
                      handleDownloadImage(
                        report.start_photo,
                        `Start-Photo-${report.trip_id}.png`
                      )
                    }
                    sx={{ mt: 2, borderRadius: 2 }}
                  >
                    Download
                  </Button>
                </>
              ) : (
                <Box
                  sx={{
                    height: '200px',
                    border: '2px dashed #e0e0e0',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No Start Photo
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* End Photo */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">
                End Photo
              </Typography>
              {report.end_photo ? (
                <>
                  <img
                    src={report.end_photo}
                    alt={`End photo for trip ${report.trip_id}`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '2px solid #e0e0e0',
                    }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() =>
                      handleDownloadImage(
                        report.end_photo,
                        `End-Photo-${report.trip_id}.png`
                      )
                    }
                    sx={{ mt: 2, borderRadius: 2 }}
                  >
                    Download
                  </Button>
                </>
              ) : (
                <Box
                  sx={{
                    height: '200px',
                    border: '2px dashed #e0e0e0',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No End Photo
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Driver Photo - Now in the same row as other photos */}
          {/* <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Driver Photo
              </Typography>
              {report.driver_photo ? (
                <>
                  <img
                    src={report.driver_photo}
                    alt={`Driver ${report.driver_name}`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '2px solid #e0e0e0',
                    }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() =>
                      handleDownloadImage(
                        report.driver_photo,
                        `Driver-Photo-${report.driver_name}.png`
                      )
                    }
                    sx={{ mt: 2, borderRadius: 2 }}
                  >
                    Download
                  </Button>
                </>
              ) : (
                <Box
                  sx={{
                    height: '200px',
                    border: '2px dashed #e0e0e0',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No Driver Photo
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid> */}
        </Grid>
      </Paper>
    </Box>
  );

  // Duration Calculation
  const calculateDuration = () => {
    if (!report.clock_in_date || !report.clock_out_date) return 'N/A';
    
    try {
      const start = new Date(`${report.clock_in_date}T${report.clock_in_time || '00:00:00'}`);
      const end = new Date(`${report.clock_out_date}T${report.clock_out_time || '00:00:00'}`);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'N/A';
      
      const durationMs = end - start;
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}h ${minutes}m`;
    } catch (error) {
      return 'N/A';
    }
  };

  // Summary Section
  const renderSummary = () => (
    <Box>
      <SectionHeader icon={CarIcon} title="Trip Summary" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          <FieldItem 
            label="Trip Duration" 
            value={calculateDuration()} 
          />
          <FieldItem 
            label="Clock In Status" 
            value={report.clock_in_date ? 'Completed' : 'Pending'} 
          />
          <FieldItem 
            label="Clock Out Status" 
            value={report.clock_out_date ? 'Completed' : 'Pending'} 
          />
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
              Driver Clock Report Details
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Complete information for Trip {report.trip_id}
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

      {/* Report Details Card */}
      <div ref={printRef} id="printable-area">
        <Card
          sx={{
            p: 4,
            borderRadius: 0,
            backgroundColor: 'background.paper',
          }}
        >
          {/* Report Header with Driver Photo */}
          <Box sx={{ mb: 4, textAlign: 'center', position: 'relative' }}>
            {/* Driver Photo positioned near the name */}
            {report.driver_photo && (
              <Box 
                sx={{ 
                  position: 'absolute', 
                  left: 0, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  display: { xs: 'none', md: 'block' }
                }}
              >
                <img
                  src={report.driver_photo}
                  alt={`Driver ${report.driver_name}`}
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    border: '3px solid #e0e0e0',
                  }}
                />
              </Box>
            )}
            
            <Typography
              variant="h3"
              sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}
            >
              {report.driver_name}
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
                label={`Trip ID: ${report.trip_id}`}
                color="primary"
                sx={{ fontWeight: 'bold' }}
              />
              <Chip
                label={`Vehicle: ${report.vehicle_no}`}
                color="secondary"
                sx={{ fontWeight: 'bold' }}
              />
              {getStatusChip(report.status)}
            </Box>
          </Box>

          {/* Render all sections */}
          {renderTripInformation()}
          {renderClockInInformation()}
          {renderClockOutInformation()}
          {renderSummary()}
          {renderPhotos()}

          {/* Footer */}
          <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
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

export default ViewDriverClockIn;