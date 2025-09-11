const express = require('express');
const router = express.Router();
const db = require('../db');

// Utility: extract sheet id and gid, build CSV export URL
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

// Simple CSV parser that handles quoted fields
function parseCsv(text) {
  const lines = text\n    .replace(/\r\n/g, '\n')
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

router.post('/googleSheet', async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url) {
      return res.status(400).json({ message: 'Missing url in body' });
    }

    const exportUrl = buildCsvExportUrl(url);
    if (!exportUrl) {
      return res.status(400).json({ message: 'Invalid Google Sheet URL' });
    }

    // Use global fetch (Node 18+). If not available, this will throw.
    const response = await fetch(exportUrl);
    if (!response.ok) {
      return res.status(400).json({ message: 'Failed to fetch sheet', status: response.status });
    }
    const csvText = await response.text();
    const rows = parseCsv(csvText);

    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: 'No rows found in sheet' });
    }

    // Collect unique names from first two columns
    const projects = new Set();
    const categories = new Set();

    for (const row of rows) {
      const projectName = String(row[0] || '').trim();
      const categoryName = String(row[1] || '').trim();
      if (projectName) projects.add(projectName);
      if (categoryName) categories.add(categoryName);
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Insert projects if not exist
      for (const name of projects) {
        // Check existence by exact name
        const [existing] = await conn.query('SELECT id FROM projects WHERE name = ? LIMIT 1', [name]);
        if (existing.length === 0) {
          await conn.query('INSERT INTO projects (name, description) VALUES (?, ?)', [name, null]);
        }
      }

      // Insert task categories if not exist
      for (const name of categories) {
        const [existing] = await conn.query('SELECT id FROM task_categories WHERE name = ? LIMIT 1', [name]);
        if (existing.length === 0) {
          await conn.query('INSERT INTO task_categories (name) VALUES (?)', [name]);
        }
      }

      await conn.commit();
      conn.release();

      res.json({
        message: 'Import completed',
        inserted: {
          projects: projects.size,
          task_categories: categories.size,
        },
      });
    } catch (e) {
      await conn.rollback();
      conn.release();
      console.error('Import transaction error:', e);
      res.status(500).json({ message: 'Import failed', error: e.message });
    }
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;