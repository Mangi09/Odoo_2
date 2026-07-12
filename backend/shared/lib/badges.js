const { ObjectId } = require('mongodb');

/**
 * Evaluates whether an employee is eligible for any unassigned badges.
 * Must be executed within a transaction session if provided.
 * @param {import('mongodb').Db} db - The MongoDB Database object.
 * @param {string|ObjectId} employeeId - The ID of the employee.
 * @param {import('mongodb').ClientSession} [session] - Optional transaction session.
 */
async function evaluateBadges(db, employeeId, session) {
  const empId = typeof employeeId === 'string' ? new ObjectId(employeeId) : employeeId;
  
  // 1. Retrieve the employee's current state
  const employee = await db.collection('employees').findOne({ _id: empId }, { session });
  if (!employee) {
    console.warn(`Employee with ID ${empId.toString()} not found for badge evaluation.`);
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
    if (badge.criteria_type === 'xp') {
      isEligible = (employee.xp || 0) >= badge.threshold;
    } else if (badge.criteria_type === 'points') {
      isEligible = (employee.points || 0) >= badge.threshold;
    } else if (badge.criteria_type === 'csr_count') {
      const count = await db.collection('employee_participations').countDocuments({
        employee_id: empId,
        status: 'approved'
      }, { session });
      isEligible = count >= badge.threshold;
    } else if (badge.criteria_type === 'challenge_count') {
      const count = await db.collection('challenge_participations').countDocuments({
        employee_id: empId,
        status: 'completed'
      }, { session });
      isEligible = count >= badge.threshold;
    }

    if (isEligible) {
      const awardDoc = {
        employee_id: empId,
        badge_id: badge._id,
        awarded_at: new Date()
      };
      await db.collection('employee_badges').insertOne(awardDoc, { session });
      newlyAwarded.push(badge);

      // Insert notification
      await db.collection('notifications').insertOne({
        employee_id: empId,
        title: `New Badge Unlocked: ${badge.name}`,
        message: `Congratulations! You have unlocked the badge: ${badge.name}.`,
        type: 'badge',
        read: false,
        timestamp: new Date()
      }, { session });
    }
  }

  return newlyAwarded;
}

module.exports = {
  evaluateBadges
};
