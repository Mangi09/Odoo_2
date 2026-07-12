INSERT INTO organizations (id, name, status) VALUES
('org-eco', 'EcoSphere Demo Company', 'Active');

INSERT INTO departments (id, org_id, name, code, head_name, parent_department_id, employee_count, status) VALUES
('dept-mfg', 'org-eco', 'Manufacturing', 'MFG', 'S. Nair', NULL, 134, 'Active'),
('dept-log', 'org-eco', 'Logistics', 'LOG', 'R. Iyer', 'dept-mfg', 58, 'Active'),
('dept-cor', 'org-eco', 'Corporate', 'COR', 'A. Mehta', NULL, 41, 'Active'),
('dept-rnd', 'org-eco', 'R&D', 'RND', 'P. Desai', NULL, 36, 'Active');

INSERT INTO users (id, org_id, department_id, full_name, email, role, status) VALUES
('u-admin', 'org-eco', 'dept-cor', 'Admin User', 'admin@ecosphere.test', 'ADMIN', 'Active'),
('u-aditi', 'org-eco', 'dept-mfg', 'Aditi Rao', 'aditi@ecosphere.test', 'EMPLOYEE', 'Active'),
('u-karan', 'org-eco', 'dept-cor', 'Karan Shah', 'karan@ecosphere.test', 'EMPLOYEE', 'Active'),
('u-riyer', 'org-eco', 'dept-log', 'R. Iyer', 'riyer@ecosphere.test', 'DEPT_HEAD', 'Active');

INSERT INTO org_esg_settings (org_id, environmental_weight, social_weight, governance_weight) VALUES
('org-eco', 40, 30, 30);

INSERT INTO categories (id, org_id, name, type, status) VALUES
('cat-community', 'org-eco', 'Community', 'CSR_ACTIVITY', 'Active'),
('cat-env', 'org-eco', 'Environment', 'CSR_ACTIVITY', 'Active'),
('cat-challenge-env', 'org-eco', 'Sustainability', 'CHALLENGE', 'Active');

INSERT INTO emission_factors (id, org_id, source_type, unit, co2e_per_unit, status) VALUES
('ef-fleet', 'org-eco', 'Fleet', 'liters', 2.68, 'Active'),
('ef-mfg', 'org-eco', 'Manufacturing', 'units', 0.42, 'Active'),
('ef-expense', 'org-eco', 'Expense', 'usd', 0.08, 'Active'),
('ef-purchase', 'org-eco', 'Purchase', 'kg', 1.15, 'Active');

INSERT INTO carbon_transactions (id, org_id, department_id, source_type, quantity, unit, emission_factor_id, calculated_co2e, calculation_mode, occurred_at) VALUES
('ct-1', 'org-eco', 'dept-log', 'Fleet', 120, 'liters', 'ef-fleet', 321.6, 'AUTO', '2026-07-10'),
('ct-2', 'org-eco', 'dept-mfg', 'Manufacturing', 400, 'units', 'ef-mfg', 168.0, 'AUTO', '2026-07-09');

INSERT INTO environmental_goals (id, org_id, department_id, name, target_co2e, current_co2e, deadline, status) VALUES
('goal-1', 'org-eco', 'dept-log', 'Reduce Fleet Emissions', 500, 390, '2026-12-31', 'Active'),
('goal-2', 'org-eco', 'dept-mfg', 'Cut Packaging Waste', 120, 98, '2026-09-30', 'On Track'),
('goal-3', 'org-eco', 'dept-cor', 'Office Energy Cut', 80, 80, '2026-06-30', 'Completed');

INSERT INTO csr_activities (id, org_id, category_id, title, description, points, evidence_required, status) VALUES
('csr-tree', 'org-eco', 'cat-community', 'Tree Plantation', 'Plant trees with the community team.', 50, 1, 'Open'),
('csr-workshop', 'org-eco', 'cat-env', 'ESG Workshop', 'Attend an ESG awareness workshop.', 30, 0, 'Open');

INSERT INTO employee_participations (id, org_id, employee_id, csr_activity_id, proof_file_name, approval_status, points_earned) VALUES
('part-1', 'org-eco', 'u-aditi', 'csr-tree', 'photo.jpg', 'Pending', 50),
('part-2', 'org-eco', 'u-karan', 'csr-workshop', 'cert.pdf', 'Approved', 30);

INSERT INTO audits (id, org_id, department_id, title, auditor_name, audit_date, findings_summary, status) VALUES
('audit-1', 'org-eco', 'dept-mfg', 'Q2 Waste Audit', 'S. Nair', '2026-06-12', '3 minor issues', 'Completed');

INSERT INTO compliance_issues (id, org_id, audit_id, department_id, owner_user_id, severity, description, due_date, status) VALUES
('issue-1', 'org-eco', 'audit-1', 'dept-mfg', 'u-riyer', 'High', 'Missing MSDS sheets', '2026-07-18', 'Open');

INSERT INTO challenges (id, org_id, category_id, title, description, xp, difficulty, evidence_required, deadline, status) VALUES
('ch-sprint', 'org-eco', 'cat-challenge-env', 'Sustainability Sprint', 'Complete a week of sustainability actions.', 200, 'Hard', 1, '2026-07-20', 'Active'),
('ch-recycle', 'org-eco', 'cat-challenge-env', 'Recycle Challenge', 'Track recycling for one week.', 80, 'Easy', 0, '2026-07-15', 'Active');

INSERT INTO badges (id, org_id, name, description, unlock_rule_json, status) VALUES
('badge-green', 'org-eco', 'Green Beginner', 'First approved activity.', '{"metric":"approved_activities","operator":">=","value":1}', 'Active'),
('badge-champ', 'org-eco', 'Sustainability Champion', 'Complete one hard challenge.', '{"metric":"hard_challenges","operator":">=","value":1}', 'Active');

INSERT INTO rewards (id, org_id, name, description, points_required, stock, status) VALUES
('rw-kit', 'org-eco', 'Reusable Kit', 'Reusable bottle and lunch box kit.', 120, 8, 'Active'),
('rw-voucher', 'org-eco', 'Eco Voucher', 'Voucher for eco-friendly products.', 500, 3, 'Active');

INSERT INTO points_ledger (id, org_id, employee_id, source_type, source_id, points_delta, reason) VALUES
('pl-1', 'org-eco', 'u-aditi', 'ADMIN_ADJUSTMENT', 'seed', 3910, 'Seed demo balance'),
('pl-2', 'org-eco', 'u-karan', 'CSR_PARTICIPATION', 'part-2', 30, 'Approved ESG Workshop');

INSERT INTO department_scores (id, org_id, department_id, period_start, period_end, environmental_score, social_score, governance_score, total_score) VALUES
('score-mfg', 'org-eco', 'dept-mfg', '2026-07-01', '2026-07-31', 84, 78, 90, 84),
('score-log', 'org-eco', 'dept-log', '2026-07-01', '2026-07-31', 78, 70, 86, 78),
('score-cor', 'org-eco', 'dept-cor', '2026-07-01', '2026-07-31', 82, 76, 89, 82);

