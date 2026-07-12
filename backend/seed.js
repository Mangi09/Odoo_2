const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecosphere';

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected to database to seed data.');

    // Clear existing data
    const collections = [
      'departments',
      'employees',
      'emission_factors',
      'carbon_transactions',
      'environmental_goals',
      'csr_activities',
      'employee_participations',
      'points_ledger',
      'audits',
      'compliance_issues',
      'challenges',
      'challenge_participations',
      'badges',
      'employee_badges',
      'rewards',
      'reward_redemptions',
      'department_scores',
      'esg_configurations',
      'notifications'
    ];

    for (const col of collections) {
      await db.collection(col).deleteMany({});
      console.log(`Cleared collection: ${col}`);
    }

    // 1. Seed Departments
    const depts = [
      { _id: new ObjectId('64a7c0000000000000000001'), name: 'Engineering' },
      { _id: new ObjectId('64a7c0000000000000000002'), name: 'Marketing' },
      { _id: new ObjectId('64a7c0000000000000000003'), name: 'Operations' }
    ];
    await db.collection('departments').insertMany(depts);

    // 2. Seed Employees
    const emps = [
      {
        _id: new ObjectId('64a7c1000000000000000001'),
        name: 'Alice Smith',
        department_id: depts[0]._id,
        points: 100,
        xp: 100
      },
      {
        _id: new ObjectId('64a7c1000000000000000002'),
        name: 'Bob Jones',
        department_id: depts[1]._id,
        points: 200,
        xp: 150
      },
      {
        _id: new ObjectId('64a7c1000000000000000003'),
        name: 'Charlie Brown',
        department_id: depts[2]._id,
        points: 50,
        xp: 50
      }
    ];
    await db.collection('employees').insertMany(emps);

    // 3. Seed Emission Factors
    const factors = [
      {
        _id: new ObjectId('64a7c2000000000000000001'),
        activity_type: 'flight',
        source_module: 'travel',
        co2e_per_unit: 0.12
      },
      {
        _id: new ObjectId('64a7c2000000000000000002'),
        activity_type: 'electricity',
        source_module: 'facility',
        co2e_per_unit: 0.45
      }
    ];
    await db.collection('emission_factors').insertMany(factors);

    // 4. Seed Environmental Goals
    const goals = [
      {
        _id: new ObjectId('64a7c7000000000000000001'),
        department_id: depts[0]._id,
        target_co2e: 100, // Engineering
        deadline: new Date('2026-12-31')
      },
      {
        _id: new ObjectId('64a7c7000000000000000002'),
        department_id: depts[1]._id,
        target_co2e: 50, // Marketing
        deadline: new Date('2026-12-31')
      }
    ];
    await db.collection('environmental_goals').insertMany(goals);

    // 5. Seed CSR Activities
    const activities = [
      {
        _id: new ObjectId('64a7c3000000000000000001'),
        title: 'Tree Planting',
        description: 'Planting trees at the local nature reserve',
        category: 'CSR_ACTIVITY',
        points: 50,
        xp: 100,
        difficulty: 'medium',
        proof_required: true
      },
      {
        _id: new ObjectId('64a7c3000000000000000002'),
        title: 'Office Recycler',
        description: 'Set up desk-side recycling bins',
        category: 'CSR_ACTIVITY',
        points: 20,
        xp: 40,
        difficulty: 'easy',
        proof_required: false
      }
    ];
    await db.collection('csr_activities').insertMany(activities);

    // 6. Seed Badges
    const badges = [
      {
        _id: new ObjectId('64a7c4000000000000000001'),
        name: 'Green Pioneer',
        description: 'Participated in at least 1 environmental or social CSR activity',
        criteria_type: 'csr_count',
        threshold: 1
      },
      {
        _id: new ObjectId('64a7c4000000000000000002'),
        name: 'Eco Warrior',
        description: 'Earned at least 200 XP',
        criteria_type: 'xp',
        threshold: 200
      },
      {
        _id: new ObjectId('64a7c4000000000000000003'),
        name: 'Challenge Master',
        description: 'Completed at least 1 gamified challenge',
        criteria_type: 'challenge_count',
        threshold: 1
      }
    ];
    await db.collection('badges').insertMany(badges);

    // 7. Seed Challenges
    const chs = [
      {
        _id: new ObjectId('64a7c5000000000000000001'),
        title: 'Ride Bike to Work',
        description: 'Commute via bicycle for a week',
        base_xp: 80,
        points: 40,
        difficulty: 'easy',
        status: 'draft',
        proof_required: true,
        created_at: new Date()
      },
      {
        _id: new ObjectId('64a7c5000000000000000002'),
        title: 'Plastic Free Week',
        description: 'Reduce single-use plastic to zero',
        base_xp: 150,
        points: 75,
        difficulty: 'medium',
        status: 'active',
        proof_required: false,
        created_at: new Date()
      }
    ];
    await db.collection('challenges').insertMany(chs);

    // 8. Seed Rewards
    const rews = [
      {
        _id: new ObjectId('64a7c6000000000000000001'),
        title: 'Eco Water Bottle',
        points_cost: 60,
        stock: 3
      },
      {
        _id: new ObjectId('64a7c6000000000000000002'),
        title: 'Premium Desk Organiser',
        points_cost: 150,
        stock: 0 // Out of stock to test failure
      }
    ];
    await db.collection('rewards').insertMany(rews);

    // 9. Seed ESG Configurations
    const esgConfig = {
      _id: new ObjectId('64a7c8000000000000000001'),
      env_weight: 0.4,
      social_weight: 0.3,
      gov_weight: 0.3
    };
    await db.collection('esg_configurations').insertOne(esgConfig);

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await client.close();
  }
}

seed();
