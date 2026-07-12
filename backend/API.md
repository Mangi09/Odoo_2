# EcoSphere ESG Platform API Documentation (Official Schema Version)

EcoSphere consists of two independent Express backend services sharing a single MongoDB database:
1. **BE1 (Environmental + Social)** - Port `3001`
2. **BE2 (Governance + Gamification + Reports)** - Port `3002`

---

## Global Headers & Standards

- **Employee Context**: Most endpoints modifying data require a header to determine the employee context:
  - Header: `x-employee-id` (e.g., `'u-aditi'`)
- **JSON Response Format**: All responses follow a standard envelope:
  ```json
  {
    "success": true | false,
    "data": <any_payload_object_or_array>,
    "error": <error_message_string_if_success_false>
  }
  ```
- **Pagination & Limits**: All `GET` list endpoints support `page` and `limit` query parameters (default `page=1`, `limit=10`).

---

## BE1 — Environmental & Social API (Port 3001)

### Environmental Endpoints

#### `GET /api/environmental/transactions`
Retrieve carbon transactions with pagination, date range filtering, and department filtering.
- **Query Filters**:
  - `page`: Page index (default: 1)
  - `limit`: Items per page (default: 10)
  - `department_id`: Filter transactions by department.
  - `employee_id`: Filter transactions by employee.
  - `activity_type` / `source_type`: Filter by source type.
  - `start_date`, `end_date`: Date range ISO filters (matches `occurred_at`).
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "ct-1",
        "org_id": "org-eco",
        "department_id": "dept-log",
        "source_type": "Fleet",
        "quantity": 120,
        "unit": "liters",
        "emission_factor_id": "ef-fleet",
        "calculated_co2e": 321.6,
        "co2e": 321.6,
        "calculation_mode": "AUTO",
        "occurred_at": "2026-07-10T00:00:00.000Z",
        "created_at": "2026-07-12T10:00:00.000Z"
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 1
  }
  ```

#### `POST /api/environmental/transactions`
Log a carbon transaction. The `calculated_co2e` value is computed server-side (`quantity * emission_factor.co2e_per_unit`).
- **Headers**:
  - `x-employee-id`: Employee ID logging the transaction.
- **Request Body**:
  ```json
  {
    "quantity": 120,
    "activity_type": "Fleet",
    "emission_factor_id": "ef-fleet"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "some-inserted-id",
      "org_id": "org-eco",
      "department_id": "dept-mfg",
      "emission_factor_id": "ef-fleet",
      "source_type": "Fleet",
      "quantity": 120,
      "unit": "liters",
      "calculated_co2e": 321.6,
      "co2e": 321.6,
      "calculation_mode": "MANUAL",
      "occurred_at": "2026-07-12T10:00:00.000Z",
      "created_by": "u-aditi",
      "created_at": "2026-07-12T10:00:00.000Z"
    }
  }
  ```

#### `POST /api/environmental/auto-calculate`
Automatically lookup the emission factor matching `source_type`, compute `calculated_co2e` server-side, and save.
- **Headers**:
  - `x-employee-id`: Employee logging the transaction.
- **Request Body**:
  ```json
  {
    "quantity": 400,
    "source_type": "Manufacturing"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "some-inserted-id",
      "org_id": "org-eco",
      "department_id": "dept-mfg",
      "emission_factor_id": "ef-mfg",
      "source_type": "Manufacturing",
      "quantity": 400,
      "unit": "units",
      "calculated_co2e": 168.0,
      "co2e": 168.0,
      "calculation_mode": "AUTO",
      "occurred_at": "2026-07-12T10:00:00.000Z",
      "created_by": "u-aditi",
      "created_at": "2026-07-12T10:00:00.000Z"
    }
  }
  ```

#### `GET /api/environmental/goals`
List department goals.
- **Query Filters**: `page`, `limit`, `department_id`.
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "goal-1",
        "org_id": "org-eco",
        "department_id": "dept-log",
        "name": "Reduce Fleet Emissions",
        "target_co2e": 500,
        "current_co2e": 390,
        "deadline": "2026-12-31T00:00:00.000Z",
        "status": "ACTIVE"
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 3
  }
  ```

---

### Social Endpoints

