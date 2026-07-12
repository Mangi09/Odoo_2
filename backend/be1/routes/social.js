const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB, runInTransaction } = require('../../shared/db');
const { recordPointsTransaction } = require('../../shared/lib/points-ledger');
const { evaluateBadges } = require('../../shared/lib/badges');

const router = express.Router();

function toObjectId(id) {
  if (!id) return null;
  try {
    return new ObjectId(id);
  } catch (e) {
    return null;
  }
}

// GET /api/social/activities
router.get('/activities', async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.category) {
      query.category = req.query.category;
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
    const { title, description, category, points, xp, difficulty, proof_required } = req.body;

    if (category !== 'CSR_ACTIVITY') {
      return res.status(400).json({ success: false, error: 'Category type must be exactly CSR_ACTIVITY' });
    }

    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and description are required' });
    }

    const pts = parseInt(points, 10);
    const xpVal = parseInt(xp, 10);
    if (isNaN(pts) || pts < 0 || isNaN(xpVal) || xpVal < 0) {
      return res.status(400).json({ success: false, error: 'Points and XP must be non-negative integers' });
    }

    const activity = {
      title,
      description,
      category: 'CSR_ACTIVITY',
      points: pts,
      xp: xpVal,
      difficulty: difficulty || 'medium',
      proof_required: !!proof_required
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
      const deptId = toObjectId(req.query.department_id);
      if (deptId) {
        const employees = await db.collection('employees').find({ department_id: deptId }).toArray();
        const employeeIds = employees.map(emp => emp._id);
        query.employee_id = { $in: employeeIds };
      } else {
        return res.status(200).json({ success: true, data: [], page, limit, total: 0 });
      }
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.start_date || req.query.end_date) {
      query.timestamp = {};
      if (req.query.start_date) {
        query.timestamp.$gte = new Date(req.query.start_date);
      }
      if (req.query.end_date) {
        query.timestamp.$lte = new Date(req.query.end_date);
      }
    }

    const total = await db.collection('employee_participations').countDocuments(query);
    const participations = await db.collection('employee_participations')
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ timestamp: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      data: participations,
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
    const activityId = toObjectId(req.params.id);
    if (!activityId) {
      return res.status(400).json({ success: false, error: 'Invalid activity ID' });
    }

    const empIdStr = req.headers['x-employee-id'] || req.body.employee_id;
    const empId = toObjectId(empIdStr);
    if (!empId) {
      return res.status(400).json({ success: false, error: 'Valid employee context is required via x-employee-id header' });
    }

    const activity = await db.collection('csr_activities').findOne({ _id: activityId });
    if (!activity) {
      return res.status(404).json({ success: false, error: 'CSR Activity not found' });
    }

    const employee = await db.collection('employees').findOne({ _id: empId });
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    const { proof_url } = req.body;

    const participation = {
      employee_id: empId,
      activity_id: activityId,
      status: 'pending',
      proof_url: proof_url || '',
      points_credited: 0,
      xp_credited: 0,
      timestamp: new Date()
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
    const partId = toObjectId(req.params.id);
    if (!partId) {
      return res.status(400).json({ success: false, error: 'Invalid participation ID' });
    }

    // Run within a transaction session
    const resultData = await runInTransaction(async (session) => {
      const participation = await db.collection('employee_participations').findOne({ _id: partId }, { session });
      if (!participation) {
        throw new Error('Participation record not found');
      }

      if (participation.status !== 'pending') {
        throw new Error(`Participation has already been resolved with status: ${participation.status}`);
      }

      const activity = await db.collection('csr_activities').findOne({ _id: participation.activity_id }, { session });
      if (!activity) {
        throw new Error('CSR Activity referenced in participation does not exist');
      }

      // Check evidence: proof_url is required if activity proof_required is flagged
      if (activity.proof_required && (!participation.proof_url || participation.proof_url.trim() === '')) {
        throw new Error('Evidence proof_url is required for this activity, but was not provided');
      }

      // credit points & XP via points ledger
      const pointsToAdd = activity.points || 0;
      const xpToAdd = activity.xp || 0;
      await recordPointsTransaction(
        db, 
        participation.employee_id, 
        pointsToAdd, 
        xpToAdd, 
        `CSR activity approved: ${activity.title}`, 
        session
      );

      // run badge evaluation
      await evaluateBadges(db, participation.employee_id, session);

      // insert notification
      await db.collection('notifications').insertOne({
        employee_id: participation.employee_id,
        title: 'CSR Activity Approved',
        message: `Your participation in "${activity.title}" was approved! +${pointsToAdd} Points, +${xpToAdd} XP.`,
        type: 'approval',
        read: false,
        timestamp: new Date()
      }, { session });

      // mark approved
      await db.collection('employee_participations').updateOne(
        { _id: partId },
        {
          $set: {
            status: 'approved',
            points_credited: pointsToAdd,
            xp_credited: xpToAdd,
            approved_at: new Date()
          }
        },
        { session }
      );

      return {
        _id: partId,
        status: 'approved',
        points_credited: pointsToAdd,
        xp_credited: xpToAdd
      };
    });

    return res.status(200).json({ success: true, data: resultData });
  } catch (error) {
    console.error('Error approving CSR participation:', error);
    // Determine if it was validation failure or db error to return suitable status code
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
    const partId = toObjectId(req.params.id);
    if (!partId) {
      return res.status(400).json({ success: false, error: 'Invalid participation ID' });
    }

    const participation = await db.collection('employee_participations').findOne({ _id: partId });
    if (!participation) {
      return res.status(404).json({ success: false, error: 'Participation not found' });
    }

    if (participation.status !== 'pending') {
      return res.status(400).json({ success: false, error: `Participation has already been resolved with status: ${participation.status}` });
    }

    const activity = await db.collection('csr_activities').findOne({ _id: participation.activity_id });

    // Mark as rejected
    await db.collection('employee_participations').updateOne(
      { _id: partId },
      {
        $set: {
          status: 'rejected',
          rejected_at: new Date()
        }
      }
    );

    // Insert notification
    await db.collection('notifications').insertOne({
      employee_id: participation.employee_id,
      title: 'CSR Activity Rejected',
      message: `Your participation in "${activity ? activity.title : 'CSR Activity'}" was not approved.`,
      type: 'rejection',
      read: false,
      timestamp: new Date()
    });

    return res.status(200).json({
      success: true,
      data: {
        _id: partId,
        status: 'rejected'
      }
    });
  } catch (error) {
    console.error('Error rejecting participation:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
