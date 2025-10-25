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
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ListAttendee = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [searchText, setSearchText] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, attendee: null });
  const [tokenExpired, setTokenExpired] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

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
    fetchAttendees();
  }, []);

  const handleTokenExpiredClose = () => {
    setTokenExpired(false);
    navigate('/login');
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchAttendees = async () => {
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
      const res = await axios.get(`${API_BASE_URL}/attendees`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAttendees(res.data.data);
    } catch (error) {
      console.error('Error fetching attendees:', error);
      setError('Failed to fetch attendees');
      if (error.response?.status === 401) {
        setTokenExpired(true);
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (attendee) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
  navigate('/edit-attendee', { state: { id: attendee.user_id } });
;
  };

  const handleDeleteClick = (attendee) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    setDeleteConfirm({ open: true, attendee });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.attendee) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setTokenExpired(true);
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/delete_attendee/${deleteConfirm.attendee.user_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showSnackbar('Attendee deleted successfully!', 'success');
      setAttendees((prev) => prev.filter((a) => a.user_id !== deleteConfirm.attendee.user_id));
    } catch (error) {
      console.error('Error deleting attendee:', error);
      showSnackbar('Failed to delete attendee', 'error');
      if (error.response?.status === 401) {
        setTokenExpired(true);
        localStorage.removeItem('token');
      }
    } finally {
      setDeleteConfirm({ open: false, attendee: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ open: false, attendee: null });
  };

  const handleViewDetails = (attendee) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    navigate('/view-attendee', { state: { attendee } });
  };

  const handleExport = () => {
  if (!checkTokenExpiration()) {
    setTokenExpired(true);
    return;
  }

  if (filteredAttendees.length === 0) {
    showSnackbar('No data to export', 'warning');
    return;
  }

  try {
    // Fields to skip
    const skipFields = ['id_proof', 'username', 'attendee_img', 'status'];

    // Get all unique keys from attendees, excluding skipFields
    const allKeys = new Set();
    filteredAttendees.forEach(attendee => {
      Object.keys(attendee).forEach(key => {
        if (!skipFields.includes(key)) allKeys.add(key);
      });
    });

    const headers = Array.from(allKeys);

    // Create CSV content
    let csvContent = headers.join(',') + '\n';

    filteredAttendees.forEach(attendee => {
      const row = headers.map(header => {
        const value = attendee[header];
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      });
      csvContent += row.join(',') + '\n';
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `attendees_${new Date().toISOString().split('T')[0]}.csv`);
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

  const handleAddAttendee = () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    navigate('/add-attendee');
  };

  const filteredAttendees = attendees.filter(attendee =>
    attendee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
   (attendee.contact_number || '').toString().toLowerCase().includes(searchText.toLowerCase())

 );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading && !tokenExpired) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
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
        open={deleteConfirm.open}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-confirmation-dialog"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete attendee <strong>"{deleteConfirm.attendee?.name}"</strong>? 
          </Typography>
        </DialogContent>
        <DialogActions sx={{ gap: 1, p: 2 }}>
          <Button 
            onClick={handleDeleteCancel} 
            variant="outlined" 
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete
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
              Attendee Management
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 1 }}>
              Manage your attendee information and details
            </Typography>
          </Box>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAttendee}
              sx={{
                background: 'linear-gradient(45deg, #DC143C, #FF6B8B)',
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 'bold',
                fontSize: isMobile ? '0.75rem' : '0.875rem'
              }}
            >
              Add Attendee
            </Button>
          </motion.div>
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
              placeholder="Search attendees..."
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

            <Box sx={{ flex: 1 }} />

            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
              {filteredAttendees.length} attendees found
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
                      width: isMobile ? '120px' : 'auto'
                    }}>
                      #
                    </TableCell>
                    <TableCell sx={{
                      backgroundColor: 'background.paper',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      width: isMobile ? '150px' : 'auto'
                    }}>
                      Name
                    </TableCell>
                    <TableCell sx={{
                      backgroundColor: 'background.paper',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      width: isMobile ? '200px' : 'auto'
                    }}>
                      Email
                    </TableCell>
                    <TableCell sx={{
                      backgroundColor: 'background.paper',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      width: isMobile ? '150px' : 'auto'
                    }}>
                      Contact Number
                    </TableCell>
                    <TableCell sx={{
                      backgroundColor: 'background.paper',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      width: isMobile ? '120px' : 'auto'
                    }}>
                      Image
                    </TableCell>
                    <TableCell sx={{
                      backgroundColor: 'background.paper',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      textAlign: 'center',
                      width: isMobile ? '140px' : 'auto'
                    }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
              <TableBody>
  {filteredAttendees
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map((attendee, index) => (
      <TableRow
        key={attendee.user_id}
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

        {/* Name */}
        <TableCell sx={{ py: isMobile ? 1 : 2 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              fontSize: isMobile ? '0.75rem' : '0.875rem',
            }}
          >
            {attendee.name || '-'}
          </Typography>
        </TableCell>

        {/* Email */}
        <TableCell sx={{ py: isMobile ? 1 : 2 }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              color: attendee.email ? 'text.primary' : 'text.secondary',
            }}
          >
            {attendee.email || 'Not Available'}
          </Typography>
        </TableCell>

        {/* Contact Number */}
        <TableCell sx={{ py: isMobile ? 1 : 2 }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              color: attendee.contact_number ? 'text.primary' : 'text.secondary',
            }}
          >
            {attendee.contact_number || 'Not Available'}
          </Typography>
        </TableCell>

        {/* Image */}
        <TableCell sx={{ py: isMobile ? 1 : 2 }}>
          {attendee.attendee_img ? (
            <Box
              component="img"
              src={attendee.attendee_img}
              alt={attendee.name || 'Attendee'}
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                objectFit: 'cover',
                border: '1px solid #ddd',
                boxShadow: 1,
              }}
            />
          ) : (
            <Chip
              label="No Image"
              color="default"
              size="small"
              sx={{
                fontWeight: 'bold',
                borderRadius: 1,
                fontSize: isMobile ? '0.7rem' : '0.75rem',
                height: isMobile ? 24 : 32,
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
              flexWrap: isMobile ? 'wrap' : 'nowrap',
            }}
          >
            {/* View */}
            <Tooltip title="View Details">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton
                  size="small"
                  onClick={() => handleViewDetails(attendee)}
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

            {/* Edit */}
            <Tooltip title="Edit Attendee">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(attendee)}
                  sx={{
                    backgroundColor: '#f3e5f5',
                    color: '#9c27b0',
                    '&:hover': {
                      backgroundColor: '#9c27b0',
                      color: 'white',
                    },
                  }}
                >
                  <EditIcon fontSize={isMobile ? 'small' : 'medium'} />
                </IconButton>
              </motion.div>
            </Tooltip>

            {/* Delete */}
            <Tooltip title="Delete Attendee">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(attendee)}
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
              count={filteredAttendees.length}
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
  );
};

export default ListAttendee;