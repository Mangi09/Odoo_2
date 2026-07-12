-- =========================================================
-- EcoSphere Seed Data
-- Part 1 - Master Data
-- =========================================================

------------------------------------------------------------
-- ORGANIZATION
------------------------------------------------------------

INSERT INTO organizations (id, name, status)
VALUES
(gen_random_uuid(), 'EcoSphere Demo Organization', 'ACTIVE');

------------------------------------------------------------
-- DEPARTMENTS
------------------------------------------------------------

INSERT INTO departments
(id, org_id, name, code, employee_count, status)

SELECT
gen_random_uuid(),
id,
'Human Resources',
'HR',
5,
'ACTIVE'
FROM organizations;

INSERT INTO departments
(id, org_id, name, code, employee_count, status)

SELECT
gen_random_uuid(),
id,
'Manufacturing',
'MFG',
8,
'ACTIVE'
FROM organizations;

INSERT INTO departments
(id, org_id, name, code, employee_count, status)

SELECT
gen_random_uuid(),
id,
'Finance',
'FIN',
4,
'ACTIVE'
FROM organizations;

INSERT INTO departments
(id, org_id, name, code, employee_count, status)

SELECT
gen_random_uuid(),
id,
'Operations',
'OPS',
7,
'ACTIVE'
FROM organizations;

INSERT INTO departments
(id, org_id, name, code, employee_count, status)

SELECT
gen_random_uuid(),
id,
'Sustainability',
'ESG',
6,
'ACTIVE'
FROM organizations;

------------------------------------------------------------
-- USERS
------------------------------------------------------------

INSERT INTO users
(id,org_id,department_id,full_name,email,role)

SELECT
gen_random_uuid(),
o.id,
d.id,
'Admin User',
'admin@ecosphere.com',
'ADMIN'

FROM organizations o
JOIN departments d
ON d.org_id=o.id
LIMIT 1;

INSERT INTO users
(id,org_id,department_id,full_name,email,role)

SELECT
gen_random_uuid(),
o.id,
d.id,
'ESG Manager',
'manager@ecosphere.com',
'ESG_MANAGER'

FROM organizations o
JOIN departments d
ON d.org_id=o.id
LIMIT 1;

INSERT INTO users
(id,org_id,department_id,full_name,email,role)

SELECT
gen_random_uuid(),
o.id,
d.id,
'Auditor',
'auditor@ecosphere.com',
'AUDITOR'

FROM organizations o
JOIN departments d
ON d.org_id=o.id
LIMIT 1;

------------------------------------------------------------
-- ESG SETTINGS
------------------------------------------------------------

INSERT INTO org_esg_settings(

org_id,

environmental_weight,

social_weight,

governance_weight,

auto_emission_enabled,

evidence_required_for_csr,

badge_auto_award_enabled,

compliance_alerts_enabled

)

SELECT

id,

40,

30,

30,

TRUE,

TRUE,

TRUE,

TRUE

FROM organizations;

------------------------------------------------------------
-- CATEGORIES
------------------------------------------------------------

INSERT INTO categories(id,org_id,name,type)

SELECT gen_random_uuid(),id,'Environment','ESG_CATEGORY'
FROM organizations;

INSERT INTO categories(id,org_id,name,type)

SELECT gen_random_uuid(),id,'CSR','CSR_ACTIVITY'
FROM organizations;

INSERT INTO categories(id,org_id,name,type)

SELECT gen_random_uuid(),id,'Health','CSR_ACTIVITY'
FROM organizations;

INSERT INTO categories(id,org_id,name,type)

SELECT gen_random_uuid(),id,'Challenge','CHALLENGE'
FROM organizations;

------------------------------------------------------------
-- EMISSION FACTORS
------------------------------------------------------------

INSERT INTO emission_factors
(id,org_id,activity_name,source_type,unit,co2e_per_unit)

SELECT
gen_random_uuid(),
id,
'Electricity',
'MANUFACTURING',
'kWh',
0.82
FROM organizations;

INSERT INTO emission_factors
(id,org_id,activity_name,source_type,unit,co2e_per_unit)

