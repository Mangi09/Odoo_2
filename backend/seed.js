const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecosphere';

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected to database to seed official schema data.');

    const collections = [
      'organizations',
      'departments',
      'users',
      'org_esg_settings',
      'categories',
      'emission_factors',
      'product_esg_profiles',
      'environmental_goals',
      'esg_policies',
      'badges',
      'rewards',
      'carbon_transactions',
      'csr_activities',
      'employee_participations',
      'challenges',
      'challenge_participations',
      'policy_acknowledgements',
      'audits',
      'compliance_issues',
      'employee_badges',
      'reward_redemptions',
      'points_ledger',
      'notifications',
      'department_scores'
    ];

    for (const col of collections) {
      await db.collection(col).deleteMany({});
      console.log(`Cleared collection: ${col}`);
    }

    // 1. Organizations
    await db.collection('organizations').insertOne({
      _id: 'org-eco',
      name: 'EcoSphere Demo Company',
      status: 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date()
    });

    // 2. Departments
    const depts = [
      {
        _id: 'dept-mfg',
        org_id: 'org-eco',
        name: 'Manufacturing',
        code: 'MFG',
        head_name: 'S. Nair',
        parent_department_id: null,
        employee_count: 134,
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: 'dept-log',
        org_id: 'org-eco',
        name: 'Logistics',
        code: 'LOG',
        head_name: 'R. Iyer',
        parent_department_id: 'dept-mfg',
        employee_count: 58,
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: 'dept-cor',
        org_id: 'org-eco',
        name: 'Corporate',
        code: 'COR',
        head_name: 'A. Mehta',
        parent_department_id: null,
        employee_count: 41,
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: 'dept-rnd',
        org_id: 'org-eco',
        name: 'R&D',
        code: 'RND',
        head_name: 'P. Desai',
        parent_department_id: null,
        employee_count: 36,
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    await db.collection('departments').insertMany(depts);

    // 3. Users (instead of employees)
    const users = [
      {
        _id: 'u-admin',
        org_id: 'org-eco',
        department_id: 'dept-cor',
        full_name: 'Admin User',
        email: 'admin@ecosphere.test',
        role: 'ADMIN',
        points_balance: 0,
        xp_total: 0,
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: 'u-aditi',
        org_id: 'org-eco',
        department_id: 'dept-mfg',
        full_name: 'Aditi Rao',
        email: 'aditi@ecosphere.test',
        role: 'EMPLOYEE',
        points_balance: 3910,
        xp_total: 0,
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: 'u-karan',
        org_id: 'org-eco',
        department_id: 'dept-cor',
        full_name: 'Karan Shah',
        email: 'karan@ecosphere.test',
        role: 'EMPLOYEE',
        points_balance: 30,
        xp_total: 0,
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: 'u-riyer',
        org_id: 'org-eco',
        department_id: 'dept-log',
        full_name: 'R. Iyer',
        email: 'riyer@ecosphere.test',
        role: 'DEPARTMENT_HEAD',
        points_balance: 0,
        xp_total: 0,
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    await db.collection('users').insertMany(users);

    // 4. ESG Settings
    await db.collection('org_esg_settings').insertOne({
      _id: 'org-eco', // org_id as PRIMARY KEY
      org_id: 'org-eco',
      environmental_weight: 40,
      social_weight: 30,
      governance_weight: 30,
      auto_emission_enabled: true,
      evidence_required_for_csr: true,
      badge_auto_award_enabled: true,
      compliance_alerts_enabled: true,
      created_at: new Date(),
      updated_at: new Date()
    });

    // 5. Categories
    const cats = [
      { _id: 'cat-community', org_id: 'org-eco', name: 'Community', type: 'CSR_ACTIVITY', status: 'ACTIVE', created_at: new Date() },
      { _id: 'cat-env', org_id: 'org-eco', name: 'Environment', type: 'CSR_ACTIVITY', status: 'ACTIVE', created_at: new Date() },
      { _id: 'cat-challenge-env', org_id: 'org-eco', name: 'Sustainability', type: 'CHALLENGE', status: 'ACTIVE', created_at: new Date() }
    ];
    await db.collection('categories').insertMany(cats);

    // 6. Emission Factors
    const factors = [
      {
        _id: 'ef-fleet',
        org_id: 'org-eco',
        source_type: 'Fleet',
        activity_name: 'Fleet Logistics Travel',
        unit: 'liters',
        co2e_per_unit: 2.68,
        status: 'ACTIVE',
        created_at: new Date()
      },
      {
        _id: 'ef-mfg',
        org_id: 'org-eco',
        source_type: 'Manufacturing',
        activity_name: 'Manufacturing Operations',
        unit: 'units',
        co2e_per_unit: 0.42,
        status: 'ACTIVE',
        created_at: new Date()
      },
      {
        _id: 'ef-expense',
        org_id: 'org-eco',
        source_type: 'Expense',
        activity_name: 'Business Expenses',
        unit: 'usd',
        co2e_per_unit: 0.08,
        status: 'ACTIVE',
        created_at: new Date()
      },
      {
        _id: 'ef-purchase',
        org_id: 'org-eco',
        source_type: 'Purchase',
        activity_name: 'Procurement Purchases',
        unit: 'kg',
        co2e_per_unit: 1.15,
        status: 'ACTIVE',
        created_at: new Date()
      }
    ];
    await db.collection('emission_factors').insertMany(factors);

    // 7. Carbon Transactions
    const txs = [
      {
        _id: 'ct-1',
        org_id: 'org-eco',
        department_id: 'dept-log',
        source_type: 'Fleet',
        quantity: 120,
        unit: 'liters',
        emission_factor_id: 'ef-fleet',
        calculated_co2e: 321.6,
        calculation_mode: 'AUTO',
        occurred_at: new Date('2026-07-10'),
        created_at: new Date()
      },
      {
        _id: 'ct-2',
        org_id: 'org-eco',
        department_id: 'dept-mfg',
        source_type: 'Manufacturing',
        quantity: 400,
        unit: 'units',
        emission_factor_id: 'ef-mfg',
        calculated_co2e: 168.0,
        calculation_mode: 'AUTO',
        occurred_at: new Date('2026-07-09'),
        created_at: new Date()
      }
    ];
    await db.collection('carbon_transactions').insertMany(txs);

    // 8. Environmental Goals
    const goals = [
      {
        _id: 'goal-1',
        org_id: 'org-eco',
        department_id: 'dept-log',
        name: 'Reduce Fleet Emissions',
        target_co2e: 500,
        current_co2e: 390,
        deadline: new Date('2026-12-31'),
        status: 'ACTIVE',
        created_at: new Date()
      },
      {
        _id: 'goal-2',
        org_id: 'org-eco',
        department_id: 'dept-mfg',
        name: 'Cut Packaging Waste',
        target_co2e: 120,
        current_co2e: 98,
        deadline: new Date('2026-09-30'),
        status: 'ON_TRACK',
        created_at: new Date()
      },
      {
        _id: 'goal-3',
        org_id: 'org-eco',
        department_id: 'dept-cor',
        name: 'Office Energy Cut',
        target_co2e: 80,
        current_co2e: 80,
        deadline: new Date('2026-06-30'),
        status: 'COMPLETED',
        created_at: new Date()
      }
    ];
    await db.collection('environmental_goals').insertMany(goals);

    // 9. CSR Activities
    const activities = [
      {
        _id: 'csr-tree',
        org_id: 'org-eco',
        category_id: 'cat-community',
        title: 'Tree Plantation',
        description: 'Plant trees with the community team.',
        points: 50,
        evidence_required: true,
        status: 'OPEN',
        created_at: new Date()
      },
      {
        _id: 'csr-workshop',
        org_id: 'org-eco',
        category_id: 'cat-env',
        title: 'ESG Workshop',
        description: 'Attend an ESG awareness workshop.',
        points: 30,
        evidence_required: false,
        status: 'OPEN',
        created_at: new Date()
      }
    ];
    await db.collection('csr_activities').insertMany(activities);

    // 10. Employee Participations
    const parts = [
      {
        _id: 'part-1',
        org_id: 'org-eco',
        employee_id: 'u-aditi',
        csr_activity_id: 'csr-tree',
        proof_file_name: 'photo.jpg',
        proof_url: 'photo.jpg',
        approval_status: 'Pending',
        points_earned: 50,
        completion_date: new Date(),
        created_at: new Date()
      },
      {
        _id: 'part-2',
        org_id: 'org-eco',
        employee_id: 'u-karan',
        csr_activity_id: 'csr-workshop',
        proof_file_name: 'cert.pdf',
        proof_url: 'cert.pdf',
        approval_status: 'Approved',
        points_earned: 30,
        completion_date: new Date(),
        created_at: new Date()
      }
    ];
    await db.collection('employee_participations').insertMany(parts);

    // 11. Audits
    await db.collection('audits').insertOne({
      _id: 'audit-1',
      org_id: 'org-eco',
      department_id: 'dept-mfg',
      title: 'Q2 Waste Audit',
      auditor_name: 'S. Nair',
      audit_date: new Date('2026-06-12'),
      findings_summary: '3 minor issues',
      status: 'Completed',
      created_at: new Date()
    });

    // 12. Compliance Issues
    await db.collection('compliance_issues').insertOne({
      _id: 'issue-1',
      org_id: 'org-eco',
      audit_id: 'audit-1',
      department_id: 'dept-mfg',
      owner_user_id: 'u-riyer',
      severity: 'High',
      description: 'Missing MSDS sheets',
      due_date: new Date('2026-07-18'),
      status: 'Open',
      created_at: new Date()
    });

    // 13. Challenges
    const chs = [
      {
        _id: 'ch-sprint',
        org_id: 'org-eco',
        category_id: 'cat-challenge-env',
        title: 'Sustainability Sprint',
        description: 'Complete a week of sustainability actions.',
        xp: 200,
        difficulty: 'Hard',
        evidence_required: true,
        deadline: new Date('2026-07-20'),
        status: 'ACTIVE',
        created_at: new Date()
      },
      {
        _id: 'ch-recycle',
        org_id: 'org-eco',
        category_id: 'cat-challenge-env',
        title: 'Recycle Challenge',
        description: 'Track recycling for one week.',
        xp: 80,
        difficulty: 'Easy',
        evidence_required: false,
        deadline: new Date('2026-07-15'),
        status: 'ACTIVE',
        created_at: new Date()
      }
    ];
    await db.collection('challenges').insertMany(chs);

    // 14. Badges
    const badges = [
      {
        _id: 'badge-green',
        org_id: 'org-eco',
        name: 'Green Beginner',
        description: 'First approved activity.',
        unlock_rule_json: '{"metric":"approved_activities","operator":">=","value":1}',
        status: 'Active',
        created_at: new Date()
      },
      {
        _id: 'badge-champ',
        org_id: 'org-eco',
        name: 'Sustainability Champion',
        description: 'Complete one hard challenge.',
        unlock_rule_json: '{"metric":"hard_challenges","operator":">=","value":1}',
        status: 'Active',
        created_at: new Date()
      }
    ];
    await db.collection('badges').insertMany(badges);

    // 15. Rewards
    const rews = [
      {
        _id: 'rw-kit',
        org_id: 'org-eco',
        name: 'Reusable Kit',
        description: 'Reusable bottle and lunch box kit.',
        points_required: 120,
        stock: 8,
        status: 'Active',
        created_at: new Date()
      },
      {
        _id: 'rw-voucher',
        org_id: 'org-eco',
        name: 'Eco Voucher',
        description: 'Voucher for eco-friendly products.',
        points_required: 500,
        stock: 3,
        status: 'Active',
        created_at: new Date()
      }
    ];
    await db.collection('rewards').insertMany(rews);

    // 16. Points Ledger
    const ledger = [
      {
        _id: 'pl-1',
        org_id: 'org-eco',
        employee_id: 'u-aditi',
        source_type: 'ADMIN_ADJUSTMENT',
        source_id: 'seed',
        points_delta: 3910,
        reason: 'Seed demo balance',
        created_at: new Date()
      },
      {
        _id: 'pl-2',
        org_id: 'org-eco',
        employee_id: 'u-karan',
        source_type: 'CSR_PARTICIPATION',
        source_id: 'part-2',
        points_delta: 30,
        reason: 'Approved ESG Workshop',
        created_at: new Date()
      }
    ];
    await db.collection('points_ledger').insertMany(ledger);

    // 17. Department Scores
    const scores = [
      {
        _id: 'score-mfg',
        org_id: 'org-eco',
        department_id: 'dept-mfg',
        period_start: new Date('2026-07-01'),
        period_end: new Date('2026-07-31'),
        environmental_score: 84,
        social_score: 78,
        governance_score: 90,
        total_score: 84,
        created_at: new Date()
      },
      {
        _id: 'score-log',
        org_id: 'org-eco',
        department_id: 'dept-log',
        period_start: new Date('2026-07-01'),
        period_end: new Date('2026-07-31'),
        environmental_score: 78,
        social_score: 70,
        governance_score: 86,
        total_score: 78,
        created_at: new Date()
      },
      {
        _id: 'score-cor',
        org_id: 'org-eco',
        department_id: 'dept-cor',
        period_start: new Date('2026-07-01'),
        period_end: new Date('2026-07-31'),
        environmental_score: 82,
        social_score: 76,
        governance_score: 89,
        total_score: 82,
        created_at: new Date()
      }
    ];
    await db.collection('department_scores').insertMany(scores);

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
