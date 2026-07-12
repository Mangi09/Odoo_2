const express = require('express');
const { getDB, runInTransaction, toDbId } = require('../../shared/db');
const { recordPointsTransaction } = require('../../shared/lib/points-ledger');
const { evaluateBadges } = require('../../shared/lib/badges');

const router = express.Router();

// GET /api/social/activities
router.get('/activities', async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.category_id) {
      const catId = toDbId(req.query.category_id);
      if (catId) query.category_id = catId;
    }

    const total = await db.collection('csr_activities').countDocuments(query);
    const activities = await db.collection('csr_activities')
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    return res.status(200).json({
      success: true,
      data: activities,
      page,
      limit,
      total
    });
  } catch (error) {
    console.error('Error fetching social activities:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/social/activities
router.post('/activities', async (req, res) => {
  try {
    const db = getDB();
    const { title, description, category_id, category, points, proof_required, evidence_required, status, department_id } = req.body;

    const catSearch = toDbId(category_id || category);
    if (!catSearch) {
      return res.status(400).json({ success: false, error: 'Category identifier (category_id or category) is required' });
    }

    // Resolve category type
    const categoryDoc = await db.collection('categories').findOne({
      $or: [
        { _id: catSearch },
        { name: category_id || category }
      ]
    });

    if (!categoryDoc || categoryDoc.type !== 'CSR_ACTIVITY') {
      return res.status(400).json({ success: false, error: 'Category type must be CSR_ACTIVITY' });
    }

    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and description are required' });
    }

    const pts = parseInt(points, 10);
    if (isNaN(pts) || pts < 0) {
      return res.status(400).json({ success: false, error: 'Points must be a non-negative integer' });
    }

    const activity = {
      org_id: categoryDoc.org_id || 'org-eco',
      category_id: categoryDoc._id,
      department_id: department_id ? toDbId(department_id) : null,
      title,
      description,
      points: pts,
      evidence_required: evidence_required !== undefined ? !!evidence_required : !!proof_required,
      status: status || 'OPEN',
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.collection('csr_activities').insertOne(activity);
    activity._id = result.insertedId;

    return res.status(201).json({ success: true, data: activity });
  } catch (error) {
    console.error('Error creating CSR activity:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/social/participations (supporting list endpoints filters)
router.get('/participations', async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.department_id) {
      const deptId = toDbId(req.query.department_id);
      if (deptId) {
        const users = await db.collection('users').find({ department_id: deptId }).toArray();
        const userIds = users.map(u => u._id);
        query.employee_id = { $in: userIds };
      } else {
        return res.status(200).json({ success: true, data: [], page, limit, total: 0 });
      }
    }

    if (req.query.status || req.query.approval_status) {
      query.approval_status = req.query.approval_status || req.query.status;
    }

    if (req.query.start_date || req.query.end_date) {
      query.created_at = {};
      if (req.query.start_date) {
        query.created_at.$gte = new Date(req.query.start_date);
      }
      if (req.query.end_date) {
        query.created_at.$lte = new Date(req.query.end_date);
      }
    }

    const total = await db.collection('employee_participations').countDocuments(query);
    const participations = await db.collection('employee_participations')
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })
      .toArray();

    // Map fields for compatibility
    const enriched = participations.map(p => ({
      ...p,
      status: p.approval_status,
      proof_url: p.proof_url || p.proof_file_name,
      points_credited: p.points_earned
    }));

    return res.status(200).json({
      success: true,
      data: enriched,
      page,
      limit,
      total
    });
  } catch (error) {
    console.error('Error fetching participations:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/social/activities/:id/participate
router.post('/activities/:id/participate', async (req, res) => {
  try {
    const db = getDB();
    const activityId = toDbId(req.params.id);
    if (!activityId) {
      return res.status(400).json({ success: false, error: 'Invalid activity ID' });
    }

    const empIdStr = req.headers['x-employee-id'] || req.body.employee_id;
    const empId = toDbId(empIdStr);
    if (!empId) {
      return res.status(400).json({ success: false, error: 'Valid employee context is required via x-employee-id header' });
    }

    const activity = await db.collection('csr_activities').findOne({ _id: activityId });
    if (!activity) {
      return res.status(404).json({ success: false, error: 'CSR Activity not found' });
    }

    const user = await db.collection('users').findOne({ _id: empId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Employee User not found' });
    }

    const { proof_url, proof_file_name } = req.body;
    const proof = proof_url || proof_file_name || '';

    const participation = {
      org_id: user.org_id || 'org-eco',
      employee_id: empId,
      csr_activity_id: activityId,
      proof_url: proof,
      proof_file_name: proof, // for compatibility
      approval_status: 'Pending',
      points_earned: 0,
      completion_date: new Date(),
      created_at: new Date()
    };

    const result = await db.collection('employee_participations').insertOne(participation);
    participation._id = result.insertedId;

    return res.status(201).json({ success: true, data: participation });
  } catch (error) {
    console.error('Error initiating participation:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/social/participations/:id/approve
router.post('/participations/:id/approve', async (req, res) => {
  try {
    const db = getDB();
    const partId = toDbId(req.params.id);
    if (!partId) {
      return res.status(400).json({ success: false, error: 'Invalid participation ID' });
    }

    const { approved_by } = req.body;

    const resultData = await runInTransaction(async (session) => {
      const participation = await db.collection('employee_participations').findOne({ _id: partId }, { session });
      if (!participation) {
        throw new Error('Participation record not found');
      }

      if (participation.approval_status !== 'Pending') {
        throw new Error(`Participation has already been resolved with status: ${participation.approval_status}`);
      }

      const activity = await db.collection('csr_activities').findOne({ _id: participation.csr_activity_id }, { session });
      if (!activity) {
        throw new Error('CSR Activity referenced in participation does not exist');
      }

      // Check evidence: proof is required if activity evidence_required is flagged
      const proofVal = participation.proof_url || participation.proof_file_name;
      if (activity.evidence_required && (!proofVal || proofVal.trim() === '')) {
        throw new Error('Evidence proof is required for this activity, but was not provided');
      }

      // credit points via points ledger
      const pointsToAdd = activity.points || 0;
      await recordPointsTransaction(
        db, 
        participation.employee_id, 
        pointsToAdd, 
        0, // 0 XP
        `CSR activity approved: ${activity.title}`, 
        session,
        { source_type: 'CSR_PARTICIPATION', source_id: partId }
      );

      // run badge evaluation
      await evaluateBadges(db, participation.employee_id, session);

      // insert notification (matching official notifications table)
      await db.collection('notifications').insertOne({
        org_id: participation.org_id || 'org-eco',
        recipient_user_id: participation.employee_id,
        event_type: 'CSR_APPROVAL',
        title: 'CSR Activity Approved',
        body: `Your participation in "${activity.title}" was approved! +${pointsToAdd} Points.`,
        entity_type: 'csr_participation',
        entity_id: partId,
        read_at: null,
        created_at: new Date()
      }, { session });

      // mark approved in DB
      await db.collection('employee_participations').updateOne(
        { _id: partId },
        {
          $set: {
            approval_status: 'Approved',
            points_earned: pointsToAdd,
            approved_by: toDbId(approved_by) || 'u-admin',
            approved_at: new Date()
          }
        },
        { session }
      );

      return {
        _id: partId,
        approval_status: 'Approved',
        points_earned: pointsToAdd
      };
    });

    return res.status(200).json({ success: true, data: resultData });
  } catch (error) {
    console.error('Error approving CSR participation:', error);
    const isValidationError = error.message.includes('not found') || 
                            error.message.includes('required') || 
                            error.message.includes('already been');
    return res.status(isValidationError ? 400 : 500).json({ success: false, error: error.message });
  }
});

// POST /api/social/participations/:id/reject
router.post('/participations/:id/reject', async (req, res) => {
  try {
    const db = getDB();
    const partId = toDbId(req.params.id);
    if (!partId) {
      return res.status(400).json({ success: false, error: 'Invalid participation ID' });
    }

    const { approved_by } = req.body;

    const participation = await db.collection('employee_participations').findOne({ _id: partId });
    if (!participation) {
      return res.status(404).json({ success: false, error: 'Participation not found' });
    }

    if (participation.approval_status !== 'Pending') {
      return res.status(400).json({ success: false, error: `Participation has already been resolved with status: ${participation.approval_status}` });
    }

    const activity = await db.collection('csr_activities').findOne({ _id: participation.csr_activity_id });

    // Mark as rejected
    await db.collection('employee_participations').updateOne(
      { _id: partId },
      {
        $set: {
          approval_status: 'Rejected',
          approved_by: toDbId(approved_by) || 'u-admin',
          approved_at: new Date()
        }
      }
    );

    // Insert notification
    await db.collection('notifications').insertOne({
      org_id: participation.org_id || 'org-eco',
      recipient_user_id: participation.employee_id,
      event_type: 'CSR_REJECTION',
      title: 'CSR Activity Rejected',
      body: `Your participation in "${activity ? activity.title : 'CSR Activity'}" was not approved.`,
      entity_type: 'csr_participation',
      entity_id: partId,
      read_at: null,
      created_at: new Date()
    });

    return res.status(200).json({
      success: true,
      data: {
        _id: partId,
        approval_status: 'Rejected'
      }
    });
  } catch (error) {
    console.error('Error rejecting participation:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
