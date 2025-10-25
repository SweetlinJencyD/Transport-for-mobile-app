import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
  Paper,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const DriverClockIn = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tokenExpired, setTokenExpired] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Check token expiration
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

  useEffect(() => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTokenExpired(true);
      return;
    }
    fetchDriverReports();
  }, []);

  const handleTokenExpiredClose = () => {
    setTokenExpired(false);
    window.location.href = '/login';
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchDriverReports = async () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Unauthorized: Please login first');
      setLoading(false);
      return;
    }

    try {
      const params = {};
      if (fromDate) params.from_date = fromDate.toISOString().split('T')[0];
      if (toDate) params.to_date = toDate.toISOString().split('T')[0];

      const res = await axios.get(`${API_BASE_URL}/driver/clock-report`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setReports(res.data.clock_report || []);
      if (res.data.clock_report && res.data.clock_report.length === 0) {
        showSnackbar('No trip records found for selected date(s)', 'info');
      }
    } catch (error) {
      console.error('Error fetching driver reports:', error);
      if (error.response?.status === 401) {
        setTokenExpired(true);
        localStorage.removeItem('token');
        setError('Session expired. Please login again.');
      } else if (error.response?.status === 404) {
        setReports([]);
        setError('No trip records found for selected date(s)');
        showSnackbar('No trip records found for selected date(s)', 'info');
      } else {
        setError('Failed to fetch driver clock reports');
      }
    } finally {
      setLoading(false);
    }
  };

