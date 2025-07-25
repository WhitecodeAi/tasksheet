// src/Pages/UsersPage.js

import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Button, Table, TableHead,
  TableRow, TableCell, TableBody, Paper, Box
} from '@mui/material';

const UsersPage = () => {
  const [users, setUsers] = useState([]);

  // Placeholder fetch (to be replaced with actual API)
  useEffect(() => {
    // TODO: Replace with actual API call
    setUsers([
      { id: 1, name: 'Ganesh Patil', email: 'ganesh@example.com', role: 'User' },
      { id: 2, name: 'Shruti Jog', email: 'shruti@example.com', role: 'Admin' }
    ]);
  }, []);

  const handleAddUser = () => {
    // TODO: Open dialog/form to add user
    alert('Add User clicked');
  };

  const handleEdit = (userId) => {
    // TODO: Edit logic
    alert(`Edit user ${userId}`);
  };

  const handleDelete = (userId) => {
    // TODO: Delete logic
    alert(`Delete user ${userId}`);
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" mt={4} mb={2}>
        <Typography variant="h5">👥 Manage Users</Typography>
        <Button variant="contained" color="primary" onClick={handleAddUser}>
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
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => handleEdit(user.id)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(user.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default UsersPage;
