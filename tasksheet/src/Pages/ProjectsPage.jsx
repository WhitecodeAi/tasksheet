import React, { useEffect, useState } from 'react';
import axios from 'axios';

import {
 Divider, CircularProgress,Container, Box, TextField, Button,
  Card, CardContent, Typography, Grid, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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
  <Grid size={5} >
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
        <Grid size={5}>
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        margin="dense"
        size="small"
      />
    </Grid>
     <Grid size={2}>
    
        <Button type="submit" variant="contained">
          {buttonText}
        </Button>
        {initialData && (
          <Button variant="text" onClick={onCancel} sx={{ ml: 2 }}>
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
      <Typography variant="h6" gutterBottom>
        {editingProject ? "Edit Project" : "Add New Project"}
      </Typography>

      <ProjectForm  
        onSubmit={editingProject ? handleUpdateProject : handleAddProject}
        initialData={editingProject}
        buttonText={editingProject ? "Update" : "Add Project"}
        onCancel={() => setEditingProject(null)}
      />
<Divider style={{margin:'15px 0'}} />

<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
 <Typography variant="h6"  sx={{ whiteSpace: 'nowrap' }}>
       List of Projects
      </Typography>
 <TextField 
        label="Search Projects..."
        variant="outlined"
        fullWidth
        size='small'
        margin='dense'
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setPage(0);
        }}
        sx={{  width:'220px' }}
      />
</Box>
     

 
      

      <TableContainer component={Paper}  sx={{ borderTop: '1px solid #eee' }} >
        <Table size="small"> 
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
                  <IconButton onClick={() => setEditingProject(project)}><EditIcon /></IconButton>
             <IconButton
  onClick={() => handleDeleteProject(project.id)}
  disabled={deletingId === project.id}
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
