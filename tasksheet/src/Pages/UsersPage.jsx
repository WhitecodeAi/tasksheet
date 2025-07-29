import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Button, Table, TableHead,
  TableRow, TableCell, TableBody, Paper, Box,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, TablePagination, TableSortLabel, CircularProgress
} from '@mui/material';
import axios from 'axios';

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'admin'
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState(null);
  const [orderBy, setOrderBy] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddUserClick = () => {
    setForm(initialForm);
    setError('');
    setIsEditing(false);
    setEditingUserId(null);
    setOpenDialog(true);
  };

  const handleEdit = (userId) => {
    const user = users.find(u => u.user_id === userId);
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role
      });
      setIsEditing(true);
      setEditingUserId(userId);
      setError('');
      setOpenDialog(true);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:3001/api/users/${userId}`);
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Something went wrong while deleting the user.');
      }
    }
  };
  const handleSaveUser = async () => {
    setIsLoading(true);
    try {
      if (isEditing) {
        await axios.put(`http://localhost:3001/api/users/${editingUserId}`, {
          name: form.name,
          email: form.email,
          role: form.role,
        });
      } else {
        await axios.post('http://localhost:3001/api/users', {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
      }

      setOpenDialog(false);
      fetchUsers();
      setForm(initialForm);
      setError('');
      setIsEditing(false);
      setEditingUserId(null);
    } catch (err) {
      console.error('Save user error:', err);
      setError('Something went wrong while saving the user.');
    }
    finally {
    setIsLoading(false);
  }
  };

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const getComparator = (order, orderBy) => {
    if (!order || !orderBy) return null;
    return order === 'desc'
      ? (a, b) => (b[orderBy].toLowerCase() < a[orderBy].toLowerCase() ? -1 : 1)
      : (a, b) => (a[orderBy].toLowerCase() < b[orderBy].toLowerCase() ? -1 : 1);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedUsers = order && orderBy
    ? filteredUsers.slice().sort(getComparator(order, orderBy))
    : filteredUsers.slice().reverse();
  return (
    <Container>
      <Box display="flex" justifyContent="space-between" mt={4} mb={2}>
        <Typography variant="h5">👥 Manage Users</Typography>
        <Box display="flex" gap={2}>
          <TextField
            label="🔍 Search Users"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleAddUserClick}>
            ➕ Add User
          </Button>
        </Box>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === 'name' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleSortRequest('name')}
                >
                  👤 Name
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'email' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'email'}
                  direction={orderBy === 'email' ? order : 'asc'}
                  onClick={() => handleSortRequest('email')}
                >
                  📧 Email
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'role' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'role'}
                  direction={orderBy === 'role' ? order : 'asc'}
                  onClick={() => handleSortRequest('role')}
                >
                  🛡️ Role
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">⚙️ Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map(user => (
                <TableRow key={user.user_id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => handleEdit(user.user_id)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(user.user_id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Name"
            fullWidth
            value={form.name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={form.email}
            onChange={handleChange}
          />
          {!isEditing && (
            <TextField
              margin="dense"
              name="password"
              label="Password"
              type="password"
              fullWidth
              value={form.password}
              onChange={handleChange}
            />
          )}
          <TextField
            margin="dense"
            name="role"
            label="Role"
            select
            fullWidth
            value={form.role}
            onChange={handleChange}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
          </TextField>
          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
       
           <Button onClick={handleSaveUser} variant="contained" disabled={isLoading}>
    {isLoading
      ? isEditing
        ? 'Saving Changes...'
        : 'Adding User...'
      : isEditing
        ? 'Save Changes'
        : 'Add'}
  </Button> 
  {isLoading && (
  <Box sx={{ textAlign: 'center', mt: 2 }}>
    <CircularProgress size={24} />
  </Box>
)}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersPage;
