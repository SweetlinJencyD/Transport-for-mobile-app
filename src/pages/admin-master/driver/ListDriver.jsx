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
  Avatar,
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

const ListDriver = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, driver: null });
  const [tokenExpired, setTokenExpired] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
  const SUPABASE_URL = 'https://jppcqqofohxurofwogsa.supabase.co';
  const BUCKET_NAME = 'uploads';

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
    fetchDrivers(token);
  }, []);

  const handleTokenExpiredClose = () => {
    setTokenExpired(false);
    navigate('/login');
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchDrivers = async (token) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        setTokenExpired(true);
        localStorage.removeItem('token');
        throw new Error('Token expired. Please login again.');
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      setDrivers(data);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError(err.message);
      if (err.message.includes('Token expired')) {
        setTokenExpired(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (driver) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    navigate('/edit-driver', { state: { driver } });
  };

  const handleDeleteClick = (driver) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    setDeleteConfirm({ open: true, driver });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.driver) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setTokenExpired(true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/drivers/${deleteConfirm.driver.user_id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        setTokenExpired(true);
        localStorage.removeItem('token');
        throw new Error('Token expired. Please login again.');
      }

      if (res.ok) {
        showSnackbar('Driver deactivated successfully!', 'success');
        setDrivers((prev) => prev.filter((d) => d.user_id !== deleteConfirm.driver.user_id));
      } else {
        showSnackbar('Failed to deactivate driver', 'error');
      }
    } catch (err) {
      console.error('Error deleting driver:', err);
      showSnackbar('An error occurred while deactivating the driver.', 'error');
      if (err.message.includes('Token expired')) {
        setTokenExpired(true);
      }
    } finally {
      setDeleteConfirm({ open: false, driver: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ open: false, driver: null });
  };

  const handleViewDetails = (driver) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    navigate('/view-driver', { state: { driver } });
  };

  const handleExport = () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    if (filteredDrivers.length === 0) {
      showSnackbar('No data to export', 'warning');
      return;
    }

    try {
      // Get all unique keys from all drivers
      const allKeys = new Set();
      filteredDrivers.forEach(driver => {
        Object.keys(driver).forEach(key => allKeys.add(key));
      });

      // Remove unwanted fields
    const excludedFields = ['username', 'driving_license', 'id_proof', 'driver_image'];
    const headers = Array.from(allKeys).filter(key => !excludedFields.includes(key));
      
      // Create CSV content
      let csvContent = headers.join(',') + '\n';
      
      filteredDrivers.forEach(driver => {
        const row = headers.map(header => {
          const value = driver[header];
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
      link.setAttribute('download', `drivers_${new Date().toISOString().split('T')[0]}.csv`);
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

  const handleAddDriver = () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    navigate('/add-driver');
  };

  const getImageUrl = (filename) => {
    if (!filename) return null;
    if (filename.startsWith('http')) return filename;
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.contact_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.vehicle_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getDriverStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'on trip':
        return 'warning';
      default:
        return 'default';
    }
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
          Confirm Deactivate
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to deactivate driver <strong>"{deleteConfirm.driver?.name}"</strong>? 
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
            Deactivate
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
              Driver Management
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 1 }}>
              Manage your drivers and their details
            </Typography>
          </Box>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddDriver}
              sx={{
                background: 'linear-gradient(45deg, #DC143C, #FF6B8B)',
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 'bold',
                fontSize: isMobile ? '0.75rem' : '0.875rem'
              }}
            >
              Add Driver
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
              placeholder="Search drivers..."
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
              {filteredDrivers.length} drivers found
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
                  minWidth: isMobile ? '1000px' : 'auto'
                }
              }}
            >
              <Table stickyHeader sx={{ minWidth: isMobile ? 1000 : 'auto' }}>
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
                      width: isMobile ? '150px' : 'auto'
                    }}>
                      Name
                    </TableCell>
                    {!isMobile && (
                      <>
                        {/* <TableCell sx={{
                          backgroundColor: 'background.paper',
                          fontWeight: 'bold',
                          fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }}>
                          Username
                        </TableCell> */}
                        <TableCell sx={{
                          backgroundColor: 'background.paper',
                          fontWeight: 'bold',
                          fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }}>
                          Email
                        </TableCell>
                      </>
                    )}
                    <TableCell sx={{
                      backgroundColor: 'background.paper',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      width: isMobile ? '120px' : 'auto'
                    }}>
                      Contact
                    </TableCell>
                    <TableCell sx={{
                      backgroundColor: 'background.paper',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      width: isMobile ? '120px' : 'auto'
                    }}>
                      Vehicle No
                    </TableCell>
                    {!isMobile && (
                      <TableCell sx={{
                        backgroundColor: 'background.paper',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.75rem' : '0.875rem'
                      }}>
                        ID Proof
                      </TableCell>
                    )}
                    <TableCell sx={{
                      backgroundColor: 'background.paper',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      width: isMobile ? '100px' : 'auto'
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
                  {filteredDrivers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isMobile ? 6 : 9} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          No drivers found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDrivers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((driver, index) => {
                        const idProofUrl = getImageUrl(driver.id_proof);
                        const driverImageUrl = getImageUrl(driver.driver_image);

                        return (
                          <TableRow
                            key={driver.user_id}
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
                                {driver.name}
                              </Typography>
                            </TableCell>
                            {!isMobile && (
                              <>
                                {/* <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                                  <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                                    {driver.username}
                                  </Typography>
                                </TableCell> */}
                                <TableCell sx={{ py: isMobile ? 1 : 2 }}>
    <Typography 
      variant="body2" 
      sx={{ 
        fontSize: isMobile ? '0.75rem' : '0.875rem', 
        color: driver.email ? 'text.primary' : 'text.secondary' 
      }}
    >
      {driver.email || 'No Email'}
    </Typography>
  </TableCell>
                              </>
                            )}
                           <TableCell sx={{ py: isMobile ? 1 : 2 }}>
  <Typography 
    variant="body2" 
    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: driver.contact_number ? 'text.primary' : 'text.secondary' }}
  >
    {driver.contact_number || 'No Contact'}
  </Typography>
</TableCell>
                           <TableCell sx={{ py: isMobile ? 1 : 2 }}>
  <Typography 
    variant="body2" 
    sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', color: driver.vehicle_no ? 'text.primary' : 'text.secondary' }}
  >
    {driver.vehicle_no || 'No Vehicle assigned'}
  </Typography>
</TableCell> 
{!isMobile && (
  <TableCell sx={{ py: isMobile ? 1 : 2 }}>
    {idProofUrl ? (
      <Box
        component="a"
        href={idProofUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ display: 'inline-block' }}
      >
        <Avatar
          src={idProofUrl}
          alt="ID Proof"
          variant="rounded"
          sx={{
            width: isMobile ? 40 : 50,
            height: isMobile ? 40 : 50,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            objectFit: 'cover',
          }}
        />
      </Box>
    ) : (
      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
        Not Available
      </Typography>
    )}
  </TableCell>
)}
                            <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                              {driverImageUrl ? (
                                <Avatar
                                  src={driverImageUrl}
                                  alt="Driver"
                                  sx={{
                                    width: isMobile ? 40 : 50,
                                    height: isMobile ? 40 : 50,
                                    borderRadius: '10%',
                                  }}
                                />
                              ) : (
                               
                                  <Typography variant="caption" sx={{ color: 'grey.600' }}>
                                    No Image
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
                                <Tooltip title="View Details">
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleViewDetails(driver)}
                                      sx={{
                                        backgroundColor: '#e3f2fd',
                                        color: '#1976d2',
                                        '&:hover': { 
                                          backgroundColor: '#1976d2',
                                          color: 'white'
                                        },
                                        fontSize: isMobile ? '0.875rem' : '1rem'
                                      }}
                                    >
                                      <ViewIcon fontSize={isMobile ? "small" : "medium"} />
                                    </IconButton>
                                  </motion.div>
                                </Tooltip>

                                <Tooltip title="Edit Driver">
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEdit(driver)}
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

                                <Tooltip title="Deactivate Driver">
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteClick(driver)}
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
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredDrivers.length}
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

export default ListDriver;