const { toDbId } = require('../db');

/**
 * Records a points and/or XP change in the ledger and updates the employee's cached balance.
 * Must be executed within a transaction session if provided.
 * @param {import('mongodb').Db} db - The MongoDB Database object.
 * @param {string} employeeId - The ID of the employee (User ID).
 * @param {number} pointsDelta - The points to add/deduct.
 * @param {number} xpDelta - The XP to add.
 * @param {string} reason - Reason for transaction.
 * @param {import('mongodb').ClientSession} [session] - Optional transaction session.
 * @param {object} [details] - Optional extra metadata like source_type and source_id.
 */
async function recordPointsTransaction(db, employeeId, pointsDelta, xpDelta, reason, session, details = {}) {
  const empId = toDbId(employeeId);
  const ledgerCol = db.collection('points_ledger');
  const userCol = db.collection('users');

  // Load user to get organization ID
  const user = await userCol.findOne({ _id: empId }, { session });
  if (!user) {
    throw new Error(`User with ID ${empId} not found for points transaction.`);
  }

  const orgId = user.org_id || 'org-eco';

  // 1. Insert points ledger entry
  await ledgerCol.insertOne({
    org_id: orgId,
    employee_id: empId,
    source_type: details.source_type || 'SYSTEM_ADJUSTMENT',
    source_id: details.source_id ? toDbId(details.source_id) : null,
    points_delta: pointsDelta,
    reason: reason,
    created_at: new Date()
  }, { session });

  // 2. Update user cached balances
  const updateResult = await userCol.findOneAndUpdate(
    { _id: empId },
    { $inc: { points_balance: pointsDelta, xp_total: xpDelta } },
    { returnDocument: 'after', session }
  );

  if (!updateResult) {
    throw new Error(`User with ID ${empId} not found for balance update.`);
  }

  const updatedUser = updateResult.value !== undefined ? updateResult.value : updateResult;
  return updatedUser;
}

module.exports = {
  recordPointsTransaction
};
