require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();
const port = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, project: 'TaskForge', message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

app.use((err, req, res, next) => {
  console.error(err.message);
  if (err.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: 'This frontend origin is not allowed.' });
  }
  if (err.code === '23503') return res.status(400).json({ error: 'Related record does not exist.' });
  if (err.code === '22007' || err.code === '22008') return res.status(400).json({ error: 'Invalid date value.' });
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({ error: 'Database connection failed. Check DATABASE_URL.' });
  }
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`TaskForge API running on port ${port}`);
});
