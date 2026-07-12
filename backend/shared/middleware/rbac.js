/**
 * RBAC middleware factory.
 * Usage: requireRole('Manager', 'Admin')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }
    next();
  };
}

/**
 * Must be called after verifyJWT.
 * Employee cannot approve/reject/resolve/create issues.
 */
const isManagerOrAdmin = requireRole('Manager', 'Admin');
const isAdmin = requireRole('Admin');

module.exports = { requireRole, isManagerOrAdmin, isAdmin };
