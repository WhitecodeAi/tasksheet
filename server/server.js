//const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
//require('dotenv').config({ path: envFile });

const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3001;

 

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const taskCategoriesRoutes = require('./routes/taskCategories');
const tasksheetEntriesRoutes = require('./routes/tasksheetEntries');
const userRoutes = require('./routes/users');
const db = require('./db'); // using pool directly

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/10e92Q_HncJq-KJBrfzJfuWq6GRlz6JVsDZdRWf-VmsM/edit?gid=0#gid=0';

function buildCsvExportUrl(inputUrl) {
  try {
    const url = new URL(inputUrl);
    const parts = url.pathname.split('/');
    const idIndex = parts.findIndex((p) => p === 'd');
    const sheetId = idIndex !== -1 && parts[idIndex + 1] ? parts[idIndex + 1] : null;
    const gid = url.searchParams.get('gid') || '0';
    if (!sheetId) return null;
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  } catch (e) {
    return null;
  }
}

function parseCsv(text) {
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0);

  const rows = lines.map((line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result.map((c) => c.trim());
  });
  return rows;
}

async function importProjectsAndCategoriesFromSheet(sheetUrl) {
  const exportUrl = buildCsvExportUrl(sheetUrl);
  if (!exportUrl) {
    console.warn('Invalid Google Sheet URL, skipping import');
    return { projects: 0, categories: 0 };
  }
  const res = await fetch(exportUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch sheet: ${res.status}`);
  }
  const csvText = await res.text();
  const rows = parseCsv(csvText);
  if (!rows.length) return { projects: 0, categories: 0 };

  let startIndex = 0;
  const c0 = String(rows[0][0] || '').toLowerCase();
  const c1 = String(rows[0][1] || '').toLowerCase();
  if (c0.includes('project') || c1.includes('categor')) startIndex = 1;

  const projects = new Set();
  const categories = new Set();
  for (let i = startIndex; i < rows.length; i++) {
    const r = rows[i];
    const projectName = String(r[0] || '').trim();
    const categoryName = String(r[1] || '').trim();
    if (projectName) projects.add(projectName);
    if (categoryName) categories.add(categoryName);
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const name of projects) {
      const [ex] = await conn.query('SELECT id FROM projects WHERE name = ? LIMIT 1', [name]);
      if (ex.length === 0) {
        await conn.query('INSERT INTO projects (name, description) VALUES (?, ?)', [name, null]);
      }
    }
    for (const name of categories) {
      const [ex] = await conn.query('SELECT id FROM task_categories WHERE name = ? LIMIT 1', [name]);
      if (ex.length === 0) {
        await conn.query('INSERT INTO task_categories (name) VALUES (?)', [name]);
      }
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  const result = { projects: projects.size, categories: categories.size };
  console.log(`📥 Imported ${result.projects} projects, ${result.categories} categories from sheet.`);
  return result;
}

// Admin endpoint to trigger sheet import manually (no UI)
app.post('/api/admin/sheet-import', async (req, res) => {
  try {
    const out = await importProjectsAndCategoriesFromSheet(SHEET_URL);
    res.json({ message: 'ok', ...out });
  } catch (e) {
    console.error('sheet-import error:', e);
    res.status(500).json({ message: 'failed', error: e.message });
  }
});

// Initialize database schema if not present
(async function initSchema() {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'employee',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

    await db.query(`CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

    await db.query(`CREATE TABLE IF NOT EXISTS task_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

    await db.query(`CREATE TABLE IF NOT EXISTS tasksheet_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      project_id INT NOT NULL,
      task_category_id INT NOT NULL,
      entry_date DATE NOT NULL,
      hours INT DEFAULT 0,
      minutes INT DEFAULT 0,
      total_hours DECIMAL(5,2) DEFAULT 0,
      comments TEXT,
      task_name TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_project_id (project_id),
      INDEX idx_category_id (task_category_id),
      INDEX idx_entry_date (entry_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

    console.log('✅ Database schema ensured.');

    // Ensure a default admin user based on configured email
    const bcrypt = require('bcryptjs');
    const adminName = process.env.DEFAULT_ADMIN_NAME || 'Administrator';
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@tasksheet.local';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeMeNow!123';

    const [existingAdminByEmail] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [adminEmail]);
    const hashed = await bcrypt.hash(adminPassword, 10);

    if (existingAdminByEmail.length === 0) {
      await db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [adminName, adminEmail, hashed, 'admin']);
      console.log(`🛡️ Default admin ensured: ${adminEmail}`);
    } else {
      // Keep email stable; ensure role and password are set to the configured values
      await db.query('UPDATE users SET role = ?, password = ? WHERE email = ?', ['admin', hashed, adminEmail]);
      console.log(`🛡️ Default admin updated: ${adminEmail}`);
    }
    try {
      await importProjectsAndCategoriesFromSheet(SHEET_URL);
    } catch (e2) {
      console.error('❌ Sheet import failed:', e2);
    }
  } catch (e) {
    console.error('❌ Schema initialization error:', e);
  }
})();


app.get("/health", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1");
    res.status(200).json({ db: "Connected ✅", timestamp: new Date() });
  } catch (err) {
    console.error("DB connection error ❌", err);
    res.status(500).json({ error: "DB connection failed", details: err.message });
  }
});


// Middleware to attach DB to every request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.use('/api/taskCategories', taskCategoriesRoutes);
app.use('/api', authRoutes);
app.use('/api/tasksheetEntries', tasksheetEntriesRoutes);
app.use('/api/users', userRoutes);
 



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
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is live 🔥" });
});
console.log(`✅ Backend live at ${process.env.PORT} in ${process.env.NODE_ENV} mode`);

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

const staticDir = path.join(__dirname, "../client/dist");
app.use(express.static(staticDir));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});
