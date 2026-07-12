const express = require('express');
const path = require('path');
const fs = require('fs');
const { getDB } = require('../shared/db');
const { verifyJWT } = require('../shared/middleware/auth');

const router = express.Router();
router.use(verifyJWT);

// Ensure downloads dir exists
const DOWNLOADS_DIR = path.join(__dirname, '../downloads');
if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });

// POST /api/reports/generate
router.post('/generate', async (req, res) => {
  try {
    const db = getDB();
    const { module: mod, departmentId, format, dateRange } = req.body;

    const errors = {};
    if (!mod) errors.module = 'Module is required';
    if (!format) errors.format = 'Format is required';
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', fields: errors });

    const reportId = `rpt-${Date.now()}`;
    const fileName = `ecosphere_${mod.toLowerCase()}_report_${Date.now()}.${format.toLowerCase()}`;
    const filePath = path.join(DOWNLOADS_DIR, fileName);

    // Generate simple CSV/JSON report content
    let content = '';
    if (format.toLowerCase() === 'csv') {
      content = `EcoSphere ESG Report\nModule: ${mod}\nDepartment: ${departmentId || 'All'}\nDate Range: ${JSON.stringify(dateRange)}\nGenerated: ${new Date().toISOString()}\n\nid,date,value\n1,${new Date().toISOString().split('T')[0]},100\n`;
    } else {
      content = JSON.stringify({
        report: mod,
        department: departmentId || 'All',
        dateRange,
        generatedAt: new Date().toISOString(),
        data: [{ id: 1, date: new Date().toISOString().split('T')[0], value: 100 }]
      }, null, 2);
    }

    fs.writeFileSync(filePath, content);

    const record = {
      _id: reportId,
      org_id: req.user.org_id,
      generated_by: req.user.id,
      module: mod,
      department_id: departmentId || null,
      format: format.toUpperCase(),
      date_range: dateRange || null,
      file_name: fileName,
      file_path: filePath,
      status: 'COMPLETED',
      created_at: new Date()
    };

    await db.collection('report_history').insertOne(record);

    return res.status(201).json({
      id: reportId,
      module: mod,
      format: format.toUpperCase(),
      status: 'COMPLETED',
      downloadUrl: `/api/reports/download/${reportId}`,
      generatedAt: record.created_at.toISOString()
    });
  } catch (err) {
    console.error('POST reports/generate error:', err);
    return res.status(500).json({ error: 'Report generation failed' });
  }
});

// GET /api/reports/history
router.get('/history', async (req, res) => {
  try {
    const db = getDB();
    const reports = await db.collection('report_history').find({ org_id: req.user.org_id }).sort({ created_at: -1 }).toArray();
    return res.json(reports.map(r => ({
      id: r._id.toString(),
      module: r.module,
      format: r.format,
      status: r.status,
      downloadUrl: `/api/reports/download/${r._id}`,
      generatedAt: (r.created_at || new Date()).toISOString()
    })));
  } catch (err) {
    console.error('GET reports/history error:', err);
    return res.status(500).json({ error: 'Failed to load report history' });
  }
});

// GET /api/reports/download/:id
router.get('/download/:id', async (req, res) => {
  try {
    const db = getDB();
    const report = await db.collection('report_history').findOne({ _id: req.params.id, org_id: req.user.org_id });

    if (!report) return res.status(404).json({ error: 'Report not found' });
    if (!fs.existsSync(report.file_path)) return res.status(404).json({ error: 'Report file not found on disk' });

    res.setHeader('Content-Disposition', `attachment; filename="${report.file_name}"`);
    const mime = report.format === 'CSV' ? 'text/csv' : 'application/json';
    res.setHeader('Content-Type', mime);
    return res.sendFile(report.file_path);
  } catch (err) {
    console.error('GET reports/download/:id error:', err);
    return res.status(500).json({ error: 'Download failed' });
  }
});

module.exports = router;
