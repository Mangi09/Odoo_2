const express = require('express');
const { getDB } = require('../shared/db');
const { verifyJWT } = require('../shared/middleware/auth');
const { isManagerOrAdmin } = require('../shared/middleware/rbac');

const router = express.Router();
router.use(verifyJWT);

// GET /api/governance/audits
router.get('/audits', async (req, res) => {
  try {
    const db = getDB();
    const depts = await db.collection('departments').find({ org_id: req.user.org_id }).toArray();
    const deptMap = Object.fromEntries(depts.map(d => [d._id.toString(), d.name]));

    const audits = await db.collection('audits').find({ org_id: req.user.org_id }).sort({ audit_date: -1 }).toArray();
    return res.json(audits.map(a => ({
      id: a._id.toString(),
      title: a.title,
      department: deptMap[a.department_id?.toString()] || 'All',
      auditorName: a.auditor_name || 'System',
      auditDate: (a.audit_date || new Date()).toISOString().split('T')[0],
      findingsSummary: a.findings_summary || '',
      status: a.status || 'Planned'
    })));
  } catch (err) {
    console.error('GET audits error:', err);
    return res.status(500).json({ error: 'Failed to load audits' });
  }
});

// GET /api/governance/issues
router.get('/issues', async (req, res) => {
  try {
    const db = getDB();
    const now = new Date();

    const depts = await db.collection('departments').find({ org_id: req.user.org_id }).toArray();
    const deptMap = Object.fromEntries(depts.map(d => [d._id.toString(), d.name]));

    const issues = await db.collection('compliance_issues').find({ org_id: req.user.org_id }).sort({ created_at: -1 }).toArray();
    return res.json(issues.map(i => {
      const isOpen = ['Open', 'In Progress'].includes(i.status);
      const dueDate = i.due_date ? new Date(i.due_date) : null;
      const overdue = isOpen && dueDate && dueDate < now;
      return {
        id: i._id.toString(),
        title: i.description || 'Compliance Issue',
        severity: i.severity || 'Medium',
        category: i.category || 'General',
        status: overdue ? 'Overdue' : (i.status || 'Open'),
        department: deptMap[i.department_id?.toString()] || 'All',
        dueDate: dueDate ? dueDate.toISOString().split('T')[0] : null,
        createdAt: (i.created_at || new Date()).toISOString().split('T')[0],
        overdue
      };
    }));
  } catch (err) {
    console.error('GET issues error:', err);
    return res.status(500).json({ error: 'Failed to load compliance issues' });
  }
});

// POST /api/governance/issues  [Manager/Admin only]
// Payload: { title, severity, category }
router.post('/issues', isManagerOrAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { title, severity, category, due_date, department_id } = req.body;

    const errors = {};
    if (!title) errors.title = 'Title is required';
    if (severity && !['Low', 'Medium', 'High', 'Critical'].includes(severity)) {
      errors.severity = 'Must be Low, Medium, High, or Critical';
    }
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', fields: errors });

    const issue = {
      _id: `issue-${Date.now()}`,
      org_id: req.user.org_id,
      audit_id: null,
      department_id: department_id || req.user.department_id || null,
      owner_user_id: req.user.id,
      severity: severity || 'Medium',
      category: category || 'General',
      description: title,
      due_date: due_date ? new Date(due_date) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'Open',
      resolved_at: null,
      created_at: new Date()
    };

    await db.collection('compliance_issues').insertOne(issue);
    return res.status(201).json({
      id: issue._id,
      title: issue.description,
      severity: issue.severity,
      category: issue.category,
      status: issue.status,
      dueDate: issue.due_date.toISOString().split('T')[0]
    });
  } catch (err) {
    console.error('POST issues error:', err);
    return res.status(500).json({ error: 'Failed to create issue' });
  }
});

// PATCH /api/governance/issues/:id  [Manager/Admin only]
// Payload: { status: 'Resolved' }
router.patch('/issues/:id', isManagerOrAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: 'Validation failed', fields: { status: 'Status is required' } });
    const allowed = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Validation failed', fields: { status: `Must be one of: ${allowed.join(', ')}` } });
    }

    const updateData = {
      status,
      updated_at: new Date(),
      ...(status === 'Resolved' || status === 'Closed' ? { resolved_at: new Date() } : {})
    };

    const result = await db.collection('compliance_issues').findOneAndUpdate(
      { _id: req.params.id },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    const issue = result?.value ?? result;
    if (!issue || !issue._id) return res.status(404).json({ error: 'Issue not found' });

    return res.json({ id: issue._id, status: issue.status });
  } catch (err) {
    console.error('PATCH issues/:id error:', err);
    return res.status(500).json({ error: 'Failed to update issue' });
  }
});

// GET /api/governance/policies
router.get('/policies', async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.id;

    const policies = await db.collection('esg_policies').find({ org_id: req.user.org_id }).toArray();
    const acks = await db.collection('policy_acknowledgements').find({ employee_id: userId }).toArray();
    const ackedSet = new Set(acks.map(a => a.policy_id?.toString()));

    return res.json(policies.map(p => ({
      id: p._id.toString(),
      title: p.title || p.name,
      description: p.description || '',
      type: p.type || 'General',
      version: p.version || '1.0',
      effectiveDate: (p.effective_date || p.created_at || new Date()).toISOString().split('T')[0],
      acknowledged: ackedSet.has(p._id.toString())
    })));
  } catch (err) {
    console.error('GET policies error:', err);
    return res.status(500).json({ error: 'Failed to load policies' });
  }
});

// POST /api/governance/policies/:id/acknowledge
router.post('/policies/:id/acknowledge', async (req, res) => {
  try {
    const db = getDB();
    const policyId = req.params.id;
    const userId = req.user.id;

    const policy = await db.collection('esg_policies').findOne({ _id: policyId });
    if (!policy) return res.status(404).json({ error: 'Policy not found' });

    // Idempotent — upsert
    await db.collection('policy_acknowledgements').updateOne(
      { policy_id: policyId, employee_id: userId },
      {
        $set: {
          policy_id: policyId,
          employee_id: userId,
          org_id: req.user.org_id,
          status: 'ACKNOWLEDGED',
          acknowledged_at: new Date()
        }
      },
      { upsert: true }
    );

    return res.json({ policyId, acknowledged: true, acknowledgedAt: new Date().toISOString() });
  } catch (err) {
    console.error('POST policies/:id/acknowledge error:', err);
    return res.status(500).json({ error: 'Failed to acknowledge policy' });
  }
});

module.exports = router;
