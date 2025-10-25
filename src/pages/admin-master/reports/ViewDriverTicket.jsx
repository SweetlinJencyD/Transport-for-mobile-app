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
  BugReport as BugIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Badge as BadgeIcon,
  PhotoCamera as PhotoIcon,
  PriorityHigh as PriorityIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ViewDriverTicket = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticket = location.state?.ticket;
  const printRef = useRef();

  if (!ticket) {
    return (
      <Container sx={{ py: 5 }}>
        {/* <Alert severity="error" sx={{ mb: 2 }}>
          No ticket data found. Please go back and select a ticket.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/report-driverTicket')}
        >
          Back to Tickets
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

    pdf.save(`ticket-${ticket.ticket_id}-details.pdf`);
  };

  const handleBack = () => navigate('/report-driverTicket');

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

  const getPriorityChip = (priority) => {
    if (!priority) return <Chip label="Unknown" color="default" sx={{ fontWeight: 'bold' }} />;
    
    const priorityLower = String(priority).toLowerCase();
    if (priorityLower === 'high' || priorityLower === 'urgent') {
      return <Chip label={priority} color="error" sx={{ fontWeight: 'bold' }} />;
    } else if (priorityLower === 'medium') {
      return <Chip label={priority} color="warning" sx={{ fontWeight: 'bold' }} />;
    } else if (priorityLower === 'low') {
      return <Chip label={priority} color="success" sx={{ fontWeight: 'bold' }} />;
    } else {
      return <Chip label={priority} color="default" sx={{ fontWeight: 'bold' }} />;
    }
  };

  
const getFlagChip = (flag) => {
  switch (flag) {
    case 1:
      return <Chip label="On Progress" color="warning" variant="filled" />;
    case 2:
      return <Chip label=" Ticket Resolved" color="success" variant="filled" />;
    default:
      return <Chip label="Unknown" color="default" variant="outlined" />;
  }
};

  // const getFlagChip = (flag) => {
  //   const flagString = String(flag || 'Unknown');
    
  //   const flagLower = flagString.toLowerCase();
  //   if (flagLower === 'resolved' || flagLower === 'completed' || flagLower === '1') {
  //     return <Chip label={flagString} color="success" sx={{ fontWeight: 'bold' }} />;
  //   } else if (flagLower === 'in progress' || flagLower === 'pending' || flagLower === '2') {
  //     return <Chip label={flagString} color="warning" sx={{ fontWeight: 'bold' }} />;
  //   } else if (flagLower === 'open' || flagLower === 'new' || flagLower === '0') {
  //     return <Chip label={flagString} color="info" sx={{ fontWeight: 'bold' }} />;
  //   } else {
  //     return <Chip label={flagString} color="default" sx={{ fontWeight: 'bold' }} />;
  //   }
  // };

  const formatDateTime = (date, time) => {
    if (!date || date === 'N/A') return 'Not Available';
    return `${date} ${time ? time : ''}`.trim();
  };

  // Ticket Information Section
  const renderTicketInformation = () => (
    <Box>
      <SectionHeader icon={BadgeIcon} title="Ticket Information" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          <FieldItem label="Ticket ID" value={ticket.ticket_id} />
          <FieldItem label="Issue Type" value={ticket.issue_type} />
          <FieldItem label="Priority" value={getPriorityChip(ticket.priority)} />
          <FieldItem label="Status" value={getFlagChip(ticket.flag)} />
          <FieldItem label="Vehicle Number" value={ticket.vehicle_no} />
          <FieldItem label="Bus Number" value={ticket.bus_number} />
        </Grid>
      </Paper>
    </Box>
  );

  // Date & Time Information Section
  const renderDateTimeInformation = () => (
    <Box>
      <SectionHeader icon={EventIcon} title="Date & Time Information" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          <FieldItem 
            label="Report Date" 
            value={ticket.date || 'Not Available'} 
          />
          <FieldItem 
            label="Report Time" 
            value={ticket.time || 'Not Available'} 
          />
          <FieldItem 
            label="Full Timestamp" 
            value={formatDateTime(ticket.date, ticket.time)} 
          />
        </Grid>
      </Paper>
    </Box>
  );

  // Description Section
  const renderDescription = () => (
    <Box>
      <SectionHeader icon={DescriptionIcon} title="Issue Description" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                p: 3,
                minHeight: '120px',
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
                Description:
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  flex: 1,
                  backgroundColor: 'background.default',
                  minHeight: '80px'
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 'medium',
                    lineHeight: 1.6
                  }}
                >
                  {ticket.description || 'No description provided'}
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  // Photo Section
  const renderPhoto = () => (
    <Box>
      <SectionHeader icon={PhotoIcon} title="Ticket Photo" />
      <Paper
        sx={{
          p: 3,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Issue Photo
              </Typography>
              {ticket.photo ? (
                <>
                  <img
                    src={ticket.photo}
                    alt={`Issue photo for ticket ${ticket.ticket_id}`}
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      height: '300px',
                      objectFit: 'contain',
                      border: '2px solid #e0e0e0',
                      borderRadius: 4,
                      backgroundColor: '#f5f5f5',
                    }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() =>
                      handleDownloadImage(
                        ticket.photo,
                        `Ticket-Photo-${ticket.ticket_id}.png`
                      )
                    }
                    sx={{ mt: 2, borderRadius: 2 }}
                  >
                    Download Photo
                  </Button>
                </>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: '400px',
                    height: '300px',
                    border: '2px dashed #e0e0e0',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fafafa',
                    margin: '0 auto',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No Photo Available
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  // Summary Section
  const renderSummary = () => (
    <Box>
      <SectionHeader icon={BugIcon} title="Ticket Summary" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          <FieldItem 
            label="Issue Type" 
            value={ticket.issue_type || 'Not Specified'} 
          />
          <FieldItem 
            label="Priority Level" 
            value={getPriorityChip(ticket.priority)} 
          />
          <FieldItem 
            label="Current Status" 
            value={getFlagChip(ticket.flag)} 
          />
          <FieldItem 
            label="Vehicle" 
            value={ticket.vehicle_no || 'N/A'} 
          />
          <FieldItem 
            label="Bus Number" 
            value={ticket.bus_number || 'N/A'} 
          />
          <FieldItem 
            label="Reported On" 
            value={formatDateTime(ticket.date, ticket.time)} 
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
              Ticket Details
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Complete information for Ticket {ticket.ticket_id}
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

      {/* Ticket Details Card */}
      <div ref={printRef} id="printable-area">
        <Card
          sx={{
            p: 4,
            borderRadius: 0,
            backgroundColor: 'background.paper',
          }}
        >
          {/* Ticket Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}
            >
              {ticket.issue_type || 'Support Ticket'}
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
                label={`Ticket ID: ${ticket.ticket_id}`}
                color="primary"
                sx={{ fontWeight: 'bold' }}
              />
              <Chip
                label={`Vehicle: ${ticket.vehicle_no}`}
                color="secondary"
                sx={{ fontWeight: 'bold' }}
              />
              {getPriorityChip(ticket.priority)}
              {getFlagChip(ticket.flag)}
            </Box>
          </Box>

          {/* Render all sections */}
          {renderTicketInformation()}
          {renderDateTimeInformation()}
          {renderDescription()}
          {renderSummary()}
          {renderPhoto()}

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

export default ViewDriverTicket;