const handleViewDetails = (report) => {
  if (!checkTokenExpiration()) {
    setTokenExpired(true);
    return;
  }
  navigate('/report-viewDriverClockin', { state: { report } });
};

  const handleCloseDetailDialog = () => {
    setDetailDialog(false);
    setSelectedReport(null);
  };

  const handleExport = () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    if (filteredReports.length === 0) {
      showSnackbar('No data to export', 'warning');
      return;
    }

    try {
      const headers = [
        'Trip ID',
        'Driver Name',
        'Vehicle Number',
        'Clock In Date',
        'Clock In Time',
        'Clock Out Date',
        'Clock Out Time',
        'Status'
      ];

      let csvContent = headers.join(',') + '\n';

      filteredReports.forEach(report => {
        const row = [
          report.trip_id,
          report.driver_name,
          report.vehicle_no,
          report.clock_in_date,
          report.clock_in_time,
          report.clock_out_date,
          report.clock_out_time,
          report.status || 'N/A'
        ].map(value => value === null || value === undefined ? '' : `"${value}"`);
        
        csvContent += row.join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `driver_clock_reports_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      showSnackbar('CSV file downloaded successfully!', 'success');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      showSnackbar('Error exporting data', 'error');
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchDriverReports();
  };

  const handleDateFilter = () => {
    setLoading(true);
    fetchDriverReports();
  };

  const handleClearDates = () => {
    setFromDate(null);
    setToDate(null);
    setLoading(true);
    setTimeout(() => fetchDriverReports(), 100);
  };

  const filteredReports = reports.filter(report =>
    report.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.vehicle_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.trip_id?.toString().includes(searchTerm) ||
     (report.emp_id?.toString().toLowerCase().includes(searchTerm))
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status) => {
    if (!status) return <Chip label="Unknown" color="default" size="small" />;
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'active' || statusLower === 'completed') {
      return <Chip label={status} color="success" size="small" />;
    } else if (statusLower === 'in progress' || statusLower === 'started') {
      return <Chip label={status} color="warning" size="small" />;
    } else {
      return <Chip label={status} color="default" size="small" />;
    }
  };

  const formatDateTime = (date, time) => {
    if (!date) return 'N/A';
    return `${date} ${time || ''}`.trim();
  };

  if (loading && !tokenExpired) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        p: isMobile ? 1 : 3
      }}>
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

        {/* Report Detail Dialog */}
        <Dialog
          open={detailDialog}
          onClose={handleCloseDetailDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ViewIcon color="primary" />
            Trip Details - {selectedReport?.trip_id}
          </DialogTitle>
          <DialogContent>
            {selectedReport && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                  <Typography><strong>Trip ID:</strong> {selectedReport.trip_id}</Typography>
                  <Typography><strong>Driver Name:</strong> {selectedReport.driver_name}</Typography>
                  <Typography><strong>Vehicle Number:</strong> {selectedReport.vehicle_no}</Typography>
                  <Typography><strong>Status:</strong> {selectedReport.status || 'N/A'}</Typography>
                  <Typography><strong>Clock In:</strong> {formatDateTime(selectedReport.clock_in_date, selectedReport.clock_in_time)}</Typography>
                  <Typography><strong>Clock Out:</strong> {formatDateTime(selectedReport.clock_out_date, selectedReport.clock_out_time)}</Typography>
                </Box>
                
                {/* Photos Section */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Trip Photos</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {selectedReport.start_photo && (
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" gutterBottom>Start Photo</Typography>
                        <Box
                          component="img"
                          src={selectedReport.start_photo}
                          alt="Start Photo"
                          sx={{
                            maxWidth: 200,
                            maxHeight: 200,
                            borderRadius: 2,
                            border: '1px solid #ddd',
                          }}
                        />
                      </Box>
                    )}
                    {selectedReport.end_photo && (
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" gutterBottom>End Photo</Typography>
                        <Box
                          component="img"
                          src={selectedReport.end_photo}
                          alt="End Photo"
                          sx={{
                            maxWidth: 200,
                            maxHeight: 200,
                            borderRadius: 2,
                            border: '1px solid #ddd',
                          }}
                        />
                      </Box>
                    )}
                    {!selectedReport.start_photo && !selectedReport.end_photo && (
                      <Typography variant="body2" color="text.secondary">
                        No photos available
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetailDialog} variant="contained">
              Close
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
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Driver Clock Reports
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 1 }}>
                Monitor driver clock-in and clock-out activities
              </Typography>
            </Box>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 'bold',
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                Refresh
              </Button>
            </motion.div>
          </Box>
        </motion.div>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Card sx={{
            p: isMobile ? 1 : 3,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            minHeight: '70vh',
            maxHeight: '80vh',
            "&:hover": {
              transform: "none",
            },
          }}>
            {/* Search and Filter Bar */}
            <Box sx={{
              display: 'flex',
              gap: 2,
              mb: 3,
              flexWrap: 'wrap',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <TextField
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  minWidth: isMobile ? '100%' : 300,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
                size={isMobile ? "small" : "medium"}
              />

              {/* Date Filters */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <DatePicker
                  label="From Date"
                  value={fromDate}
                  onChange={setFromDate}
                  slotProps={{
                    textField: {
                      size: isMobile ? "small" : "medium",
                      sx: { minWidth: 150 }
                    }
                  }}
                />
                <DatePicker
                  label="To Date"
                  value={toDate}
                  onChange={setToDate}
                  slotProps={{
                    textField: {
                      size: isMobile ? "small" : "medium",
                      sx: { minWidth: 150 }
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<CalendarIcon />}
                  onClick={handleDateFilter}
                  size={isMobile ? "small" : "medium"}
                >
                  Filter
                </Button>
                <Button
                  variant="text"
                  onClick={handleClearDates}
                  size={isMobile ? "small" : "medium"}
                >
                  Clear
                </Button>
              </Box>

              <Box sx={{ flex: 1 }} />

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  sx={{ 
                    borderRadius: 2, 
                    px: 3,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                  size={isMobile ? "small" : "medium"}
                >
                  Export
                </Button>
              </motion.div>

              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                {filteredReports.length} reports found
              </Typography>
            </Box>

            {/* Table Container with Scroll */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              {filteredReports.length === 0 && !loading ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: 200,
                  flexDirection: 'column',
                  gap: 2
                }}>
                  <Typography variant="h6" color="text.secondary">
                    No reports found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {reports.length === 0 ? 'No trip records available' : 'No records match your search'}
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer 
                    sx={{
                      flex: 1,
                      overflow: 'auto',
                      maxHeight: '100%',
                      '& .MuiTable-root': {
                        minWidth: isMobile ? '800px' : 'auto'
                      }
                    }}
                  >
                    <Table stickyHeader sx={{ minWidth: isMobile ? 800 : 'auto' }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{
                            backgroundColor: 'background.paper',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            py: isMobile ? 1 : 2,
                            width: isMobile ? '80px' : 'auto'
                          }}>
                            #
                          </TableCell>

                           <TableCell sx={{
                            backgroundColor: 'background.paper',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            py: isMobile ? 1 : 2,
                            width: isMobile ? '80px' : 'auto'
                          }}>
                            Emp ID
                          </TableCell>

                          <TableCell sx={{
                            backgroundColor: 'background.paper',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            width: isMobile ? '120px' : 'auto'
                          }}>
                            Trip ID
                          </TableCell>
                          <TableCell sx={{
                            backgroundColor: 'background.paper',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            width: isMobile ? '150px' : 'auto'
                          }}>
                            Driver Name
                          </TableCell>
                          <TableCell sx={{
                            backgroundColor: 'background.paper',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            width: isMobile ? '130px' : 'auto'
                          }}>
                            Vehicle No
                          </TableCell>
                          <TableCell sx={{
                            backgroundColor: 'background.paper',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            width: isMobile ? '120px' : 'auto'
                          }}>
                            Clock In
                          </TableCell>
                          <TableCell sx={{
                            backgroundColor: 'background.paper',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            width: isMobile ? '120px' : 'auto'
                          }}>
                            Clock Out
                          </TableCell>
                          <TableCell sx={{
                            backgroundColor: 'background.paper',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            width: isMobile ? '100px' : 'auto'
                          }}>
                            Status
                          </TableCell>
                          <TableCell sx={{
                            backgroundColor: 'background.paper',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            textAlign: 'center',
                            width: isMobile ? '100px' : 'auto'
                          }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredReports
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((report, index) => (
                            <TableRow
                              key={report.trip_id}
                              component={motion.tr}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              sx={{
                                transition: 'all 0.3s ease',
                                '&:last-child td, &:last-child th': { border: 0 },
                              }}
                            >
                              {/* Index */}
                              <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 'medium',
                                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                                  }}
                                >
                                  {page * rowsPerPage + index + 1}
                                </Typography>
                              </TableCell>


 <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 500,
                                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                                  }}
                                >
                                  {report.emp_id}
                                </Typography>
                              </TableCell>
                              {/* Trip ID */}
                              <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 500,
                                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                                  }}
                                >
                                  {report.trip_id}
                                </Typography>
                              </TableCell>

                              {/* Driver Name */}
                              <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                                    fontWeight: 500,
                                  }}
                                >
                                  {report.driver_name || 'N/A'}
                                </Typography>
                              </TableCell>

                              {/* Vehicle Number */}
                              <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                <Chip
                                  label={report.vehicle_no || 'N/A'}
                                  color="primary"
                                  variant="outlined"
                                  size="small"
                                  sx={{
                                    fontWeight: 'bold',
                                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                                  }}
                                />
                              </TableCell>

                              {/* Clock In */}
                              <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {report.clock_in_date || 'N/A'}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                                      color: 'text.secondary',
                                    }}
                                  >
                                    {report.clock_in_time || 'N/A'}
                                  </Typography>
                                </Box>
                              </TableCell>

                              {/* Clock Out */}
                              <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {report.clock_out_date || 'N/A'}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                                      color: 'text.secondary',
                                    }}
                                  >
                                    {report.clock_out_time || 'N/A'}
                                  </Typography>
                                </Box>
                              </TableCell>

                              {/* Status */}
                              <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                {getStatusChip(report.status)}
                              </TableCell>

                              {/* Action Buttons */}
                              <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    gap: 1,
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Tooltip title="View Details">
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleViewDetails(report)}
                                        sx={{
                                          backgroundColor: '#e3f2fd',
                                          color: '#1976d2',
                                          '&:hover': {
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                          },
                                        }}
                                      >
                                        <ViewIcon fontSize={isMobile ? 'small' : 'medium'} />
                                      </IconButton>
                                    </motion.div>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination */}
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredReports.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      '& .MuiTablePagination-toolbar': {
                        padding: isMobile ? 1 : 2,
                        flexWrap: 'wrap',
                        gap: 1
                      },
                      '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                        fontSize: isMobile ? '0.75rem' : '0.875rem'
                      },
                      flexShrink: 0
                    }}
                  />
                </>
              )}
            </Paper>
          </Card>
        </motion.div>
      </Box>
    </LocalizationProvider>
  );
};

export default DriverClockIn;