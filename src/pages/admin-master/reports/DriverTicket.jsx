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

const DriverTicket = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tokenExpired, setTokenExpired] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [selectedTicket, setSelectedTicket] = useState(null);
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
    fetchDriverTickets();
  }, []);

  const handleTokenExpiredClose = () => {
    setTokenExpired(false);
    window.location.href = '/login';
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };
const handleStatusUpdate = async (ticketId) => {
  if (!checkTokenExpiration()) {
    setTokenExpired(true);
    return;
  }

  const confirmAction = window.confirm("Are you sure you want to mark this ticket as completed?");
  if (!confirmAction) return; // stop if user cancels


  const token = localStorage.getItem('token');
  if (!token) return showSnackbar('Unauthorized', 'error');

  try {
  
    await axios.put(
      `${API_BASE_URL}/admin/ticket-update/${ticketId}`,
      { flag: 2 },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Update ticket locally (no reload)
    setTickets(prev =>
      prev.map(t =>
        t.ticket_id === ticketId ? { ...t, flag: 2 } : t
      )
    );

    showSnackbar('Ticket marked as completed', 'success');
  } catch (err) {
    console.error('Error updating flag:', err);
    showSnackbar('Failed to update ticket', 'error');
  }
};

  const fetchDriverTickets = async () => {
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

      const res = await axios.get(`${API_BASE_URL}/admin/ticket-history`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setTickets(res.data.tickets || []);
      if (res.data.tickets && res.data.tickets.length === 0) {
        showSnackbar('No ticket records found for selected date(s)', 'info');
      }
    } catch (error) {
      console.error('Error fetching driver tickets:', error);
      if (error.response?.status === 401) {
        setTokenExpired(true);
        localStorage.removeItem('token');
        setError('Session expired. Please login again.');
      } else if (error.response?.status === 404) {
        setTickets([]);
        setError('No ticket records found for selected date(s)');
        showSnackbar('No ticket records found for selected date(s)', 'info');
      } else {
        setError('Failed to fetch driver ticket history');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (ticket) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    navigate('/report-viewDriverTicket', { state: { ticket } });
  };

  const handleCloseDetailDialog = () => {
    setDetailDialog(false);
    setSelectedTicket(null);
  };

  const handleExport = () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    if (filteredTickets.length === 0) {
      showSnackbar('No data to export', 'warning');
      return;
    }

    try {
      const headers = [
        // 'Ticket ID',
        'Issue Type',
        'Priority',
        'Description',
        'Vehicle Number',
        'Bus Number',
        'Date',
        'Time',
        'Status Flag'
      ];

      let csvContent = headers.join(',') + '\n';

      filteredTickets.forEach(ticket => {
        const row = [
          // ticket.ticket_id,
          ticket.issue_type,
          ticket.priority,
          ticket.description ? `"${ticket.description.replace(/"/g, '""')}"` : '',
          ticket.vehicle_no,
          ticket.bus_number,
          ticket.date,
          ticket.time,
          ticket.flag || 'N/A'
          
          
        ];
        
        csvContent += row.join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `driver_tickets_${new Date().toISOString().split('T')[0]}.csv`);
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
    fetchDriverTickets();
  };

  const handleDateFilter = () => {
    setLoading(true);
    fetchDriverTickets();
  };

  const handleClearDates = () => {
    setFromDate(null);
    setToDate(null);
    setLoading(true);
    setTimeout(() => fetchDriverTickets(), 100);
  };
const filteredTickets = tickets.filter(ticket => {
  const term = searchTerm.toLowerCase();

  // Check emp_id
  const empMatch = ticket.emp_id?.toString().toLowerCase().includes(term);

  // Check driver_name
  const nameMatch = ticket.driver_name?.toLowerCase().includes(term);

  // Check status/flag
  let statusText = '';
  switch (ticket.flag) {
    case 0:
      statusText = 'open';
      break;
    case 1:
      statusText = 'pending';
      break;
    case 2:
      statusText = 'resolved';
      break;
    default:
      statusText = '';
  }
  const statusMatch = statusText.includes(term);

  // Check other fields
  const otherMatch =
    ticket.issue_type?.toLowerCase().includes(term) ||
    ticket.vehicle_no?.toLowerCase().includes(term) ||
    ticket.bus_number?.toLowerCase().includes(term) ||
    ticket.ticket_id?.toString().includes(term) ||
    ticket.priority?.toLowerCase().includes(term);

  return empMatch || nameMatch || statusMatch || otherMatch;
});

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getPriorityChip = (priority) => {
    if (!priority) return <Chip label="Unknown" color="default" size="small" />;
    
    const priorityLower = String(priority).toLowerCase();
    if (priorityLower === 'high' || priorityLower === 'urgent') {
      return <Chip label={priority} color="error" size="small" />;
    } else if (priorityLower === 'medium') {
      return <Chip label={priority} color="warning" size="small" />;
    } else if (priorityLower === 'low') {
      return <Chip label={priority} color="success" size="small" />;
    } else {
      return <Chip label={priority} color="default" size="small" />;
    }
  };

  const getFlagChip = (flag) => {
    // Convert flag to string and handle null/undefined cases
    const flagString = String(flag || 'Unknown');
    
    const flagLower = flagString.toLowerCase();
    if (flagLower === 'resolved' || flagLower === 'completed' || flagLower === '1') {
      return <Chip label={flagString} color="success" size="small" />;
    } else if (flagLower === 'in progress' || flagLower === 'pending' || flagLower === '2') {
      return <Chip label={flagString} color="warning" size="small" />;
    } else if (flagLower === 'open' || flagLower === 'new' || flagLower === '0') {
      return <Chip label={flagString} color="info" size="small" />;
    } else {
      return <Chip label={flagString} color="default" size="small" />;
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

        {/* Ticket Detail Dialog */}
        <Dialog
          open={detailDialog}
          onClose={handleCloseDetailDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ViewIcon color="primary" />
            Ticket Details - {selectedTicket?.ticket_id}
          </DialogTitle>
          <DialogContent>
            {selectedTicket && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                  {/* <Typography><strong>Ticket ID:</strong> {selectedTicket.ticket_id}</Typography> */}
                  <Typography><strong>Issue Type:</strong> {selectedTicket.issue_type}</Typography>
                  <Typography><strong>Priority:</strong> {selectedTicket.priority}</Typography>
                  <Typography><strong>Status:</strong> {selectedTicket.flag || 'N/A'}</Typography>
                  <Typography><strong>Vehicle Number:</strong> {selectedTicket.vehicle_no}</Typography>
                  <Typography><strong>Bus Number:</strong> {selectedTicket.bus_number}</Typography>
                  <Typography><strong>Date:</strong> {selectedTicket.date || 'N/A'}</Typography>
                  <Typography><strong>Time:</strong> {selectedTicket.time || 'N/A'}</Typography>
                </Box>
                
                {/* Description Section */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'background.default' }}>
                    <Typography variant="body2">
                      {selectedTicket.description || 'No description available'}
                    </Typography>
                  </Paper>
                </Box>
                
                {/* Photo Section */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Ticket Photo</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {selectedTicket.photo ? (
                      <Box sx={{ textAlign: 'center' }}>
                        <Box
                          component="img"
                          src={selectedTicket.photo}
                          alt="Ticket Photo"
                          sx={{
                            maxWidth: 300,
                            maxHeight: 300,
                            borderRadius: 2,
                            border: '1px solid #ddd',
                          }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No photo available
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
                Driver Ticket History
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 1 }}>
                Monitor and manage driver ticket submissions
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
                placeholder="Search tickets..."
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
                {filteredTickets.length} tickets found
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
              {filteredTickets.length === 0 && !loading ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: 200,
                  flexDirection: 'column',
                  gap: 2
                }}>
                  <Typography variant="h6" color="text.secondary">
                    No tickets found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tickets.length === 0 ? 'No ticket records available' : 'No records match your search'}
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
                            <TableCell>Emp ID</TableCell>
    <TableCell>Driver Name</TableCell>

                          {/* <TableCell sx={{
                            backgroundColor: 'background.paper',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            width: isMobile ? '120px' : 'auto'
                          }}>
                            Ticket ID
                          </TableCell> */}
                          <TableCell sx={{
                            backgroundColor: 'background.paper',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            width: isMobile ? '150px' : 'auto'
                          }}>
                            Issue Type
                          </TableCell>
                          <TableCell sx={{
                            backgroundColor: 'background.paper',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            width: isMobile ? '100px' : 'auto'
                          }}>
                            Priority
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
                            Date
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
                        {filteredTickets
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((ticket, index) => (
                            <TableRow
                              key={ticket.ticket_id}
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
  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
    {ticket.emp_id || 'N/A'}
  </Typography>
</TableCell>

<TableCell sx={{ py: isMobile ? 1 : 2 }}>
  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
    {ticket.driver_name || 'N/A'}
  </Typography>
</TableCell>

                              {/* Ticket ID */}
                              {/* <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 500,
                                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                                  }}
                                >
                                  {ticket.ticket_id}
                                </Typography>
                              </TableCell> */}

                              {/* Issue Type */}
                              <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                                    fontWeight: 500,
                                  }}
                                >
                                  {ticket.issue_type || 'N/A'}
                                </Typography>
                              </TableCell>

                              {/* Priority */}
                              <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                {getPriorityChip(ticket.priority)}
                              </TableCell>

                              {/* Vehicle Number */}
                              <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                <Box>
                                  <Chip
                                    label={ticket.vehicle_no || 'N/A'}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                      fontWeight: 'bold',
                                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                                      mb: 0.5
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                                      color: 'text.secondary',
                                    }}
                                  >
                                    {ticket.bus_number || 'N/A'}
                                  </Typography>
                                </Box>
                              </TableCell>

                              {/* Date */}
                              <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {ticket.date || 'N/A'}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                                      color: 'text.secondary',
                                    }}
                                  >
                                    {ticket.time || 'N/A'}
                                  </Typography>
                                </Box>
                              </TableCell>

                              {/* Status Flag */}
                          <TableCell sx={{ py: isMobile ? 1 : 2 }}>
  {ticket.flag === 1 ? (
    <Button
      variant="contained"
      color="warning"
      size="small"
      onClick={() => handleStatusUpdate(ticket.ticket_id)}
      sx={{
        fontWeight: 'bold',
        textTransform: 'none',
        fontSize: isMobile ? '0.7rem' : '0.8rem'
      }}
    >
      Pending
    </Button>
  ) : (
    <Chip
      label="Resolved"
      color="success"
      size="small"
      sx={{
        fontWeight: 'bold',
        fontSize: isMobile ? '0.7rem' : '0.8rem'
      }}
    />
  )}
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
                                        onClick={() => handleViewDetails(ticket)}
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
                    count={filteredTickets.length}
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

export default DriverTicket;