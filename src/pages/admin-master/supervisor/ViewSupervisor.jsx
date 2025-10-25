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
  Person as PersonIcon,
  Email as EmailIcon,
  Groups as GroupsIcon,
  Badge as BadgeIcon,
  ContactMail as ContactIcon,
  GroupWork as GroupWorkIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ViewSupervisor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const supervisor = location.state?.supervisor;
  const printRef = useRef();

  if (!supervisor) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          No supervisor data found. Please go back and select a supervisor.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/list-supervisor')}
        >
          Back to Supervisor List
        </Button>
      </Container>
    );
  }

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`supervisor-${supervisor.name}-details.pdf`);
  };

  const handleBack = () => navigate('/list-supervisor');

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
          {supervisor.name && <FieldItem label="Full Name" value={supervisor.name} />}
          {supervisor.emp_id && <FieldItem label="Employee ID" value={supervisor.emp_id} />}
          {supervisor.username && <FieldItem label="Username" value={supervisor.username} />}
          {supervisor.email && <FieldItem label="Email" value={supervisor.email} />}
        </Grid>
      </Paper>
    </Box>
  );

  // Group Assignment Section
  const renderGroupAssignment = () => (
    <Box>
      <SectionHeader icon={GroupsIcon} title="Group Assignments" />
      <Paper sx={{ p: 3, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        {supervisor.groups && supervisor.groups.length > 0 ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                Assigned Groups ({supervisor.groups.length})
              </Typography>
            </Grid>
            {supervisor.groups.map((group, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'primary.light',
                    backgroundColor: 'primary.light + 08',
                    borderRadius: 2,
                    textAlign: 'center'
                  }}
                >
                  <GroupWorkIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {group}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Group {index + 1}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <GroupsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No Groups Assigned
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This supervisor is not assigned to any groups yet.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );

  // Group IDs Section (Detailed View)
  const renderGroupIDs = () => (
    <Box>
      <SectionHeader icon={BadgeIcon} title="Group IDs" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          {supervisor.group_ids && supervisor.group_ids.length > 0 ? (
            <Grid item xs={12}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                  Assigned Group IDs
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {supervisor.group_ids.map((groupId, index) => (
                    <Chip
                      key={groupId}
                      label={`Group ID: ${groupId}`}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 'bold' }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No Group IDs assigned
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );

  // Summary Information Section
  const renderSummaryInformation = () => (
    <Box>
      <SectionHeader icon={ContactIcon} title="Summary Information" />
      <Paper sx={{ p: 0, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Grid container>
          <FieldItem 
            label="Total Groups" 
            value={
              <Chip 
                label={supervisor.groups?.length || 0} 
                color="primary" 
                sx={{ fontWeight: 'bold', fontSize: '1rem' }}
              />
            } 
          />
          <FieldItem 
            label="Assignment Status" 
            value={
              <Chip 
                label={supervisor.groups?.length > 0 ? "Assigned" : "Unassigned"} 
                color={supervisor.groups?.length > 0 ? "success" : "warning"}
                sx={{ fontWeight: 'bold' }}
              />
            } 
          />
          <FieldItem 
            label="User ID" 
            value={supervisor.id} 
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
              Supervisor Details
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Complete information for {supervisor.name}
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

      {/* Supervisor Details Card */}
      <div ref={printRef} id="printable-area">
        <Card
          sx={{
            p: 4,
            borderRadius: 0,
            backgroundColor: 'background.paper',
          }}
        >
          {/* Supervisor Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}
            >
              {supervisor.name}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              {supervisor.emp_id && (
                <Chip
                  label={`Employee ID: ${supervisor.emp_id}`}
                  color="primary"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
              {supervisor.groups && supervisor.groups.length > 0 && (
                <Chip
                  label={`Groups: ${supervisor.groups.length}`}
                  color="secondary"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
              <Chip
                label="Supervisor"
                color="success"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </Box>

          {/* Render all sections */}
          {renderPersonalInformation()}
          {renderGroupAssignment()}
          {renderGroupIDs()}
          {renderSummaryInformation()}
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

export default ViewSupervisor;