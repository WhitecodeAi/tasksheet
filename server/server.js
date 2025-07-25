const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config();


app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const taskCategoriesRoutes = require('./routes/taskCategories');
const tasksheetEntriesRoutes = require('./routes/tasksheetEntries');
 
const db = require('./db'); // using pool directly


// Middleware to attach DB to every request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.use('/api/task-categories', taskCategoriesRoutes);
app.use('/api', authRoutes);
app.use('/api/tasksheetEntries', tasksheetEntriesRoutes);

// API to get all projects
app.get("/api/projects", (req, res) => {
  db.query("SELECT * FROM projects")
    .then(([results]) => res.json(results))
    .catch(err => res.status(500).json({ error: err }));
});

// Add new project
app.post("/api/projects", (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Project name is required" });
  }

  const query = "INSERT INTO projects (name, description) VALUES (?, ?)";
  db.query(query, [name, description])
    .then(() => res.status(201).json({ message: "Project added successfully" }))
    .catch(err => res.status(500).json({ error: err }));
});

// Delete a project by ID
app.delete("/api/projects/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM projects WHERE id = ?";
  db.query(query, [id])
    .then(() => res.status(200).json({ message: "Project deleted successfully" }))
    .catch(err => res.status(500).json({ error: err }));
});

// Update a project by ID
app.put("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const query = "UPDATE projects SET name = ?, description = ? WHERE id = ?";
  db.query(query, [name, description, id])
    .then(() => res.status(200).json({ message: "Project updated successfully" }))
    .catch(err => {
      console.error("Error updating project:", err);
      res.status(500).json({ error: err });
    });
});

// Start the server
app.listen(3001, () => {
  console.log("✅ Backend running on http://localhost:3001");
});
