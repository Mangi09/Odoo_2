const jwt = require('jsonwebtoken');
const { getDB } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'ecosphere_super_secret_jwt_key_change_in_prod';

/**
 * Verify JWT from HTTP-only cookie or Authorization: Bearer header.
 * Attaches req.user = { id, email, role, org_id, department_id }
 */
async function verifyJWT(req, res, next) {
  try {
    let token = null;

    // 1. Check HTTP-only cookie first
    if (req.cookies && req.cookies.ecosphere_token) {
      token = req.cookies.ecosphere_token;
    }

    // 2. Fall back to Authorization: Bearer header
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    // 3. Fall back to query parameter (needed for file downloads via <a> tags)
    if (!token && req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch fresh user from DB to catch revocations
    const db = getDB();
    const user = await db.collection('users').findOne({ _id: decoded.userId });
    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'User account is inactive or not found' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      org_id: user.org_id,
      department_id: user.department_id,
      full_name: user.full_name
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Authentication token has expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Authentication check failed' });
  }
}

module.exports = { verifyJWT };
