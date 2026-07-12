-- =====================================================
-- EcoSphere Views
-- =====================================================

--------------------------------------------------------
-- Dashboard Summary
--------------------------------------------------------

CREATE OR REPLACE VIEW vw_dashboard_summary AS
SELECT
AVG(environmental_score) AS environmental_score,
AVG(social_score) AS social_score,
AVG(governance_score) AS governance_score,
AVG(total_score) AS overall_esg_score
FROM department_scores;


--------------------------------------------------------
-- Department Scores
--------------------------------------------------------

CREATE OR REPLACE VIEW vw_department_scores AS
SELECT

d.name AS department,

ds.environmental_score,

ds.social_score,

ds.governance_score,

ds.total_score

FROM department_scores ds

JOIN departments d

ON ds.department_id=d.id;


--------------------------------------------------------
-- Employee Leaderboard
--------------------------------------------------------

CREATE OR REPLACE VIEW vw_leaderboard AS

SELECT

u.full_name,

u.points_balance,

u.xp_total,

COUNT(eb.id) AS badges

FROM users u

LEFT JOIN employee_badges eb

ON eb.employee_id=u.id

GROUP BY

u.id,

u.full_name,

u.points_balance,

u.xp_total

ORDER BY

points_balance DESC,

xp_total DESC;


--------------------------------------------------------
-- Recent Notifications
--------------------------------------------------------

CREATE OR REPLACE VIEW vw_recent_activity AS

SELECT

title,

body,

event_type,

created_at

FROM notifications

ORDER BY created_at DESC;


--------------------------------------------------------
-- ESG Summary
--------------------------------------------------------

CREATE OR REPLACE VIEW vw_esg_summary AS

SELECT

d.name,

ds.environmental_score,

ds.social_score,

ds.governance_score,

ds.total_score

FROM department_scores ds

JOIN departments d

ON ds.department_id=d.id;