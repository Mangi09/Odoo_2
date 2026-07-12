# EcoSphere ESG Platform API Documentation

EcoSphere consists of two independent Express backend services sharing a single MongoDB database:
1. **BE1 (Environmental + Social)** - Port `3001`
2. **BE2 (Governance + Gamification + Reports)** - Port `3002`

---

## Global Headers & Standards

- **Employee Context**: Most endpoints modifying data require a header to determine the employee context:
  - Header: `x-employee-id` (e.g., `64a7c1000000000000000001`)
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
  - `activity_type`: Filter by activity type.
  - `start_date`, `end_date`: Date range ISO filters (matches `timestamp`).
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "64a7c9000000000000000001",
        "employee_id": "64a7c1000000000000000001",
        "quantity": 10,
        "co2e": 1.2,
        "activity_type": "flight",
        "emission_factor_id": "64a7c2000000000000000001",
        "timestamp": "2026-07-12T10:00:00.000Z"
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 1
  }
  ```

#### `POST /api/environmental/transactions`
Log a carbon transaction. The `co2e` value is computed server-side (`quantity * emission_factor.co2e_per_unit`).
- **Headers**:
  - `x-employee-id`: Employee ID logging the transaction.
- **Request Body**:
  ```json
  {
    "quantity": 10,
    "activity_type": "flight",
    "emission_factor_id": "64a7c2000000000000000001"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "64a7c9000000000000000001",
      "employee_id": "64a7c1000000000000000001",
      "quantity": 10,
      "co2e": 1.2,
      "activity_type": "flight",
      "emission_factor_id": "64a7c2000000000000000001",
      "timestamp": "2026-07-12T10:00:00.000Z"
    }
  }
  ```

#### `POST /api/environmental/auto-calculate`
Automatically lookup the emission factor matching `activity_type` + `source_module`, compute `co2e` server-side, and save.
- **Headers**:
  - `x-employee-id`: Employee logging the transaction.
- **Request Body**:
  ```json
  {
    "quantity": 10,
    "activity_type": "flight",
    "source_module": "travel"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "64a7c9500000000000000001",
      "employee_id": "64a7c1000000000000000001",
      "quantity": 10,
      "co2e": 1.2,
      "activity_type": "flight",
      "emission_factor_id": "64a7c2000000000000000001",
      "timestamp": "2026-07-12T10:05:00.000Z",
      "auto_calculated": true
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
        "_id": "64a7c7000000000000000001",
        "department_id": "64a7c0000000000000000001",
        "target_co2e": 100,
        "deadline": "2026-12-31T00:00:00.000Z"
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 1
  }
  ```

---

### Social Endpoints

#### `GET /api/social/activities`
List available CSR activities.
- **Query Filters**: `page`, `limit`, `category`.
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "64a7c3000000000000000001",
        "title": "Tree Planting",
        "description": "Planting trees",
        "category": "CSR_ACTIVITY",
        "points": 50,
        "xp": 100,
        "difficulty": "medium",
        "proof_required": true
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 1
  }
  ```

#### `POST /api/social/activities`
Create a CSR activity. Validates category must be `CSR_ACTIVITY` (fails with 400 otherwise).
- **Request Body**:
  ```json
  {
    "title": "Beach Cleanup",
    "description": "Clean garbage",
    "category": "CSR_ACTIVITY",
    "points": 40,
    "xp": 80,
    "difficulty": "medium",
    "proof_required": false
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "64a7c3500000000000000001",
      "title": "Beach Cleanup",
      "description": "Clean garbage",
      "category": "CSR_ACTIVITY",
      "points": 40,
      "xp": 80,
      "difficulty": "medium",
      "proof_required": false
    }
  }
  ```

#### `POST /api/social/activities/:id/participate`
Join a CSR activity as an employee. Marks participation status as `pending`.
- **Headers**:
  - `x-employee-id`: Joining Employee ID.
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
      "_id": "64a7ca000000000000000001",
      "employee_id": "64a7c1000000000000000001",
      "activity_id": "64a7c3000000000000000001",
      "status": "pending",
      "proof_url": "https://example.com/tree.jpg",
      "points_credited": 0,
      "xp_credited": 0,
      "timestamp": "2026-07-12T10:10:00.000Z"
    }
  }
  ```

#### `POST /api/social/participations/:id/approve`
Approves a pending participation.
- **Transaction Flow (Server-side)**:
  1. Checks if activity requires evidence (`proof_required`). If flagged, validation fails if `proof_url` is missing (400).
  2. Updates status to `approved`.
  3. Records Points and XP using points ledger (`points-ledger.js`) inside transaction context.
  4. Evaluates badge unlocks (`badges.js`) and issues awards.
  5. Inserts an approval notification.
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "64a7ca000000000000000001",
      "status": "approved",
      "points_credited": 50,
      "xp_credited": 100
    }
  }
  ```

