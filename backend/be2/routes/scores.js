const express = require('express');
const { getDB } = require('../../shared/db');

const router = express.Router();

// POST /api/scores/recompute
router.post('/recompute', async (req, res) => {
  try {
    const db = getDB();

    // 1. Get weights configuration from org_esg_settings
    const config = await db.collection('org_esg_settings').findOne() || {
      environmental_weight: 40,
      social_weight: 30,
      governance_weight: 30
    };

    const envWeight = parseFloat(config.environmental_weight || config.env_weight || 40);
    const socialWeight = parseFloat(config.social_weight || config.social_weight || 30);
    const govWeight = parseFloat(config.governance_weight || config.gov_weight || 30);

    // 2. Fetch all departments
    const departments = await db.collection('departments').find().toArray();
    const updatedScores = [];

    for (const dept of departments) {
      // Find all users in this department
      const users = await db.collection('users').find({ department_id: dept._id }).toArray();
      const userIds = users.map(u => u._id);

      // --- Environmental Score ---
      let envScore = 100;
      const transactions = await db.collection('carbon_transactions').find({ department_id: dept._id }).toArray();
      const totalCo2e = transactions.reduce((sum, tx) => sum + (tx.calculated_co2e || 0), 0);

      const goal = await db.collection('environmental_goals').findOne({ department_id: dept._id });
      if (goal && goal.target_co2e > 0) {
        if (totalCo2e <= goal.target_co2e) {
          envScore = 100;
        } else {
          // Deduct points based on excess emissions
          const excessPct = ((totalCo2e - goal.target_co2e) / goal.target_co2e) * 100;
          envScore = Math.max(0, Math.round(100 - excessPct));
        }
      }

      // --- Social Score ---
      let socialScore = 100;
      if (userIds.length > 0) {
        const participations = await db.collection('employee_participations').find({ employee_id: { $in: userIds } }).toArray();
        const totalPart = participations.length;
        if (totalPart > 0) {
          const approvedPart = participations.filter(p => (p.approval_status || '').toUpperCase() === 'APPROVED').length;
          socialScore = Math.round((approvedPart / totalPart) * 100);
        }
      }

      // --- Governance Score ---
      // 1. Policy acknowledgement rate
      let ackRate = 1.0;
      if (userIds.length > 0) {
        const acks = await db.collection('policy_acknowledgements').find({ employee_id: { $in: userIds } }).toArray();
        if (acks.length > 0) {
          const ackedCount = acks.filter(a => (a.status || '').toUpperCase() === 'ACKNOWLEDGED').length;
          ackRate = ackedCount / acks.length;
        }
      }

      // 2. Open issues penalty
      const issues = await db.collection('compliance_issues').find({ department_id: dept._id }).toArray();
      const openIssuesCount = issues.filter(i => {
        const stat = (i.status || '').toUpperCase();
        return stat === 'OPEN' || stat === 'IN_PROGRESS' || stat === 'OVERDUE';
      }).length;

      const penalty = openIssuesCount * 5; // -5 points per open issue
      let govScore = Math.max(0, Math.round((ackRate * 100) - penalty));

      // --- Total Weighted Score ---
      const envWeighted = envScore * (envWeight / 100);
      const socialWeighted = socialScore * (socialWeight / 100);
      const govWeighted = govScore * (govWeight / 100);
      const totalScore = Math.round((envWeighted + socialWeighted + govWeighted) * 100) / 100;

      const scoreDoc = {
        org_id: dept.org_id || 'org-eco',
        department_id: dept._id,
        period_start: new Date('2026-07-01'),
        period_end: new Date('2026-07-31'),
        environmental_score: envScore,
        social_score: socialScore,
        governance_score: govScore,
        total_score: totalScore,
        updated_at: new Date()
      };

      // Upsert score matching period
      await db.collection('department_scores').updateOne(
        { department_id: dept._id, period_start: scoreDoc.period_start, period_end: scoreDoc.period_end },
        { $set: scoreDoc },
        { upsert: true }
      );

      updatedScores.push({
        department_id: dept._id,
        department_name: dept.name,
        ...scoreDoc
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Scores recomputed successfully',
      data: updatedScores
    });
  } catch (error) {
    console.error('Error during score recomputation:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
