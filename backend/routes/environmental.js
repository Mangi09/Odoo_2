const express = require('express');
const { getDB, toDbId } = require('../shared/db');
const { verifyJWT } = require('../shared/middleware/auth');

const router = express.Router();
router.use(verifyJWT);

/**
 * Map a DB carbon_transaction to the CarbonTransaction TS interface:
 * { id, date, source, category, amount, status, department }
 */
function mapTransaction(tx, deptMap) {
  return {
    id: tx._id.toString(),
    date: (tx.occurred_at || tx.created_at || new Date()).toISOString().split('T')[0],
    source: tx.activity_name || tx.source_type || 'Unknown Source',
    category: tx.source_type || 'General',
    amount: tx.calculated_co2e || 0,
    status: tx.status || 'Pending',
    department: deptMap[tx.department_id?.toString()] || 'All Departments'
  };
}

// GET /api/environmental/transactions?search=&status=
router.get('/transactions', async (req, res) => {
  try {
    const db = getDB();
    const orgId = req.user.org_id;

    const query = { org_id: orgId };
    if (req.query.status) {
      query.status = req.query.status; // 'Verified' | 'Pending' | 'Flagged'
    }

    let txs = await db.collection('carbon_transactions').find(query).sort({ occurred_at: -1 }).toArray();

    // Client-side search filter on source_type or activity_name
    if (req.query.search) {
      const s = req.query.search.toLowerCase();
      txs = txs.filter(t =>
        (t.source_type || '').toLowerCase().includes(s) ||
        (t.activity_name || '').toLowerCase().includes(s)
      );
    }

    const depts = await db.collection('departments').find({ org_id: orgId }).toArray();
    const deptMap = Object.fromEntries(depts.map(d => [d._id.toString(), d.name]));

    return res.json(txs.map(t => mapTransaction(t, deptMap)));
  } catch (err) {
    console.error('GET transactions error:', err);
    return res.status(500).json({ error: 'Failed to load transactions' });
  }
});

// GET /api/environmental/goals
router.get('/goals', async (req, res) => {
  try {
    const db = getDB();
    const orgId = req.user.org_id;

    const goals = await db.collection('environmental_goals').find({ org_id: orgId }).toArray();
    const depts = await db.collection('departments').find({ org_id: orgId }).toArray();
    const deptMap = Object.fromEntries(depts.map(d => [d._id.toString(), d.name]));

    const result = goals.map(g => ({
      id: g._id.toString(),
      name: g.name,
      target: g.target_co2e || 0,
      current: g.current_co2e || 0,
      unit: 'tCO2e',
      deadline: (g.deadline || new Date()).toISOString().split('T')[0],
      status: g.status || 'Active',
      department: deptMap[g.department_id?.toString()] || 'All'
    }));

    return res.json(result);
  } catch (err) {
    console.error('GET goals error:', err);
    return res.status(500).json({ error: 'Failed to load goals' });
  }
});

// POST /api/environmental/calculate
// Returns { summary, transaction: CarbonTransaction }
router.post('/calculate', async (req, res) => {
  try {
    const db = getDB();
    const orgId = req.user.org_id;
    const userId = req.user.id;

    const { source_type, activity_type, quantity } = req.body;
    const type = source_type || activity_type || 'Fleet';
    const qty = parseFloat(quantity) || 100;

    // Auto-lookup emission factor
    const factor = await db.collection('emission_factors').findOne({
      org_id: orgId,
      source_type: { $regex: new RegExp(`^${type}$`, 'i') }
    });

    if (!factor) {
      // Use default factor if not found
    }
    const co2ePerUnit = factor ? parseFloat(factor.co2e_per_unit) : 2.68;
    const calculatedCo2e = Math.round(qty * co2ePerUnit * 100) / 100;

    // Fetch user's department
    const user = await db.collection('users').findOne({ _id: userId });
    const deptId = user?.department_id || null;

    const newTx = {
      _id: `ct-${Date.now()}`,
      org_id: orgId,
      department_id: deptId,
      source_type: type,
      activity_name: `${type} Auto-Calculated`,
      quantity: qty,
      unit: factor?.unit || 'units',
      emission_factor_id: factor?._id || null,
      calculated_co2e: calculatedCo2e,
      calculation_mode: 'AUTO',
      status: 'Verified',
      occurred_at: new Date(),
      created_by: userId,
      created_at: new Date()
    };

    await db.collection('carbon_transactions').insertOne(newTx);

    // Also update current_co2e on the department's active goal
    if (deptId) {
      await db.collection('environmental_goals').updateOne(
        { org_id: orgId, department_id: deptId, status: { $in: ['ACTIVE', 'ON_TRACK'] } },
        { $inc: { current_co2e: calculatedCo2e } }
      );
    }

    // Summary stats
    const allTxs = await db.collection('carbon_transactions').find({ org_id: orgId }).toArray();
    const totalEmissions = allTxs.reduce((s, t) => s + (t.calculated_co2e || 0), 0);
    const goals = await db.collection('environmental_goals').find({ org_id: orgId }).toArray();

    const depts = await db.collection('departments').find({ org_id: orgId }).toArray();
    const deptMap = Object.fromEntries(depts.map(d => [d._id.toString(), d.name]));

    return res.status(201).json({
      summary: {
        totalEmissions: Math.round(totalEmissions * 10) / 10,
        activeGoals: goals.filter(g => ['ACTIVE', 'ON_TRACK'].includes(g.status)).length,
        lastCalculated: new Date().toISOString()
      },
      transaction: mapTransaction(newTx, deptMap)
    });
  } catch (err) {
    console.error('POST calculate error:', err);
    return res.status(500).json({ error: 'Calculation failed' });
  }
});

module.exports = router;
