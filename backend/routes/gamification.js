const express = require('express');
const { getDB, runInTransaction } = require('../shared/db');
const { verifyJWT } = require('../shared/middleware/auth');
const { isManagerOrAdmin } = require('../shared/middleware/rbac');
const { recordPointsTransaction } = require('../shared/lib/points-ledger');
const { evaluateBadges } = require('../shared/lib/badges');

const router = express.Router();
router.use(verifyJWT);

/** Map DB challenge → GameChallenge TS interface */
function mapChallenge(ch, userParticipation) {
  let userStatus = 'NotStarted';
  if (userParticipation) {
    if (userParticipation.approval_status === 'Approved') userStatus = 'Completed';
    else if (userParticipation.approval_status === 'Pending') userStatus = 'InProgress';
  }

  return {
    id: ch._id.toString(),
    title: ch.title,
    description: ch.description || '',
    xpReward: ch.xp || ch.base_xp || 100,
    type: ch.type || ch.category_name || 'Environmental',
    deadline: (ch.deadline || new Date()).toISOString().split('T')[0],
    participants: ch.participants || 0,
    difficulty: ch.difficulty || 'Medium',
    isActive: (ch.status || '').toUpperCase() === 'ACTIVE',
    userStatus
  };
}

// GET /api/gamification/challenges
router.get('/challenges', async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.id;

    const challenges = await db.collection('challenges').find({ org_id: req.user.org_id }).toArray();
    const myParts = await db.collection('challenge_participations').find({ employee_id: userId }).toArray();
    const myPartMap = Object.fromEntries(myParts.map(p => [p.challenge_id?.toString(), p]));

    return res.json(challenges.map(ch => mapChallenge(ch, myPartMap[ch._id.toString()])));
  } catch (err) {
    console.error('GET challenges error:', err);
    return res.status(500).json({ error: 'Failed to load challenges' });
  }
});

// POST /api/gamification/challenges/:id/complete
router.post('/challenges/:id/complete', async (req, res) => {
  try {
    const db = getDB();
    const challengeId = req.params.id;
    const userId = req.user.id;

    const result = await runInTransaction(async (session) => {
      const challenge = await db.collection('challenges').findOne({ _id: challengeId }, { session });
      if (!challenge) throw Object.assign(new Error('Challenge not found'), { status: 404 });

      const challengeStatus = (challenge.status || '').toUpperCase();
      if (challengeStatus !== 'ACTIVE') {
        throw Object.assign(new Error('Challenge is not active'), { status: 400 });
      }

      // Check existing participation
      const existingPart = await db.collection('challenge_participations').findOne({
        challenge_id: challengeId,
        employee_id: userId
      }, { session });

      if (existingPart && existingPart.approval_status === 'Approved') {
        throw Object.assign(new Error('You have already completed this challenge'), { status: 400 });
      }

      // Evidence stored but not strictly required — managers can review proof later
      const { proof_url } = req.body;

      // XP multiplier by difficulty
      const baseXP = challenge.xp || challenge.base_xp || 100;
      const diff = (challenge.difficulty || 'Medium').toLowerCase();
      const multiplier = diff === 'hard' ? 2.0 : diff === 'medium' ? 1.5 : 1.0;
      const xpToAward = Math.round(baseXP * multiplier);

      // Credit XP
      await recordPointsTransaction(
        db, userId, 0, xpToAward,
        `Challenge completed: ${challenge.title}`,
        session,
        { source_type: 'CHALLENGE_COMPLETION', source_id: challengeId }
      );

      // Badge check
      await evaluateBadges(db, userId, session);

      // Upsert participation record
      const partData = {
        _id: existingPart?._id || `chpart-${Date.now()}`,
        org_id: req.user.org_id,
        challenge_id: challengeId,
        employee_id: userId,
        proof_url: proof_url || '',
        approval_status: 'Approved',
        xp_awarded: xpToAward,
        completed_at: new Date(),
        joined_at: existingPart?.joined_at || new Date()
      };

      if (existingPart) {
        await db.collection('challenge_participations').updateOne(
          { _id: existingPart._id },
          { $set: { ...partData } },
          { session }
        );
      } else {
        await db.collection('challenge_participations').insertOne(partData, { session });
      }

      // Increment participant count
      await db.collection('challenges').updateOne(
        { _id: challengeId },
        { $inc: { participants: 1 } },
        { session }
      );

      // Notification
      await db.collection('notifications').insertOne({
        _id: `notif-${Date.now()}`,
        org_id: req.user.org_id,
        recipient_user_id: userId,
        event_type: 'CHALLENGE_COMPLETE',
        title: 'Challenge Completed! 🏆',
        body: `You completed "${challenge.title}"! +${xpToAward} XP earned.`,
        entity_type: 'challenge',
        entity_id: challengeId,
        read_at: null,
        created_at: new Date()
      }, { session });

      return { id: challengeId, xpAwarded: xpToAward, message: 'Challenge completed successfully' };
    });

    return res.json(result);
  } catch (err) {
    console.error('POST challenges/:id/complete error:', err);
    return res.status(err.status || 500).json({ error: err.message || 'Challenge completion failed' });
  }
});