#### `POST /api/social/participations/:id/reject`
Rejects a pending participation. Marks status to `rejected` and issues notification. No points/XP ledger adjustments.
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "64a7ca000000000000000001",
      "status": "rejected"
    }
  }
  ```

---

## BE2 — Governance & Gamification & Reports (Port 3002)

### Governance Endpoints

#### `GET/POST /api/governance/audits`
- **GET**: Lists audits. Filters: `department_id`, pagination.
- **POST**: Logs a new audit:
  ```json
  {
    "title": "Q3 Social Compliance Audit",
    "department_id": "64a7c0000000000000000001",
    "status": "completed",
    "findings": "All clear."
  }
  ```

#### `GET/POST /api/governance/issues`
- **GET**: Lists compliance issues. Enriches elements with a dynamic `overdue: true/false` field calculated on read if the issue is `status === 'open'` and `due_date` is in the past.
- **POST**: Logs a compliance issue. Validation error (400) occurs if `owner_id` or `due_date` is missing.
  ```json
  {
    "title": "Replace non-biodegradable plastics",
    "owner_id": "64a7c1000000000000000001",
    "due_date": "2026-07-20T00:00:00.000Z"
  }
  ```

---

### Gamification Endpoints

#### `GET/POST /api/gamification/challenges`
- **GET**: Lists challenges. Filters: `status`, pagination.
- **POST**: Creates a challenge in `draft` status:
  ```json
  {
    "title": "Plastic Free Week",
    "description": "Zero single-use plastic",
    "base_xp": 100,
    "points": 50,
    "difficulty": "medium"
  }
  ```

#### `PATCH /api/gamification/challenges/:id/status`
Validates challenge state transitions. Only allows progression:
- `draft` ➔ `active` ➔ `under_review` ➔ `completed`
- At any point, transition to `archived` is allowed.
- Returns `400` on invalid state jump (e.g. `active` to `draft`).
- **Request Body**:
  ```json
  { "status": "active" }
  ```

#### `POST /api/gamification/challenges/:id/participate`
- **Headers**: `x-employee-id`
- **Response**: Registers employee into the challenge (`status: 'joined'`).

#### `POST /api/gamification/challenges/:id/complete`
Marks a joined challenge as completed.
- **Transaction Flow (Server-side)**:
  1. Validates proof evidence.
  2. Multiplies reward XP based on difficulty:
     - `easy`: `base_xp * 1.0`
     - `medium`: `base_xp * 1.5`
     - `hard`: `base_xp * 2.0`
  3. Records Points/XP in ledger transaction, runs badge check, registers notification, sets status to `completed`.

#### `GET /api/gamification/leaderboard?scope=org|department`
Retrieve employees sorted descending by XP.
- **Query parameters**:
  - `scope`: `org` (entire platform) or `department` (specific department)
  - `department_id`: Required if `scope=department`
- **Response**: Sorted array of employee names, points, XP.

#### `POST /api/gamification/rewards/:id/redeem`
Atomic transaction to redeem a reward.
- **Transaction Flow (Server-side)**:
  1. Updates reward stock: `UPDATE rewards SET stock=stock-1 WHERE id=$id AND stock>0`.
  2. Verifies the employee's cached points balance.
  3. Deducts points from employee (`recordPointsTransaction`) inside points-ledger.
  4. Returns new stock. If *either* stock decrement or points balance check fails, the transaction rolls back both.

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
        "department_id": "64a7c0000000000000000001",
        "department_name": "Engineering",
        "env_score": 100,
        "social_score": 100,
        "governance_score": 95,
        "total_score": 98.5
      }
    ]
  }
  ```

#### `POST /api/scores/recompute`
Recompute score cached documents in database:
- **Environmental score**: Evaluates department total co2e against the environmental goal target. Defaults to 100 if no goal target.
- **Social score**: Computes approved vs total CSR participation rate.
- **Governance score**: Calculates compliance issues resolved rate, applying a -5 penalty per open issue.
- **Total score**: Weighted sum: `(env_score * env_weight) + (social_score * social_weight) + (governance_score * gov_weight)`.
