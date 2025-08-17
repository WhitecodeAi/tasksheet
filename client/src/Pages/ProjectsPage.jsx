import React, { useEffect, useState } from 'react';
import axios from 'axios';

import {
 Divider, CircularProgress,Container, Box, TextField, Button,
 Typography, Grid, IconButton, InputAdornment, Fab, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Search, Add, PushPin, PushPinOutlined } from '@mui/icons-material';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, TableSortLabel} from '@mui/material';
  import { Snackbar, Alert } from '@mui/material';
import { api } from '../utils/api';


const ProjectForm = ({ onSubmit, initialData, buttonText = "Add Project", onCancel }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ id: initialData?.id, name, description });
    setName("");
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit} >
      <Grid container spacing={2} alignItems={'center'}>
        <Grid size={4}>
          <TextField
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="dense"
            required
            size="small"
          />
        </Grid>
        <Grid size={4}>
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="dense"
            size="small"
          />
        </Grid>
        <Grid size={4} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            size="small"
            sx={{ px: 3, py: 1, minHeight: '32px' }}
          >
            {buttonText}
          </Button>
          {initialData && (
            <Button
              variant="outlined"
              onClick={onCancel}
              size="small"
              sx={{ px: 3, py: 1, minHeight: '32px' }}
            >
              Cancel
            </Button>
          )}
        </Grid>
      </Grid>
    </form>
  );
};

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
const [searchText, setSearchText] = useState("");
const [orderBy, setOrderBy] = useState("name");
const [order, setOrder] = useState("asc");
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);

const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState('');
const [deletingId, setDeletingId] = useState(null);
const [showAddForm, setShowAddForm] = useState(false);
const [isPinned, setIsPinned] = useState(false);

const filtered = projects.filter(p =>
  p.name.toLowerCase().includes(searchText.toLowerCase()) ||
  p.description.toLowerCase().includes(searchText.toLowerCase())
);

 
const sorted = filtered.sort((a, b) => {
  const aVal = a[orderBy]?.toString().toLowerCase() || "";
  const bVal = b[orderBy]?.toString().toLowerCase() || "";
  if (aVal < bVal) return order === "asc" ? -1 : 1;
  if (aVal > bVal) return order === "asc" ? 1 : -1;
  return 0;
});


const paginated = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
 
  const fetchProjects = () => {
    api.get('/api/projects')
      .then((res) => setProjects(res.data))
      .catch((err) => console.error("Error fetching projects:", err));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = (project) => {
    api.post('/api/projects', project)
      .then(() => fetchProjects())
      .catch((err) => console.error("Error adding project:", err));
  };

  const handleUpdateProject = (project) => {
    api.put(`/api/projects/${project.id}`, project)
      .then(() => {
        setEditingProject(null);
        fetchProjects();
      })
      .catch((err) => console.error("Error updating project:", err));
  };

const handleDeleteProject = (id) => {
  if (!window.confirm('Are you sure you want to delete this project?')) return;

  setDeletingId(id); // start loading state
  api
    .delete(`/api/projects/${id}`)
    .then(() => {
      fetchProjects();
      setSnackbarMessage('Project deleted successfully!');
    })
    .catch((err) => {
      console.error('Error deleting project:', err);
      setSnackbarMessage('Error deleting project.');
    })
    .finally(() => {
      setDeletingId(null); // reset loading state
      setSnackbarOpen(true);
    });
};
  return (<>
    <Container>
      {/* Search & Add Controls - Berry Dashboard Style */}
      <Paper
        sx={{
          p: 2,
          mb: 0,
          borderRadius: '12px 12px 0 0',
          border: '1px solid #f0f0f0',
          borderBottom: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          {/* Left: Search Field */}
          <TextField
            placeholder="Search projects..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f8fafc'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#9e9e9e', fontSize: '1.2rem' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Right: Add Button */}
          <Tooltip title={showAddForm ? "Cancel" : "Add Project"}>
            <Fab
              color="primary"
              size="small"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingProject(null); // Clear editing mode when toggling add form
              }}
            >
              {showAddForm ? '×' : <Add />}
            </Fab>
          </Tooltip>
        </Box>
      </Paper>

      {/* Inline Add/Edit Form */}
      {(showAddForm || editingProject) && (
        <Paper
          sx={{
            p: 3,
            mb: 0,
            borderRadius: 0,
            border: '1px solid #f0f0f0',
            borderTop: 'none',
            borderBottom: 'none',
            backgroundColor: '#fafbfc'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {editingProject ? "Edit Project" : "Add New Project"}
            </Typography>
            {!editingProject && (
              <IconButton
                size="small"
                onClick={() => setIsPinned(!isPinned)}
                sx={{
                  color: isPinned ? '#1976d2' : '#9e9e9e',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
                title={isPinned ? "Unpin form (closes after adding)" : "Pin form (stays open after adding)"}
              >
                {isPinned ? <PushPin fontSize="small" /> : <PushPinOutlined fontSize="small" />}
              </IconButton>
            )}
          </Box>
          <ProjectForm
            onSubmit={(project) => {
              if (editingProject) {
                handleUpdateProject(project);
              } else {
                handleAddProject(project);
                // Only hide form if not pinned
                if (!isPinned) {
                  setShowAddForm(false);
                }
              }
            }}
            initialData={editingProject}
            buttonText={editingProject ? "Update" : "Save"}
            onCancel={() => {
              setEditingProject(null);
              setShowAddForm(false);
              setIsPinned(false); // Reset pin state when canceling
            }}
          />
        </Paper>
      )}

      {/* Table Container */}
      <TableContainer
        component={Paper}
        sx={{
          mt: 0,
          borderRadius: (showAddForm || editingProject) ? '0 0 12px 12px' : '0 0 12px 12px',
          border: '1px solid #f0f0f0',
          borderTop: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Table size="small" sx={{ '& .MuiTableCell-root': { py: 1 } }}> 
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === 'name' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => {
                    const isAsc = orderBy === 'name' && order === 'asc';
                    setOrder(isAsc ? "desc" : "asc");
                    setOrderBy("name");
                  }}
                >
                  Project Name
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'description' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'description'}
                  direction={orderBy === 'description' ? order : 'asc'}
                  onClick={() => {
                    const isAsc = orderBy === 'description' && order === 'asc';
                    setOrder(isAsc ? "desc" : "asc");
                    setOrderBy("description");
                  }}
                >
                  Description
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.map((project) => (
              <TableRow
                key={project.id}
                sx={{
                  backgroundColor: editingProject?.id === project.id ? "rgba(25, 118, 210, 0.1)" : "inherit"
                }}
              >
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.description}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => setEditingProject(project)}
                    size="small"
                    sx={{ minHeight: '32px', minWidth: '32px' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteProject(project.id)}
                    disabled={deletingId === project.id}
                    size="small"
                    sx={{ minHeight: '32px', minWidth: '32px' }}
                  >
                    {deletingId === project.id ? (
                      <CircularProgress size={20} />
                    ) : (
                      <DeleteIcon />
                    )}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={sorted.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

    </Container>
    <Snackbar
  open={snackbarOpen}
  autoHideDuration={3000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
    {snackbarMessage}
  </Alert>
</Snackbar>
</>
  );
}

export default ProjectsPage;