// GET /api/gamification/badges
router.get('/badges', async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.id;

    const allBadges = await db.collection('badges').find({ org_id: req.user.org_id }).toArray();
    const earnedBadges = await db.collection('employee_badges').find({ employee_id: userId }).toArray();
    const earnedIds = new Set(earnedBadges.map(e => e.badge_id?.toString()));

    const result = allBadges.map(b => ({
      id: b._id.toString(),
      name: b.name,
      description: b.description || '',
      icon: b.icon || '🏅',
      unlocked: earnedIds.has(b._id.toString()),
      unlockedAt: earnedBadges.find(e => e.badge_id?.toString() === b._id.toString())?.awarded_at || null
    }));

    return res.json(result);
  } catch (err) {
    console.error('GET badges error:', err);
    return res.status(500).json({ error: 'Failed to load badges' });
  }
});

// GET /api/gamification/leaderboard?type=employee|department
router.get('/leaderboard', async (req, res) => {
  try {
    const db = getDB();
    const type = req.query.type || 'employee';
    const orgId = req.user.org_id;

    if (type === 'department') {
      const depts = await db.collection('departments').find({ org_id: orgId }).toArray();
      const scores = await db.collection('department_scores').find({ org_id: orgId }).toArray();
      const scoreMap = Object.fromEntries(scores.map(s => [s.department_id?.toString(), s]));

      const result = depts.map((d, i) => {
        const s = scoreMap[d._id.toString()];
        return {
          rank: i + 1,
          id: d._id.toString(),
          name: d.name,
          totalScore: s?.total_score || 0,
          environmentalScore: s?.environmental_score || 0,
          socialScore: s?.social_score || 0,
          governanceScore: s?.governance_score || 0
        };
      }).sort((a, b) => b.totalScore - a.totalScore).map((r, i) => ({ ...r, rank: i + 1 }));

      return res.json(result);
    }

    // Employee leaderboard
    const users = await db.collection('users').find({ org_id: orgId, status: 'ACTIVE' })
      .sort({ xp_total: -1, points_balance: -1 })
      .limit(50)
      .toArray();

    const depts = await db.collection('departments').find({ org_id: orgId }).toArray();
    const deptMap = Object.fromEntries(depts.map(d => [d._id.toString(), d.name]));

    const result = users.map((u, i) => ({
      rank: i + 1,
      id: u._id.toString(),
      name: u.full_name,
      xp: u.xp_total || 0,
      points: u.points_balance || 0,
      department: deptMap[u.department_id?.toString()] || 'Unknown',
      role: u.role
    }));

    return res.json(result);
  } catch (err) {
    console.error('GET leaderboard error:', err);
    return res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

// GET /api/gamification/rewards
router.get('/rewards', async (req, res) => {
  try {
    const db = getDB();
    const rewards = await db.collection('rewards').find({ org_id: req.user.org_id }).toArray();
    const result = rewards.map(r => ({
      id: r._id.toString(),
      name: r.name,
      description: r.description || '',
      pointsRequired: r.points_required || r.points_cost || 100,
      stock: r.stock || 0,
      status: r.status || 'Active',
      available: (r.stock || 0) > 0
    }));
    return res.json(result);
  } catch (err) {
    console.error('GET rewards error:', err);
    return res.status(500).json({ error: 'Failed to load rewards' });
  }
});

// POST /api/gamification/rewards/:id/redeem
router.post('/rewards/:id/redeem', async (req, res) => {
  try {
    const db = getDB();
    const rewardId = req.params.id;
    const userId = req.user.id;

    const result = await runInTransaction(async (session) => {
      // Atomic stock decrement: UPDATE rewards SET stock=stock-1 WHERE id=$1 AND stock>0 RETURNING *
      const rewardDoc = await db.collection('rewards').findOneAndUpdate(
        { _id: rewardId, stock: { $gt: 0 } },
        { $inc: { stock: -1 } },
        { returnDocument: 'after', session }
      );

      // findOneAndUpdate returns the doc directly in newer drivers, or wrapped in .value in older
      const reward = rewardDoc?.value ?? rewardDoc ?? null;
      if (!reward || !reward._id) {
        throw Object.assign(new Error('Reward is out of stock or not found'), { status: 400 });
      }

      // Check balance in same transaction
      const user = await db.collection('users').findOne({ _id: userId }, { session });
      const required = reward.points_required || reward.points_cost || 0;
      if ((user?.points_balance || 0) < required) {
        throw Object.assign(new Error(`Insufficient points: need ${required}, have ${user?.points_balance || 0}`), { status: 400 });
      }

      // Deduct points via ledger
      await recordPointsTransaction(
        db, userId, -required, 0,
        `Redeemed: ${reward.name}`,
        session,
        { source_type: 'REWARD_REDEMPTION', source_id: rewardId }
      );

      // Log redemption
      await db.collection('reward_redemptions').insertOne({
        _id: `rr-${Date.now()}`,
        org_id: req.user.org_id,
        employee_id: userId,
        reward_id: rewardId,
        points_spent: required,
        status: 'FULFILLED',
        redeemed_at: new Date()
      }, { session });

      // Notification
      await db.collection('notifications').insertOne({
        _id: `notif-${Date.now()}`,
        org_id: req.user.org_id,
        recipient_user_id: userId,
        event_type: 'REWARD_REDEEMED',
        title: 'Reward Redeemed! 🎁',
        body: `You redeemed "${reward.name}" for ${required} points.`,
        entity_type: 'reward',
        entity_id: rewardId,
        read_at: null,
        created_at: new Date()
      }, { session });

      return {
        id: rewardId,
        name: reward.name,
        pointsSpent: required,
        remainingStock: reward.stock,
        message: 'Reward redeemed successfully'
      };
    });

    return res.json(result);
  } catch (err) {
    console.error('POST rewards/:id/redeem error:', err);
    return res.status(err.status || 500).json({ error: err.message || 'Redemption failed' });
  }
});

module.exports = router;