SELECT
gen_random_uuid(),
id,
'Diesel',
'FLEET',
'Litres',
2.68
FROM organizations;

INSERT INTO emission_factors
(id,org_id,activity_name,source_type,unit,co2e_per_unit)

SELECT
gen_random_uuid(),
id,
'Natural Gas',
'MANUFACTURING',
'm3',
2.10
FROM organizations;

INSERT INTO emission_factors
(id,org_id,activity_name,source_type,unit,co2e_per_unit)

SELECT
gen_random_uuid(),
id,
'Business Travel',
'EXPENSE',
'km',
0.15
FROM organizations;

------------------------------------------------------------
-- REWARDS
------------------------------------------------------------

INSERT INTO rewards(id,org_id,name,points_required,stock)

SELECT
gen_random_uuid(),
id,
'Eco Water Bottle',
250,
20
FROM organizations;

INSERT INTO rewards(id,org_id,name,points_required,stock)

SELECT
gen_random_uuid(),
id,
'Plant Kit',
500,
15
FROM organizations;

INSERT INTO rewards(id,org_id,name,points_required,stock)

SELECT
gen_random_uuid(),
id,
'Amazon Voucher',
800,
10
FROM organizations;

------------------------------------------------------------
-- BADGES
------------------------------------------------------------

INSERT INTO badges
(id,org_id,name,description,unlock_rule)

SELECT

gen_random_uuid(),

id,

'Green Beginner',

'First ESG Activity',

'{"metric":"xp_total","operator":">=","value":100}'

FROM organizations;

-- =========================================================
-- PART 2 - BUSINESS DATA
-- =========================================================

------------------------------------------------------------
-- PRODUCT ESG PROFILES
------------------------------------------------------------

INSERT INTO product_esg_profiles
(id, org_id, product_name, emission_factor_id, lifecycle_stage)

SELECT
gen_random_uuid(),
o.id,
'Solar Panel',
ef.id,
'Production'
FROM organizations o
CROSS JOIN LATERAL (
    SELECT id
    FROM emission_factors
    LIMIT 1
) ef;

------------------------------------------------------------
-- ENVIRONMENTAL GOALS
------------------------------------------------------------

INSERT INTO environmental_goals
(id,org_id,department_id,name,target_co2e,current_co2e,start_date,deadline,status)

SELECT
gen_random_uuid(),
o.id,
d.id,
'Reduce Carbon Emissions by 20%',
1000,
320,
CURRENT_DATE,
CURRENT_DATE + INTERVAL '365 days',
'ON_TRACK'

FROM organizations o
JOIN departments d
ON o.id=d.org_id
LIMIT 1;

------------------------------------------------------------
-- ESG POLICIES
------------------------------------------------------------

INSERT INTO esg_policies
(id,org_id,title,description,version,effective_date,status)

SELECT
gen_random_uuid(),
id,
'Corporate ESG Policy',
'Organization wide ESG policy',
'1.0',
CURRENT_DATE,
'ACTIVE'
FROM organizations;

------------------------------------------------------------
-- CSR ACTIVITIES
------------------------------------------------------------

INSERT INTO csr_activities
(id,org_id,category_id,title,description,points,evidence_required,status)

SELECT
gen_random_uuid(),
o.id,
c.id,
'Tree Plantation Drive',
'Plant 100 trees in the city',
100,
TRUE,
'OPEN'

FROM organizations o
JOIN categories c
ON o.id=c.org_id
WHERE c.type='CSR_ACTIVITY'
LIMIT 1;

INSERT INTO csr_activities
(id,org_id,category_id,title,description,points,evidence_required,status)

SELECT
gen_random_uuid(),
o.id,
c.id,
'Beach Cleanup',
'Community cleanup initiative',
120,
TRUE,
'OPEN'

FROM organizations o
JOIN categories c
ON o.id=c.org_id
WHERE c.type='CSR_ACTIVITY'
LIMIT 1;

------------------------------------------------------------
-- CHALLENGES
------------------------------------------------------------

INSERT INTO challenges
(id,org_id,category_id,title,description,xp,difficulty,evidence_required,deadline,status)

