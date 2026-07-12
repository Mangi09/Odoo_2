-- EcoSphere starter schema, SQLite-friendly.
-- Convert TEXT ids to UUID if using PostgreSQL.

CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  head_name TEXT,
  parent_department_id TEXT REFERENCES departments(id),
  employee_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active',
  UNIQUE (org_id, code)
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  department_id TEXT REFERENCES departments(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  UNIQUE (org_id, email)
);

CREATE TABLE org_esg_settings (
  org_id TEXT PRIMARY KEY REFERENCES organizations(id),
  environmental_weight INTEGER NOT NULL DEFAULT 40,
  social_weight INTEGER NOT NULL DEFAULT 30,
  governance_weight INTEGER NOT NULL DEFAULT 30,
  auto_emission_enabled INTEGER NOT NULL DEFAULT 1,
  evidence_required_for_csr INTEGER NOT NULL DEFAULT 1,
  badge_auto_award_enabled INTEGER NOT NULL DEFAULT 1,
  compliance_alerts_enabled INTEGER NOT NULL DEFAULT 1,
  CHECK (environmental_weight + social_weight + governance_weight = 100)
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  UNIQUE (org_id, type, name)
);

CREATE TABLE emission_factors (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  source_type TEXT NOT NULL,
  unit TEXT NOT NULL,
  co2e_per_unit REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  CHECK (co2e_per_unit >= 0)
);

CREATE TABLE carbon_transactions (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  department_id TEXT NOT NULL REFERENCES departments(id),
  source_type TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  emission_factor_id TEXT REFERENCES emission_factors(id),
  calculated_co2e REAL NOT NULL,
  calculation_mode TEXT NOT NULL DEFAULT 'AUTO',
  occurred_at TEXT NOT NULL,
  CHECK (quantity >= 0),
  CHECK (calculated_co2e >= 0)
);

CREATE TABLE environmental_goals (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  department_id TEXT NOT NULL REFERENCES departments(id),
  name TEXT NOT NULL,
  target_co2e REAL NOT NULL,
  current_co2e REAL NOT NULL DEFAULT 0,
  deadline TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  CHECK (target_co2e >= 0),
  CHECK (current_co2e >= 0)
);

CREATE TABLE csr_activities (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  category_id TEXT REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  evidence_required INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Open',
  CHECK (points >= 0)
);

CREATE TABLE employee_participations (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  employee_id TEXT NOT NULL REFERENCES users(id),
  csr_activity_id TEXT NOT NULL REFERENCES csr_activities(id),
  proof_file_name TEXT,
  approval_status TEXT NOT NULL DEFAULT 'Pending',
  points_earned INTEGER NOT NULL DEFAULT 0,
  approved_by TEXT REFERENCES users(id),
  approved_at TEXT,
  UNIQUE (employee_id, csr_activity_id)
);

CREATE TABLE audits (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  department_id TEXT NOT NULL REFERENCES departments(id),
  title TEXT NOT NULL,
  auditor_name TEXT NOT NULL,
  audit_date TEXT NOT NULL,
  findings_summary TEXT,
  status TEXT NOT NULL DEFAULT 'Under Review'
);

CREATE TABLE compliance_issues (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  audit_id TEXT REFERENCES audits(id),
  department_id TEXT NOT NULL REFERENCES departments(id),
  owner_user_id TEXT NOT NULL REFERENCES users(id),
  severity TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open'
);

CREATE TABLE challenges (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  category_id TEXT REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL,
  evidence_required INTEGER NOT NULL DEFAULT 0,
  deadline TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  CHECK (xp >= 0)
);

CREATE TABLE challenge_participations (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  challenge_id TEXT NOT NULL REFERENCES challenges(id),
  employee_id TEXT NOT NULL REFERENCES users(id),
  progress_percent INTEGER NOT NULL DEFAULT 0,
  proof_file_name TEXT,
  approval_status TEXT NOT NULL DEFAULT 'Pending',
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  UNIQUE (challenge_id, employee_id)
);

CREATE TABLE badges (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  unlock_rule_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  UNIQUE (org_id, name)
);

CREATE TABLE employee_badges (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  employee_id TEXT NOT NULL REFERENCES users(id),
  badge_id TEXT NOT NULL REFERENCES badges(id),
  awarded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (employee_id, badge_id)
);

CREATE TABLE rewards (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  stock INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  CHECK (points_required >= 0),
  CHECK (stock >= 0)
);

CREATE TABLE reward_redemptions (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  employee_id TEXT NOT NULL REFERENCES users(id),
  reward_id TEXT NOT NULL REFERENCES rewards(id),
  points_spent INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Fulfilled',
  redeemed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE points_ledger (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  employee_id TEXT NOT NULL REFERENCES users(id),
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  points_delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  recipient_user_id TEXT NOT NULL REFERENCES users(id),
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE department_scores (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  department_id TEXT NOT NULL REFERENCES departments(id),
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  environmental_score INTEGER NOT NULL,
  social_score INTEGER NOT NULL,
  governance_score INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  UNIQUE (department_id, period_start, period_end)
);

