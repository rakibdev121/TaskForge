const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT p.id, p.name, p.description, p.color, p.created_at,
        COUNT(t.id)::int AS task_count,
        COUNT(t.id) FILTER (WHERE t.status = 'done')::int AS completed_count
       FROM projects p
       LEFT JOIN tasks t ON t.project_id = p.id AND t.user_id = p.user_id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.updated_at DESC, p.id DESC`,
      [req.user.id]
    );
    res.json({ projects: result.rows });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const description = String(req.body.description || '').trim();
    const color = /^#[0-9a-fA-F]{6}$/.test(req.body.color) ? req.body.color : '#8b5cf6';
    if (name.length < 2 || name.length > 120) {
      return res.status(400).json({ error: 'Project name must be between 2 and 120 characters.' });
    }
    const result = await db.query(
      'INSERT INTO projects (user_id, name, description, color) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, name, description.slice(0, 500), color]
    );
    res.status(201).json({ project: result.rows[0] });
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const description = String(req.body.description || '').trim();
    const color = /^#[0-9a-fA-F]{6}$/.test(req.body.color) ? req.body.color : '#8b5cf6';
    if (name.length < 2 || name.length > 120) {
      return res.status(400).json({ error: 'Project name must be between 2 and 120 characters.' });
    }
    const result = await db.query(
      `UPDATE projects SET name=$1, description=$2, color=$3, updated_at=NOW()
       WHERE id=$4 AND user_id=$5 RETURNING *`,
      [name, description.slice(0, 500), color, req.params.id, req.user.id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Project not found.' });
    res.json({ project: result.rows[0] });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'DELETE FROM projects WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Project not found.' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
