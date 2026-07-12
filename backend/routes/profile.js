const express = require('express');
const { getDB } = require('../shared/db');
const { verifyJWT } = require('../shared/middleware/auth');

const router = express.Router();
router.use(verifyJWT);

// GET /api/profile/me
router.get('/me', async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.id;

    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) return res.status(404).json({ error: 'Profile not found' });

    const depts = await db.collection('departments').find({ org_id: user.org_id }).toArray();
    const deptMap = Object.fromEntries(depts.map(d => [d._id.toString(), d.name]));

    // Counts
    const badgesCount = await db.collection('employee_badges').countDocuments({ employee_id: userId });
    const csrCount = await db.collection('employee_participations').countDocuments({ employee_id: userId, approval_status: 'Approved' });
    const challengesCount = await db.collection('challenge_participations').countDocuments({ employee_id: userId, approval_status: 'Approved' });

    return res.json({
      id: user._id.toString(),
      name: user.full_name,
      email: user.email,
      role: user.role,
      department: deptMap[user.department_id?.toString()] || null,
      joinedAt: (user.created_at || new Date()).toISOString().split('T')[0],
      xp: user.xp_total || 0,
      points: user.points_balance || 0,
      badges: badgesCount,
      csrEvents: csrCount,
      challengesCompleted: challengesCount
    });
  } catch (err) {
    console.error('GET profile/me error:', err);
    return res.status(500).json({ error: 'Failed to load profile' });
  }
});

// GET /api/profile/history?type=Challenge|CSR|Reward
router.get('/history', async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.id;
    const type = req.query.type;

    const history = [];

    if (!type || type === 'Challenge') {
      const parts = await db.collection('challenge_participations').find({ employee_id: userId }).sort({ completed_at: -1 }).toArray();
      const challengeIds = parts.map(p => p.challenge_id?.toString()).filter(Boolean);
      const challenges = challengeIds.length ? await db.collection('challenges').find({ _id: { $in: challengeIds } }).toArray() : [];
      const chMap = Object.fromEntries(challenges.map(c => [c._id.toString(), c]));

      for (const p of parts) {
        const ch = chMap[p.challenge_id?.toString()];
        history.push({
          id: p._id.toString(),
          type: 'Challenge',
          title: ch?.title || 'Challenge',
          description: `XP earned: ${p.xp_awarded || 0}`,
          date: (p.completed_at || p.joined_at || new Date()).toISOString().split('T')[0],
          status: p.approval_status,
          value: p.xp_awarded || 0,
          unit: 'XP'
        });
      }
    }

    if (!type || type === 'CSR') {
      const parts = await db.collection('employee_participations').find({ employee_id: userId }).sort({ created_at: -1 }).toArray();
      const actIds = parts.map(p => p.csr_activity_id?.toString()).filter(Boolean);
      const activities = actIds.length ? await db.collection('csr_activities').find({ _id: { $in: actIds } }).toArray() : [];
      const actMap = Object.fromEntries(activities.map(a => [a._id.toString(), a]));

      for (const p of parts) {
        const act = actMap[p.csr_activity_id?.toString()];
        history.push({
          id: p._id.toString(),
          type: 'CSR',
          title: act?.title || 'CSR Activity',
          description: `Points earned: ${p.points_earned || 0}`,
          date: (p.created_at || new Date()).toISOString().split('T')[0],
          status: p.approval_status,
          value: p.points_earned || 0,
          unit: 'Points'
        });
      }
    }

    if (!type || type === 'Reward') {
      const redemptions = await db.collection('reward_redemptions').find({ employee_id: userId }).sort({ redeemed_at: -1 }).toArray();
      const rewardIds = redemptions.map(r => r.reward_id?.toString()).filter(Boolean);
      const rewards = rewardIds.length ? await db.collection('rewards').find({ _id: { $in: rewardIds } }).toArray() : [];
      const rewardMap = Object.fromEntries(rewards.map(r => [r._id.toString(), r]));

      for (const r of redemptions) {
        const reward = rewardMap[r.reward_id?.toString()];
        history.push({
          id: r._id.toString(),
          type: 'Reward',
          title: reward?.name || 'Reward',
          description: `Points spent: ${r.points_spent || 0}`,
          date: (r.redeemed_at || new Date()).toISOString().split('T')[0],
          status: r.status || 'FULFILLED',
          value: r.points_spent || 0,
          unit: 'Points'
        });
      }
    }

    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    return res.json(history);
  } catch (err) {
    console.error('GET profile/history error:', err);
    return res.status(500).json({ error: 'Failed to load history' });
  }
});

module.exports = router;
