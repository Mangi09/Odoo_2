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

// State transition map for challenges: draft -> active -> under_review -> completed, or archived anytime
const VALID_TRANSITIONS = {
  'draft': ['active', 'archived'],
  'active': ['under_review', 'archived'],
  'under_review': ['completed', 'archived'],
  'completed': ['archived'],
  'archived': []
};

// GET /api/gamification/challenges
router.get('/challenges', async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await db.collection('challenges').countDocuments(query);
    const challenges = await db.collection('challenges')
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    return res.status(200).json({
      success: true,
      data: challenges,
      page,
      limit,
      total
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/gamification/challenges
router.post('/challenges', async (req, res) => {
  try {
    const db = getDB();
    const { title, description, base_xp, difficulty, points, proof_required } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and description are required' });
    }

    const xp = parseInt(base_xp, 10);
    const pts = parseInt(points, 10) || 0;
    if (isNaN(xp) || xp <= 0) {
      return res.status(400).json({ success: false, error: 'base_xp must be a positive integer' });
    }

    const diff = difficulty || 'medium';
    if (!['easy', 'medium', 'hard'].includes(diff)) {
      return res.status(400).json({ success: false, error: "Difficulty must be 'easy', 'medium', or 'hard'" });
    }

    const challenge = {
      title,
      description,
      base_xp: xp,
      points: pts,
      difficulty: diff,
      status: 'draft',
      proof_required: !!proof_required,
      created_at: new Date()
    };

    const result = await db.collection('challenges').insertOne(challenge);
    challenge._id = result.insertedId;

    return res.status(201).json({ success: true, data: challenge });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/gamification/challenges/:id/status
router.patch('/challenges/:id/status', async (req, res) => {
  try {
    const db = getDB();
    const challengeId = toObjectId(req.params.id);
    if (!challengeId) {
      return res.status(400).json({ success: false, error: 'Invalid challenge ID' });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'status is required' });
    }

    const challenge = await db.collection('challenges').findOne({ _id: challengeId });
    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }

    const currentStatus = challenge.status || 'draft';
    const allowed = VALID_TRANSITIONS[currentStatus];

    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid transition: cannot move challenge from status '${currentStatus}' to '${status}'`
      });
    }

    await db.collection('challenges').updateOne(
      { _id: challengeId },
      { $set: { status, updated_at: new Date() } }
    );

    return res.status(200).json({
      success: true,
      data: {
        _id: challengeId,
        previous_status: currentStatus,
        new_status: status
      }
    });
  } catch (error) {
    console.error('Error transitioning challenge status:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/gamification/challenges/:id/participate
router.post('/challenges/:id/participate', async (req, res) => {
  try {
    const db = getDB();
    const challengeId = toObjectId(req.params.id);
    if (!challengeId) {
      return res.status(400).json({ success: false, error: 'Invalid challenge ID' });
    }

    const empIdStr = req.headers['x-employee-id'] || req.body.employee_id;
    const empId = toObjectId(empIdStr);
    if (!empId) {
      return res.status(400).json({ success: false, error: 'Valid employee context is required via x-employee-id header' });
    }

    const challenge = await db.collection('challenges').findOne({ _id: challengeId });
    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }

    if (challenge.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Cannot participate in a challenge that is not active' });
    }

    const employee = await db.collection('employees').findOne({ _id: empId });
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    // Check if already participating
    const existing = await db.collection('challenge_participations').findOne({
      challenge_id: challengeId,
      employee_id: empId
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'Already participating in this challenge' });
    }

    const { proof_url } = req.body;

    const participation = {
      employee_id: empId,
      challenge_id: challengeId,
      status: 'joined',
      proof_url: proof_url || '',
      timestamp: new Date()
    };

    const result = await db.collection('challenge_participations').insertOne(participation);
    participation._id = result.insertedId;

    return res.status(201).json({ success: true, data: participation });
  } catch (error) {
    console.error('Error participating in challenge:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/gamification/challenges/:id/complete
router.post('/challenges/:id/complete', async (req, res) => {
  try {
    const db = getDB();
    const challengeId = toObjectId(req.params.id);
    if (!challengeId) {
      return res.status(400).json({ success: false, error: 'Invalid challenge ID' });
    }

    const empIdStr = req.headers['x-employee-id'] || req.body.employee_id;
    const empId = toObjectId(empIdStr);
    if (!empId) {
      return res.status(400).json({ success: false, error: 'Valid employee context is required' });
    }

    const challenge = await db.collection('challenges').findOne({ _id: challengeId });
    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }

    const resultData = await runInTransaction(async (session) => {
      // Look up current active participation
      const participation = await db.collection('challenge_participations').findOne(
        { challenge_id: challengeId, employee_id: empId, status: 'joined' },
        { session }
      );

      if (!participation) {
        throw new Error('No active joined participation found for this employee and challenge');
      }

      // Check evidence: proof_url is required if challenge proof_required is flagged
      const submittedProofUrl = req.body.proof_url || participation.proof_url;
      if (challenge.proof_required && (!submittedProofUrl || submittedProofUrl.trim() === '')) {
        throw new Error('Evidence proof_url is required for this challenge, but was not provided');
      }

      // XP = base_xp * difficulty multiplier
      // easy 1x, medium 1.5x, hard 2x
      let multiplier = 1.0;
      if (challenge.difficulty === 'medium') {
        multiplier = 1.5;
      } else if (challenge.difficulty === 'hard') {
        multiplier = 2.0;
      }

      const baseXP = challenge.base_xp || 0;
      const xpToAdd = Math.round(baseXP * multiplier);
      const pointsToAdd = challenge.points || 0;

      // Credit XP/points via ledger
      await recordPointsTransaction(
        db,
        empId,
        pointsToAdd,
        xpToAdd,
        `Completed challenge: ${challenge.title}`,
        session
      );

      // Run badge evaluation
      await evaluateBadges(db, empId, session);

      // Insert notification
      await db.collection('notifications').insertOne({
        employee_id: empId,
        title: 'Challenge Completed',
        message: `Congratulations! You completed the challenge "${challenge.title}"! Credited ${xpToAdd} XP.`,
        type: 'challenge_complete',
        read: false,
        timestamp: new Date()
      }, { session });

      // Mark participation as completed
      await db.collection('challenge_participations').updateOne(
        { _id: participation._id },
        {
          $set: {
            status: 'completed',
            proof_url: submittedProofUrl,
            xp_credited: xpToAdd,
            points_credited: pointsToAdd,
            completed_at: new Date()
          }
        },
        { session }
      );

      return {
        participation_id: participation._id,
        status: 'completed',
        xp_credited: xpToAdd,
        points_credited: pointsToAdd
      };
    });

    return res.status(200).json({ success: true, data: resultData });
  } catch (error) {
    console.error('Error completing challenge:', error);
    const isValidationError = error.message.includes('found') || error.message.includes('required');
    return res.status(isValidationError ? 400 : 500).json({ success: false, error: error.message });
  }
});

// GET /api/gamification/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const scope = req.query.scope || 'org'; // 'org' or 'department'
    const query = {};

    if (scope === 'department') {
      const deptId = toObjectId(req.query.department_id);
      if (!deptId) {
        return res.status(400).json({ success: false, error: 'department_id is required when scope is department' });
      }
      query.department_id = deptId;
    }

    const total = await db.collection('employees').countDocuments(query);
    const employees = await db.collection('employees')
      .find(query)
      .project({ name: 1, points: 1, xp: 1, department_id: 1 })
      .sort({ xp: -1, points: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return res.status(200).json({
      success: true,
      data: employees,
      scope,
      page,
      limit,
      total
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/gamification/rewards
router.get('/rewards', async (req, res) => {
  try {
    const db = getDB();
    const rewards = await db.collection('rewards').find().toArray();
    return res.status(200).json({ success: true, data: rewards });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/gamification/rewards
router.post('/rewards', async (req, res) => {
  try {
    const db = getDB();
    const { title, points_cost, stock } = req.body;

    if (!title || isNaN(points_cost) || isNaN(stock)) {
      return res.status(400).json({ success: false, error: 'Title, points_cost, and stock are required' });
    }

    const reward = {
      title,
      points_cost: parseInt(points_cost, 10),
      stock: parseInt(stock, 10)
    };

    const result = await db.collection('rewards').insertOne(reward);
    reward._id = result.insertedId;

    return res.status(201).json({ success: true, data: reward });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/gamification/rewards/:id/redeem
router.post('/rewards/:id/redeem', async (req, res) => {
  try {
    const db = getDB();
    const rewardId = toObjectId(req.params.id);
    if (!rewardId) {
      return res.status(400).json({ success: false, error: 'Invalid reward ID' });
    }

    const empIdStr = req.headers['x-employee-id'] || req.body.employee_id;
    const empId = toObjectId(empIdStr);
    if (!empId) {
      return res.status(400).json({ success: false, error: 'Valid employee context is required via x-employee-id header' });
    }

    const resultData = await runInTransaction(async (session) => {
      // 1. UPDATE rewards SET stock=stock-1 WHERE id=$1 AND stock>0 RETURNING *,
      // We use findOneAndUpdate with filter query to ensure stock > 0
      const rewardResult = await db.collection('rewards').findOneAndUpdate(
        { _id: rewardId, stock: { $gt: 0 } },
        { $inc: { stock: -1 } },
        { returnDocument: 'after', session }
      );

      const reward = rewardResult.value !== undefined ? rewardResult.value : rewardResult;
      if (!reward) {
        throw new Error('Reward is out of stock or does not exist');
      }

      // 2. Check points balance in the same transaction
      const employee = await db.collection('employees').findOne({ _id: empId }, { session });
      if (!employee) {
        throw new Error('Employee record not found');
      }

      if ((employee.points || 0) < reward.points_cost) {
        throw new Error(`Insufficient points: reward costs ${reward.points_cost} points, but employee only has ${employee.points || 0}`);
      }

      // 3. Deduct points via points ledger
      await recordPointsTransaction(
        db,
        empId,
        -reward.points_cost,
        0,
        `Redeemed reward: ${reward.title}`,
        session
      );

      // 4. Log redemption
      const redemption = {
        employee_id: empId,
        reward_id: rewardId,
        points_cost: reward.points_cost,
        redeemed_at: new Date()
      };
      await db.collection('reward_redemptions').insertOne(redemption, { session });

      return {
        reward_id: rewardId,
        reward_title: reward.title,
        points_deducted: reward.points_cost,
        remaining_stock: reward.stock
      };
    });

    return res.status(200).json({ success: true, data: resultData });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    const isValidationError = error.message.includes('out of stock') || error.message.includes('Insufficient') || error.message.includes('not found');
    return res.status(isValidationError ? 400 : 500).json({ success: false, error: error.message });
  }
});

module.exports = router;
