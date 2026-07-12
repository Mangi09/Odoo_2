const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB, runInTransaction, toDbId } = require('../../shared/db');
const { recordPointsTransaction } = require('../../shared/lib/points-ledger');
const { evaluateBadges } = require('../../shared/lib/badges');

const router = express.Router();

// State transition map for challenges: DRAFT -> ACTIVE -> UNDER_REVIEW -> COMPLETED, or ARCHIVED anytime
const VALID_TRANSITIONS = {
  'DRAFT': ['ACTIVE', 'ARCHIVED'],
  'ACTIVE': ['UNDER_REVIEW', 'ARCHIVED'],
  'UNDER_REVIEW': ['COMPLETED', 'ARCHIVED'],
  'COMPLETED': ['ARCHIVED'],
  'ARCHIVED': []
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
      query.status = req.query.status.toUpperCase();
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
    const { title, description, base_xp, xp, difficulty, points, proof_required, evidence_required, category_id } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and description are required' });
    }

    const xpVal = parseInt(xp || base_xp, 10);
    if (isNaN(xpVal) || xpVal <= 0) {
      return res.status(400).json({ success: false, error: 'xp must be a positive integer' });
    }

    const diff = (difficulty || 'MEDIUM').toUpperCase();
    if (!['EASY', 'MEDIUM', 'HARD'].includes(diff)) {
      return res.status(400).json({ success: false, error: "Difficulty must be 'EASY', 'MEDIUM', or 'HARD'" });
    }

    // Resolve org_id
    const catDoc = category_id ? await db.collection('categories').findOne({ _id: toDbId(category_id) }) : null;
    const orgId = catDoc ? catDoc.org_id : 'org-eco';

    const challenge = {
      org_id: orgId,
      category_id: category_id ? toDbId(category_id) : null,
      title,
      description,
      xp: xpVal,
      difficulty: diff,
      evidence_required: evidence_required !== undefined ? !!evidence_required : !!proof_required,
      status: 'DRAFT',
      created_at: new Date(),
      updated_at: new Date()
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
    const challengeId = toDbId(req.params.id);
    if (!challengeId) {
      return res.status(400).json({ success: false, error: 'Invalid challenge ID' });
    }

    let { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'status is required' });
    }
    status = status.toUpperCase();

    const challenge = await db.collection('challenges').findOne({ _id: challengeId });
    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }

    const currentStatus = (challenge.status || 'DRAFT').toUpperCase();
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
    const challengeId = toDbId(req.params.id);
    if (!challengeId) {
      return res.status(400).json({ success: false, error: 'Invalid challenge ID' });
    }

    const empIdStr = req.headers['x-employee-id'] || req.body.employee_id;
    const empId = toDbId(empIdStr);
    if (!empId) {
      return res.status(400).json({ success: false, error: 'Valid employee context is required via x-employee-id header' });
    }

    const challenge = await db.collection('challenges').findOne({ _id: challengeId });
    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }

    const challengeStatus = (challenge.status || 'DRAFT').toUpperCase();
    if (challengeStatus !== 'ACTIVE') {
      return res.status(400).json({ success: false, error: 'Cannot participate in a challenge that is not active' });
    }

    const user = await db.collection('users').findOne({ _id: empId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Employee User not found' });
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
      org_id: user.org_id || 'org-eco',
      challenge_id: challengeId,
      employee_id: empId,
      progress_percent: 0,
      proof_url: proof_url || '',
      approval_status: 'Pending',
      xp_awarded: 0,
      joined_at: new Date()
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
    const challengeId = toDbId(req.params.id);
    if (!challengeId) {
      return res.status(400).json({ success: false, error: 'Invalid challenge ID' });
    }

    const empIdStr = req.headers['x-employee-id'] || req.body.employee_id;
    const empId = toDbId(empIdStr);
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
        { challenge_id: challengeId, employee_id: empId, approval_status: 'Pending' },
        { session }
      );

      if (!participation) {
        throw new Error('No active joined participation found for this employee and challenge');
      }

      // Check evidence: proof_url is required if challenge evidence_required is flagged
      const submittedProofUrl = req.body.proof_url || participation.proof_url;
      if (challenge.evidence_required && (!submittedProofUrl || submittedProofUrl.trim() === '')) {
        throw new Error('Evidence proof_url is required for this challenge, but was not provided');
      }

      // XP = challenge.xp * difficulty multiplier (EASY 1x, MEDIUM 1.5x, HARD 2x)
      const diff = (challenge.difficulty || 'MEDIUM').toUpperCase();
      let multiplier = 1.0;
      if (diff === 'MEDIUM') {
        multiplier = 1.5;
      } else if (diff === 'HARD') {
        multiplier = 2.0;
      }

      const challengeXP = challenge.xp || 0;
      const xpToAdd = Math.round(challengeXP * multiplier);

      // Credit XP in ledger
      await recordPointsTransaction(
        db,
        empId,
        0, // 0 Points
        xpToAdd, // XP
        `Completed challenge: ${challenge.title}`,
        session,
        { source_type: 'CHALLENGE_COMPLETION', source_id: participation._id }
      );

      // Run badge evaluation
      await evaluateBadges(db, empId, session);

      // Insert notification
      await db.collection('notifications').insertOne({
        org_id: participation.org_id || 'org-eco',
        recipient_user_id: empId,
        event_type: 'CHALLENGE_COMPLETE',
        title: 'Challenge Completed',
        body: `Congratulations! You completed the challenge "${challenge.title}"! Credited ${xpToAdd} XP.`,
        entity_type: 'challenge',
        entity_id: challengeId,
        read_at: null,
        created_at: new Date()
      }, { session });

      // Mark participation as completed & approved
      await db.collection('challenge_participations').updateOne(
        { _id: participation._id },
        {
          $set: {
            approval_status: 'Approved',
            proof_url: submittedProofUrl,
            xp_awarded: xpToAdd,
            completed_at: new Date()
          }
        },
        { session }
      );

      return {
        participation_id: participation._id,
        approval_status: 'Approved',
        xp_credited: xpToAdd
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
      const deptId = toDbId(req.query.department_id);
      if (!deptId) {
        return res.status(400).json({ success: false, error: 'department_id is required when scope is department' });
      }
      query.department_id = deptId;
    }

    const total = await db.collection('users').countDocuments(query);
    const users = await db.collection('users')
      .find(query)
      .project({ full_name: 1, points_balance: 1, xp_total: 1, department_id: 1 })
      .sort({ xp_total: -1, points_balance: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Map for frontend compatibility
    const enriched = users.map(u => ({
      ...u,
      name: u.full_name,
      xp: u.xp_total,
      points: u.points_balance
    }));

    return res.status(200).json({
      success: true,
      data: enriched,
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
    const { title, name, points_cost, points_required, stock } = req.body;

    const rewardName = name || title;
    const pts = parseInt(points_required || points_cost, 10);
    if (!rewardName || isNaN(pts) || isNaN(stock)) {
      return res.status(400).json({ success: false, error: 'Name, points_required, and stock are required' });
    }

    const reward = {
      org_id: 'org-eco',
      name: rewardName,
      points_required: pts,
      stock: parseInt(stock, 10),
      status: 'Active',
      created_at: new Date(),
      updated_at: new Date()
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
    const rewardId = toDbId(req.params.id);
    if (!rewardId) {
      return res.status(400).json({ success: false, error: 'Invalid reward ID' });
    }

    const empIdStr = req.headers['x-employee-id'] || req.body.employee_id;
    const empId = toDbId(empIdStr);
    if (!empId) {
      return res.status(400).json({ success: false, error: 'Valid employee context is required' });
    }

    const resultData = await runInTransaction(async (session) => {
      // 1. UPDATE rewards SET stock=stock-1 WHERE id=$1 AND stock>0 RETURNING *,
      const rewardResult = await db.collection('rewards').findOneAndUpdate(
        { _id: rewardId, stock: { $gt: 0 } },
        { $inc: { stock: -1 } },
        { returnDocument: 'after', session }
      );

      const reward = rewardResult.value !== undefined ? rewardResult.value : rewardResult;
      if (!reward) {
        throw new Error('Reward is out of stock or does not exist');
      }

      // 2. Check points balance in the same transaction (from users collection)
      const user = await db.collection('users').findOne({ _id: empId }, { session });
      if (!user) {
        throw new Error('Employee User record not found');
      }

      if ((user.points_balance || 0) < reward.points_required) {
        throw new Error(`Insufficient points: reward costs ${reward.points_required} points, but employee only has ${user.points_balance || 0}`);
      }

      // 3. Deduct points via points ledger
      await recordPointsTransaction(
        db,
        empId,
        -reward.points_required,
        0, // 0 XP
        `Redeemed reward: ${reward.name}`,
        session,
        { source_type: 'REWARD_REDEMPTION', source_id: rewardId }
      );

      // 4. Log redemption
      const redemption = {
        org_id: user.org_id || 'org-eco',
        employee_id: empId,
        reward_id: rewardId,
        points_spent: reward.points_required,
        status: 'FULFILLED',
        redeemed_at: new Date()
      };
      await db.collection('reward_redemptions').insertOne(redemption, { session });

      return {
        reward_id: rewardId,
        reward_title: reward.name,
        points_deducted: reward.points_required,
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