#### `GET /api/social/activities`
List available CSR activities.
- **Query Filters**: `page`, `limit`, `category_id`.
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "csr-tree",
        "org_id": "org-eco",
        "category_id": "cat-community",
        "title": "Tree Plantation",
        "description": "Plant trees with the community team.",
        "points": 50,
        "evidence_required": true,
        "status": "OPEN"
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 2
  }
  ```

#### `POST /api/social/activities`
Create a CSR activity. Validates category must correspond to a category of type `CSR_ACTIVITY`.
- **Request Body**:
  ```json
  {
    "title": "Eco Awareness Workshop",
    "description": "Awareness session",
    "category_id": "cat-env",
    "points": 30,
    "evidence_required": false
  }
  ```

#### `POST /api/social/activities/:id/participate`
Join a CSR activity as an employee. Marks participation status as `Pending`.
- **Headers**:
  - `x-employee-id`: Joining Employee User ID.
- **Request Body**:
  ```json
  {
    "proof_url": "https://example.com/tree.jpg"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "some-participation-id",
      "org_id": "org-eco",
      "employee_id": "u-aditi",
      "csr_activity_id": "csr-tree",
      "proof_url": "https://example.com/tree.jpg",
      "proof_file_name": "https://example.com/tree.jpg",
      "approval_status": "Pending",
      "points_earned": 0,
      "completion_date": "2026-07-12T10:00:00.000Z",
      "created_at": "2026-07-12T10:00:00.000Z"
    }
  }
  ```

#### `POST /api/social/participations/:id/approve`
Approves a pending participation.
- **Transaction Flow**:
  1. Checks if activity requires evidence (`evidence_required`). If flagged, validation fails if proof is missing.
  2. Updates status to `Approved`.
  3. Records points in user profile (`points_balance` incremented) and writes points ledger entry.
  4. Evaluates badge unlocks and registers notifications.
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "participation-id",
      "approval_status": "Approved",
      "points_earned": 50
    }
  }
  ```

#### `POST /api/social/participations/:id/reject`
Rejects a pending participation. Marks status to `Rejected` and issues notification. No points ledger adjustments.

---

## BE2 — Governance & Gamification & Reports (Port 3002)

### Governance Endpoints

#### `GET/POST /api/governance/audits`
- **GET**: Lists audits.
- **POST**: Logs a new audit:
  ```json
  {
    "title": "Q2 Waste Audit",
    "department_id": "dept-mfg",
    "auditor_name": "S. Nair",
    "findings_summary": "3 minor issues",
    "status": "Completed"
  }
  ```

#### `GET/POST /api/governance/issues`
- **GET**: Lists compliance issues. Enriches elements with a dynamic `overdue: true/false` field calculated on read if the issue is open and past its due date.
- **POST**: Logs a compliance issue. Validation error occurs if `owner_user_id` or `due_date` is missing.
  ```json
  {
    "title": "Missing MSDS sheets",
    "owner_user_id": "u-riyer",
    "due_date": "2026-07-18T00:00:00.000Z",
    "department_id": "dept-mfg",
    "severity": "High"
  }
  ```

---

### Gamification Endpoints

#### `GET/POST /api/gamification/challenges`
- **GET**: Lists challenges.
- **POST**: Creates a challenge.

#### `PATCH /api/gamification/challenges/:id/status`
Validates challenge state transitions. Only allows progression:
- `DRAFT` ➔ `ACTIVE` ➔ `UNDER_REVIEW` ➔ `COMPLETED`
- At any point, transition to `ARCHIVED` is allowed.
- Returns `400` on invalid state jump.

#### `POST /api/gamification/challenges/:id/participate`
- **Headers**: `x-employee-id`
- **Response**: Registers employee into the challenge (`approval_status: 'Pending'`).

#### `POST /api/gamification/challenges/:id/complete`
Marks a challenge participation as completed.
- **Transaction Flow**:
  1. Validates proof evidence.
  2. Multiplies reward XP based on difficulty: EASY (1x), MEDIUM (1.5x), HARD (2x).
  3. Records XP in user profile (`xp_total`), runs badge evaluation, registers notification, sets status to `Approved`.

#### `GET /api/gamification/leaderboard?scope=org|department`
Retrieve employees sorted descending by XP. Returns users mapped to names, points, XP.

#### `POST /api/gamification/rewards/:id/redeem`
Atomic transaction to redeem a reward.
- **Transaction Flow**:
  1. Decrements stock: `UPDATE rewards SET stock=stock-1 WHERE id=$id AND stock>0`.
  2. Verifies the user's cached `points_balance`.
  3. Deducts points from user (`points_balance` decremented) and writes points ledger entry.
  4. Returns new stock. If either stock decrement or points balance check fails, the transaction rolls back.

---

### Reports & Scores Endpoints

#### `GET /api/reports/esg-summary`
Fetch the environmental, social, governance, and total scores per department.
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "department_id": "dept-mfg",
        "department_name": "Manufacturing",
        "environmental_score": 84,
        "social_score": 78,
        "governance_score": 90,
        "total_score": 84
      }
    ]
  }
  ```

#### `POST /api/scores/recompute`
Recompute scores for departments:
- **Environmental score**: Evaluates department total `calculated_co2e` against the environmental goal target. Defaults to 100 if no goal.
- **Social score**: Computes approved vs total CSR participation rate.
- **Governance score**: Calculates policy acknowledgements rate (`status: 'ACKNOWLEDGED'`) minus open issues penalty (-5 per open issue).
- **Total score**: Weighted sum: `(env_score * env_weight) + (social_score * social_weight) + (governance_score * gov_weight)`.
