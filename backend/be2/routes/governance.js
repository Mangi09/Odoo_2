const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB, toDbId } = require('../../shared/db');

const router = express.Router();

// GET /api/governance/audits
router.get('/audits', async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.department_id) {
      const deptId = toDbId(req.query.department_id);
      if (deptId) query.department_id = deptId;
    }

    const total = await db.collection('audits').countDocuments(query);
    const audits = await db.collection('audits')
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    return res.status(200).json({
      success: true,
      data: audits,
      page,
      limit,
      total
    });
  } catch (error) {
    console.error('Error fetching audits:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/governance/audits
router.post('/audits', async (req, res) => {
  try {
    const db = getDB();
    const { title, department_id, status, findings, findings_summary, auditor_user_id, auditor_name, audit_date } = req.body;

    const deptId = toDbId(department_id);
    if (!deptId) {
      return res.status(400).json({ success: false, error: 'Valid department_id is required' });
    }

    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    // Resolve org_id from department
    const department = await db.collection('departments').findOne({ _id: deptId });
    const orgId = department ? department.org_id : 'org-eco';

    const audit = {
      org_id: orgId,
      department_id: deptId,
      title,
      auditor_user_id: auditor_user_id ? toDbId(auditor_user_id) : null,
      auditor_name: auditor_name || 'System Auditor',
      audit_date: audit_date ? new Date(audit_date) : new Date(),
      findings_summary: findings_summary || findings || '',
      status: status || 'PLANNED',
      created_at: new Date()
    };

    const result = await db.collection('audits').insertOne(audit);
    audit._id = result.insertedId;

    return res.status(201).json({ success: true, data: audit });
  } catch (error) {
    console.error('Error creating audit:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/governance/issues
router.get('/issues', async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.owner_user_id || req.query.owner_id) {
      const ownerId = toDbId(req.query.owner_user_id || req.query.owner_id);
      if (ownerId) query.owner_user_id = ownerId;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await db.collection('compliance_issues').countDocuments(query);
    const issues = await db.collection('compliance_issues')
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Compute overdue on read if open + due_date < today
    const now = new Date();
    const enrichedIssues = issues.map(issue => {
      let overdue = false;
      const stat = (issue.status || '').toUpperCase();
      if ((stat === 'OPEN' || stat === 'IN_PROGRESS' || stat === 'OVERDUE') && issue.due_date) {
        const dueDate = new Date(issue.due_date);
        if (dueDate < now) {
          overdue = true;
        }
      }
      return {
        ...issue,
        overdue
      };
    });

    return res.status(200).json({
      success: true,
      data: enrichedIssues,
      page,
      limit,
      total
    });
  } catch (error) {
    console.error('Error fetching compliance issues:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/governance/issues
router.post('/issues', async (req, res) => {
  try {
    const db = getDB();
    const { title, owner_user_id, owner_id, due_date, audit_id, department_id, severity, description } = req.body;

    const ownerIdStr = owner_user_id || owner_id;
    if (!ownerIdStr) {
      return res.status(400).json({ success: false, error: 'owner_user_id is required' });
    }
    if (!due_date) {
      return res.status(400).json({ success: false, error: 'due_date is required' });
    }

    const ownerId = toDbId(ownerIdStr);
    if (!ownerId) {
      return res.status(400).json({ success: false, error: 'Valid owner_user_id is required' });
    }

    const parsedDueDate = new Date(due_date);
    if (isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid due_date format' });
    }

    // Resolve department and org_id
    const user = await db.collection('users').findOne({ _id: ownerId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Owner user not found' });
    }

    const deptId = department_id ? toDbId(department_id) : user.department_id;
    const orgId = user.org_id || 'org-eco';

    const issue = {
      org_id: orgId,
      audit_id: audit_id ? toDbId(audit_id) : null,
      department_id: deptId,
      owner_user_id: ownerId,
      severity: severity || 'MEDIUM',
      description: description || title || 'Compliance Issue',
      due_date: parsedDueDate,
      status: 'Open',
      resolved_at: null,
      created_at: new Date()
    };

    const result = await db.collection('compliance_issues').insertOne(issue);
    issue._id = result.insertedId;

    return res.status(201).json({ success: true, data: issue });
  } catch (error) {
    console.error('Error creating compliance issue:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
