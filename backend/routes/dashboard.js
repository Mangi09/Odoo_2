const express = require('express');
const { getDB } = require('../shared/db');
const { verifyJWT } = require('../shared/middleware/auth');

const router = express.Router();

// All dashboard routes require auth
router.use(verifyJWT);

// GET /api/dashboard/summary
router.get('/summary', async (req, res) => {
  try {
    const db = getDB();
    const orgId = req.user.org_id;

    // ESG Score: average of latest department scores
    const scores = await db.collection('department_scores').find({ org_id: orgId }).toArray();
    const esgScore = scores.length
      ? Math.round(scores.reduce((s, d) => s + (d.total_score || 0), 0) / scores.length)
      : 72;

    // Carbon offset: sum of calculated_co2e in carbon transactions this month
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
    const txs = await db.collection('carbon_transactions').find({
      org_id: orgId,
      occurred_at: { $gte: startOfMonth }
    }).toArray();
    const carbonOffset = txs.reduce((s, t) => s + (t.calculated_co2e || 0), 0);

    // Active goals
    const activeGoals = await db.collection('environmental_goals').countDocuments({ org_id: orgId, status: { $in: ['ACTIVE', 'ON_TRACK'] } });

    // Volunteer hours: sum from participations (estimate: each approved activity = 4h)
    const approvedParts = await db.collection('employee_participations').countDocuments({
      org_id: orgId,
      approval_status: 'Approved'
    });
    const volunteerHours = approvedParts * 4;

    return res.json({
      esgScore,
      carbonOffset: Math.round(carbonOffset * 10) / 10,
      activeGoals,
      volunteerHours
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    return res.status(500).json({ error: 'Failed to load summary' });
  }
});

// GET /api/dashboard/emissions-trend?range=6M|1Y
router.get('/emissions-trend', async (req, res) => {
  try {
    const db = getDB();
    const orgId = req.user.org_id;
    const range = req.query.range || '6M';
    const monthsBack = range === '1Y' ? 12 : 6;

    const now = new Date();
    const result = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });

      const txs = await db.collection('carbon_transactions').find({
        org_id: orgId,
        occurred_at: { $gte: d, $lt: end }
      }).toArray();

      const value = txs.reduce((s, t) => s + (t.calculated_co2e || 0), 0);
      result.push({ month: monthLabel, value: Math.round(value * 10) / 10 });
    }

    return res.json(result);
  } catch (err) {
    console.error('Emissions trend error:', err);
    return res.status(500).json({ error: 'Failed to load emissions trend' });
  }
});

// GET /api/dashboard/activities
router.get('/activities', async (req, res) => {
  try {
    const db = getDB();
    const orgId = req.user.org_id;

    // Mix of recent participations and carbon transactions
    const parts = await db.collection('employee_participations').find({ org_id: orgId })
      .sort({ created_at: -1 }).limit(5).toArray();

    const txs = await db.collection('carbon_transactions').find({ org_id: orgId })
      .sort({ created_at: -1 }).limit(5).toArray();

    // Enrich with activity title
    const activityIds = parts.map(p => p.csr_activity_id);
    const activities = activityIds.length
      ? await db.collection('csr_activities').find({ _id: { $in: activityIds } }).toArray()
      : [];
    const actMap = Object.fromEntries(activities.map(a => [a._id.toString(), a]));

    // Enrich with dept name
    const depts = await db.collection('departments').find({ org_id: orgId }).toArray();
    const deptMap = Object.fromEntries(depts.map(d => [d._id.toString(), d.name]));

    const feed = [
      ...parts.map(p => ({
        id: p._id.toString(),
        title: actMap[p.csr_activity_id?.toString()]?.title || 'CSR Activity',
        type: 'Social',
        date: (p.created_at || new Date()).toISOString().split('T')[0],
        department: deptMap[p.org_id] || 'All Departments',
        status: p.approval_status
      })),
      ...txs.map(t => ({
        id: t._id.toString(),
        title: `${t.source_type} Emission Log`,
        type: 'Environmental',
        date: (t.occurred_at || new Date()).toISOString().split('T')[0],
        department: deptMap[t.department_id?.toString()] || 'All Departments',
        status: t.status || 'Pending'
      }))
    ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

    return res.json(feed);
  } catch (err) {
    console.error('Dashboard activities error:', err);
    return res.status(500).json({ error: 'Failed to load activities' });
  }
});

// GET /api/dashboard/deadlines
router.get('/deadlines', async (req, res) => {
  try {
    const db = getDB();
    const orgId = req.user.org_id;

    const goals = await db.collection('environmental_goals').find({
      org_id: orgId,
      status: { $in: ['ACTIVE', 'ON_TRACK'] },
      deadline: { $gte: new Date() }
    }).sort({ deadline: 1 }).limit(5).toArray();

    const audits = await db.collection('audits').find({
      org_id: orgId,
      audit_date: { $gte: new Date() }
    }).sort({ audit_date: 1 }).limit(5).toArray();

    const issues = await db.collection('compliance_issues').find({
      org_id: orgId,
      status: 'Open',
      due_date: { $gte: new Date() }
    }).sort({ due_date: 1 }).limit(5).toArray();

    const deadlines = [
      ...goals.map(g => ({
        id: g._id.toString(),
        title: g.name,
        dueDate: (g.deadline || new Date()).toISOString().split('T')[0],
        type: 'Environmental Goal',
        status: g.status
      })),
      ...audits.map(a => ({
        id: a._id.toString(),
        title: a.title,
        dueDate: (a.audit_date || new Date()).toISOString().split('T')[0],
        type: 'Audit',
        status: a.status || 'Pending'
      })),
      ...issues.map(i => ({
        id: i._id.toString(),
        title: i.description || 'Compliance Issue',
        dueDate: (i.due_date || new Date()).toISOString().split('T')[0],
        type: 'Compliance Issue',
        status: i.status
      }))
    ]
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 8);

    return res.json(deadlines);
  } catch (err) {
    console.error('Dashboard deadlines error:', err);
    return res.status(500).json({ error: 'Failed to load deadlines' });
  }
});

module.exports = router;
