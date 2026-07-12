const express = require('express');
const { getDB } = require('../shared/db');
const { verifyJWT } = require('../shared/middleware/auth');
const { isAdmin, isManagerOrAdmin } = require('../shared/middleware/rbac');

const router = express.Router();
router.use(verifyJWT);

// GET /api/settings/config
router.get('/config', async (req, res) => {
  try {
    const db = getDB();
    const config = await db.collection('org_esg_settings').findOne({ org_id: req.user.org_id });
    return res.json(config || {
      org_id: req.user.org_id,
      auto_emission_enabled: true,
      evidence_required_for_csr: true,
      badge_auto_award_enabled: true,
      compliance_alerts_enabled: true,
      environmental_weight: 40,
      social_weight: 30,
      governance_weight: 30
    });
  } catch (err) {
    console.error('GET settings/config error:', err);
    return res.status(500).json({ error: 'Failed to load config' });
  }
});

// PATCH /api/settings/config  [Admin only]
router.patch('/config', isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const updates = { ...req.body, updated_at: new Date() };
    delete updates.org_id; // Prevent org_id override

    const result = await db.collection('org_esg_settings').findOneAndUpdate(
      { org_id: req.user.org_id },
      { $set: updates },
      { returnDocument: 'after', upsert: true }
    );

    return res.json(result?.value ?? result);
  } catch (err) {
    console.error('PATCH settings/config error:', err);
    return res.status(500).json({ error: 'Failed to update config' });
  }
});

// GET /api/departments
router.get('/departments', async (req, res) => {
  try {
    const db = getDB();
    const depts = await db.collection('departments').find({ org_id: req.user.org_id }).toArray();
    return res.json(depts.map(d => ({
      id: d._id.toString(),
      name: d.name,
      code: d.code || '',
      headName: d.head_name || null,
      employeeCount: d.employee_count || 0,
      status: d.status || 'ACTIVE'
    })));
  } catch (err) {
    console.error('GET departments error:', err);
    return res.status(500).json({ error: 'Failed to load departments' });
  }
});

// POST /api/departments  [Admin only]
router.post('/departments', isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { name, code, head_name } = req.body;
    if (!name) return res.status(400).json({ error: 'Validation failed', fields: { name: 'Name is required' } });

    const dept = {
      _id: `dept-${Date.now()}`,
      org_id: req.user.org_id,
      name: name.trim(),
      code: code || name.toUpperCase().slice(0, 4),
      head_name: head_name || null,
      employee_count: 0,
      status: 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date()
    };

    await db.collection('departments').insertOne(dept);
    return res.status(201).json({ id: dept._id, name: dept.name, code: dept.code, status: dept.status });
  } catch (err) {
    console.error('POST departments error:', err);
    return res.status(500).json({ error: 'Failed to create department' });
  }
});

// DELETE /api/departments/:id  [Admin only]
router.delete('/departments/:id', isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('departments').deleteOne({ _id: req.params.id, org_id: req.user.org_id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Department not found' });
    return res.json({ deleted: true, id: req.params.id });
  } catch (err) {
    console.error('DELETE departments/:id error:', err);
    return res.status(500).json({ error: 'Failed to delete department' });
  }
});

// GET /api/categories
router.get('/categories', async (req, res) => {
  try {
    const db = getDB();
    const cats = await db.collection('categories').find({ org_id: req.user.org_id }).toArray();
    return res.json(cats.map(c => ({
      id: c._id.toString(),
      name: c.name,
      type: c.type || 'General',
      status: c.status || 'ACTIVE'
    })));
  } catch (err) {
    console.error('GET categories error:', err);
    return res.status(500).json({ error: 'Failed to load categories' });
  }
});

// POST /api/categories  [Admin only]
router.post('/categories', isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { name, type } = req.body;
    if (!name) return res.status(400).json({ error: 'Validation failed', fields: { name: 'Name is required' } });

    const cat = {
      _id: `cat-${Date.now()}`,
      org_id: req.user.org_id,
      name: name.trim(),
      type: type || 'CSR_ACTIVITY',
      status: 'ACTIVE',
      created_at: new Date()
    };

    await db.collection('categories').insertOne(cat);
    return res.status(201).json({ id: cat._id, name: cat.name, type: cat.type, status: cat.status });
  } catch (err) {
    console.error('POST categories error:', err);
    return res.status(500).json({ error: 'Failed to create category' });
  }
});

// DELETE /api/categories/:id  [Admin only]
router.delete('/categories/:id', isAdmin, async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('categories').deleteOne({ _id: req.params.id, org_id: req.user.org_id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Category not found' });
    return res.json({ deleted: true, id: req.params.id });
  } catch (err) {
    console.error('DELETE categories/:id error:', err);
    return res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Also expose these at /api/departments and /api/categories directly (router mounting at /api/settings)
module.exports = router;
