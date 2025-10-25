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
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ListAssignAttendee = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tokenExpired, setTokenExpired] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
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
    fetchAssignments();
  }, []);

  const handleTokenExpiredClose = () => {
    setTokenExpired(false);
    window.location.href = '/login';
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };
const fetchAssignments = async () => {
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
    const response = await axios.get(`${API_BASE_URL}/attendees`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('API Response:', response.data);
    let assignmentsData = [];

    if (response.data.status === 'success' && Array.isArray(response.data.data)) {
      assignmentsData = response.data.data.map(a => ({
        id: a.user_id,
        attendee_id: a.user_id,
        attendee_name: a.name,
        emp_id: a.emp_id,
        id_proof: a.id_proof,
        id_proof_no: a.id_proof_no,
        contact_number: a.contact_number,
        email: a.email,
        vehicle_no:a.vehicle_no,
        attendee_img: a.attendee_img || null,
        status: a.status === 1 ? 'Active' : 'Inactive',
        assignment_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        notes: `${a.name} (${a.email || 'No email'})`
      }));
    }

    setAssignments(assignmentsData);

    if (assignmentsData.length === 0) {
      showSnackbar('No attendees found', 'info');
    }
  } catch (error) {
    console.error('Error fetching attendees:', error);
    if (error.response?.status === 401) {
      setTokenExpired(true);
      localStorage.removeItem('token');
      setError('Session expired. Please login again.');
    } else {
      setError('Failed to fetch attendees');
    }
  } finally {
    setLoading(false);
  }
};

  const handleViewDetails = (assignment) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    setSelectedAssignment(assignment);
    setDetailDialog(true);
  };

  const handleEditAssignment = (assignment) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    navigate('/assign-attendee', { state: { assignment } });
  };

  const handleDeleteAssignment = (assignment) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    setSelectedAssignment(assignment);
    setDeleteDialog(true);
  };

