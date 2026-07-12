const express = require('express');
const { getDB, toDbId } = require('../../shared/db');

const router = express.Router();

// GET /api/environmental/transactions
router.get('/transactions', async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by department_id (requires resolving users in department)
    if (req.query.department_id) {
      const deptId = toDbId(req.query.department_id);
      if (deptId) {
        const users = await db.collection('users').find({ department_id: deptId }).toArray();
        const userIds = users.map(u => u._id);
        query.created_by = { $in: userIds };
      } else {
        return res.status(200).json({ success: true, data: [], page, limit, total: 0 });
      }
    }

    // Filter by employee_id/created_by directly
    if (req.query.employee_id || req.query.created_by) {
      const empId = toDbId(req.query.employee_id || req.query.created_by);
      if (empId) {
        query.created_by = empId;
      }
    }

    // Filter by activity_type or source_type
    const activityType = req.query.activity_type || req.query.source_type;
    if (activityType) {
      query.source_type = { $regex: new RegExp(`^${activityType}$`, 'i') };
    }

    // Filter by date range (occurred_at)
    if (req.query.start_date || req.query.end_date) {
      query.occurred_at = {};
      if (req.query.start_date) {
        query.occurred_at.$gte = new Date(req.query.start_date);
      }
      if (req.query.end_date) {
        query.occurred_at.$lte = new Date(req.query.end_date);
      }
    }

    const total = await db.collection('carbon_transactions').countDocuments(query);
    const transactions = await db.collection('carbon_transactions')
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ occurred_at: -1 })
      .toArray();

    // Map calculated_co2e to co2e for compatibility
    const enrichedTransactions = transactions.map(tx => ({
      ...tx,
      co2e: tx.calculated_co2e
    }));

    return res.status(200).json({
      success: true,
      data: enrichedTransactions,
      page,
      limit,
      total
    });
  } catch (error) {
    console.error('Error fetching environmental transactions:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/environmental/transactions
router.post('/transactions', async (req, res) => {
  try {
    const db = getDB();
    const { employee_id, quantity, activity_type, source_type, emission_factor_id } = req.body;

    const empIdStr = employee_id || req.headers['x-employee-id'];
    const empId = toDbId(empIdStr);
    if (!empId) {
      return res.status(400).json({ success: false, error: 'Valid employee_id context is required' });
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Quantity must be a positive number' });
    }

    const type = source_type || activity_type;
    if (!type) {
      return res.status(400).json({ success: false, error: 'source_type or activity_type is required' });
    }

    const efId = toDbId(emission_factor_id);
    if (!efId) {
      return res.status(400).json({ success: false, error: 'Valid emission_factor_id is required' });
    }

    // Lookup user details
    const user = await db.collection('users').findOne({ _id: empId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Employee User not found' });
    }

    // Lookup emission factor
    const factor = await db.collection('emission_factors').findOne({ _id: efId });
    if (!factor) {
      return res.status(404).json({ success: false, error: 'Emission factor not found' });
    }

    // Compute co2e server-side (calculated_co2e)
    const calculatedCo2e = qty * parseFloat(factor.co2e_per_unit);

    const transaction = {
      org_id: user.org_id || 'org-eco',
      department_id: user.department_id,
      emission_factor_id: efId,
      source_type: factor.source_type || type,
      quantity: qty,
      unit: factor.unit || 'units',
      calculated_co2e: calculatedCo2e,
      co2e: calculatedCo2e, // for compatibility
      calculation_mode: 'MANUAL',
      occurred_at: new Date(),
      created_by: empId,
      created_at: new Date()
    };

    const result = await db.collection('carbon_transactions').insertOne(transaction);
    transaction._id = result.insertedId;

    return res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error creating environmental transaction:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/environmental/auto-calculate
router.post('/auto-calculate', async (req, res) => {
  try {
    const db = getDB();
    const { employee_id, quantity, activity_type, source_type } = req.body;

    const empIdStr = employee_id || req.headers['x-employee-id'];
    const empId = toDbId(empIdStr);
    if (!empId) {
      return res.status(400).json({ success: false, error: 'Valid employee_id is required' });
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Quantity must be a positive number' });
    }

    const type = source_type || activity_type;
    if (!type) {
      return res.status(400).json({ success: false, error: 'source_type or activity_type is required' });
    }

    // Lookup user details
    const user = await db.collection('users').findOne({ _id: empId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Employee User not found' });
    }

    // Lookup emission factor dynamically by source_type (case-insensitive)
    const factor = await db.collection('emission_factors').findOne({
      source_type: { $regex: new RegExp(`^${type}$`, 'i') }
    });

    if (!factor) {
      return res.status(404).json({ success: false, error: `Emission factor matching type '${type}' not found` });
    }

    // Compute co2e server-side
    const calculatedCo2e = qty * parseFloat(factor.co2e_per_unit);

    const transaction = {
      org_id: user.org_id || 'org-eco',
      department_id: user.department_id,
      emission_factor_id: factor._id,
      source_type: factor.source_type,
      quantity: qty,
      unit: factor.unit || 'units',
      calculated_co2e: calculatedCo2e,
      co2e: calculatedCo2e, // for compatibility
      calculation_mode: 'AUTO',
      occurred_at: new Date(),
      created_by: empId,
      created_at: new Date()
    };

    const result = await db.collection('carbon_transactions').insertOne(transaction);
    transaction._id = result.insertedId;

    return res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error in environmental auto-calculate:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/environmental/goals
router.get('/goals', async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.department_id) {
      const deptId = toDbId(req.query.department_id);
      if (deptId) query.department_id = deptId;
    }

    const total = await db.collection('environmental_goals').countDocuments(query);
    const goals = await db.collection('environmental_goals')
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    return res.status(200).json({
      success: true,
      data: goals,
      page,
      limit,
      total
    });
  } catch (error) {
    console.error('Error fetching environmental goals:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
