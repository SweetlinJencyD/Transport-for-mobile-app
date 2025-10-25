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
  Stack,
  Dialog,
  DialogContent,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  DirectionsCar as CarIcon,
  Description as DocumentIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Assignment as TripIcon,
  Report as TicketIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ViewDriver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const driver = location.state?.driver;
  const printRef = useRef();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Add print event listeners
  useEffect(() => {
    const handleBeforePrint = () => {
      setIsPrinting(true);
    };

    const handleAfterPrint = () => {
      setIsPrinting(false);
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  if (!driver) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          No driver data found. Please go back and select a driver.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/list-driver')}
        >
          Back to Driver List
        </Button>
      </Container>
    );
  }

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    // Force fixed width to match design
    const originalWidth = printContent.style.width;
    printContent.style.width = '1200px';
    printContent.style.maxWidth = '100%';
    printContent.style.margin = '0 auto';

    window.print();

    // Restore afterward
    printContent.style.width = originalWidth;
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

    pdf.save(`driver-${driver.driver}-details.pdf`);
  };

  const handleBack = () => navigate('/list-driver');

  // Helper function to check if value exists and is not empty
  const hasValue = (value) => {
    return value && value !== '' && value !== '0' && value !== 'null' && value !== 'undefined';
  };

  // Enhanced download document function
  const handleDownloadDocument = async (url, documentName) => {
    if (!url) return;

    try {
      // Extract file extension from URL
      const fileExtension = url.split('.').pop().split('?')[0];
      const validExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
      const extension = validExtensions.includes(fileExtension.toLowerCase()) ? fileExtension : 'jpg';

      // Create a proper filename
      const fileName = `${documentName.replace(/\s+/g, '_')}.${extension}`;

      // Fetch the file and create a blob
      const response = await fetch(url);
      const blob = await response.blob();

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab if download fails
      window.open(url, '_blank');
    }
  };

  // View document function
  const handleViewDocument = (url, documentType, documentName) => {
    if (!url) return;

    setCurrentDocument({
      url,
      type: documentType,
      name: documentName
    });
    setViewDialogOpen(true);
  };

  // Close view dialog
  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setCurrentDocument(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Section Header Component
  const SectionHeader = ({ icon: Icon, title, count = 0 }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: 'primary.main',
          color: 'white',
          mr: 2,
        }}
      >
        <Icon sx={{ fontSize: '1.2rem' }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', flex: 1 }}>
        {title}
      </Typography>
      {count > 0 && (
        <Chip
          label={count}
          size="small"
          color="primary"
          variant="outlined"
        />
      )}
    </Box>
  );

  // Info Item Component
  const InfoItem = ({ icon: Icon, label, value, color = 'primary' }) => {
    if (!hasValue(value)) return null;

    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5 }}>
        <Icon
          sx={{
            fontSize: '1.2rem',
            color: `${color}.main`,
            mr: 2,
            mt: 0.5,
            flexShrink: 0
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem' }}>
            {label}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
            {value}
          </Typography>
        </Box>
      </Box>
    );
  };

  // Document Item Component
  const DocumentItem = ({ label, url, documentType }) => {
    if (!hasValue(url)) return null;

    return (
      <Grid item xs={12} sm={6}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            height: '100%',
            '&:hover': {
              boxShadow: 2,
              borderColor: 'primary.main',
            },
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
            {label}
          </Typography>

          {/* Document Preview Section */}
          <Box sx={{ mb: 2, flex: 1 }}>
            <Tooltip title="Click to view full document">
              <Box
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover .preview-overlay': {
                    opacity: 1,
                  },
                  '&:hover img': {
                    transform: 'scale(1.05)',
                  },
                  height: 150,
                }}
                onClick={() => handleViewDocument(url, documentType, label)}
              >
                <img
                  src={url}
                  alt={label}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                  }}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA3MEg2MFY5MEg4MFY3MFoiIGZpbGw9IiM5QzlDOUMiLz4KPHBhdGggZD0iTTEwMCA3MEgxMjBWOTBIMTAwVjcwWiIgZmlsbD0iIzlDOUM5QyIvPgo8cGF0aCBkPSJNNjAgNTBINzBWNTBINjBWNzBINjBWNTBaIiBmaWxsPSIjOUM5QzlDIi8+CjxwYXRoIGQ9Ik0xMjAgNTBIMTMwVjUwSDEyMFY3MEgxMjBWNTBaIiBmaWxsPSIjOUM5QzlDIi8+CjxwYXRoIGQ9Ik03MCA1MFY2MEg4MFY1MEg3MFoiIGZpbGw9IiM5QzlDOUMiLz4KPHBhdGggZD0iTTEwMCA1MFY2MEgxMTBWNTBIMTAwWiIgZmlsbD0iIzlDOUM5QyIvPgo8cGF0aCBkPSJNODAgNjBWNzBINzBWNjBIODBaIiBmaWxsPSIiOUM5QzlDIi8+CjxwYXRoIGQ9Ik0xMTAgNjBWNzBIMTAwVjYwSDExMFoiIGZpbGw9IiM5QzlDOUMiLz4KPHBhdGggZD0iTTYwIDkwVjEwMEg3MFY5MEg2MFoiIGZpbGw9IiM5QzlDOUMiLz4KPHBhdGggZD0iTTEzMCA5MFYxMDBIMTIwVjkwSDEzMFoiIGZpbGw9IiM5QzlDOUMiLz4KPHBhdGggZD0iTTcwIDEwMFY5MEg4MFYxMDBINzBaIiBmaWxsPSIjOUM5QzlDIi8+CjxwYXRoIGQ9Ik0xMDAgMTAwVjkwaDExMFYxMDBIMTAwWiIgZmlsbD0iIzlDOUM5QyIvPgo8L3N2Zz4K';
                  }}
                />

                <Box
                  className="preview-overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  <ViewIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
              </Box>
            </Tooltip>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            {/* <Tooltip title="View Full Document">
              <IconButton
                size="small"
                onClick={() => handleViewDocument(url, documentType, label)}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'primary.dark' },
                }}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip> */}

            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownloadDocument(url, label)}
              sx={{
                borderRadius: 1,
                textTransform: 'none',
                minWidth: '120px',
              }}
            >
              Download
            </Button>
          </Box>
        </Paper>
      </Grid>
    );
  };

  // Count fields with values for each section
  const personalInfoCount = [
    driver.name,
    driver.emp_id,
    driver.username,
    driver.email,
    driver.contact_number
  ].filter(val => hasValue(val)).length;

  const vehicleCount = [
    driver.vehicle_no,
    driver.vehicle_id,
    driver.bus_number
  ].filter(val => hasValue(val)).length;

  const licenseCount = [
    driver.driving_license_no,
    driver.license_no
  ].filter(val => hasValue(val)).length;

  const idProofCount = hasValue(driver.id_proof_no) ? 1 : 0;

  const documentsCount = [
    driver.driving_license,
    driver.id_proof
  ].filter(val => hasValue(val)).length;

  const activityCount = [
    driver.trip_count,
    driver.last_clock_in,
    driver.last_clock_out,
    driver.issue_type
  ].filter(val => hasValue(val)).length;

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        // Ensure consistent width during printing
        width: '100% !important',
        maxWidth: '1200px !important'
      }}
    >
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
              Driver Details
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Complete information for {driver.name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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

      {/* Driver Details Card - Resume Style */}
      <div
        ref={printRef}
        id="printable-area"
        style={{
          // Ensure consistent sizing
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        <Card
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 3,
            backgroundColor: 'background.paper',
            maxWidth: 1200,
            mx: 'auto',
            width: '100%',
            // Prevent layout shifts
            minHeight: isPrinting ? '297mm' : 'auto'
          }}
        >
          {/* Header Section with Photo and Basic Info */}
          <Box
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              p: { xs: 3, md: 4 },
              position: 'relative',
            }}
          >
            <Grid container spacing={4} alignItems="center" justifyContent="center">
              {/* Driver Photo */}
              <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    border: '4px solid white',
                    overflow: 'hidden',
                    boxShadow: 3,
                    flexShrink: 0,
                  }}
                >
                  {driver.driver_image ? (
                    <img
                      src={driver.driver_image}
                      alt={driver.name}
                      style={{
                        width: '200px',
                        height: '200px',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PersonIcon sx={{ fontSize: { xs: 40, md: 60 }, color: 'white' }} />
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Basic Information */}
              <Grid item xs={12} md={9} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    fontSize: { xs: '2rem', md: '3rem' },
                  }}
                >
                  {driver.name || 'Driver Name'}
                </Typography>
                {/* <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.9,
                    mb: 2,
                    fontStyle: 'italic',
                    fontSize: { xs: '1rem', md: '1.25rem' },
                  }}
                >
                  Professional Driver
                </Typography> */}

                <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  mt: 3,
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}>
                  {driver.emp_id && (
                    <Chip
                      icon={<BadgeIcon />}
                      label={`ID: ${driver.emp_id}`}
                      variant="outlined"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        borderColor: 'white'
                      }}
                    />
                  )}
                  {driver.vehicle_no && (
                    <Chip
                      icon={<CarIcon />}
                      label={`Vehicle: ${driver.vehicle_no}`}
                      variant="outlined"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        borderColor: 'white'
                      }}
                    />
                  )}
                  {driver.trip_count > 0 && (
                    <Chip
                      icon={<TripIcon />}
                      label={`${driver.trip_count} Trips`}
                      variant="outlined"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        borderColor: 'white'
                      }}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Content Section */}
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Grid container spacing={4} justifyContent="center">
              {/* Left Column - Personal & Contact Info */}
              <Grid item xs={12} md={5} lg={4}>
                {/* Personal Information */}
                {(personalInfoCount > 0) && (
                  <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, height: 'fit-content' }}>
                    <SectionHeader
                      icon={PersonIcon}
                      title="Personal Information"
                    // count={personalInfoCount}
                    />
                    <Divider sx={{ mb: 2 }} />
                    <InfoItem icon={BadgeIcon} label="Employee ID" value={driver.emp_id} />
                    <InfoItem icon={PersonIcon} label="Username" value={driver.username} />
                    <InfoItem icon={EmailIcon} label="Email" value={driver.email} />
                    <InfoItem icon={PhoneIcon} label="Contact Number" value={driver.contact_number} />
                  </Paper>
                )}

                {/* Vehicle Assignment */}
                {(vehicleCount > 0) && (
                  <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <SectionHeader
                      icon={CarIcon}
                      title="Vehicle Assignment"
                    />
                    <Divider sx={{ mb: 2 }} />

                    {hasValue(driver.vehicle_no) && (
                      <InfoItem
                        icon={CarIcon}
                        label="Assigned Vehicle"
                        value={driver.vehicle_no}
                      />
                    )}

                    {driver.bus_number && (
                      <InfoItem
                        icon={BadgeIcon}
                        label="Bus Number"
                        value={driver.bus_number}
                      />
                    )}
                  </Paper>
                )}

                {/* Activity Summary */}
                {(activityCount > 0) && (
                  <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <SectionHeader
                      icon={TripIcon}
                      title="Activity Summary"
                    // count={activityCount}
                    />
                    <Divider sx={{ mb: 2 }} />

                    {hasValue(driver.trip_count) && (
                      <InfoItem
                        icon={TripIcon}
                        label="Total Trips"
                        value={driver.trip_count}
                        color="success"
                      />
                    )}

                    {hasValue(driver.last_clock_in) && (
                      <InfoItem
                        icon={CalendarIcon}
                        label="Last Clock In"
                        value={formatDate(driver.last_clock_in)}
                        color="info"
                      />
                    )}

                    {hasValue(driver.last_clock_out) && (
                      <InfoItem
                        icon={CalendarIcon}
                        label="Last Clock Out"
                        value={formatDate(driver.last_clock_out)}
                        color="info"
                      />
                    )}

                    {hasValue(driver.issue_type) && (
                      <InfoItem
                        icon={TicketIcon}
                        label="Latest Issue"
                        value={driver.issue_type}
                        color="warning"
                      />
                    )}

                    {hasValue(driver.description) && (
                      <InfoItem
                        icon={TicketIcon}
                        label="Issue Description"
                        value={driver.description}
                        color="warning"
                      />
                    )}
                  </Paper>
                )}
              </Grid>

              {/* Right Column - Professional Details & Documents */}
              <Grid item xs={12} md={7} lg={8}>
                {/* License Information */}
                {(licenseCount > 0) && (
                  <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <SectionHeader
                      icon={BadgeIcon}
                      title="License Information"
                    // count={licenseCount}
                    />
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                      {hasValue(driver.driving_license_no) && (
                        <Grid item xs={12} md={6}>
                          <InfoItem icon={BadgeIcon} label="Driving License No" value={driver.driving_license_no} />
                        </Grid>
                      )}
                      {hasValue(driver.license_no) && (
                        <Grid item xs={12} md={6}>
                          <InfoItem icon={DocumentIcon} label="License Number" value={driver.license_no} />
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                )}

                {/* ID Proof Information */}
                {(idProofCount > 0) && (
                  <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <SectionHeader
                      icon={DocumentIcon}
                      title="ID Proof Information"
                    // count={idProofCount}
                    />
                    <Divider sx={{ mb: 2 }} />
                    <InfoItem icon={DocumentIcon} label="ID Proof Number" value={driver.id_proof_no} />
                  </Paper>
                )}

                {/* Documents Section */}
                {(documentsCount > 0) && (
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                    <SectionHeader
                      icon={DocumentIcon}
                      title="Documents"
                    // count={documentsCount}
                    />
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={2}>
                      <DocumentItem
                        label="Driving License"
                        url={driver.driving_license}
                        documentType="driving_license"
                      />
                      <DocumentItem
                        label="ID Proof Document"
                        url={driver.id_proof}
                        documentType="id_proof"
                      />
                    </Grid>
                  </Paper>
                )}

                {/* Empty State Message */}
                {personalInfoCount === 0 && vehicleCount === 0 && licenseCount === 0 &&
                  idProofCount === 0 && documentsCount === 0 && activityCount === 0 && (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Information Available
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This driver profile doesn't have any information filled out yet.
                      </Typography>
                    </Paper>
                  )}
              </Grid>
            </Grid>
          </Box>
        </Card>
      </div>

      {/* Document View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 64px)' },
            maxWidth: '1200px',
            height: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 64px)' },
            maxHeight: '90vh',
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {currentDocument && (
            <>
              {/* Header with title and close button */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  p: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  zIndex: 1,
                }}
              >
                <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  {currentDocument.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Download Document">
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadDocument(currentDocument.url, currentDocument.name)}
                      sx={{ color: 'white' }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Close">
                    <IconButton
                      size="small"
                      onClick={handleCloseViewDialog}
                      sx={{ color: 'white' }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Document image with responsive sizing */}
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 0, sm: 1 },
                  pt: { xs: 4, sm: 5 },
                  overflow: 'auto',
                }}
              >
                <img
                  src={currentDocument.url}
                  alt={currentDocument.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '4px',
                  }}
                />
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Styles */}
      <style>
        {`
  @media print {
    body {
      margin: 0;
      background-color: white !important;
    }

    body * {
      visibility: hidden;
      box-sizing: border-box;
    }

    #printable-area,
    #printable-area * {
      visibility: visible;
    }

    #printable-area {
      position: relative !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      max-width: 1200px !important;
      margin: 0 auto !important;
      padding: 0 !important;
      background-color: white !important;
      transform: none !important;
    }

    /* Force fixed layout for Grids and Cards */
    .MuiGrid-container {
      display: flex !important;
      flex-wrap: wrap !important;
    }
    .MuiGrid-item {
      display: flex !important;
      flex-direction: column !important;
    }
    .MuiPaper-root {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* Hide UI elements not needed in print */
    .no-print {
      display: none !important;
    }

    @page {
      size: A4;
      margin: 15mm;
    }
  }
`}
      </style>

    </Container>
  );
};

export default ViewDriver;