SELECT
gen_random_uuid(),
o.id,
c.id,
'Cycle To Work',
'Use cycle instead of vehicle',
200,
'MEDIUM',
TRUE,
CURRENT_DATE + INTERVAL '20 days',
'ACTIVE'

FROM organizations o
JOIN categories c
ON o.id=c.org_id
WHERE c.type='CHALLENGE'
LIMIT 1;

INSERT INTO challenges
(id,org_id,category_id,title,description,xp,difficulty,evidence_required,deadline,status)

SELECT
gen_random_uuid(),
o.id,
c.id,
'Recycle Challenge',
'Recycle office waste',
120,
'EASY',
FALSE,
CURRENT_DATE + INTERVAL '15 days',
'ACTIVE'

FROM organizations o
JOIN categories c
ON o.id=c.org_id
WHERE c.type='CHALLENGE'
LIMIT 1;

------------------------------------------------------------
-- CARBON TRANSACTIONS
------------------------------------------------------------

INSERT INTO carbon_transactions
(
id,
org_id,
department_id,
emission_factor_id,
source_type,
quantity,
unit,
calculated_co2e,
calculation_mode,
occurred_at
)

SELECT

gen_random_uuid(),

o.id,

d.id,

ef.id,

'MANUFACTURING',

350,

'kWh',

287,

'AUTO',

CURRENT_TIMESTAMP

FROM organizations o
JOIN departments d
ON o.id=d.org_id

JOIN emission_factors ef
ON ef.org_id=o.id

LIMIT 1;

INSERT INTO carbon_transactions
(
id,
org_id,
department_id,
emission_factor_id,
source_type,
quantity,
unit,
calculated_co2e,
calculation_mode,
occurred_at
)

SELECT

gen_random_uuid(),

o.id,

d.id,

ef.id,

'FLEET',

120,

'Litres',

321.6,

'AUTO',

CURRENT_TIMESTAMP

FROM organizations o
JOIN departments d
ON o.id=d.org_id

JOIN emission_factors ef
ON ef.org_id=o.id

OFFSET 1
LIMIT 1;

------------------------------------------------------------
-- AUDITS
------------------------------------------------------------

INSERT INTO audits
(
id,
org_id,
department_id,
title,
auditor_user_id,
audit_date,
findings_summary,
status
)

SELECT

gen_random_uuid(),

o.id,

d.id,

'Quarterly ESG Audit',

u.id,

CURRENT_DATE,

'Overall compliance satisfactory',

'COMPLETED'

FROM organizations o

JOIN departments d
ON d.org_id=o.id

JOIN users u
ON u.org_id=o.id

LIMIT 1;

------------------------------------------------------------
-- COMPLIANCE ISSUES
------------------------------------------------------------

INSERT INTO compliance_issues
(
id,
org_id,
audit_id,
department_id,
owner_user_id,
severity,
description,
due_date,
status
)

SELECT

gen_random_uuid(),

o.id,

a.id,

d.id,

u.id,

'HIGH',

'Waste segregation needs improvement',

CURRENT_DATE + INTERVAL '15 days',

'OPEN'

FROM organizations o

JOIN audits a
ON a.org_id=o.id

JOIN departments d
ON d.org_id=o.id

JOIN users u
ON u.org_id=o.id

LIMIT 1;

-- =========================================================
-- PART 3 - PARTICIPATIONS, GAMIFICATION & REPORTING
-- =========================================================

------------------------------------------------------------
-- POLICY ACKNOWLEDGEMENTS
------------------------------------------------------------

INSERT INTO policy_acknowledgements
(
id,
org_id,
policy_id,
employee_id,
acknowledged_at,
status
)

SELECT
gen_random_uuid(),
o.id,
p.id,
u.id,
CURRENT_TIMESTAMP,
'ACKNOWLEDGED'

FROM organizations o
JOIN esg_policies p
ON p.org_id=o.id
JOIN users u
ON u.org_id=o.id
LIMIT 1;

------------------------------------------------------------
-- EMPLOYEE PARTICIPATIONS
------------------------------------------------------------

INSERT INTO employee_participations
(
id,
org_id,
employee_id,
csr_activity_id,
approval_status,
points_earned,
completion_date,
approved_by,
approved_at
)

