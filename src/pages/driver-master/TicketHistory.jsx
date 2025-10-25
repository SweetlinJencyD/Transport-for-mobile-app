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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Clear as ClearIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TicketHistory = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const priorityColors = {
    low: 'success',
    medium: 'warning',
    high: 'error',
    critical: 'error',
  };

  // Fetch tickets
  const fetchTicketHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:8000/driver/ticket-history', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketHistory();
  }, []);

  // Filtered tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.issue_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.vehicle_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.bus_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

    let matchesDate = true;
    if (dateFilter !== 'all' && ticket.date) {
      const ticketDate = new Date(ticket.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      switch (dateFilter) {
        case 'today':
          matchesDate = ticketDate.toDateString() === today.toDateString();
          break;
        case 'yesterday':
          matchesDate = ticketDate.toDateString() === yesterday.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          matchesDate = ticketDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          matchesDate = ticketDate >= monthAgo;
          break;
        default:
          matchesDate = true;
      }
    }

    return matchesSearch && matchesPriority && matchesDate;
  });

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Export CSV
  const handleExport = () => {
    if (filteredTickets.length === 0) return;

    try {
      const headers = ['#', 'Issue Type', 'Description', 'Priority', 'Vehicle No', 'Bus No', 'Date', 'Time'];
      let csvContent = headers.join(',') + '\n';
      filteredTickets.forEach((ticket, index) => {
        const row = [
          index + 1,
          `"${ticket.issue_type || ''}"`,
          `"${ticket.description || ''}"`,
          ticket.priority,
          ticket.vehicle_no || '',
          ticket.bus_number || '',
          ticket.date || '',
          ticket.time || ''
        ];
        csvContent += row.join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `ticket_history_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriorityFilter('all');
    setDateFilter('all');
  };

  const handleAddTicket = () => navigate('/driver-ticketRaise');
  const handleViewDetails = (ticket) => console.log('View ticket details:', ticket);

  // MARK TICKET AS RESOLVED
  const handleMarkResolved = async (ticket) => {
    const confirmed = window.confirm(`Mark ticket #${ticket.ticket_id} as Resolved?`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8000/ticket-update/${ticket.ticket_id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to update ticket');

      setTickets(prev => prev.map(t => t.ticket_id === ticket.ticket_id ? { ...t, flag: 2 } : t));
      alert(`Ticket #${ticket.ticket_id} marked as resolved.`);
    } catch (err) {
      console.error(err);
      alert('Failed to update ticket. Please try again.');
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', p: isMobile ? 1 : 3 }}>
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Ticket History
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 1 }}>
              View and manage your ticket history
            </Typography>
          </Box>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddTicket}
              sx={{
                background: 'linear-gradient(45deg, #DC143C, #FF6B8B)',
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 'bold',
                fontSize: isMobile ? '0.75rem' : '0.875rem'
              }}
            >
              Add Ticket
            </Button>
          </motion.div>
        </Box>
      </motion.div>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* CONTENT */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Card sx={{ p: isMobile ? 1 : 3, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', minHeight: '70vh', maxHeight: '80vh' }}>
          {/* Search and Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
            <TextField
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>,
                endAdornment: searchTerm && <InputAdornment position="end"><IconButton onClick={() => setSearchTerm('')} size="small" sx={{ mr: -0.5 }}><ClearIcon fontSize="small" /></IconButton></InputAdornment>
              }}
              sx={{ minWidth: isMobile ? '100%' : 300, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              size={isMobile ? "small" : "medium"}
            />
            <FormControl size={isMobile ? "small" : "medium"} sx={{ minWidth: isMobile ? 120 : 140 }}>
              <InputLabel>Priority</InputLabel>
              <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} label="Priority">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
            <FormControl size={isMobile ? "small" : "medium"} sx={{ minWidth: isMobile ? 140 : 160 }}>
              <InputLabel>Date</InputLabel>
              <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} label="Date">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="yesterday">Yesterday</MenuItem>
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} sx={{ borderRadius: 2, px: 3, fontSize: isMobile ? '0.75rem' : '0.875rem' }} size={isMobile ? "small" : "medium"}>Export</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outlined" onClick={clearFilters} sx={{ borderRadius: 2, px: 3, fontSize: isMobile ? '0.75rem' : '0.875rem' }} size={isMobile ? "small" : "medium"}>Clear Filters</Button>
            </motion.div>
            <Box sx={{ flex: 1 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>{filteredTickets.length} tickets found</Typography>
          </Box>

          {/* TABLE */}
          <Paper elevation={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <TableContainer sx={{ flex: 1, overflow: 'auto', maxHeight: '100%', '& .MuiTable-root': { minWidth: isMobile ? 1000 : 'auto' } }}>
              <Table stickyHeader sx={{ minWidth: isMobile ? 1000 : 'auto' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ backgroundColor: 'background.paper', fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : '0.875rem', py: isMobile ? 1 : 2, width: '60px' }}>#</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.paper', fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>Issue Type</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.paper', fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>Description</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.paper', fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>Priority</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.paper', fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>Vehicle No</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.paper', fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>Bus No</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.paper', fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>Date</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.paper', fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : '0.875rem', textAlign: 'center', width: '100px' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTickets.length > 0 ? filteredTickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((ticket, index) => (
                    <TableRow key={ticket.ticket_id} component={motion.tr} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: index * 0.05 }} sx={{ transition: 'all 0.3s ease', '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ py: isMobile ? 1 : 2 }}>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell sx={{ py: isMobile ? 1 : 2 }}>{ticket.issue_type}</TableCell>
                      <TableCell sx={{ py: isMobile ? 1 : 2 }}>{ticket.description?.length > 50 ? `${ticket.description.substring(0, 50)}...` : ticket.description}</TableCell>
                      <TableCell sx={{ py: isMobile ? 1 : 2 }}>
                        <Chip label={ticket.priority} color={priorityColors[ticket.priority]} size="small" sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem', fontWeight: 'bold' }} />
                      </TableCell>
                      <TableCell sx={{ py: isMobile ? 1 : 2 }}>{ticket.vehicle_no}</TableCell>
                      <TableCell sx={{ py: isMobile ? 1 : 2 }}>{ticket.bus_number}</TableCell>
                      <TableCell sx={{ py: isMobile ? 1 : 2 }}>{ticket.date}</TableCell>
                      <TableCell sx={{ py: isMobile ? 1 : 2, textAlign: 'center' }}>
                        {ticket.flag === 1 && (
                          <Chip
                            label="On Progress"
                            color="info"
                            size="small"
                            sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => handleMarkResolved(ticket)}
                          />
                        )}
                        {ticket.flag === 2 && <Chip label="Resolved" color="primary" size="small" sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem', fontWeight: 'bold' }} />}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                        No tickets found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredTickets.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: '1px solid', borderColor: 'divider', '& .MuiTablePagination-toolbar': { padding: isMobile ? 1 : 2, flexWrap: 'wrap', gap: 1 }, '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: isMobile ? '0.75rem' : '0.875rem' }, flexShrink: 0 }}
            />
          </Paper>
        </Card>
      </motion.div>
    </Box>
  );
};

export default TicketHistory;
