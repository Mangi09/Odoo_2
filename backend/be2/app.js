const express = require('express');
const governanceRoutes = require('./routes/governance');
const gamificationRoutes = require('./routes/gamification');
const reportsRoutes = require('./routes/reports');
const scoresRoutes = require('./routes/scores');

const app = express();

app.use(express.json());

// Set client context globally
app.use((req, res, next) => {
  if (!req.body) req.body = {};
  req.employeeId = req.headers['x-employee-id'] || req.query.employee_id;
  next();
});

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'BE2 Service is active' });
});

// Bind route handlers
app.use('/api/governance', governanceRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/scores', scoresRoutes);

// Fallback response
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found on BE2' });
});

module.exports = app;
