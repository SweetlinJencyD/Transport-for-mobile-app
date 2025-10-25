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
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  ContactMail as ContactIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ViewAttendee = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const attendee = location.state?.attendee;
  const printRef = useRef();

  if (!attendee) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          No attendee data found. Please go back and select an attendee.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/list-attendee')}
        >
          Back to Attendee List
        </Button>
      </Container>
    );
  }


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
    console.error('Error downloading attendee document image:', error);
  }
};


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

    pdf.save(`attendee-${attendee.attendee}-details.pdf`);
  };

  const handleBack = () => navigate('/list-attendee');

  const SectionHeader = ({ icon: Icon, title }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 4 }}>
      <Icon color="primary" sx={{ mr: 2, fontSize: '1.5rem' }} />
      <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {title}
      </Typography>
    </Box>
  );

  // Field Item Component for 3-column layout
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

  // Personal Information Section
  const renderPersonalInformation = () => (
    <Box>
      <SectionHeader icon={PersonIcon} title="Personal Information" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          {attendee.name && <FieldItem label="Full Name" value={attendee.name} />}
          {attendee.emp_id && <FieldItem label="Employee ID" value={attendee.emp_id} />}
          {attendee.username && <FieldItem label="Username" value={attendee.username} />}
          {attendee.email && <FieldItem label="Email" value={attendee.email} />}
          {attendee.contact_number && <FieldItem label="Contact Number" value={attendee.contact_number} />}
        </Grid>
      </Paper>
    </Box>
  );

  // ID Proof Information Section
  const renderIDProofInformation = () => (
    <Box>
      <SectionHeader icon={BadgeIcon} title="ID Proof Information" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          {attendee.id_proof_no && <FieldItem label="ID Proof Number" value={attendee.id_proof_no} />}
        </Grid>
      </Paper>
    </Box>
  );

  // Status Information Section
  const renderStatusInformation = () => (
    <Box>
      <SectionHeader icon={ContactIcon} title="Status Information" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          {attendee.status && (
            <FieldItem 
              label="Status" 
              value={
                <Chip 
                  label={attendee.status === 1 ? "Active" : "Inactive"} 
                  color={attendee.status === 1 ? "success" : "error"}
                  sx={{ fontWeight: 'bold' }}
                />
              } 
            />
          )}
        </Grid>
      </Paper>
    </Box>
  );

  // Documents Section
 const renderDocuments = () => (
  <Box>
    <SectionHeader icon={DocumentIcon} title="Documents" />
    <Paper
      sx={{
        p: 3,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Grid container spacing={2}>
        {attendee.id_proof && (
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <img
                src={attendee.id_proof}
                alt={`ID Proof of ${attendee.name}`}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                }}
              />
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() =>
                  handleDownloadDocumentImage(
                    attendee.id_proof,
                    `ID-Proof-${attendee.name || 'attendee'}.png`
                  )
                }
                sx={{ mt: 1, borderRadius: 2 }}
              >
                Download ID Proof
              </Button>
            </Box>
          </Grid>
        )}

        {/* Add more document types if needed */}
        {attendee.address_proof && (
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <img
                src={attendee.address_proof}
                alt={`Address Proof of ${attendee.name}`}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'contain',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                }}
              />
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() =>
                  handleDownloadDocumentImage(
                    attendee.address_proof,
                    `Address-Proof-${attendee.name || 'attendee'}.png`
                  )
                }
                sx={{ mt: 1, borderRadius: 2 }}
              >
                Download Address Proof
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
              Attendee Details
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Complete information for {attendee.name}
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

      {/* Attendee Details Card */}
      <div ref={printRef} id="printable-area">
        <Card
          sx={{
            p: 4,
            borderRadius: 0,
            backgroundColor: 'background.paper',
          }}
        >
          {/* Attendee Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}
            >
              {attendee.name}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              {attendee.emp_id && (
                <Chip
                  label={`Employee ID: ${attendee.emp_id}`}
                  color="primary"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
              {attendee.status && (
                <Chip
                  label={`Status: ${attendee.status === 1 ? "Active" : "Inactive"}`}
                  color={attendee.status === 1 ? "success" : "error"}
                  sx={{ fontWeight: 'bold' }}
                />
              )}
            </Box>
          </Box>

          {/* Attendee Image */}
          {attendee.attendee_img && (
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <img
                src={attendee.attendee_img}
                alt="Attendee"
                style={{
                  maxWidth: '300px',
                  maxHeight: '300px',
                  objectFit: 'cover',
                  borderRadius: '0px',
                  border: '2px solid #e0e0e0',
                }}
              />
            </Box>
          )}

          {/* Render all sections */}
          {renderPersonalInformation()}
          {renderIDProofInformation()}
          {renderStatusInformation()}
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

export default ViewAttendee;