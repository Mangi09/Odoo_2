const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../../shared/db');

const router = express.Router();

function toObjectId(id) {
  if (!id) return null;
  try {
    return new ObjectId(id);
  } catch (e) {
    return null;
  }
}

// GET /api/governance/audits
router.get('/audits', async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.department_id) {
      const deptId = toObjectId(req.query.department_id);
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
    const { title, department_id, status, findings } = req.body;

    const deptId = toObjectId(department_id);
    if (!deptId) {
      return res.status(400).json({ success: false, error: 'Valid department_id is required' });
    }

    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const audit = {
      title,
      department_id: deptId,
      status: status || 'pending',
      findings: findings || '',
      timestamp: new Date()
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
    if (req.query.owner_id) {
      const ownerId = toObjectId(req.query.owner_id);
      if (ownerId) query.owner_id = ownerId;
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
      if (issue.status === 'open' && issue.due_date) {
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
    const { title, owner_id, due_date } = req.body;

    //owner_id and due_date required (400 if missing)
    if (!owner_id) {
      return res.status(400).json({ success: false, error: 'owner_id is required' });
    }
    if (!due_date) {
      return res.status(400).json({ success: false, error: 'due_date is required' });
    }

    const ownerId = toObjectId(owner_id);
    if (!ownerId) {
      return res.status(400).json({ success: false, error: 'Valid owner_id is required' });
    }

    const parsedDueDate = new Date(due_date);
    if (isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid due_date format' });
    }

    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const issue = {
      title,
      owner_id: ownerId,
      due_date: parsedDueDate,
      status: 'open',
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
