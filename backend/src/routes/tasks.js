const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const statuses = ['todo', 'progress', 'review', 'done'];
const priorities = ['low', 'medium', 'high'];

router.get('/', async (req, res, next) => {
  try {
    const params = [req.user.id];
    let projectFilter = '';
    if (req.query.projectId && req.query.projectId !== 'all') {
      params.push(req.query.projectId);
      projectFilter = ` AND t.project_id = $${params.length}`;
    }
    const result = await db.query(
      `SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
              t.due_date, t.created_at, t.updated_at, p.name AS project_name
       FROM tasks t
       LEFT JOIN projects p ON p.id = t.project_id AND p.user_id = t.user_id
       WHERE t.user_id = $1${projectFilter}
       ORDER BY
         CASE t.status WHEN 'todo' THEN 1 WHEN 'progress' THEN 2 WHEN 'review' THEN 3 ELSE 4 END,
         t.created_at DESC`,
      params
    );
    res.json({ tasks: result.rows });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    const status = statuses.includes(req.body.status) ? req.body.status : 'todo';
    const priority = priorities.includes(req.body.priority) ? req.body.priority : 'medium';
    const dueDate = req.body.due_date || null;
    const projectId = req.body.project_id || null;

    if (title.length < 2 || title.length > 180) {
      return res.status(400).json({ error: 'Task title must be between 2 and 180 characters.' });
    }
    if (projectId) {
      const project = await db.query('SELECT id FROM projects WHERE id=$1 AND user_id=$2', [projectId, req.user.id]);
      if (!project.rowCount) return res.status(400).json({ error: 'Selected project does not exist.' });
    }
    const result = await db.query(
      `INSERT INTO tasks (user_id, project_id, title, description, status, priority, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, project_id, title, description, status, priority, due_date, created_at, updated_at`,
      [req.user.id, projectId, title, description.slice(0, 1000), status, priority, dueDate]
    );
    res.status(201).json({ task: result.rows[0] });
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const current = await db.query('SELECT * FROM tasks WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (!current.rowCount) return res.status(404).json({ error: 'Task not found.' });
    const old = current.rows[0];
    const title = req.body.title === undefined ? old.title : String(req.body.title).trim();
    const description = req.body.description === undefined ? old.description : String(req.body.description).trim();
    const status = req.body.status === undefined ? old.status : req.body.status;
    const priority = req.body.priority === undefined ? old.priority : req.body.priority;
    const dueDate = req.body.due_date === undefined ? old.due_date : (req.body.due_date || null);
    const projectId = req.body.project_id === undefined ? old.project_id : (req.body.project_id || null);

    if (title.length < 2 || title.length > 180) return res.status(400).json({ error: 'Task title must be between 2 and 180 characters.' });
    if (!statuses.includes(status)) return res.status(400).json({ error: 'Invalid task status.' });
    if (!priorities.includes(priority)) return res.status(400).json({ error: 'Invalid task priority.' });
    if (projectId) {
      const project = await db.query('SELECT id FROM projects WHERE id=$1 AND user_id=$2', [projectId, req.user.id]);
      if (!project.rowCount) return res.status(400).json({ error: 'Selected project does not exist.' });
    }

    const result = await db.query(
      `UPDATE tasks SET project_id=$1, title=$2, description=$3, status=$4,
       priority=$5, due_date=$6, updated_at=NOW()
       WHERE id=$7 AND user_id=$8
       RETURNING id, project_id, title, description, status, priority, due_date, created_at, updated_at`,
      [projectId, title, description.slice(0, 1000), status, priority, dueDate, req.params.id, req.user.id]
    );
    res.json({ task: result.rows[0] });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM tasks WHERE id=$1 AND user_id=$2 RETURNING id', [req.params.id, req.user.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Task not found.' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
