const express = require('express');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
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
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'Validation failed', fields: errors });
    }

    const reportId = `rpt-${Date.now()}`;
    const fileExt = format.toLowerCase();
    const fileName = `ecosphere_${mod.toLowerCase()}_report_${Date.now()}.${fileExt}`;
    const filePath = path.join(DOWNLOADS_DIR, fileName);

    // Fetch live data based on report configuration
    const orgId = req.user.org_id;
    const org = await db.collection('organizations').findOne({ _id: orgId });
    const depts = await db.collection('departments').find({ org_id: orgId }).toArray();
    const deptMap = Object.fromEntries(depts.map(d => [d._id.toString(), d.name]));

    // Query datasets for ESG Report
    const txs = await db.collection('carbon_transactions').find({ org_id: orgId }).toArray();
    const goals = await db.collection('environmental_goals').find({ org_id: orgId }).toArray();
    const activities = await db.collection('csr_activities').find({ org_id: orgId }).toArray();
    const complianceIssues = await db.collection('compliance_issues').find({ org_id: orgId }).toArray();
    const audits = await db.collection('audits').find({ org_id: orgId }).toArray();
    const policies = await db.collection('esg_policies').find({ org_id: orgId }).toArray();

    if (fileExt === 'pdf') {
      // PDF Generation
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // --- HEADER ---
      doc.fillColor('#16A34A').fontSize(24).text('EcoSphere ESG Report', { align: 'left' });
      doc.fontSize(10).fillColor('#64748B').text(`Organization: ${org?.name || 'EcoSphere Ltd'}`, { align: 'left' });
      doc.text(`Generated On: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`);
      doc.text(`Module Segment: ${mod.toUpperCase()}`);
      doc.moveDown(1.5);
      doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(2);

      // --- SUMMARY STATISTICS ---
      doc.fillColor('#1E293B').fontSize(14).text('Executive Summary', { underline: true });
      doc.moveDown(0.5);
      
      const totalEmissions = txs.reduce((acc, t) => acc + (t.calculated_co2e || 0), 0);
      const totalActivities = activities.length;
      const openIssuesCount = complianceIssues.filter(i => i.status !== 'Resolved').length;

      doc.fontSize(11).fillColor('#334155');
      doc.text(`• Total Carbon Emissions Tracked: ${totalEmissions.toFixed(2)} tCO2e`);
      doc.text(`• Active CSR Initiatives: ${totalActivities} programs`);
      doc.text(`• Outstanding Compliance Action Items: ${openIssuesCount} issues`);
      doc.moveDown(1.5);

      // --- DATA TABLE ---
      if (mod === 'Environmental') {
        doc.fillColor('#1E293B').fontSize(14).text('Carbon Emissions Breakdown', { underline: true });
        doc.moveDown(1);

        // Draw Table Header
        let y = doc.y;
        doc.fontSize(10).fillColor('#475569');
        doc.text('Source Category', 50, y, { width: 150 });
        doc.text('Department', 200, y, { width: 120 });
        doc.text('Calculated CO2e (t)', 320, y, { width: 120, align: 'right' });
        doc.text('Status', 450, y, { width: 100, align: 'right' });

        doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(50, y + 15).lineTo(550, y + 15).stroke();
        doc.moveDown(1);

        // Draw Rows
        txs.forEach(t => {
          doc.moveDown(0.5);
          y = doc.y;
          if (y > 700) { doc.addPage(); y = 50; }
          doc.fillColor('#1E293B');
          doc.text(t.source_type || 'Other', 50, y, { width: 150 });
          doc.text(deptMap[t.department_id?.toString()] || 'HQ / Corporate', 200, y, { width: 120 });
          doc.text((t.calculated_co2e || 0).toFixed(2), 320, y, { width: 120, align: 'right' });
          doc.text(t.status || 'Pending', 450, y, { width: 100, align: 'right' });
        });
      } else if (mod === 'Social') {
        doc.fillColor('#1E293B').fontSize(14).text('CSR Initiatives & Social Impact', { underline: true });
        doc.moveDown(1);

        let y = doc.y;
        doc.fontSize(10).fillColor('#475569');
        doc.text('Initiative Title', 50, y, { width: 200 });
        doc.text('Impact Area', 260, y, { width: 120 });
        doc.text('Reward Points', 390, y, { width: 80, align: 'right' });
        doc.text('Status', 480, y, { width: 70, align: 'right' });

        doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(50, y + 15).lineTo(550, y + 15).stroke();
        doc.moveDown(1);

        activities.forEach(a => {
          doc.moveDown(0.5);
          y = doc.y;
          if (y > 700) { doc.addPage(); y = 50; }
          doc.fillColor('#1E293B');
          doc.text(a.title || 'CSR Activity', 50, y, { width: 200 });
          doc.text(a.category || 'Community', 260, y, { width: 120 });
          doc.text((a.points || 0).toString(), 390, y, { width: 80, align: 'right' });
          doc.text(a.status || 'Open', 480, y, { width: 70, align: 'right' });
        });
      } else {
        // Governance
        doc.fillColor('#1E293B').fontSize(14).text('Compliance & Governance Audit Log', { underline: true });
        doc.moveDown(1);

        let y = doc.y;
        doc.fontSize(10).fillColor('#475569');
        doc.text('Action Item', 50, y, { width: 220 });
        doc.text('Category', 280, y, { width: 100 });
        doc.text('Severity', 390, y, { width: 80, align: 'right' });
        doc.text('Status', 480, y, { width: 70, align: 'right' });

        doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(50, y + 15).lineTo(550, y + 15).stroke();
        doc.moveDown(1);

        complianceIssues.forEach(i => {
          doc.moveDown(0.5);
          y = doc.y;
          if (y > 700) { doc.addPage(); y = 50; }
          doc.fillColor('#1E293B');
          doc.text(i.title || 'Compliance Audit Issue', 50, y, { width: 220 });
          doc.text(i.category || 'General', 280, y, { width: 100 });
          doc.text(i.severity || 'Medium', 390, y, { width: 80, align: 'right' });
          doc.text(i.status || 'Open', 480, y, { width: 70, align: 'right' });
        });
      }

      doc.end();

      // Wait for stream to finish writing
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

    } else if (fileExt === 'xlsx' || fileExt === 'excel' || fileExt === 'csv') {
      // Excel/CSV Generation using ExcelJS
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('ESG Data');

      // Title Block
      sheet.addRow([`EcoSphere ESG Report - ${mod}`]);
      sheet.addRow([`Organization: ${org?.name || 'EcoSphere Ltd'}`]);
      sheet.addRow([`Generated: ${new Date().toLocaleString()}`]);
      sheet.addRow([]); // Blank row

      if (mod === 'Environmental') {
        sheet.addRow(['Date', 'Source Category', 'Department', 'Calculated CO2e (t)', 'Status']);
        txs.forEach(t => {
          sheet.addRow([
            (t.occurred_at || t.created_at || new Date()).toISOString().split('T')[0],
            t.source_type,
            deptMap[t.department_id?.toString()] || 'HQ / Corporate',
            t.calculated_co2e || 0,
            t.status
          ]);
        });
      } else if (mod === 'Social') {
        sheet.addRow(['Initiative Title', 'Category', 'Target Group', 'Points Awarded', 'Status']);
        activities.forEach(a => {
          sheet.addRow([
            a.title,
            a.category,
            a.target_group || 'Corporate',
            a.points || 0,
            a.status
          ]);
        });
      } else {
        sheet.addRow(['Title', 'Category', 'Severity', 'Status', 'Logged Date']);
        complianceIssues.forEach(i => {
          sheet.addRow([
            i.title,
            i.category || 'General',
            i.severity,
            i.status,
            (i.created_at || new Date()).toISOString().split('T')[0]
          ]);
        });
      }

      // Design/Formatting
      sheet.getRow(5).font = { bold: true };
      sheet.columns.forEach(col => { col.width = 25; });

      if (fileExt === 'csv') {
        await workbook.csv.writeFile(filePath);
      } else {
        await workbook.xlsx.writeFile(filePath);
      }
    }

    const record = {
      _id: reportId,
      org_id: orgId,
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
    let mime = 'application/octet-stream';
    if (report.format === 'CSV') mime = 'text/csv';
    else if (report.format === 'PDF') mime = 'application/pdf';
    else if (report.format === 'EXCEL' || report.format === 'XLSX') mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.setHeader('Content-Type', mime);
    return res.sendFile(report.file_path);
  } catch (err) {
    console.error('GET reports/download/:id error:', err);
    return res.status(500).json({ error: 'Download failed' });
  }
});

module.exports = router;
