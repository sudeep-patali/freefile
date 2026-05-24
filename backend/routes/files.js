const express = require('express');
const { getDb } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/files
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const files = db.prepare(`
      SELECT f.*, COUNT(e.id) as entry_count
      FROM files f
      LEFT JOIN entries e ON e.file_id = f.id
      WHERE f.user_id = ?
      GROUP BY f.id
      ORDER BY f.created_at DESC
    `).all(req.userId);
    res.json(files);
  } catch (err) {
    console.error('Get files error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/files
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'File name is required' });
  }

  try {
    const db = getDb();
    const result = db.prepare('INSERT INTO files (user_id, name) VALUES (?, ?)').run(req.userId, name.trim());
    const file = db.prepare('SELECT * FROM files WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ ...file, entry_count: 0 });
  } catch (err) {
    console.error('Create file error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/files  (body: { ids: [] })
router.delete('/', (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids array is required' });
  }

  try {
    const db = getDb();
    // Verify ownership of all files before deleting
    const placeholders = ids.map(() => '?').join(',');
    const owned = db.prepare(`
      SELECT id FROM files WHERE id IN (${placeholders}) AND user_id = ?
    `).all(...ids, req.userId);

    if (owned.length !== ids.length) {
      return res.status(403).json({ error: 'Unauthorized to delete one or more files' });
    }

    const deleteFiles = db.prepare(`DELETE FROM files WHERE id IN (${placeholders}) AND user_id = ?`);
    deleteFiles.run(...ids, req.userId);

    res.json({ deleted: ids.length });
  } catch (err) {
    console.error('Delete files error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/files/:fileId/entries
router.get('/:fileId/entries', (req, res) => {
  const { fileId } = req.params;
  try {
    const db = getDb();
    const file = db.prepare('SELECT id FROM files WHERE id = ? AND user_id = ?').get(fileId, req.userId);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const entries = db.prepare('SELECT * FROM entries WHERE file_id = ? ORDER BY created_at ASC').all(fileId);
    res.json(entries);
  } catch (err) {
    console.error('Get entries error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/files/:fileId/entries
router.post('/:fileId/entries', (req, res) => {
  const { fileId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const db = getDb();
    const file = db.prepare('SELECT id FROM files WHERE id = ? AND user_id = ?').get(fileId, req.userId);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const result = db.prepare('INSERT INTO entries (file_id, content) VALUES (?, ?)').run(fileId, content.trim());
    const entry = db.prepare('SELECT * FROM entries WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(entry);
  } catch (err) {
    console.error('Create entry error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/files/:fileId/entries/:id
router.put('/:fileId/entries/:id', (req, res) => {
  const { fileId, id } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const db = getDb();
    const file = db.prepare('SELECT id FROM files WHERE id = ? AND user_id = ?').get(fileId, req.userId);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const entry = db.prepare('SELECT id FROM entries WHERE id = ? AND file_id = ?').get(id, fileId);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    db.prepare('UPDATE entries SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(content.trim(), id);
    const updated = db.prepare('SELECT * FROM entries WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    console.error('Update entry error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/files/:fileId/entries/:id
router.delete('/:fileId/entries/:id', (req, res) => {
  const { fileId, id } = req.params;
  try {
    const db = getDb();
    const file = db.prepare('SELECT id FROM files WHERE id = ? AND user_id = ?').get(fileId, req.userId);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const result = db.prepare('DELETE FROM entries WHERE id = ? AND file_id = ?').run(id, fileId);
    if (result.changes === 0) return res.status(404).json({ error: 'Entry not found' });

    res.json({ deleted: true });
  } catch (err) {
    console.error('Delete entry error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
