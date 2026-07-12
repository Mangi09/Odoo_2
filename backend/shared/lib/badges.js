const { toDbId } = require('../db');

/**
 * Evaluates whether an employee (user) is eligible for any unassigned badges.
 * Must be executed within a transaction session if provided.
 * @param {import('mongodb').Db} db - The MongoDB Database object.
 * @param {string} employeeId - The ID of the employee (User ID).
 * @param {import('mongodb').ClientSession} [session] - Optional transaction session.
 */
async function evaluateBadges(db, employeeId, session) {
  const empId = toDbId(employeeId);
  
  // 1. Retrieve the employee's current state from the users collection
  const user = await db.collection('users').findOne({ _id: empId }, { session });
  if (!user) {
    console.warn(`User with ID ${empId} not found for badge evaluation.`);
    return [];
  }

  // 2. Fetch all available badges
  const allBadges = await db.collection('badges').find({}, { session }).toArray();
  
  // 3. Find badges already awarded to this employee
  const existingBadges = await db.collection('employee_badges').find({ employee_id: empId }, { session }).toArray();
  const existingBadgeIds = new Set(existingBadges.map(eb => eb.badge_id.toString()));

  const newlyAwarded = [];

  // 4. Check eligibility for each badge
  for (const badge of allBadges) {
    if (existingBadgeIds.has(badge._id.toString())) {
      continue; // Employee already has this badge
    }

    let isEligible = false;
    let rule = {};
    if (badge.unlock_rule_json) {
      try {
        rule = typeof badge.unlock_rule_json === 'string' ? JSON.parse(badge.unlock_rule_json) : badge.unlock_rule_json;
      } catch (e) {
        console.error('Failed to parse unlock_rule_json:', badge.unlock_rule_json, e);
      }
    } else if (badge.unlock_rule) {
      // Fallback to unlock_rule
      rule = typeof badge.unlock_rule === 'string' ? JSON.parse(badge.unlock_rule) : badge.unlock_rule;
    }

    if (rule.metric) {
      let actualValue = 0;
      if (rule.metric === 'approved_activities') {
        actualValue = await db.collection('employee_participations').countDocuments({
          employee_id: empId,
          approval_status: 'Approved'
        }, { session });
      } else if (rule.metric === 'hard_challenges') {
        const completedParts = await db.collection('challenge_participations').find({
          employee_id: empId,
          approval_status: 'Approved'
        }, { session }).toArray();
        const challengeIds = completedParts.map(cp => cp.challenge_id);
        actualValue = await db.collection('challenges').countDocuments({
          _id: { $in: challengeIds },
          difficulty: { $in: ['HARD', 'Hard', 'hard'] }
        }, { session });
      } else if (rule.metric === 'xp_total') {
        actualValue = user.xp_total || 0;
      } else if (rule.metric === 'points_balance') {
        actualValue = user.points_balance || 0;
      }

      const targetValue = rule.value;
      if (rule.operator === '>=') {
        isEligible = actualValue >= targetValue;
      } else if (rule.operator === '>') {
        isEligible = actualValue > targetValue;
      } else if (rule.operator === '==') {
        isEligible = actualValue === targetValue;
      }
    }

    if (isEligible) {
      const awardDoc = {
        org_id: user.org_id || 'org-eco',
        employee_id: empId,
        badge_id: badge._id,
        awarded_at: new Date(),
        reason: badge.description || `Unlocked badge ${badge.name}`
      };
      await db.collection('employee_badges').insertOne(awardDoc, { session });
      newlyAwarded.push(badge);

      // Insert notification (matching official notifications schema)
      await db.collection('notifications').insertOne({
        org_id: user.org_id || 'org-eco',
        recipient_user_id: empId,
        event_type: 'BADGE_UNLOCKED',
        title: `New Badge Unlocked: ${badge.name}`,
        body: `Congratulations! You have unlocked the badge: ${badge.name}.`,
        entity_type: 'badge',
        entity_id: badge._id,
        read_at: null,
        created_at: new Date()
      }, { session });
    }
  }

  return newlyAwarded;
}

module.exports = {
  evaluateBadges
};
