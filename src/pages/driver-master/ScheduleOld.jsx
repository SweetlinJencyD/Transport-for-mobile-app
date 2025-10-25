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
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const DriverSchedule = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [viewDialog, setViewDialog] = useState({ open: false, schedule: null });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchSchedule = async () => {
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login again');
      setLoading(false);
      return;
    }

    try {
      let url = `${API_BASE_URL}/driver/schedule`;
      const params = new URLSearchParams();
      
      if (fromDate) {
        params.append('from_date', fromDate.toISOString().split('T')[0]);
      }
      if (toDate) {
        params.append('to_date', toDate.toISOString().split('T')[0]);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to fetch schedule');
      }

      const data = await res.json();
      setSchedules(data.assigned_vehicles || []);

      
      if (data.schedule && data.schedule.length === 0) {
        showSnackbar('No schedule found for selected date range', 'info');
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError(err.message);
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleSearch = () => {
    setPage(0);
    fetchSchedule();
  };

  const handleClearFilters = () => {
    setFromDate(null);
    setToDate(null);
    setSearchTerm('');
    setPage(0);
  };

  const handleExport = () => {
    if (filteredSchedules.length === 0) {
      showSnackbar('No data to export', 'warning');
      return;
    }

    try {
      const headers = ['#', 'Vehicle No', 'Date', 'Time', 'Driver ID'];

      let csvContent = headers.join(',') + '\n';

      filteredSchedules.forEach((schedule, index) => {
        const row = [
          index + 1,
          schedule.vehicle_no,
          schedule.date,
          schedule.time,
        ];
        csvContent += row.join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `driver_schedule_${new Date().toISOString().split('T')[0]}.csv`);
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

  const handleViewDetails = (schedule) => {
    setViewDialog({ open: true, schedule });
  };

  const handleCloseViewDialog = () => {
    setViewDialog({ open: false, schedule: null });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredSchedules = schedules.filter(schedule =>
    schedule.vehicle_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.time?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.driver_id?.toString().includes(searchTerm)
  );

  if (loading) {
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
        {/* View Details Dialog */}
        <Dialog
          open={viewDialog.open}
          onClose={handleCloseViewDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon color="primary" />
            Schedule Details
          </DialogTitle>
          <DialogContent>
            {viewDialog.schedule && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Vehicle No:</strong> {viewDialog.schedule.vehicle_no}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Date:</strong> {viewDialog.schedule.date}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Time:</strong> {viewDialog.schedule.time}
                </Typography>
                
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewDialog} variant="contained">
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
                Driver Schedule
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 1 }}>
                View and manage your driving schedule
              </Typography>
            </Box>
          </Box>
        </motion.div>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
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
                placeholder="Search schedules..."
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
                  minWidth: isMobile ? '100%' : 250,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
                size={isMobile ? "small" : "medium"}
              />

              <DatePicker
                label="From Date"
                value={fromDate}
                onChange={setFromDate}
                slotProps={{
                  textField: {
                    size: isMobile ? "small" : "medium",
                    sx: { minWidth: isMobile ? 140 : 150 }
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
                    sx: { minWidth: isMobile ? 140 : 150 }
                  }
                }}
              />

              {/* Search Schedule Button moved here */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="contained"
                  startIcon={<CalendarIcon />}
                  onClick={handleSearch}
                  sx={{
                    background: 'linear-gradient(45deg, #DC143C, #FF6B8B)',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                  size={isMobile ? "small" : "medium"}
                >
                  Search Schedule
                </Button>
              </motion.div>

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

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                  size={isMobile ? "small" : "medium"}
                >
                  Clear Filters
                </Button>
              </motion.div>

              <Box sx={{ flex: 1 }} />

              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                {filteredSchedules.length} schedules found
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
                        width: '60px'
                      }}>
                        #
                      </TableCell>
                      <TableCell sx={{
                        backgroundColor: 'background.paper',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                      }}>
                        Vehicle No
                      </TableCell>
                      <TableCell sx={{
                        backgroundColor: 'background.paper',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                      }}>
                        Date
                      </TableCell>
                      <TableCell sx={{
                        backgroundColor: 'background.paper',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                      }}>
                        Time
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSchedules.length > 0 ? (
                      filteredSchedules
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((schedule, index) => (
                          <TableRow
                            key={`${schedule.date}-${schedule.time}-${index}`}
                            component={motion.tr}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            sx={{
                              transition: 'all 0.3s ease',
                              '&:last-child td, &:last-child th': { border: 0 }
                            }}
                          >
                            <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                              <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                                {page * rowsPerPage + index + 1}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                                {schedule.vehicle_no}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                              <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                                {schedule.date}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                              <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                                {schedule.time}
                              </Typography>
                            </TableCell>
                            {/* <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                              <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                                {schedule.driver_id}
                              </Typography>
                            </TableCell> */}
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            No schedules found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredSchedules.length}
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
            </Paper>
          </Card>
        </motion.div>
      </Box>
    </LocalizationProvider>
  );
};

export default DriverSchedule;