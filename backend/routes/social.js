const express = require('express');
const { getDB, toDbId, runInTransaction } = require('../shared/db');
const { verifyJWT } = require('../shared/middleware/auth');
const { isManagerOrAdmin } = require('../shared/middleware/rbac');
const { recordPointsTransaction } = require('../shared/lib/points-ledger');
const { evaluateBadges } = require('../shared/lib/badges');

const router = express.Router();
router.use(verifyJWT);

function mapActivity(a, categoryMap) {
  return {
    id: a._id.toString(),
    title: a.title,
    description: a.description || '',
    category: categoryMap[a.category_id?.toString()] || 'General',
    points: a.points || 0,
    evidenceRequired: !!a.evidence_required,
    status: a.status || 'OPEN',
    org_id: a.org_id
  };
}

function mapParticipation(p, actMap, userMap) {
  const activity = actMap[p.csr_activity_id?.toString()];
  const user = userMap[p.employee_id?.toString()];
  return {
    id: p._id.toString(),
    employeeId: p.employee_id?.toString(),
    employeeName: user?.full_name || 'Unknown',
    activityId: p.csr_activity_id?.toString(),
    activityTitle: activity?.title || 'Unknown Activity',
    status: p.approval_status || 'Pending',
    pointsEarned: p.points_earned || 0,
    proofUrl: p.proof_url || null,
    submittedAt: (p.created_at || new Date()).toISOString().split('T')[0]
  };
}

// GET /api/social/activities
router.get('/activities', async (req, res) => {
  try {
    const db = getDB();
    const activities = await db.collection('csr_activities').find({ org_id: req.user.org_id }).toArray();
    const cats = await db.collection('categories').find({ org_id: req.user.org_id }).toArray();
    const catMap = Object.fromEntries(cats.map(c => [c._id.toString(), c.name]));
    return res.json(activities.map(a => mapActivity(a, catMap)));
  } catch (err) {
    console.error('GET social/activities error:', err);
    return res.status(500).json({ error: 'Failed to load activities' });
  }
});

// POST /api/social/activities/:id/join
router.post('/activities/:id/join', async (req, res) => {
  try {
    const db = getDB();
    const activityId = req.params.id;
    const userId = req.user.id;

    const activity = await db.collection('csr_activities').findOne({ _id: activityId });
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    if (activity.status !== 'OPEN') return res.status(400).json({ error: 'This activity is no longer open for joining' });

    // Check for duplicate
    const existing = await db.collection('employee_participations').findOne({
      csr_activity_id: activityId,
      employee_id: userId
    });
    if (existing) return res.status(400).json({ error: 'You have already joined this activity' });

    const { proof_url } = req.body;
    const part = {
      _id: `part-${Date.now()}`,
      org_id: req.user.org_id,
      employee_id: userId,
      csr_activity_id: activityId,
      proof_url: proof_url || null,
      proof_file_name: null,
      approval_status: 'Pending',
      points_earned: 0,
      completion_date: new Date(),
      created_at: new Date()
    };

    await db.collection('employee_participations').insertOne(part);
    return res.status(201).json({ id: part._id, status: 'Pending', message: 'Successfully joined activity' });
  } catch (err) {
    console.error('POST activities/:id/join error:', err);
    return res.status(500).json({ error: 'Failed to join activity' });
  }
});

// GET /api/social/participations
router.get('/participations', async (req, res) => {
  try {
    const db = getDB();
    const query = { org_id: req.user.org_id };
    // Employees see only their own
    if (req.user.role === 'Employee') {
      query.employee_id = req.user.id;
    }

    const parts = await db.collection('employee_participations').find(query).sort({ created_at: -1 }).toArray();

    const actIds = [...new Set(parts.map(p => p.csr_activity_id?.toString()).filter(Boolean))];
    const activities = actIds.length ? await db.collection('csr_activities').find({ _id: { $in: actIds } }).toArray() : [];
    const actMap = Object.fromEntries(activities.map(a => [a._id.toString(), a]));

    const userIds = [...new Set(parts.map(p => p.employee_id?.toString()).filter(Boolean))];
    const users = userIds.length ? await db.collection('users').find({ _id: { $in: userIds } }).toArray() : [];
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

    return res.json(parts.map(p => mapParticipation(p, actMap, userMap)));
  } catch (err) {
    console.error('GET social/participations error:', err);
    return res.status(500).json({ error: 'Failed to load participations' });
  }
});