const confirmDeleteAssignment = async () => {
  if (!selectedAssignment) return;

  const token = localStorage.getItem('token');
  try {
    // Soft delete API call
    await axios.put(
      `${API_BASE_URL}/attendees/delete/${selectedAssignment.id}`,
      {}, // empty body
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    // Update frontend state
    setAssignments(assignments.map(a =>
      a.id === selectedAssignment.id
        ? { ...a, status: 'Inactive' } // update status locally
        : a
    ));

    showSnackbar('Attendee assignment deleted successfully!', 'success');
    setDeleteDialog(false);
    setSelectedAssignment(null);
  } catch (error) {
    console.error('Error deleting attendee assignment:', error);
    if (error.response?.status === 401) {
      setTokenExpired(true);
      localStorage.removeItem('token');
      showSnackbar('Session expired. Please login again.', 'error');
    } else {
      showSnackbar('Error deleting attendee assignment', 'error');
    }
  }
};


  const handleCloseDetailDialog = () => {
    setDetailDialog(false);
    setSelectedAssignment(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    setSelectedAssignment(null);
  };

  const handleExport = () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    if (filteredAssignments.length === 0) {
      showSnackbar('No data to export', 'warning');
      return;
    }

    try {
      const headers = [
        // 'Assignment ID',
        'Attendee Name',
        'Attendee ID',
        'Employee ID',
        'Vehicle Number',
        'Assignment Date',
        'Status',
        'Created At',
        'Notes'
      ];

      let csvContent = headers.join(',') + '\n';

      filteredAssignments.forEach(assignment => {
        const row = [
          // assignment.id,
          assignment.attendee_name,
          assignment.attendee_id,
          assignment.emp_id,
          assignment.vehicle_no,
          assignment.assignment_date,
          assignment.status,
          assignment.created_at,
          assignment.notes || ''
        ].map(value => value === null || value === undefined ? '' : `"${value}"`);
        
        csvContent += row.join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `attendee_assignments_${new Date().toISOString().split('T')[0]}.csv`);
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
    fetchAssignments();
  };

  const handleDateFilter = () => {
    setLoading(true);
    fetchAssignments();
  };

  const handleClearDates = () => {
    setFromDate(null);
    setToDate(null);
    setLoading(true);
    setTimeout(() => fetchAssignments(), 100);
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.attendee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.vehicle_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.attendee_id?.toString().includes(searchTerm) ||
    assignment.id?.toString().includes(searchTerm) ||
    assignment.emp_id?.toString().includes(searchTerm)
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
    if (statusLower === 'active' || statusLower === 'assigned') {
      return <Chip label={status} color="success" size="small" />;
    } else if (statusLower === 'inactive' || statusLower === 'pending') {
      return <Chip label={status} color="warning" size="small" />;
    } else if (statusLower === 'completed' || statusLower === 'ended') {
      return <Chip label={status} color="info" size="small" />;
    } else {
      return <Chip label={status} color="default" size="small" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog}
          onClose={handleCloseDeleteDialog}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the assignment for{' '}
              <strong>{selectedAssignment?.attendee_name}</strong> on vehicle{' '}
              <strong>{selectedAssignment?.vehicle_no}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button 
              onClick={confirmDeleteAssignment} 
              variant="contained" 
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assignment Detail Dialog */}
        <Dialog
          open={detailDialog}
          onClose={handleCloseDetailDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ViewIcon color="primary" />
            Assignment Details - {selectedAssignment?.id}
          </DialogTitle>
          <DialogContent>
            {selectedAssignment && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                  {/* <Typography><strong>Assignment ID:</strong> {selectedAssignment.id}</Typography> */}
                  <Typography><strong>Attendee Name:</strong> {selectedAssignment.attendee_name}</Typography>
                  <Typography><strong>Attendee ID:</strong> {selectedAssignment.attendee_id}</Typography>
                  <Typography><strong>Employee ID:</strong> {selectedAssignment.emp_id || 'N/A'}</Typography>
                  <Typography><strong>Vehicle Number:</strong> {selectedAssignment.vehicle_no}</Typography>
                  <Typography><strong>Assignment Date:</strong> {formatDate(selectedAssignment.assignment_date)}</Typography>
                  <Typography><strong>Status:</strong> {selectedAssignment.status || 'N/A'}</Typography>
                  <Typography><strong>Created At:</strong> {formatDate(selectedAssignment.created_at)}</Typography>
                  {selectedAssignment.notes && (
                    <Typography gridColumn="span 2">
                      <strong>Notes:</strong> {selectedAssignment.notes}
                    </Typography>
                  )}
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
                Attendee Assignments
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 1 }}>
                Manage attendee to vehicle assignments
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/assign-attendee')}
                  sx={{
                    background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  New Assignment
                </Button>
              </motion.div>

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
                placeholder="Search assignments..."
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
                {filteredAssignments.length} assignments found
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
              {filteredAssignments.length === 0 && !loading ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: 200,
                  flexDirection: 'column',
                  gap: 2
                }}>
                  <Typography variant="h6" color="text.secondary">
                    No assignments found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {assignments.length === 0 ? 'No assignment records available' : 'No records match your search'}
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
                          {/* <TableCell sx={{
                            backgroundColor: 'background.paper',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            width: isMobile ? '120px' : 'auto'
                          }}>
                            Assignment ID
                          </TableCell> */}
                          <TableCell sx={{
                            backgroundColor: 'background.paper',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            width: isMobile ? '150px' : 'auto'
                          }}>
                            Attendee Name
                          </TableCell>
                          <TableCell sx={{
                            backgroundColor: 'background.paper',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            width: isMobile ? '120px' : 'auto'
                          }}>
                            Emp ID
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
                            Assignment Date
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
                            width: isMobile ? '150px' : 'auto'
                          }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAssignments
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((assignment, index) => (
                            <TableRow
                              key={assignment.id}
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

                              {/* Assignment ID */}
                              {/* <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 500,
                                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                                  }}
                                >
                                  {assignment.id}
                                </Typography>
                              </TableCell> */}

                              {/* Attendee Name */}
                              <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                                    fontWeight: 500,
                                  }}
                                >
                                  {assignment.attendee_name || 'N/A'}
                                </Typography>
                              </TableCell>

                              {/* Employee ID */}
                              <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                                    color: 'text.secondary',
                                  }}
                                >
                                  {assignment.emp_id || 'N/A'}
                                </Typography>
                              </TableCell>

                              {/* Vehicle Number */}
                              <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                <Chip
                                  label={assignment.vehicle_no || 'N/A'}
                                  color="primary"
                                  variant="outlined"
                                  size="small"
                                  sx={{
                                    fontWeight: 'bold',
                                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                                  }}
                                />
                              </TableCell>

                              {/* Assignment Date */}
                              <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                                    fontWeight: 500,
                                  }}
                                >
                                  {formatDate(assignment.assignment_date)}
                                </Typography>
                              </TableCell>

                              {/* Status */}
                              <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                {getStatusChip(assignment.status)}
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
                                  {/* <Tooltip title="View Details">
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleViewDetails(assignment)}
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

                                  <Tooltip title="Edit Assignment">
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleEditAssignment(assignment)}
                                        sx={{
                                          backgroundColor: '#e8f5e8',
                                          color: '#2e7d32',
                                          '&:hover': {
                                            backgroundColor: '#2e7d32',
                                            color: 'white',
                                          },
                                        }}
                                      >
                                        <EditIcon fontSize={isMobile ? 'small' : 'medium'} />
                                      </IconButton>
                                    </motion.div>
                                  </Tooltip> */}

                                  <Tooltip title="Delete Assignment">
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDeleteAssignment(assignment)}
                                        sx={{
                                          backgroundColor: '#ffebee',
                                          color: '#d32f2f',
                                          '&:hover': {
                                            backgroundColor: '#d32f2f',
                                            color: 'white',
                                          },
                                        }}
                                      >
                                        <DeleteIcon fontSize={isMobile ? 'small' : 'medium'} />
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
                    count={filteredAssignments.length}
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

export default ListAssignAttendee;