-- =========================================================
-- EcoSphere ESG Management Platform
-- PostgreSQL Schema
-- Part 1 - Master Tables
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- ORGANIZATIONS
-- =========================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE'
        CHECK(status IN ('ACTIVE','INACTIVE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- DEPARTMENTS
-- =========================================================

CREATE TABLE departments (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    name VARCHAR(100) NOT NULL,

    code VARCHAR(20) NOT NULL,

    head_user_id UUID,

    parent_department_id UUID,

    employee_count INT DEFAULT 0,

    status VARCHAR(20)
        DEFAULT 'ACTIVE'
        CHECK(status IN ('ACTIVE','INACTIVE')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_department_org
        FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    CONSTRAINT fk_parent_department
        FOREIGN KEY(parent_department_id)
        REFERENCES departments(id),

    UNIQUE(org_id,code)

);

-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE users (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    department_id UUID,

    full_name VARCHAR(120) NOT NULL,

    email VARCHAR(120) NOT NULL,

    role VARCHAR(30)
        NOT NULL
        CHECK(role IN
        (
            'ADMIN',
            'ESG_MANAGER',
            'DEPARTMENT_HEAD',
            'EMPLOYEE',
            'AUDITOR'
        )),

    xp_total INT DEFAULT 0,

    points_balance INT DEFAULT 0,

    status VARCHAR(20)
        DEFAULT 'ACTIVE'
        CHECK(status IN ('ACTIVE','INACTIVE')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_org
        FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    CONSTRAINT fk_user_department
        FOREIGN KEY(department_id)
        REFERENCES departments(id),

    UNIQUE(org_id,email)

);

ALTER TABLE departments
ADD CONSTRAINT fk_department_head
FOREIGN KEY(head_user_id)
REFERENCES users(id);

-- =========================================================
-- ESG SETTINGS
-- =========================================================

CREATE TABLE org_esg_settings (

    org_id UUID PRIMARY KEY,

    environmental_weight DECIMAL(5,2) DEFAULT 40,

    social_weight DECIMAL(5,2) DEFAULT 30,

    governance_weight DECIMAL(5,2) DEFAULT 30,

    auto_emission_enabled BOOLEAN DEFAULT TRUE,

    evidence_required_for_csr BOOLEAN DEFAULT TRUE,

    badge_auto_award_enabled BOOLEAN DEFAULT TRUE,

    compliance_alerts_enabled BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_settings_org
        FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    CHECK(
        environmental_weight +
        social_weight +
        governance_weight = 100
    )

);

-- =========================================================
-- CATEGORIES
-- =========================================================

CREATE TABLE categories (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    name VARCHAR(100) NOT NULL,

    type VARCHAR(30)
        CHECK(type IN
        (
            'CSR_ACTIVITY',
            'CHALLENGE',
            'ESG_CATEGORY'
        )),

    status VARCHAR(20)
        DEFAULT 'ACTIVE'
        CHECK(status IN ('ACTIVE','INACTIVE')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_category_org
        FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    UNIQUE(org_id,type,name)

);

-- =========================================================
-- EMISSION FACTORS
-- =========================================================

CREATE TABLE emission_factors (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    activity_name VARCHAR(100) NOT NULL,

    source_type VARCHAR(30)
        CHECK(source_type IN
        (
            'PURCHASE',
            'MANUFACTURING',
            'EXPENSE',
            'FLEET',
            'MANUAL'
        )),

    unit VARCHAR(20) NOT NULL,

    co2e_per_unit NUMERIC(10,4)
        NOT NULL
        CHECK(co2e_per_unit>=0),

    effective_from DATE,

    effective_to DATE,

    status VARCHAR(20)
        DEFAULT 'ACTIVE'
        CHECK(status IN ('ACTIVE','INACTIVE')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_emission_org
        FOREIGN KEY(org_id)
        REFERENCES organizations(id)

);

-- =========================================================
-- PRODUCT ESG PROFILES
-- =========================================================

CREATE TABLE product_esg_profiles (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    product_name VARCHAR(150) NOT NULL,

    emission_factor_id UUID,

    lifecycle_stage VARCHAR(80),

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_profile_org
        FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    CONSTRAINT fk_profile_emission
        FOREIGN KEY(emission_factor_id)
        REFERENCES emission_factors(id)

);

-- =========================================================
-- ENVIRONMENTAL GOALS
-- =========================================================

CREATE TABLE environmental_goals (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    department_id UUID NOT NULL,

    name VARCHAR(120) NOT NULL,

    target_co2e NUMERIC(12,2)
        CHECK(target_co2e>=0),

    current_co2e NUMERIC(12,2)
        DEFAULT 0
        CHECK(current_co2e>=0),

    start_date DATE,

    deadline DATE,

    status VARCHAR(30)
        DEFAULT 'ACTIVE'
        CHECK(status IN
        (
            'ACTIVE',
            'ON_TRACK',
            'AT_RISK',
            'COMPLETED',
            'ARCHIVED'
        )),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_goal_org
        FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    CONSTRAINT fk_goal_department
        FOREIGN KEY(department_id)
        REFERENCES departments(id)

);

-- =========================================================
-- ESG POLICIES
-- =========================================================

CREATE TABLE esg_policies (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    title VARCHAR(200) NOT NULL,

    description TEXT,

    version VARCHAR(30),

    effective_date DATE,

    owner_user_id UUID,

    status VARCHAR(30)
        DEFAULT 'DRAFT'
        CHECK(status IN
        (
            'DRAFT',
            'ACTIVE',
            'RETIRED'
        )),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_policy_org
        FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    CONSTRAINT fk_policy_owner
        FOREIGN KEY(owner_user_id)
        REFERENCES users(id)

);

-- =========================================================
-- BADGES
-- =========================================================

CREATE TABLE badges (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    name VARCHAR(100) NOT NULL,

    description TEXT,

    unlock_rule JSONB,

    icon VARCHAR(255),

    status VARCHAR(20)
        DEFAULT 'ACTIVE'
        CHECK(status IN ('ACTIVE','INACTIVE')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_badge_org
        FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    UNIQUE(org_id,name)

);

-- =========================================================
-- REWARDS
-- =========================================================

CREATE TABLE rewards (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    name VARCHAR(120) NOT NULL,

    description TEXT,

    points_required INT
        CHECK(points_required>=0),

    stock INT
        CHECK(stock>=0),

    status VARCHAR(20)
        DEFAULT 'ACTIVE'
        CHECK(status IN ('ACTIVE','INACTIVE')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reward_org
        FOREIGN KEY(org_id)
        REFERENCES organizations(id)

);

-- part2
-- =========================================================
-- PART 2 - TRANSACTION TABLES
-- =========================================================

------------------------------------------------------------
-- CARBON TRANSACTIONS
------------------------------------------------------------

CREATE TABLE carbon_transactions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,
    department_id UUID NOT NULL,
    emission_factor_id UUID,
    product_profile_id UUID,

    source_type VARCHAR(30)
        CHECK(source_type IN
        ('PURCHASE','MANUFACTURING','EXPENSE','FLEET','MANUAL')),

    quantity NUMERIC(12,2) NOT NULL CHECK(quantity>=0),

    unit VARCHAR(20),

    calculated_co2e NUMERIC(12,4)
        NOT NULL
        CHECK(calculated_co2e>=0),

    calculation_mode VARCHAR(20)
        DEFAULT 'AUTO'
        CHECK(calculation_mode IN ('AUTO','MANUAL')),

    occurred_at TIMESTAMP NOT NULL,

    notes TEXT,

    created_by UUID,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    FOREIGN KEY(department_id)
        REFERENCES departments(id),

    FOREIGN KEY(emission_factor_id)
        REFERENCES emission_factors(id),

    FOREIGN KEY(product_profile_id)
        REFERENCES product_esg_profiles(id),

    FOREIGN KEY(created_by)
        REFERENCES users(id)

);

------------------------------------------------------------
-- CSR ACTIVITIES
------------------------------------------------------------

CREATE TABLE csr_activities (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    category_id UUID,

    department_id UUID,

    title VARCHAR(150) NOT NULL,

    description TEXT,

    starts_at DATE,

    ends_at DATE,

    points INT DEFAULT 0 CHECK(points>=0),

    evidence_required BOOLEAN DEFAULT FALSE,

    status VARCHAR(20)
        DEFAULT 'OPEN'
        CHECK(status IN
        ('DRAFT','OPEN','CLOSED','ARCHIVED')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    FOREIGN KEY(category_id)
        REFERENCES categories(id),

    FOREIGN KEY(department_id)
        REFERENCES departments(id)

);

------------------------------------------------------------
-- EMPLOYEE PARTICIPATIONS
------------------------------------------------------------

CREATE TABLE employee_participations (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    employee_id UUID NOT NULL,

    csr_activity_id UUID NOT NULL,

    proof_url TEXT,

    approval_status VARCHAR(20)
        DEFAULT 'PENDING'
        CHECK(approval_status IN
        ('PENDING','APPROVED','REJECTED')),

    points_earned INT DEFAULT 0,

    completion_date DATE,

    approved_by UUID,

    approved_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    FOREIGN KEY(employee_id)
        REFERENCES users(id),

    FOREIGN KEY(csr_activity_id)
        REFERENCES csr_activities(id),

    FOREIGN KEY(approved_by)
        REFERENCES users(id),

    UNIQUE(employee_id,csr_activity_id)

);

------------------------------------------------------------
-- CHALLENGES
------------------------------------------------------------

CREATE TABLE challenges (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    category_id UUID,

    title VARCHAR(150) NOT NULL,

    description TEXT,

    xp INT DEFAULT 0,

    difficulty VARCHAR(20)
        CHECK(difficulty IN
        ('EASY','MEDIUM','HARD')),

    evidence_required BOOLEAN DEFAULT FALSE,

    deadline DATE,

    status VARCHAR(30)
        DEFAULT 'DRAFT'
        CHECK(status IN
        ('DRAFT',
         'ACTIVE',
         'UNDER_REVIEW',
         'COMPLETED',
         'ARCHIVED')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    FOREIGN KEY(category_id)
        REFERENCES categories(id)

);

------------------------------------------------------------
-- CHALLENGE PARTICIPATIONS
------------------------------------------------------------

CREATE TABLE challenge_participations (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    challenge_id UUID NOT NULL,

    employee_id UUID NOT NULL,

    progress_percent INT DEFAULT 0,

    proof_url TEXT,

    approval_status VARCHAR(20)
        DEFAULT 'PENDING'
        CHECK(approval_status IN
        ('PENDING','APPROVED','REJECTED')),

    xp_awarded INT DEFAULT 0,

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    completed_at TIMESTAMP,

    approved_by UUID,

    approved_at TIMESTAMP,

    FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    FOREIGN KEY(challenge_id)
        REFERENCES challenges(id),

    FOREIGN KEY(employee_id)
        REFERENCES users(id),

    FOREIGN KEY(approved_by)
        REFERENCES users(id),

    UNIQUE(challenge_id,employee_id)

);

------------------------------------------------------------
-- POLICY ACKNOWLEDGEMENTS
------------------------------------------------------------

CREATE TABLE policy_acknowledgements (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    policy_id UUID NOT NULL,

    employee_id UUID NOT NULL,

    acknowledged_at TIMESTAMP,

    status VARCHAR(20)
        DEFAULT 'PENDING'
        CHECK(status IN
        ('PENDING','ACKNOWLEDGED')),

    FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    FOREIGN KEY(policy_id)
        REFERENCES esg_policies(id),

    FOREIGN KEY(employee_id)
        REFERENCES users(id),

    UNIQUE(policy_id,employee_id)

);

------------------------------------------------------------
-- AUDITS
------------------------------------------------------------

CREATE TABLE audits (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    department_id UUID NOT NULL,

    title VARCHAR(200) NOT NULL,

    auditor_user_id UUID,

    audit_date DATE,

    findings_summary TEXT,

    status VARCHAR(20)
        DEFAULT 'PLANNED'
        CHECK(status IN
        ('PLANNED',
         'UNDER_REVIEW',
         'COMPLETED',
         'ARCHIVED')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    FOREIGN KEY(department_id)
        REFERENCES departments(id),

    FOREIGN KEY(auditor_user_id)
        REFERENCES users(id)

);

------------------------------------------------------------
-- COMPLIANCE ISSUES
------------------------------------------------------------

CREATE TABLE compliance_issues (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    audit_id UUID,

    department_id UUID NOT NULL,

    owner_user_id UUID NOT NULL,

    severity VARCHAR(20)
        CHECK(severity IN
        ('LOW',
         'MEDIUM',
         'HIGH',
         'CRITICAL')),

    description TEXT NOT NULL,

    due_date DATE NOT NULL,

    status VARCHAR(20)
        DEFAULT 'OPEN'
        CHECK(status IN
        ('OPEN',
         'IN_PROGRESS',
         'RESOLVED',
         'OVERDUE',
         'ARCHIVED')),

    resolved_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    FOREIGN KEY(audit_id)
        REFERENCES audits(id),

    FOREIGN KEY(department_id)
        REFERENCES departments(id),

    FOREIGN KEY(owner_user_id)
        REFERENCES users(id)

);

-- part3

------------------------------------------------------------
-- EMPLOYEE BADGES
------------------------------------------------------------

CREATE TABLE employee_badges (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    employee_id UUID NOT NULL,

    badge_id UUID NOT NULL,

    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    reason TEXT,

    FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    FOREIGN KEY(employee_id)
        REFERENCES users(id),

    FOREIGN KEY(badge_id)
        REFERENCES badges(id),

    UNIQUE(employee_id,badge_id)

);

------------------------------------------------------------
-- REWARD REDEMPTIONS
------------------------------------------------------------

CREATE TABLE reward_redemptions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    employee_id UUID NOT NULL,

    reward_id UUID NOT NULL,

    points_spent INT NOT NULL
        CHECK(points_spent>=0),

    status VARCHAR(20)
        DEFAULT 'FULFILLED'
        CHECK(status IN
        ('PENDING',
         'FULFILLED',
         'CANCELLED')),

    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    FOREIGN KEY(employee_id)
        REFERENCES users(id),

    FOREIGN KEY(reward_id)
        REFERENCES rewards(id)

);

------------------------------------------------------------
-- POINTS LEDGER
------------------------------------------------------------

CREATE TABLE points_ledger (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    employee_id UUID NOT NULL,

    source_type VARCHAR(50),

    source_id UUID,

    points_delta INT NOT NULL,

    reason TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    FOREIGN KEY(employee_id)
        REFERENCES users(id)

);

------------------------------------------------------------
-- NOTIFICATIONS
------------------------------------------------------------

CREATE TABLE notifications (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    recipient_user_id UUID NOT NULL,

    event_type VARCHAR(50),

    title VARCHAR(150),

    body TEXT,

    entity_type VARCHAR(50),

    entity_id UUID,

    read_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    FOREIGN KEY(recipient_user_id)
        REFERENCES users(id)

);

------------------------------------------------------------
-- DEPARTMENT SCORES
------------------------------------------------------------

CREATE TABLE department_scores (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    org_id UUID NOT NULL,

    department_id UUID NOT NULL,

    period_start DATE,

    period_end DATE,

    environmental_score NUMERIC(5,2),

    social_score NUMERIC(5,2),

    governance_score NUMERIC(5,2),

    total_score NUMERIC(5,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(org_id)
        REFERENCES organizations(id),

    FOREIGN KEY(department_id)
        REFERENCES departments(id),

    UNIQUE(department_id,period_start,period_end)

);

------------------------------------------------------------
-- INDEXES
------------------------------------------------------------

CREATE INDEX idx_users_org
ON users(org_id);

CREATE INDEX idx_users_department
ON users(department_id);

CREATE INDEX idx_departments_org
ON departments(org_id);

CREATE INDEX idx_carbon_department
ON carbon_transactions(department_id);

CREATE INDEX idx_carbon_org
ON carbon_transactions(org_id);

CREATE INDEX idx_csr_org
ON csr_activities(org_id);

CREATE INDEX idx_challenge_org
ON challenges(org_id);

CREATE INDEX idx_notifications_user
ON notifications(recipient_user_id);

CREATE INDEX idx_department_scores
ON department_scores(department_id);

CREATE INDEX idx_points_employee
ON points_ledger(employee_id);

CREATE INDEX idx_reward_employee
ON reward_redemptions(employee_id);

CREATE INDEX idx_compliance_owner
ON compliance_issues(owner_user_id);

CREATE INDEX idx_employee_badges
ON employee_badges(employee_id);

