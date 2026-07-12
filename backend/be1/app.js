const express = require('express');
const environmentalRoutes = require('./routes/environmental');
const socialRoutes = require('./routes/social');

const app = express();

app.use(express.json());

// Header mapping middleware for request contexts
app.use((req, res, next) => {
  if (!req.body) req.body = {};
  req.employeeId = req.headers['x-employee-id'] || req.query.employee_id;
  next();
});

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'BE1 Service is active' });
});

// API Routes
app.use('/api/environmental', environmentalRoutes);
app.use('/api/social', socialRoutes);

// Fallback route
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found on BE1' });
});

module.exports = app;
