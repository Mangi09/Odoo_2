const express = require('express');
const { getDB } = require('../shared/db');
const { verifyJWT } = require('../shared/middleware/auth');

const router = express.Router();
router.use(verifyJWT);

function mapNotification(n) {
  return {
    id: n._id.toString(),
    title: n.title,
    body: n.body || n.message || '',
    type: n.event_type || 'General',
    entityType: n.entity_type || null,
    entityId: n.entity_id?.toString() || null,
    read: !!n.read_at,
    createdAt: (n.created_at || new Date()).toISOString()
  };
}

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.id;
    const query = { recipient_user_id: userId };
    if (req.query.type) query.event_type = req.query.type;

    const notifs = await db.collection('notifications').find(query).sort({ created_at: -1 }).limit(100).toArray();
    return res.json(notifs.map(mapNotification));
  } catch (err) {
    console.error('GET notifications error:', err);
    return res.status(500).json({ error: 'Failed to load notifications' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('notifications').findOneAndUpdate(
      { _id: req.params.id, recipient_user_id: req.user.id },
      { $set: { read_at: new Date() } },
      { returnDocument: 'after' }
    );
    const notif = result?.value ?? result;
    if (!notif || !notif._id) return res.status(404).json({ error: 'Notification not found' });
    return res.json(mapNotification(notif));
  } catch (err) {
    console.error('PATCH notifications/:id/read error:', err);
    return res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// POST /api/notifications/read-all
router.post('/read-all', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('notifications').updateMany(
      { recipient_user_id: req.user.id, read_at: null },
      { $set: { read_at: new Date() } }
    );
    return res.json({ updated: result.modifiedCount });
  } catch (err) {
    console.error('POST notifications/read-all error:', err);
    return res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

module.exports = router;
