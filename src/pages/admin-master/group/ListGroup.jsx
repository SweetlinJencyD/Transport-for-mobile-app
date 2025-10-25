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

const ListGroup = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState([]);
  const [vehiclesMap, setVehiclesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, group: null });
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
    fetchData();
  }, []);

  const handleTokenExpiredClose = () => {
    setTokenExpired(false);
    navigate('/login');
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fetch vehicles and map by ID for quick lookup
  const fetchVehicles = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/vehicle_list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        setTokenExpired(true);
        localStorage.removeItem('token');
        throw new Error('Token expired. Please login again.');
      }

      if (!res.ok) throw new Error('Failed to fetch vehicles');

      const data = await res.json();
      const map = data.reduce((acc, vehicle) => {
        acc[vehicle.id] = vehicle.vehicle_no;
        return acc;
      }, {});
      setVehiclesMap(map);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError(err.message);
      if (err.message.includes('Token expired')) {
        setTokenExpired(true);
      }
    }
  };

  const fetchGroups = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/group_list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        setTokenExpired(true);
        localStorage.removeItem('token');
        throw new Error('Token expired. Please login again.');
      }

      if (!res.ok) throw new Error('Failed to fetch groups');

      const data = await res.json();

      // ✅ Fix: merge same group_name entries
      const grouped = {};
      (data.data || []).forEach((g) => {
        const name = g.group_name;
        if (!grouped[name]) {
          grouped[name] = { ...g, buses: [...(g.buses || [])] };
        } else {
          grouped[name].buses = [...grouped[name].buses, ...(g.buses || [])];
        }
      });

      // Convert object back to array
      setGroups(Object.values(grouped));
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError(err.message);
      if (err.message.includes('Token expired')) {
        setTokenExpired(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      setLoading(false);
      return;
    }
    await fetchVehicles();
    await fetchGroups();
  };

  const handleEdit = (group) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    navigate('/edit-group', { state: { group } });
  };

  const handleDeleteClick = (group) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    setDeleteConfirm({ open: true, group });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.group) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setTokenExpired(true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/delete_group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: deleteConfirm.group.id }),
      });

      if (res.status === 401) {
        setTokenExpired(true);
        localStorage.removeItem('token');
        throw new Error('Token expired. Please login again.');
      }

      const data = await res.json();
      if (res.ok) {
        showSnackbar('Group deleted successfully!', 'success');
        setGroups((prev) => prev.filter((g) => g.id !== deleteConfirm.group.id));
      } else {
        showSnackbar(data.detail || 'Failed to delete group', 'error');
      }
    } catch (err) {
      console.error('Error deleting group:', err);
      showSnackbar('An error occurred while deleting the group.', 'error');
      if (err.message.includes('Token expired')) {
        setTokenExpired(true);
      }
    } finally {
      setDeleteConfirm({ open: false, group: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ open: false, group: null });
  };

  const handleExport = () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }

    if (filteredGroups.length === 0) {
      showSnackbar('No data to export', 'warning');
      return;
    }

    try {
      const headers = ['Group Name', 'Bus Numbers'];

      // Create CSV content
      let csvContent = headers.join(',') + '\n';

      filteredGroups.forEach(group => {
        const busNumbers = group.buses && group.buses.length > 0
          ? group.buses
            .map(bus => vehiclesMap[bus.vehicle_id] || bus.vehicle_no || '-')
            .join('; ')
          : '-';

        const row = [
          group.group_name,
          `"${busNumbers}"` // Wrap in quotes since it might contain commas
        ];
        csvContent += row.join(',') + '\n';
      });

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `groups_${new Date().toISOString().split('T')[0]}.csv`);
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

  const handleAddGroup = () => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    navigate('/add-group');
  };

  const filteredGroups = groups.filter(group =>
    group.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.buses && group.buses.some(bus =>
      vehiclesMap[bus.vehicle_id]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.vehicle_no?.toLowerCase().includes(searchTerm.toLowerCase())
    ))
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

  const handleViewDetails = (group) => {
    if (!checkTokenExpiration()) {
      setTokenExpired(true);
      return;
    }
    navigate('/view-group', { state: { group } });
  };

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
            Are you sure you want to delete group <strong>"{deleteConfirm.group?.group_name}"</strong>?
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
              Group Management
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 1 }}>
              Manage your vehicle groups and assignments
            </Typography>
          </Box>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddGroup}
              sx={{
                background: 'linear-gradient(45deg, #DC143C, #FF6B8B)',
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 'bold',
                fontSize: isMobile ? '0.75rem' : '0.875rem'
              }}
            >
              Add Group
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
              placeholder="Search groups..."
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
              {filteredGroups.length} groups found
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
                      Group Name
                    </TableCell>
                    {/* <TableCell sx={{
                      backgroundColor: 'background.paper',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      width: isMobile ? '300px' : 'auto'
                    }}>
                      Bus Numbers
                    </TableCell> */}
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
                  {filteredGroups.length > 0 ? (
                    filteredGroups
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((group, index) => {
                        const busNumbers = group.buses && group.buses.length > 0
                          ? group.buses
                            .map(bus => vehiclesMap[bus.vehicle_id] || bus.vehicle_no || '-')
                            .join(', ')
                          : '-';

                        return (
                          <TableRow
                            key={group.id}
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
                                {index + 1}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                                {group.group_name}
                              </Typography>
                            </TableCell>
                            {/* <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                              <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                                {busNumbers}
                              </Typography>
                            </TableCell> */}
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
                                      onClick={() => handleViewDetails(group)}
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
                                <Tooltip title="Edit Group">
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEdit(group)}
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

                                <Tooltip title="Delete Group">
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteClick(group)}
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
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          No groups found
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
              count={filteredGroups.length}
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

export default ListGroup;