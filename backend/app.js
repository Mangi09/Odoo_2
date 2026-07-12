const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { connectDB } = require('./shared/db');

// Route imports
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const environmentalRoutes = require('./routes/environmental');
const socialRoutes = require('./routes/social');
const gamificationRoutes = require('./routes/gamification');
const governanceRoutes = require('./routes/governance');
const reportsRoutes = require('./routes/reports');
const notificationsRoutes = require('./routes/notifications');
const profileRoutes = require('./routes/profile');
const settingsRoutes = require('./routes/settings');
const { verifyJWT } = require('./shared/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'EcoSphere API', timestamp: new Date().toISOString() });
});

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/environmental', environmentalRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/settings', settingsRoutes);
// Also mount departments/categories at root-level paths (frontend_handoff.md spec)
app.use('/api/departments', settingsRoutes);
app.use('/api/categories', settingsRoutes);

// ── 404 Fallback ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.path}` });
});

// ── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ── Boot ────────────────────────────────────────────────────────────────────
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🌿 EcoSphere API running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
