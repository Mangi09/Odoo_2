const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../../shared/db');

const router = express.Router();

function toObjectId(id) {
  if (!id) return null;
  try {
    return new ObjectId(id);
  } catch (e) {
    return null;
  }
}

// GET /api/environmental/transactions
router.get('/transactions', async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by department_id (requires resolving employees in department)
    if (req.query.department_id) {
      const deptId = toObjectId(req.query.department_id);
      if (deptId) {
        const employees = await db.collection('employees').find({ department_id: deptId }).toArray();
        const employeeIds = employees.map(emp => emp._id);
        query.employee_id = { $in: employeeIds };
      } else {
        return res.status(200).json({ success: true, data: [], page, limit, total: 0 });
      }
    }

    // Filter by employee_id directly
    if (req.query.employee_id) {
      const empId = toObjectId(req.query.employee_id);
      if (empId) {
        query.employee_id = empId;
      }
    }

    // Filter by activity_type
    if (req.query.activity_type) {
      query.activity_type = req.query.activity_type;
    }

    // Filter by date range
    if (req.query.start_date || req.query.end_date) {
      query.timestamp = {};
      if (req.query.start_date) {
        query.timestamp.$gte = new Date(req.query.start_date);
      }
      if (req.query.end_date) {
        query.timestamp.$lte = new Date(req.query.end_date);
      }
    }

    const total = await db.collection('carbon_transactions').countDocuments(query);
    const transactions = await db.collection('carbon_transactions')
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ timestamp: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      data: transactions,
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
    const { employee_id, quantity, activity_type, emission_factor_id } = req.body;

    const empIdStr = employee_id || req.headers['x-employee-id'];
    const empId = toObjectId(empIdStr);
    if (!empId) {
      return res.status(400).json({ success: false, error: 'Valid employee_id is required' });
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Quantity must be a positive number' });
    }

    if (!activity_type) {
      return res.status(400).json({ success: false, error: 'activity_type is required' });
    }

    const efId = toObjectId(emission_factor_id);
    if (!efId) {
      return res.status(400).json({ success: false, error: 'Valid emission_factor_id is required' });
    }

    // Lookup emission factor
    const factor = await db.collection('emission_factors').findOne({ _id: efId });
    if (!factor) {
      return res.status(404).json({ success: false, error: 'Emission factor not found' });
    }

    // Compute co2e server-side (never trust client)
    const co2e = qty * parseFloat(factor.co2e_per_unit);

    const transaction = {
      employee_id: empId,
      quantity: qty,
      co2e,
      activity_type,
      emission_factor_id: efId,
      timestamp: new Date()
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
    const { employee_id, quantity, activity_type, source_module } = req.body;

    const empIdStr = employee_id || req.headers['x-employee-id'];
    const empId = toObjectId(empIdStr);
    if (!empId) {
      return res.status(400).json({ success: false, error: 'Valid employee_id is required' });
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Quantity must be a positive number' });
    }

    if (!activity_type || !source_module) {
      return res.status(400).json({ success: false, error: 'activity_type and source_module are required' });
    }

    // Lookup emission factor dynamically by type + source
    const factor = await db.collection('emission_factors').findOne({ activity_type, source_module });
    if (!factor) {
      return res.status(404).json({ success: false, error: `Emission factor matching activity_type '${activity_type}' and source_module '${source_module}' not found` });
    }

    // Compute co2e server-side
    const co2e = qty * parseFloat(factor.co2e_per_unit);

    const transaction = {
      employee_id: empId,
      quantity: qty,
      co2e,
      activity_type,
      emission_factor_id: factor._id,
      timestamp: new Date(),
      auto_calculated: true
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
      const deptId = toObjectId(req.query.department_id);
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
