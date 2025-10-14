import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, MenuItem } from '@mui/material';
import Breadcrumbs from '../Components/Breadcrumbs';
import { api } from '../utils/api';
import TasksheetEntriesDisplay from '../Components/TasksheetEntriesDisplay';

const TasksheetDetailsPage = () => {
  const { userId } = useParams();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(userId || '');
  const [entries, setEntries] = useState([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    api.get('/api/users')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    api.get(`/api/tasksheetEntries/user/${selectedUserId}`)
      .then(res => setEntries(res.data))
      .catch(() => setEntries([]));
    const foundUser = users.find(u => String(u.user_id) === String(selectedUserId));
    setUserName(foundUser ? foundUser.name : '');
  }, [selectedUserId, users]);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Tasksheet Details</Typography>
      <TextField
        select
        label="Select User"
        value={selectedUserId}
        onChange={e => setSelectedUserId(e.target.value)}
        sx={{ minWidth: 220, mb: 3 }}
        size="small"
      >
        {users.map(u => (
          <MenuItem key={u.user_id} value={u.user_id}>{u.name}</MenuItem>
        ))}
      </TextField>
      <TasksheetEntriesDisplay entries={entries} showActions={false} />
    </Box>
  );
};

export default TasksheetDetailsPage;
