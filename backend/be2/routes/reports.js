const express = require('express');
const { getDB } = require('../../shared/db');

const router = express.Router();

// GET /api/reports/esg-summary
router.get('/esg-summary', async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const scores = await db.collection('department_scores').aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: {
          path: '$department',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          department_id: 1,
          department_name: { $ifNull: ['$department.name', 'Unknown Department'] },
          environmental_score: 1,
          social_score: 1,
          governance_score: 1,
          total_score: 1,
          // Compatibility fields
          env_score: '$environmental_score',
          period_start: 1,
          period_end: 1
        }
      },
      { $skip: skip },
      { $limit: limit }
    ]).toArray();

    const total = await db.collection('department_scores').countDocuments();

    return res.status(200).json({
      success: true,
      data: scores,
      page,
      limit,
      total
    });
  } catch (error) {
    console.error('Error fetching ESG Summary report:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
