const express = require('express');
const { getDB } = require('../../shared/db');

const router = express.Router();

// POST /api/scores/recompute
router.post('/recompute', async (req, res) => {
  try {
    const db = getDB();

    // 1. Get weights configuration
    const config = await db.collection('esg_configurations').findOne() || {
      env_weight: 0.4,
      social_weight: 0.3,
      gov_weight: 0.3
    };

    const envWeight = parseFloat(config.env_weight);
    const socialWeight = parseFloat(config.social_weight);
    const govWeight = parseFloat(config.gov_weight);

    // 2. Fetch all departments
    const departments = await db.collection('departments').find().toArray();
    const updatedScores = [];

    for (const dept of departments) {
      // Find all employees in this department
      const employees = await db.collection('employees').find({ department_id: dept._id }).toArray();
      const empIds = employees.map(e => e._id);

      // --- Environmental Score ---
      let envScore = 100;
      if (empIds.length > 0) {
        const transactions = await db.collection('carbon_transactions').find({ employee_id: { $in: empIds } }).toArray();
        const totalCo2e = transactions.reduce((sum, tx) => sum + (tx.co2e || 0), 0);

        const goal = await db.collection('environmental_goals').findOne({ department_id: dept._id });
        if (goal && goal.target_co2e > 0) {
          if (totalCo2e <= goal.target_co2e) {
            envScore = 100;
          } else {
            // Deduct points based on how much they exceeded the target
            const excessPct = ((totalCo2e - goal.target_co2e) / goal.target_co2e) * 100;
            envScore = Math.max(0, Math.round(100 - excessPct));
          }
        }
      }

      // --- Social Score ---
      let socialScore = 100;
      if (empIds.length > 0) {
        const participations = await db.collection('employee_participations').find({ employee_id: { $in: empIds } }).toArray();
        const totalPart = participations.length;
        if (totalPart > 0) {
          const approvedPart = participations.filter(p => p.status === 'approved').length;
          socialScore = Math.round((approvedPart / totalPart) * 100);
        }
      }

      // --- Governance Score ---
      let govScore = 100;
      if (empIds.length > 0) {
        const issues = await db.collection('compliance_issues').find({ owner_id: { $in: empIds } }).toArray();
        const totalIssues = issues.length;
        if (totalIssues > 0) {
          const resolvedIssues = issues.filter(i => i.status === 'resolved').length;
          const openIssuesCount = issues.filter(i => i.status === 'open').length;

          const ackRate = resolvedIssues / totalIssues;
          const penalty = openIssuesCount * 5; // -5 points per open compliance issue
          govScore = Math.max(0, Math.round((ackRate * 100) - penalty));
        }
      }

      // --- Total Weighted Score ---
      const rawTotal = (envScore * envWeight) + (socialScore * socialWeight) + (govScore * govWeight);
      const totalScore = Math.round(rawTotal * 100) / 100;

      const scoreDoc = {
        department_id: dept._id,
        env_score: envScore,
        social_score: socialScore,
        governance_score: govScore,
        total_score: totalScore,
        updated_at: new Date()
      };

      // Upsert score
      await db.collection('department_scores').updateOne(
        { department_id: dept._id },
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