SELECT
gen_random_uuid(),
o.id,
u.id,
c.id,
'APPROVED',
100,
CURRENT_DATE,
u.id,
CURRENT_TIMESTAMP

FROM organizations o
JOIN users u
ON u.org_id=o.id
JOIN csr_activities c
ON c.org_id=o.id
LIMIT 1;

------------------------------------------------------------
-- CHALLENGE PARTICIPATIONS
------------------------------------------------------------

INSERT INTO challenge_participations
(
id,
org_id,
challenge_id,
employee_id,
progress_percent,
approval_status,
xp_awarded,
completed_at,
approved_by,
approved_at
)

SELECT
gen_random_uuid(),
o.id,
c.id,
u.id,
100,
'APPROVED',
200,
CURRENT_TIMESTAMP,
u.id,
CURRENT_TIMESTAMP

FROM organizations o
JOIN users u
ON u.org_id=o.id
JOIN challenges c
ON c.org_id=o.id
LIMIT 1;

------------------------------------------------------------
-- POINTS LEDGER
------------------------------------------------------------

INSERT INTO points_ledger
(
id,
org_id,
employee_id,
source_type,
source_id,
points_delta,
reason
)

SELECT
gen_random_uuid(),
o.id,
u.id,
'CSR_ACTIVITY',
gen_random_uuid(),
100,
'Tree Plantation Participation'

FROM organizations o
JOIN users u
ON u.org_id=o.id
LIMIT 1;

INSERT INTO points_ledger
(
id,
org_id,
employee_id,
source_type,
source_id,
points_delta,
reason
)

SELECT
gen_random_uuid(),
o.id,
u.id,
'CHALLENGE',
gen_random_uuid(),
200,
'Cycle To Work Challenge'

FROM organizations o
JOIN users u
ON u.org_id=o.id
LIMIT 1;

------------------------------------------------------------
-- EMPLOYEE BADGES
------------------------------------------------------------

INSERT INTO employee_badges
(
id,
org_id,
employee_id,
badge_id,
reason
)

SELECT
gen_random_uuid(),
o.id,
u.id,
b.id,
'Completed first sustainability challenge'

FROM organizations o
JOIN users u
ON u.org_id=o.id
JOIN badges b
ON b.org_id=o.id
LIMIT 1;

------------------------------------------------------------
-- REWARD REDEMPTIONS
------------------------------------------------------------

INSERT INTO reward_redemptions
(
id,
org_id,
employee_id,
reward_id,
points_spent,
status
)

SELECT
gen_random_uuid(),
o.id,
u.id,
r.id,
250,
'FULFILLED'

FROM organizations o
JOIN users u
ON u.org_id=o.id
JOIN rewards r
ON r.org_id=o.id
LIMIT 1;

------------------------------------------------------------
-- NOTIFICATIONS
------------------------------------------------------------

INSERT INTO notifications
(
id,
org_id,
recipient_user_id,
event_type,
title,
body
)

SELECT
gen_random_uuid(),
o.id,
u.id,
'BADGE_UNLOCKED',
'Congratulations!',
'You unlocked your first ESG badge.'

FROM organizations o
JOIN users u
ON u.org_id=o.id
LIMIT 1;

INSERT INTO notifications
(
id,
org_id,
recipient_user_id,
event_type,
title,
body
)

SELECT
gen_random_uuid(),
o.id,
u.id,
'CSR_APPROVED',
'CSR Activity Approved',
'You earned 100 points.'

FROM organizations o
JOIN users u
ON u.org_id=o.id
LIMIT 1;

------------------------------------------------------------
-- DEPARTMENT SCORES
------------------------------------------------------------

INSERT INTO department_scores
(
id,
org_id,
department_id,
period_start,
period_end,
environmental_score,
social_score,
governance_score,
total_score
)

SELECT
gen_random_uuid(),
o.id,
d.id,
CURRENT_DATE,
CURRENT_DATE + INTERVAL '30 days',
82,
76,
91,
84

FROM organizations o
JOIN departments d
ON d.org_id=o.id
LIMIT 1;