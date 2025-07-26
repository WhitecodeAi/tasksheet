import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Button, Table, TableHead,
  TableRow, TableCell, TableBody, Paper, Box,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem
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
        password: '', // Do not prefill password on edit
        role: user.role
      });
      setIsEditing(true);
      setEditingUserId(userId);
      setError('');
      setOpenDialog(true);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:3001/api/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleSaveUser = async () => {
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
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" mt={4} mb={2}>
        <Typography variant="h5">👥 Manage Users</Typography>
        <Button variant="contained" color="primary" onClick={handleAddUserClick}>
          ➕ Add User
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>👤 Name</TableCell>
              <TableCell>📧 Email</TableCell>
              <TableCell>🛡️ Role</TableCell>
              <TableCell align="right">⚙️ Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
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
      </Paper>

      {/* Shared Add/Edit User Dialog */}
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
          </TextField>
          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">
            {isEditing ? 'Save Changes' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersPage;
