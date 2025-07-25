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
  role: 'User'
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [form, setForm] = useState(initialForm);

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

  const handleAddUser = async () => {
    try {
      await axios.post('http://localhost:3001/api/users', form);
      setOpenAddDialog(false);
      setForm(initialForm);
      fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
    }
  };

  const handleEdit = (userId) => {
    alert(`Edit user ${userId}`);
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:3001/api/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" mt={4} mb={2}>
        <Typography variant="h5">👥 Manage Users</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)}>
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

      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New User</DialogTitle>
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
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            value={form.password}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="role"
            label="Role"
            select
            fullWidth
            value={form.role}
            onChange={handleChange}
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="User">User</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersPage;
