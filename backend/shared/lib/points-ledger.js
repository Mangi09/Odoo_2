const { ObjectId } = require('mongodb');

/**
 * Records a points and/or XP change in the ledger and updates the employee's cached balance.
 * Must be executed within a transaction session if provided.
 * @param {import('mongodb').Db} db - The MongoDB Database object.
 * @param {string|ObjectId} employeeId - The ID of the employee.
 * @param {number} points - The points to add (can be negative).
 * @param {number} xp - The XP to add (can be negative).
 * @param {string} description - Description of the transaction.
 * @param {import('mongodb').ClientSession} [session] - Optional transaction session.
 */
async function recordPointsTransaction(db, employeeId, points, xp, description, session) {
  const empId = typeof employeeId === 'string' ? new ObjectId(employeeId) : employeeId;
  const ledgerCol = db.collection('points_ledger');
  const employeeCol = db.collection('employees');

  // 1. Insert points ledger entry
  await ledgerCol.insertOne({
    employee_id: empId,
    points,
    xp,
    description,
    timestamp: new Date()
  }, { session });

  // 2. Update employee cached balances
  const updateResult = await employeeCol.findOneAndUpdate(
    { _id: empId },
    { $inc: { points, xp } },
    { returnDocument: 'after', session }
  );

  if (!updateResult) {
    throw new Error(`Employee with ID ${empId.toString()} not found for points update.`);
  }

  // Handle difference in MongoDB driver versions for findOneAndUpdate returning value or the doc
  const updatedEmployee = updateResult.value !== undefined ? updateResult.value : updateResult;
  return updatedEmployee;
}

module.exports = {
  recordPointsTransaction
};
