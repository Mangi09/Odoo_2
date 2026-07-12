const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../shared/db');
const { verifyJWT } = require('../shared/middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ecosphere_super_secret_jwt_key_change_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function setAuthCookie(res, token) {
  res.cookie('ecosphere_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

function buildUserProfile(user) {
  return {
    id: user._id,
    name: user.full_name,
    email: user.email,
    role: user.role,
    department: user.department_id,
    org_id: user.org_id,
    points_balance: user.points_balance || 0,
    xp_total: user.xp_total || 0,
    avatar: user.avatar || null,
    joinedAt: user.created_at
  };
}

function buildPermissions(role) {
  const base = ['view_dashboard', 'view_environmental', 'view_social', 'view_gamification', 'view_governance', 'view_reports', 'view_profile', 'view_notifications'];
  if (role === 'Employee') return [...base, 'join_activities', 'complete_challenges', 'redeem_rewards', 'acknowledge_policies'];
  if (role === 'Manager') return [...base, 'join_activities', 'complete_challenges', 'redeem_rewards', 'acknowledge_policies', 'approve_participations', 'resolve_issues', 'create_issues'];
  // Admin
  return [...base, 'join_activities', 'complete_challenges', 'redeem_rewards', 'acknowledge_policies', 'approve_participations', 'resolve_issues', 'create_issues', 'manage_settings', 'manage_departments', 'manage_categories'];
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = {};
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'Validation failed', fields: errors });
    }

    const db = getDB();
    const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password', fields: { email: 'No account found' } });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash || '');
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid email or password', fields: { password: 'Incorrect password' } });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Account is inactive. Contact your administrator.' });
    }

    const token = signToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json({
      user: buildUserProfile(user),
      permissions: buildPermissions(user.role),
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, orgName } = req.body;
    const errors = {};
    if (!name) errors.name = 'Name is required';
    if (!email || !/\S+@\S+\.\S+/.test(email)) errors.email = 'Valid email is required';
    if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'Validation failed', fields: errors });
    }

    const db = getDB();
    const existing = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered', fields: { email: 'Already in use' } });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = {
      _id: `u-${Date.now()}`,
      org_id: 'org-eco',
      department_id: null,
      full_name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role || 'Employee',
      password_hash: passwordHash,
      points_balance: 0,
      xp_total: 0,
      status: 'ACTIVE',
      avatar: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    await db.collection('users').insertOne(newUser);

    const token = signToken(newUser._id);
    setAuthCookie(res, token);

    return res.status(201).json({
      user: buildUserProfile(newUser),
      permissions: buildPermissions(newUser.role),
      token
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Signup failed' });
  }
});

// GET /api/auth/me
router.get('/me', verifyJWT, async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ _id: req.user.id });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    return res.status(200).json({
      user: buildUserProfile(user),
      permissions: buildPermissions(user.role)
    });
  } catch (err) {
    console.error('Auth/me error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('ecosphere_token');
  return res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
