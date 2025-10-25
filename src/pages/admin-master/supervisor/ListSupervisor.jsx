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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ListSupervisor = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [supervisors, setSupervisors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [allSupervisors, setAllSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, supervisor: null });
  const [tokenExpired, setTokenExpired] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

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
    fetchData(token);
    fetchVehicles(token);
    fetchAllSupervisors(token);
  }, []);

  const handleTokenExpiredClose = () => {
    setTokenExpired(false);
    navigate('/login');
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchData = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/supervisor_list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        setTokenExpired(true);
        localStorage.removeItem('token');
        throw new Error('Token expired. Please login again.');
      }

      if (!res.ok) throw new Error('Failed to fetch supervisors');

      const data = await res.json();
      setSupervisors(data);
    } catch (err) {
      console.error('Error fetching supervisors:', err);
      setError(err.message);
      if (err.message.includes('Token expired')) {
        setTokenExpired(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/get_buses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        setTokenExpired(true);
        localStorage.removeItem('token');
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch vehicles');

      const data = await res.json();
      setVehicles(data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const fetchAllSupervisors = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/get_supervisors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        setTokenExpired(true);
        localStorage.removeItem('token');
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch all supervisors');

      const data = await res.json();
      setAllSupervisors(data);
    } catch (err) {
      console.error('Error fetching all supervisors:', err);
    }
  };

  const handleDeleteClick = (supervisor) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    setDeleteConfirm({ open: true, supervisor });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.supervisor) return;

    const supervisor = deleteConfirm.supervisor;
    const token = localStorage.getItem('token');
    if (!token) {
      setTokenExpired(true);
      return;
    }

    try {
      const group_id =
        supervisor.group_id ||
        (supervisor.group_ids && supervisor.group_ids[0]) ||
        (supervisor.groups && supervisor.groups[0]?.id);

      if (!group_id) {
        showSnackbar('Supervisor has no group assigned.', 'warning');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/delete_supervisor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: supervisor.id, group_id }),
      });

      const data = await res.json();

      if (res.ok && data.supervisor) {
        setSupervisors((prev) =>
          prev.map((s) =>
            s.id === data.supervisor.id ? { ...s, ...data.supervisor } : s
          )
        );
        showSnackbar('Supervisor unlinked successfully!', 'success');
      } else {
        showSnackbar(data.detail || 'Failed to unlink supervisor', 'error');
      }
    } catch (err) {
      console.error('Error deleting supervisor:', err);
      showSnackbar('An error occurred while unlinking the supervisor.', 'error');
    } finally {
      setDeleteConfirm({ open: false, supervisor: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ open: false, supervisor: null });
  };

  const handleEdit = (supervisor) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    const sup = { ...supervisor, user_id: supervisor.id };
    navigate('/edit-supervisor', { state: { supervisor: sup } });
  };

  const handleAddSupervisor = () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    navigate('/add-supervisor');
  };

  const handleExport = () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    if (filteredSupervisors.length === 0) {
      showSnackbar('No data to export', 'warning');
      return;
    }

    try {
      // Get all unique keys from all supervisors
      const allKeys = new Set();
      filteredSupervisors.forEach(supervisor => {
        Object.keys(supervisor).forEach(key => allKeys.add(key));
      });

      const headers = Array.from(allKeys);
      
      // Create CSV content
      let csvContent = headers.join(',') + '\n';
      
      filteredSupervisors.forEach(supervisor => {
        const row = headers.map(header => {
          const value = supervisor[header];
          // Handle values that might contain commas or quotes
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
      link.setAttribute('download', `supervisors_${new Date().toISOString().split('T')[0]}.csv`);
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

  const filteredSupervisors = supervisors.filter(supervisor =>
    supervisor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supervisor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supervisor.groups && supervisor.groups.join(', ').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getGroupStatusColor = (groups) => {
    if (!groups || groups.length === 0) return 'error';
    return 'success';
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
          Confirm Unlink Supervisor
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to unlink supervisor <strong>"{deleteConfirm.supervisor?.name}"</strong> from the group? 
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
            Unlink
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
              Supervisor Management
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 1 }}>
              Manage your supervisors and their vehicle groups
            </Typography>
          </Box>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSupervisor}
              sx={{
                background: 'linear-gradient(45deg, #DC143C, #FF6B8B)',
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 'bold',
                fontSize: isMobile ? '0.75rem' : '0.875rem'
              }}
            >
              Add Supervisor
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
              placeholder="Search supervisors..."
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
              {filteredSupervisors.length} supervisors found
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
                      width: isMobile ? '80px' : 'auto'
                    }}>
                      #
                    </TableCell>
                    <TableCell sx={{
                      backgroundColor: 'background.paper',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      width: isMobile ? '200px' : 'auto'
                    }}>
                      Name
                    </TableCell>
                    <TableCell sx={{
                      backgroundColor: 'background.paper',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      width: isMobile ? '250px' : 'auto'
                    }}>
                      Email
                    </TableCell>
                    <TableCell sx={{
                      backgroundColor: 'background.paper',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      width: isMobile ? '200px' : 'auto'
                    }}>
                      Vehicle Group(s)
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
                  {filteredSupervisors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            textAlign: 'center', 
                            py: 4,
                            color: 'text.secondary'
                          }}
                        >
                          No supervisor found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSupervisors
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((supervisor, index) => (
                        <TableRow
                          key={supervisor.id}
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
                            <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                              {page * rowsPerPage + index + 1}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                              {supervisor.name}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                            <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                              {supervisor.email}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                            {supervisor.groups && supervisor.groups.length > 0 ? (
                              <Chip
                                label={supervisor.groups.join(', ')}
                                color={getGroupStatusColor(supervisor.groups)}
                                size="small"
                                sx={{
                                  fontWeight: 'bold',
                                  borderRadius: 1,
                                  maxWidth: isMobile ? 150 : 200,
                                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                                  height: isMobile ? 24 : 32
                                }}
                              />
                            ) : (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                                  color: 'text.secondary',
                                  fontStyle: 'italic'
                                }}
                              >
                                No groups assigned
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                            <Box sx={{
                              display: 'flex',
                              gap: 1,
                              justifyContent: 'center',
                              flexWrap: isMobile ? 'wrap' : 'nowrap'
                            }}>
                              <Tooltip title="Edit Supervisor">
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEdit(supervisor)}
                                    sx={{
                                      backgroundColor: '#f3e5f5',
                                      color: '#9c27b0',
                                      '&:hover': { 
                                        backgroundColor: '#9c27b0',
                                        color: 'white'
                                      },
                                      fontSize: isMobile ? '0.875rem' : '1rem'
                                    }}
                                  >
                                    <EditIcon fontSize={isMobile ? "small" : "medium"} />
                                  </IconButton>
                                </motion.div>
                              </Tooltip>

                              <Tooltip title="Unlink Supervisor">
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteClick(supervisor)}
                                    sx={{
                                      backgroundColor: '#ffebee',
                                      color: '#d32f2f',
                                      '&:hover': { 
                                        backgroundColor: '#d32f2f',
                                        color: 'white'
                                      },
                                      fontSize: isMobile ? '0.875rem' : '1rem'
                                    }}
                                  >
                                    <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                                  </IconButton>
                                </motion.div>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredSupervisors.length}
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

export default ListSupervisor;