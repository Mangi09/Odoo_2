const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecosphere';

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log('✅ Connected to MongoDB. Seeding EcoSphere data...\n');

    const collections = [
      'organizations', 'departments', 'users', 'org_esg_settings',
      'categories', 'emission_factors', 'environmental_goals', 'esg_policies',
      'badges', 'rewards', 'carbon_transactions', 'csr_activities',
      'employee_participations', 'challenges', 'challenge_participations',
      'policy_acknowledgements', 'audits', 'compliance_issues',
      'employee_badges', 'reward_redemptions', 'points_ledger',
      'notifications', 'department_scores', 'report_history'
    ];

    for (const col of collections) {
      await db.collection(col).deleteMany({});
      console.log(`  Cleared: ${col}`);
    }

    // ── 1. Organization ──────────────────────────────────────────────────────
    await db.collection('organizations').insertOne({
      _id: 'org-eco',
      name: 'EcoSphere Demo Company',
      status: 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date()
    });

    // ── 2. Departments ───────────────────────────────────────────────────────
    await db.collection('departments').insertMany([
      { _id: 'dept-mfg', org_id: 'org-eco', name: 'Manufacturing', code: 'MFG', head_name: 'S. Nair', employee_count: 134, status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
      { _id: 'dept-log', org_id: 'org-eco', name: 'Logistics', code: 'LOG', head_name: 'R. Iyer', employee_count: 58, status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
      { _id: 'dept-cor', org_id: 'org-eco', name: 'Corporate', code: 'COR', head_name: 'A. Mehta', employee_count: 41, status: 'ACTIVE', created_at: new Date(), updated_at: new Date() },
      { _id: 'dept-rnd', org_id: 'org-eco', name: 'R&D', code: 'RND', head_name: 'P. Desai', employee_count: 36, status: 'ACTIVE', created_at: new Date(), updated_at: new Date() }
    ]);

    // ── 3. Users (with hashed passwords) ────────────────────────────────────
    const adminHash = await bcrypt.hash('Admin123!', 12);
    const managerHash = await bcrypt.hash('Manager123!', 12);
    const empHash = await bcrypt.hash('Employee123!', 12);

    await db.collection('users').insertMany([
      {
        _id: 'u-admin',
        org_id: 'org-eco',
        department_id: 'dept-cor',
        full_name: 'Admin User',
        email: 'admin@ecosphere.test',
        role: 'Admin',
        password_hash: adminHash,
        points_balance: 0,
        xp_total: 0,
        status: 'ACTIVE',
        avatar: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: 'u-aditi',
        org_id: 'org-eco',
        department_id: 'dept-mfg',
        full_name: 'Aditi Rao',
        email: 'aditi@ecosphere.test',
        role: 'Employee',
        password_hash: empHash,
        points_balance: 3910,
        xp_total: 450,
        status: 'ACTIVE',
        avatar: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: 'u-karan',
        org_id: 'org-eco',
        department_id: 'dept-cor',
        full_name: 'Karan Shah',
        email: 'karan@ecosphere.test',
        role: 'Manager',
        password_hash: managerHash,
        points_balance: 150,
        xp_total: 200,
        status: 'ACTIVE',
        avatar: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: 'u-riyer',
        org_id: 'org-eco',
        department_id: 'dept-log',
        full_name: 'Ramesh Iyer',
        email: 'riyer@ecosphere.test',
        role: 'Manager',
        password_hash: managerHash,
        points_balance: 80,
        xp_total: 120,
        status: 'ACTIVE',
        avatar: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // ── 4. ESG Settings ───────────────────────────────────────────────────────
    await db.collection('org_esg_settings').insertOne({
      _id: 'settings-org-eco',
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

    // ── 5. Categories ────────────────────────────────────────────────────────
    await db.collection('categories').insertMany([
      { _id: 'cat-community', org_id: 'org-eco', name: 'Community', type: 'CSR_ACTIVITY', status: 'ACTIVE', created_at: new Date() },
      { _id: 'cat-env', org_id: 'org-eco', name: 'Environment', type: 'CSR_ACTIVITY', status: 'ACTIVE', created_at: new Date() },
      { _id: 'cat-health', org_id: 'org-eco', name: 'Health & Wellbeing', type: 'CSR_ACTIVITY', status: 'ACTIVE', created_at: new Date() },
      { _id: 'cat-challenge-env', org_id: 'org-eco', name: 'Sustainability', type: 'CHALLENGE', status: 'ACTIVE', created_at: new Date() },
      { _id: 'cat-challenge-gov', org_id: 'org-eco', name: 'Compliance', type: 'CHALLENGE', status: 'ACTIVE', created_at: new Date() }
    ]);

    // ── 6. Emission Factors ───────────────────────────────────────────────────
    await db.collection('emission_factors').insertMany([
      { _id: 'ef-fleet', org_id: 'org-eco', source_type: 'Fleet', activity_name: 'Fleet Logistics Travel', unit: 'liters', co2e_per_unit: 2.68, status: 'ACTIVE', created_at: new Date() },
      { _id: 'ef-mfg', org_id: 'org-eco', source_type: 'Manufacturing', activity_name: 'Manufacturing Operations', unit: 'units', co2e_per_unit: 0.42, status: 'ACTIVE', created_at: new Date() },
      { _id: 'ef-expense', org_id: 'org-eco', source_type: 'Expense', activity_name: 'Business Expenses', unit: 'usd', co2e_per_unit: 0.08, status: 'ACTIVE', created_at: new Date() },
      { _id: 'ef-purchase', org_id: 'org-eco', source_type: 'Purchase', activity_name: 'Procurement Purchases', unit: 'kg', co2e_per_unit: 1.15, status: 'ACTIVE', created_at: new Date() },
      { _id: 'ef-energy', org_id: 'org-eco', source_type: 'Energy', activity_name: 'Electricity Consumption', unit: 'kWh', co2e_per_unit: 0.233, status: 'ACTIVE', created_at: new Date() }
    ]);

    // ── 7. Carbon Transactions ────────────────────────────────────────────────
    await db.collection('carbon_transactions').insertMany([
      { _id: 'ct-1', org_id: 'org-eco', department_id: 'dept-log', source_type: 'Fleet', activity_name: 'Fleet Logistics Travel', quantity: 120, unit: 'liters', emission_factor_id: 'ef-fleet', calculated_co2e: 321.6, calculation_mode: 'AUTO', status: 'Verified', occurred_at: new Date('2026-07-10'), created_by: 'u-riyer', created_at: new Date('2026-07-10') },
      { _id: 'ct-2', org_id: 'org-eco', department_id: 'dept-mfg', source_type: 'Manufacturing', activity_name: 'Manufacturing Operations', quantity: 400, unit: 'units', emission_factor_id: 'ef-mfg', calculated_co2e: 168.0, calculation_mode: 'AUTO', status: 'Verified', occurred_at: new Date('2026-07-09'), created_by: 'u-aditi', created_at: new Date('2026-07-09') },
      { _id: 'ct-3', org_id: 'org-eco', department_id: 'dept-cor', source_type: 'Energy', activity_name: 'Electricity Consumption', quantity: 2000, unit: 'kWh', emission_factor_id: 'ef-energy', calculated_co2e: 466.0, calculation_mode: 'AUTO', status: 'Pending', occurred_at: new Date('2026-07-08'), created_by: 'u-karan', created_at: new Date('2026-07-08') },
      { _id: 'ct-4', org_id: 'org-eco', department_id: 'dept-rnd', source_type: 'Expense', activity_name: 'Business Travel Expenses', quantity: 3500, unit: 'usd', emission_factor_id: 'ef-expense', calculated_co2e: 280.0, calculation_mode: 'MANUAL', status: 'Flagged', occurred_at: new Date('2026-07-07'), created_by: 'u-admin', created_at: new Date('2026-07-07') }
    ]);

    // ── 8. Environmental Goals ────────────────────────────────────────────────
    await db.collection('environmental_goals').insertMany([
      { _id: 'goal-1', org_id: 'org-eco', department_id: 'dept-log', name: 'Reduce Fleet Emissions', target_co2e: 500, current_co2e: 390, deadline: new Date('2026-12-31'), status: 'ACTIVE', created_at: new Date() },
      { _id: 'goal-2', org_id: 'org-eco', department_id: 'dept-mfg', name: 'Cut Manufacturing Waste', target_co2e: 120, current_co2e: 98, deadline: new Date('2026-09-30'), status: 'ON_TRACK', created_at: new Date() },
      { _id: 'goal-3', org_id: 'org-eco', department_id: 'dept-cor', name: 'Office Energy Cut', target_co2e: 80, current_co2e: 80, deadline: new Date('2026-06-30'), status: 'COMPLETED', created_at: new Date() }
    ]);

    // ── 9. CSR Activities ────────────────────────────────────────────────────
    await db.collection('csr_activities').insertMany([
      { _id: 'csr-tree', org_id: 'org-eco', category_id: 'cat-community', title: 'Tree Plantation Drive', description: 'Plant trees with the community team to offset carbon emissions.', points: 50, evidence_required: true, status: 'OPEN', created_at: new Date() },
      { _id: 'csr-workshop', org_id: 'org-eco', category_id: 'cat-env', title: 'ESG Awareness Workshop', description: 'Attend a comprehensive ESG awareness and training workshop.', points: 30, evidence_required: false, status: 'OPEN', created_at: new Date() },
      { _id: 'csr-beach', org_id: 'org-eco', category_id: 'cat-community', title: 'Beach Clean-Up', description: 'Participate in the monthly beach clean-up initiative.', points: 40, evidence_required: true, status: 'OPEN', created_at: new Date() },
      { _id: 'csr-mentor', org_id: 'org-eco', category_id: 'cat-health', title: 'Mentor Local Youth', description: 'Volunteer 2 hours to mentor students from local schools.', points: 60, evidence_required: false, status: 'OPEN', created_at: new Date() }
    ]);

    // ── 10. Employee Participations ───────────────────────────────────────────
    await db.collection('employee_participations').insertMany([
      { _id: 'part-1', org_id: 'org-eco', employee_id: 'u-aditi', csr_activity_id: 'csr-tree', proof_url: 'https://example.com/proof/tree.jpg', approval_status: 'Pending', points_earned: 0, completion_date: new Date(), created_at: new Date() },
      { _id: 'part-2', org_id: 'org-eco', employee_id: 'u-karan', csr_activity_id: 'csr-workshop', proof_url: null, approval_status: 'Approved', points_earned: 30, completion_date: new Date(), approved_at: new Date(), created_at: new Date() }
    ]);

    // ── 11. Challenges ────────────────────────────────────────────────────────
    await db.collection('challenges').insertMany([
      { _id: 'ch-sprint', org_id: 'org-eco', category_id: 'cat-challenge-env', type: 'Environmental', title: 'Sustainability Sprint', description: 'Complete a week of sustainability actions including reducing waste and using public transport.', xp: 200, base_xp: 200, difficulty: 'Hard', evidence_required: true, deadline: new Date('2026-07-31'), participants: 12, status: 'ACTIVE', created_at: new Date() },
      { _id: 'ch-recycle', org_id: 'org-eco', category_id: 'cat-challenge-env', type: 'Environmental', title: 'Recycle Challenge', description: 'Track and report recycling for one full week.', xp: 80, base_xp: 80, difficulty: 'Easy', evidence_required: false, deadline: new Date('2026-07-20'), participants: 28, status: 'ACTIVE', created_at: new Date() },
      { _id: 'ch-policy', org_id: 'org-eco', category_id: 'cat-challenge-gov', type: 'Governance', title: 'Policy Quiz Challenge', description: 'Test your knowledge of company ESG policies.', xp: 120, base_xp: 120, difficulty: 'Medium', evidence_required: false, deadline: new Date('2026-08-15'), participants: 8, status: 'ACTIVE', created_at: new Date() }
    ]);

    // ── 12. Badges ────────────────────────────────────────────────────────────
    await db.collection('badges').insertMany([
      { _id: 'badge-green', org_id: 'org-eco', name: 'Green Beginner', description: 'Earned after your first approved CSR activity.', icon: '🌱', unlock_rule_json: '{"metric":"approved_activities","operator":">=","value":1}', status: 'Active', created_at: new Date() },
      { _id: 'badge-champ', org_id: 'org-eco', name: 'Sustainability Champion', description: 'Earned for completing one hard difficulty challenge.', icon: '🏆', unlock_rule_json: '{"metric":"hard_challenges","operator":">=","value":1}', status: 'Active', created_at: new Date() },
      { _id: 'badge-xp500', org_id: 'org-eco', name: 'XP Trailblazer', description: 'Reached 500 total XP.', icon: '⚡', unlock_rule_json: '{"metric":"xp_total","operator":">=","value":500}', status: 'Active', created_at: new Date() },
      { _id: 'badge-pts1000', org_id: 'org-eco', name: 'Points Collector', description: 'Accumulated 1000 points.', icon: '💰', unlock_rule_json: '{"metric":"points_balance","operator":">=","value":1000}', status: 'Active', created_at: new Date() }
    ]);

    // ── 13. Rewards ───────────────────────────────────────────────────────────
    await db.collection('rewards').insertMany([
      { _id: 'rw-kit', org_id: 'org-eco', name: 'Eco Reusable Kit', description: 'Reusable bottle, lunch box, and tote bag kit.', points_required: 120, stock: 8, status: 'Active', created_at: new Date() },
      { _id: 'rw-voucher', org_id: 'org-eco', name: 'Eco Voucher (₹500)', description: 'Voucher redeemable at partner eco-friendly stores.', points_required: 500, stock: 3, status: 'Active', created_at: new Date() },
      { _id: 'rw-wfh', org_id: 'org-eco', name: 'WFH Friday Pass', description: 'One approved work-from-home day on any Friday.', points_required: 200, stock: 20, status: 'Active', created_at: new Date() },
      { _id: 'rw-plant', org_id: 'org-eco', name: 'Office Plant Gift', description: 'A small potted plant for your workspace.', points_required: 80, stock: 15, status: 'Active', created_at: new Date() }
    ]);

    // ── 14. ESG Policies ──────────────────────────────────────────────────────
    await db.collection('esg_policies').insertMany([
      { _id: 'pol-carbon', org_id: 'org-eco', title: 'Carbon Reduction Policy', name: 'Carbon Reduction Policy', description: 'Outlines commitments and targets for reducing organizational carbon footprint by 40% by 2030.', type: 'Environmental', version: '2.1', effective_date: new Date('2026-01-01'), status: 'ACTIVE', created_at: new Date() },
      { _id: 'pol-diversity', org_id: 'org-eco', title: 'Diversity & Inclusion Charter', name: 'Diversity & Inclusion Charter', description: 'Commits to maintaining an inclusive workplace with zero tolerance for discrimination.', type: 'Social', version: '1.3', effective_date: new Date('2026-02-01'), status: 'ACTIVE', created_at: new Date() },
      { _id: 'pol-ethics', org_id: 'org-eco', title: 'Business Ethics & Anti-Corruption Code', name: 'Business Ethics & Anti-Corruption Code', description: 'Standards for ethical business conduct and anti-bribery compliance.', type: 'Governance', version: '3.0', effective_date: new Date('2026-03-01'), status: 'ACTIVE', created_at: new Date() }
    ]);

    // ── 15. Audits ────────────────────────────────────────────────────────────
    await db.collection('audits').insertMany([
      { _id: 'audit-1', org_id: 'org-eco', department_id: 'dept-mfg', title: 'Q2 2026 Manufacturing Waste Audit', auditor_name: 'S. Nair', audit_date: new Date('2026-06-12'), findings_summary: '3 minor process gaps identified, 1 critical waste disposal issue.', status: 'Completed', created_at: new Date() },
      { _id: 'audit-2', org_id: 'org-eco', department_id: 'dept-log', title: 'Q3 2026 Fleet Emissions Audit', auditor_name: 'External Auditor', audit_date: new Date('2026-09-15'), findings_summary: 'Scheduled for Q3.', status: 'Planned', created_at: new Date() }
    ]);

    // ── 16. Compliance Issues ─────────────────────────────────────────────────
    await db.collection('compliance_issues').insertMany([
      { _id: 'issue-1', org_id: 'org-eco', audit_id: 'audit-1', department_id: 'dept-mfg', owner_user_id: 'u-riyer', severity: 'High', category: 'Environmental', description: 'Missing MSDS sheets for chemical storage units.', due_date: new Date('2026-07-18'), status: 'Open', resolved_at: null, created_at: new Date() },
      { _id: 'issue-2', org_id: 'org-eco', audit_id: 'audit-1', department_id: 'dept-mfg', owner_user_id: 'u-admin', severity: 'Medium', category: 'Governance', description: 'Incomplete waste disposal logs for Q1.', due_date: new Date('2026-07-25'), status: 'In Progress', resolved_at: null, created_at: new Date() },
      { _id: 'issue-3', org_id: 'org-eco', audit_id: null, department_id: 'dept-cor', owner_user_id: 'u-karan', severity: 'Low', category: 'Social', description: 'Volunteer participation rate below target.', due_date: new Date('2026-08-31'), status: 'Open', resolved_at: null, created_at: new Date() }
    ]);

    // ── 17. Points Ledger ─────────────────────────────────────────────────────
    await db.collection('points_ledger').insertMany([
      { _id: 'pl-1', org_id: 'org-eco', employee_id: 'u-aditi', source_type: 'ADMIN_ADJUSTMENT', source_id: 'seed', points_delta: 3910, reason: 'Seed demo balance', created_at: new Date() },
      { _id: 'pl-2', org_id: 'org-eco', employee_id: 'u-karan', source_type: 'CSR_PARTICIPATION', source_id: 'part-2', points_delta: 30, reason: 'Approved: ESG Awareness Workshop', created_at: new Date() }
    ]);

    // ── 18. Department Scores ─────────────────────────────────────────────────
    await db.collection('department_scores').insertMany([
      { _id: 'score-mfg', org_id: 'org-eco', department_id: 'dept-mfg', period_start: new Date('2026-07-01'), period_end: new Date('2026-07-31'), environmental_score: 84, social_score: 78, governance_score: 90, total_score: 84, created_at: new Date() },
      { _id: 'score-log', org_id: 'org-eco', department_id: 'dept-log', period_start: new Date('2026-07-01'), period_end: new Date('2026-07-31'), environmental_score: 78, social_score: 70, governance_score: 86, total_score: 78, created_at: new Date() },
      { _id: 'score-cor', org_id: 'org-eco', department_id: 'dept-cor', period_start: new Date('2026-07-01'), period_end: new Date('2026-07-31'), environmental_score: 82, social_score: 76, governance_score: 89, total_score: 82, created_at: new Date() },
      { _id: 'score-rnd', org_id: 'org-eco', department_id: 'dept-rnd', period_start: new Date('2026-07-01'), period_end: new Date('2026-07-31'), environmental_score: 88, social_score: 82, governance_score: 91, total_score: 87, created_at: new Date() }
    ]);

    // ── 19. Welcome Notifications ──────────────────────────────────────────────
    const welcomeNotifs = [
      { userId: 'u-aditi', name: 'Aditi' },
      { userId: 'u-karan', name: 'Karan' },
      { userId: 'u-riyer', name: 'Ramesh' },
      { userId: 'u-admin', name: 'Admin' }
    ];
    await db.collection('notifications').insertMany(welcomeNotifs.map((u, i) => ({
      _id: `notif-welcome-${i}`,
      org_id: 'org-eco',
      recipient_user_id: u.userId,
      event_type: 'SYSTEM',
      title: `Welcome to EcoSphere, ${u.name}! 🌿`,
      body: 'Start your sustainability journey by joining a CSR activity or completing a challenge.',
      entity_type: null,
      entity_id: null,
      read_at: null,
      created_at: new Date()
    })));

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n─────────────────────────────────────────────────');
    console.log('📧 Demo Login Credentials:');
    console.log('   Admin:   admin@ecosphere.test   / Admin123!');
    console.log('   Manager: karan@ecosphere.test   / Manager123!');
    console.log('   Manager: riyer@ecosphere.test   / Manager123!');
    console.log('   Employee: aditi@ecosphere.test  / Employee123!');
    console.log('─────────────────────────────────────────────────\n');

  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