// POST /api/social/participations/:id/approve  [Manager/Admin only]
router.post('/participations/:id/approve', isManagerOrAdmin, async (req, res) => {
  try {
    const db = getDB();
    const partId = req.params.id;

    const result = await runInTransaction(async (session) => {
      const part = await db.collection('employee_participations').findOne({ _id: partId }, { session });
      if (!part) throw Object.assign(new Error('Participation not found'), { status: 404 });
      if (part.approval_status !== 'Pending') {
        throw Object.assign(new Error(`Already ${part.approval_status}`), { status: 400 });
      }

      const activity = await db.collection('csr_activities').findOne({ _id: part.csr_activity_id }, { session });
      if (!activity) throw Object.assign(new Error('Activity not found'), { status: 404 });

      // Evidence is stored at join time; managers decide approval regardless

      const pointsToAdd = activity.points || 50;

      // Credit points via shared ledger
      await recordPointsTransaction(db, part.employee_id, pointsToAdd, 0,
        `CSR approved: ${activity.title}`, session,
        { source_type: 'CSR_PARTICIPATION', source_id: partId });

      // Badge check
      await evaluateBadges(db, part.employee_id, session);

      // Notification
      await db.collection('notifications').insertOne({
        _id: `notif-${Date.now()}`,
        org_id: part.org_id,
        recipient_user_id: part.employee_id,
        event_type: 'CSR_APPROVAL',
        title: 'CSR Activity Approved! 🎉',
        body: `Your participation in "${activity.title}" was approved! +${pointsToAdd} Points.`,
        entity_type: 'csr_participation',
        entity_id: partId,
        read_at: null,
        created_at: new Date()
      }, { session });

      // Update record
      await db.collection('employee_participations').updateOne(
        { _id: partId },
        { $set: { approval_status: 'Approved', points_earned: pointsToAdd, approved_at: new Date() } },
        { session }
      );

      return { id: partId, status: 'Approved', pointsAwarded: pointsToAdd };
    });

    return res.json(result);
  } catch (err) {
    console.error('POST participations/:id/approve error:', err);
    return res.status(err.status || 500).json({ error: err.message || 'Approval failed' });
  }
});

// POST /api/social/participations/:id/reject  [Manager/Admin only]
router.post('/participations/:id/reject', isManagerOrAdmin, async (req, res) => {
  try {
    const db = getDB();
    const partId = req.params.id;

    const part = await db.collection('employee_participations').findOne({ _id: partId });
    if (!part) return res.status(404).json({ error: 'Participation not found' });
    if (part.approval_status !== 'Pending') {
      return res.status(400).json({ error: `Already ${part.approval_status}` });
    }

    const activity = await db.collection('csr_activities').findOne({ _id: part.csr_activity_id });

    await db.collection('employee_participations').updateOne(
      { _id: partId },
      { $set: { approval_status: 'Rejected', rejected_at: new Date() } }
    );

    await db.collection('notifications').insertOne({
      _id: `notif-${Date.now()}`,
      org_id: part.org_id,
      recipient_user_id: part.employee_id,
      event_type: 'CSR_REJECTION',
      title: 'CSR Activity Update',
      body: `Your participation in "${activity?.title || 'an activity'}" was not approved this time.`,
      entity_type: 'csr_participation',
      entity_id: partId,
      read_at: null,
      created_at: new Date()
    });

    return res.json({ id: partId, status: 'Rejected' });
  } catch (err) {
    console.error('POST participations/:id/reject error:', err);
    return res.status(500).json({ error: 'Rejection failed' });
  }
});

module.exports = router;
