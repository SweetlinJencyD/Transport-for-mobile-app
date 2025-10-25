import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Typography,
  Box,
  Grid,
  Chip,
  Paper,
  Container,
  Button,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Speed as SpeedIcon,
  CalendarToday as CalendarIcon,
  Build as ServiceIcon,
  LocalGasStation as FuelIcon,
  CheckCircle as ActiveIcon,
  Warning as WarningIcon,
  DocumentScanner as DocumentIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const VehicleInfo = () => {
  const navigate = useNavigate();
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const printRef = useRef();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchVehicleInfo();
  }, []);

  const fetchVehicleInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const driverResponse = await fetch(`${API_BASE_URL}/user-details`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!driverResponse.ok) throw new Error('Failed to fetch driver info');
      const driverData = await driverResponse.json();

      const vehicleResponse = await fetch(`${API_BASE_URL}/vehicle_list`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!vehicleResponse.ok) throw new Error('Failed to fetch vehicle data');

      const vehicles = await vehicleResponse.json();
      const assignedVehicle = vehicles.find(v => v.driver_name === driverData.name);

      if (assignedVehicle) setVehicleData(assignedVehicle);
      else setError('No vehicle assigned to your account');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasValue = (value) =>
    value && value !== '' && value !== '0' && value !== 'null' && value !== 'undefined';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const isServiceDueSoon = (serviceDate) => {
    if (!serviceDate) return false;
    const days = Math.ceil((new Date(serviceDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 30 && days > 0;
  };

  const isServiceOverdue = (serviceDate) => {
    if (!serviceDate) return false;
    return new Date(serviceDate) < new Date();
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 0.7);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`vehicle-${vehicleData.vehicle_no}-details.pdf`);
  };

  const handleBack = () => navigate(-1);

  const handleDownloadDocument = async (url, documentName) => {
    if (!url) return;
    try {
      const fileExtension = url.split('.').pop().split('?')[0];
      const extension = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'].includes(fileExtension.toLowerCase())
        ? fileExtension
        : 'jpg';
      const fileName = `${documentName.replace(/\s+/g, '_')}.${extension}`;
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleViewDocument = (url, documentType, documentName) => {
    if (!url) return;
    setCurrentDocument({ url, type: documentType, name: documentName });
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setCurrentDocument(null);
  };

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
      {count > 0 && <Chip label={count} size="small" color="primary" variant="outlined" />}
    </Box>
  );

  const InfoItem = ({ icon: Icon, label, value, color = 'primary' }) => {
    if (!hasValue(value)) return null;
    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5 }}>
        <Icon sx={{ fontSize: '1.2rem', color: `${color}.main`, mr: 2, mt: 0.5, flexShrink: 0 }} />
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

  const DocumentItem = ({ label, url, documentType, number, expiry }) => {
    if (!hasValue(url)) return null;
    return (
      <Grid item xs={12} sm={6}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '&:hover': { boxShadow: 2, borderColor: 'primary.main' },
            transition: 'all 0.3s ease',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
            {label}
          </Typography>
          {number && <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>{number}</Typography>}
          {expiry && (
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon sx={{ fontSize: 16 }} />
              Expires: {formatDate(expiry)}
            </Typography>
          )}
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
                  height: 150,
                  '&:hover .preview-overlay': { opacity: 1 },
                  '&:hover img': { transform: 'scale(1.05)' },
                }}
                onClick={() => handleViewDocument(url, documentType, label)}
              >
                <img
                  src={url}
                  alt={label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  onError={(e) => { e.target.src = 'data:image/svg+xml;base64,...'; }}
                />
                <Box
                  className="preview-overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
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
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownloadDocument(url, label)}
              sx={{ borderRadius: 1, textTransform: 'none', minWidth: '120px' }}
            >
              Download
            </Button>
          </Box>
        </Paper>
      </Grid>
    );
  };

  if (loading) return (
    <Container sx={{ py: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <CircularProgress size={40} />
    </Container>
  );

  if (error) return (
    <Container sx={{ py: 5 }}>
      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Go Back</Button>
    </Container>
  );

  if (!vehicleData) return (
    <Container sx={{ py: 5 }}>
      <Alert severity="info" sx={{ mb: 2 }}>No vehicle data available.</Alert>
      <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Go Back</Button>
    </Container>
  );

  // Calculate counts for sections
  const basicInfoCount = [vehicleData.vehicle_id, vehicleData.bus_number, vehicleData.gps, vehicleData.dlf_filling].filter(hasValue).length;
  const specificationsCount = [vehicleData.diesel_per_km, vehicleData.tyre_count, vehicleData.cameras].filter(hasValue).length;
  const serviceCount = [vehicleData.service_date, vehicleData.wheel_alignment_date].filter(hasValue).length;
  const tyreCount = [vehicleData.front_left_tyre_status, vehicleData.front_right_tyre_status, vehicleData.rear_left_tyre_status, vehicleData.rear_right_tyre_status].filter(hasValue).length;
  const documentsCount = [vehicleData.rc_document, vehicleData.insurance_document, vehicleData.permit_doc, vehicleData.fitness_certificate_doc, vehicleData.emission_certificate_doc].filter(hasValue).length;
  const additionalInfoCount = [vehicleData.tax, vehicleData.battery_sts, vehicleData.others].filter(hasValue).length;

  const serviceStatus = isServiceOverdue(vehicleData.service_date) ? 'error' : isServiceDueSoon(vehicleData.service_date) ? 'warning' : 'success';

  return (
    <Container maxWidth="lg" sx={{ py: 4, width: '100% !important', maxWidth: '1200px !important' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }} className="no-print">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconButton onClick={handleBack} color="primary" sx={{ backgroundColor: 'primary.light', color: 'white', '&:hover': { backgroundColor: 'primary.main' } }}>
              <ArrowBackIcon />
            </IconButton>
          </motion.div>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Vehicle Details</Typography>
            <Typography variant="subtitle1" color="text.secondary">Complete information for {vehicleData.vehicle_no}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ borderRadius: 2 }}>Print</Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="contained" startIcon={<PdfIcon />} onClick={handleDownloadPDF} sx={{ borderRadius: 2 }}>Download PDF</Button>
          </motion.div>
        </Box>
      </Box>

      {/* Vehicle Details */}
      <div ref={printRef} id="printable-area" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3, backgroundColor: 'background.paper', maxWidth: 1200, mx: 'auto', width: '100%' }}>
          {/* Header with Vehicle Image and Info */}
          <Box sx={{ backgroundColor: 'primary.main', color: 'white', p: { xs: 3, md: 4 }, position: 'relative' }}>
            <Grid container spacing={4} alignItems="center" justifyContent="center">
              <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: 200, height: 200, borderRadius: '50%', border: '4px solid white', overflow: 'hidden', boxShadow: 3, flexShrink: 0 }}>
                  {vehicleData.vehicle_image ? <img src={vehicleData.vehicle_image} alt={vehicleData.vehicle_no} style={{ width: '200px', height: '200px', objectFit: 'cover' }} /> : <Box sx={{ width: '100%', height: '100%', backgroundColor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CarIcon sx={{ fontSize: { xs: 40, md: 60 }, color: 'white' }} /></Box>}
                </Box>
              </Grid>
              <Grid item xs={12} md={9}>
                <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                  <Grid item xs={12} md={8}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, textShadow: '1px 1px 2px rgba(0,0,0,0.3)', fontSize: { xs: '2rem', md: '3rem' } }}>
                      {vehicleData.vehicle_no || 'Vehicle Number'}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 2, fontStyle: 'italic', fontSize: { xs: '1rem', md: '1.25rem' } }}>
                      {vehicleData.bus_number} • {vehicleData.vehicle_id}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
                      {vehicleData.vehicle_status && <Chip icon={<ActiveIcon />} label={`Status: ${vehicleData.vehicle_status}`} variant="outlined" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'white' }} />}
                      {vehicleData.service_status && <Chip icon={<ServiceIcon />} label={`Service: ${vehicleData.service_status}`} variant="outlined" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'white' }} />}
                      {vehicleData.tyre_count && <Chip icon={<SpeedIcon />} label={`${vehicleData.tyre_count} Tyres`} variant="outlined" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'white' }} />}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>

          {/* Content Section */}
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Grid container spacing={4} justifyContent="center">
              {/* Vehicle Info & Specifications */}
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  {basicInfoCount > 0 && (
                    <Grid item xs={12} md={6}>
                      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, height: 'fit-content' }}>
                        <SectionHeader icon={CarIcon} title="Vehicle Information" />
                        <Divider sx={{ mb: 2 }} />
                        <InfoItem icon={CarIcon} label="Vehicle ID" value={vehicleData.vehicle_id} />
                        <InfoItem icon={CarIcon} label="Bus Number" value={vehicleData.bus_number} />
                        <InfoItem icon={CarIcon} label="GPS" value={vehicleData.gps} />
                        <InfoItem icon={FuelIcon} label="DLF Filling" value={vehicleData.dlf_filling} />
                      </Paper>
                    </Grid>
                  )}
                  {specificationsCount > 0 && (
                    <Grid item xs={12} md={6}>
                      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, height: 'fit-content' }}>
                        <SectionHeader icon={SpeedIcon} title="Specifications" />
                        <Divider sx={{ mb: 2 }} />
                        <InfoItem icon={FuelIcon} label="Fuel Efficiency" value={vehicleData.diesel_per_km ? `${vehicleData.diesel_per_km} km/l` : null} />
                        <InfoItem icon={SpeedIcon} label="Tyre Count" value={vehicleData.tyre_count} />
                        <InfoItem icon={CarIcon} label="Cameras" value={vehicleData.cameras} />
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Grid>

              {/* Service & Additional Info */}
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  {(serviceCount > 0 || tyreCount > 0) && (
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, height: 'fit-content' }}>
                        <SectionHeader icon={ServiceIcon} title="Service & Maintenance" />
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                          {vehicleData.service_date && <Grid item xs={12} md={6}><InfoItem icon={ServiceIcon} label="Next Service" value={formatDate(vehicleData.service_date)} color={serviceStatus} /></Grid>}
                          {vehicleData.wheel_alignment_date && <Grid item xs={12} md={6}><InfoItem icon={ServiceIcon} label="Wheel Alignment" value={formatDate(vehicleData.wheel_alignment_date)} /></Grid>}
                        </Grid>
                        {tyreCount > 0 && (
                          <>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Tyre Status</Typography>
                            <Grid container spacing={2}>
                              {vehicleData.front_left_tyre_status && <Grid item xs={12} sm={6}><InfoItem icon={SpeedIcon} label="Front Left Tyre" value={vehicleData.front_left_tyre_status} /></Grid>}
                              {vehicleData.front_right_tyre_status && <Grid item xs={12} sm={6}><InfoItem icon={SpeedIcon} label="Front Right Tyre" value={vehicleData.front_right_tyre_status} /></Grid>}
                              {vehicleData.rear_left_tyre_status && <Grid item xs={12} sm={6}><InfoItem icon={SpeedIcon} label="Rear Left Tyre" value={vehicleData.rear_left_tyre_status} /></Grid>}
                              {vehicleData.rear_right_tyre_status && <Grid item xs={12} sm={6}><InfoItem icon={SpeedIcon} label="Rear Right Tyre" value={vehicleData.rear_right_tyre_status} /></Grid>}
                            </Grid>
                          </>
                        )}
                      </Paper>
                    </Grid>
                  )}
                  {additionalInfoCount > 0 && (
                    <Grid item xs={12} md={6}>
                      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, height: 'fit-content' }}>
                        <SectionHeader icon={WarningIcon} title="Additional Information" />
                        <Divider sx={{ mb: 2 }} />
                        <InfoItem icon={WarningIcon} label="Tax" value={vehicleData.tax} />
                        <InfoItem icon={WarningIcon} label="Battery Status" value={vehicleData.battery_sts} />
                        <InfoItem icon={WarningIcon} label="Remarks" value={vehicleData.others} />
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Grid>

              {/* Documents */}
              {documentsCount > 0 && (
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                    <SectionHeader icon={DocumentIcon} title="Documents & Certificates" />
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={2}>
                      <DocumentItem label="Registration Certificate" url={vehicleData.rc_document} documentType="rc_document" number={vehicleData.rc_number} />
                      <DocumentItem label="Insurance" url={vehicleData.insurance_document} documentType="insurance_document" number={vehicleData.insurance_number} expiry={vehicleData.insurance_expiry} />
                      <DocumentItem label="Permit" url={vehicleData.permit_doc} documentType="permit_doc" number={vehicleData.permit_no} expiry={vehicleData.permit_expiry} />
                      <DocumentItem label="Fitness Certificate" url={vehicleData.fitness_certificate_doc} documentType="fitness_certificate_doc" number={vehicleData.fitness_certificate_no} expiry={vehicleData.fitness_expiry} />
                      <DocumentItem label="Emission Certificate" url={vehicleData.emission_certificate_doc} documentType="emission_certificate_doc" number={vehicleData.emission_certificate_no} expiry={vehicleData.emission_expiry} />
                    </Grid>
                  </Paper>
                </Grid>
              )}

              {/* Empty State */}
              {basicInfoCount + specificationsCount + serviceCount + tyreCount + documentsCount + additionalInfoCount === 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>No Information Available</Typography>
                    <Typography variant="body2" color="text.secondary">This vehicle profile doesn't have any information filled out yet.</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        </Card>
      </div>

      {/* Document View Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth={false} sx={{ '& .MuiDialog-paper': { margin: { xs: 1, sm: 2 }, width: { xs: '300px', sm: '400px', md: '500px' }, height: { xs: '200px', sm: '300px', md: '400px' }, maxWidth: '1200px', maxHeight: '90vh' } }}>
        <DialogContent sx={{ p: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {currentDocument && (
            <>
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'primary.main', color: 'white', p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>{currentDocument.name}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Download Document">
                    <IconButton size="small" onClick={() => handleDownloadDocument(currentDocument.url, currentDocument.name)} sx={{ color: 'white' }}><DownloadIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Close">
                    <IconButton size="small" onClick={handleCloseViewDialog} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 0, sm: 1 }, pt: { xs: 4, sm: 5 }, overflow: 'auto' }}>
                <img src={currentDocument.url} alt={currentDocument.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }} />
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Styles */}
      <style>{`@media print { body { margin: 0; background-color: white !important; } body * { visibility: hidden; box-sizing: border-box; } #printable-area, #printable-area * { visibility: visible; } #printable-area { position: relative !important; left: 0 !important; top: 0 !important; width: 100% !important; max-width: 1200px !important; margin: 0 auto !important; padding: 0 !important; background-color: white !important; transform: none !important; } .MuiGrid-container { display: flex !important; flex-wrap: wrap !important; } .MuiGrid-item { display: flex !important; flex-direction: column !important; } .MuiPaper-root { break-inside: avoid; page-break-inside: avoid; } .no-print { display: none !important; } @page { size: A4; margin: 15mm; }`}</style>
    </Container>
  );
};

export default VehicleInfo;
