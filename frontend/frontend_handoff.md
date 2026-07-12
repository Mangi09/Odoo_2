# EcoSphere Frontend Handoff Document

This document serves as a comprehensive guide for backend developers integrating with the EcoSphere frontend MVP. It details the application architecture, user flows, mock data schemas, and expected REST API endpoints required to transition the frontend from static mock data to dynamic server-side functionality.

---

## 1. Application Overview & User Flow

EcoSphere is a B2B SaaS Enterprise ESG (Environmental, Social, and Governance) Management Platform. It enables organizations to track carbon emissions, manage CSR (Corporate Social Responsibility) initiatives, engage employees through gamification, handle compliance audits, and generate investor-ready reports.

**Core User Flow:**
1. **Landing Page**: Unauthenticated users land here. They can view the platform's value proposition and click "Get Started" or "Sign In".
2. **Authentication Gateway**: Users are presented with a Login or Sign Up form. Successful authentication sets a global state and routes the user to the Dashboard.
3. **Dashboard Pages**: Once authenticated, the user accesses a unified layout (`DashboardLayout`) featuring a persistent sidebar and header. Navigation between modules happens client-side without page reloads.

**Navigation Structure:**
- `/` -> `Landing` -> `Auth`
- Dashboard Routes (Controlled by `activePage` state):
  - `Dashboard` (Home overview)
  - `Environmental` (Carbon tracking)
  - `Social` (CSR management)
  - `Gamification` (Challenges & Rewards)
  - `Governance` (Audits & Policies)
  - `Reports` (Generation & Exports)
  - `Settings` (Org Config & Master Data)
  - `Notifications` (Inbox)
  - `Profile` (User stats & history)

---

## 2. Authentication & Authorization

Currently, authentication is simulated client-side. The backend must implement a robust authentication strategy (e.g., JWT via HTTP-only cookies).

- **Roles**: `Employee`, `Manager`, `Admin`.
- **Expected Flow**:
  - `POST /api/auth/login` -> Returns JWT or sets session cookie.
  - `POST /api/auth/signup` -> Creates organization/user and returns auth token.
  - `GET /api/auth/me` -> Validates session and returns `UserProfile` and `Permissions`.
- **Access Control**: The frontend currently assumes Admin access for all actions (e.g., approving CSR requests, creating departments). The backend must enforce role-based access control (RBAC) on all mutable endpoints.

---

## 3. Global State & Data Flow

- The application currently uses React `useState` and passing props for state management.
- Mock data is localized in the `src/data/` folder.
- **Integration Note**: To integrate APIs, frontend developers will likely replace the localized `useState` hooks with data-fetching libraries (e.g., React Query or RTK Query) to handle loading, error, and caching states automatically based on the endpoints defined below.

---

## 4. Module Specifications & API Requirements

### 4.1. Dashboard (Home)

**Purpose:** Provide an aggregated executive summary of ESG performance.

**UI Sections & Data:**
- **Summary Cards**: ESG Score, Carbon Offset, Active Goals, Volunteer Hours.
- **Carbon Trend Chart**: Line chart showing emissions over time.
- **Recent Activities Widget**: Feed of organizational events.
- **Upcoming Deadlines**: List of pending audits/goals.

**Expected Endpoints:**
- `GET /api/dashboard/summary` 
- `GET /api/dashboard/emissions-trend` (Accepts `?range=6M|1Y`)
- `GET /api/dashboard/activities`
- `GET /api/dashboard/deadlines`

### 4.2. Environmental

**Purpose:** Monitor carbon emissions and sustainability goals.

**UI Sections & Interactions:**
- **Carbon Transactions Table**: Lists emission logs. Includes Search and Status Filter (Pending/Verified).
- **Environmental Goals Table**: Shows target vs current progress.
- **Action**: "Auto Calculate Emission" simulates a backend calculation, injecting a new transaction and updating goals.

**Expected Endpoints:**
- `GET /api/environmental/transactions` (Accepts `?search=...&status=...`)
- `GET /api/environmental/goals`
- `POST /api/environmental/calculate` -> Triggers calculation engine, returns updated summary metrics and new transaction object.

### 4.3. Social

**Purpose:** Manage CSR activities and employee volunteering.

**UI Sections & Interactions:**
- **CSR Activity Cards**: Browse open/ongoing initiatives.
  - **Action**: "Join Now" (creates a pending participation record).
- **Employee Participation Table**: Admins view logs submitted by users.
  - **Action**: "Approve" (awards points to user, updates status to Approved).

**Expected Endpoints:**
- `GET /api/social/activities`
- `POST /api/social/activities/:id/join`
- `GET /api/social/participations`
- `POST /api/social/participations/:id/approve`
- `POST /api/social/participations/:id/reject`

### 4.4. Gamification

**Purpose:** Drive engagement through challenges, XP, badges, and rewards.

**UI Sections & Interactions:**
- **Active Challenges**: List of available quests.
  - **Action**: "Complete" (awards XP, checks for badge unlocks).
- **Badge Gallery**: Grid of locked/unlocked badges.
- **Leaderboard**: Ranked list of users (Toggle: Employees vs Departments).
- **Rewards Catalog**: Items purchasable with Points.
  - **Action**: "Redeem" (deducts points, logs redemption).

**Expected Endpoints:**
- `GET /api/gamification/challenges`
- `POST /api/gamification/challenges/:id/complete`
- `GET /api/gamification/badges` (Returns user's unlock status)
- `GET /api/gamification/leaderboard` (Accepts `?type=employee|department`)
- `GET /api/gamification/rewards`
- `POST /api/gamification/rewards/:id/redeem`

### 4.5. Governance

**Purpose:** Manage policies, audits, and compliance tracking.

**UI Sections & Interactions:**
- **Audits Table**: Upcoming and past audits.
- **Compliance Issues Table**: Log of flagged risks.
  - **Action**: "Resolve Issue" (updates status to Resolved, recalculates metrics).
  - **Action**: "Report Issue" (creates a new high-severity issue).
- **ESG Policies**: List of mandatory documents.
  - **Action**: "Acknowledge" (marks policy as read for the user).

**Expected Endpoints:**
- `GET /api/governance/audits`
- `GET /api/governance/issues`
- `POST /api/governance/issues` (Payload: `{ title, severity, category }`)
- `PATCH /api/governance/issues/:id` (Payload: `{ status: 'Resolved' }`)
- `GET /api/governance/policies`
- `POST /api/governance/policies/:id/acknowledge`

### 4.6. Reports

**Purpose:** Generate and export custom ESG insights.

**UI Sections & Interactions:**
- **Custom Report Builder Form**: Filters by Module, Department, Format, Date Range.
  - **Action**: "Generate Report" (simulates async generation, adds to history).
- **Report History Table**: Log of generated reports with download links.

**Expected Endpoints:**
- `POST /api/reports/generate` (Payload: `{ module, departmentId, format, dateRange }`) -> Initiates async job or returns immediate file stream/URL.
- `GET /api/reports/history`
- `GET /api/reports/download/:id`

### 4.7. Settings

**Purpose:** Organization configuration and Master Data Management.

**UI Sections & Interactions:**
- **Configuration Toggles**: E.g., Auto Emission Calc, System Alerts.
  - **Action**: Toggle changes state immediately (optimistic UI).
- **Departments Management**: CRUD table.
  - **Action**: "Add" / "Delete".
- **Categories Management**: CRUD table for ESG pillars.
  - **Action**: "Add" / "Delete".

**Expected Endpoints:**
- `GET /api/settings/config`
- `PATCH /api/settings/config` (Payload: `{ key: value }`)
- `GET /api/departments`
- `POST /api/departments`
- `DELETE /api/departments/:id`
- `GET /api/categories`
- `POST /api/categories`
- `DELETE /api/categories/:id`

### 4.8. Notifications

**Purpose:** Centralized user inbox.

**UI Sections & Interactions:**
- **Filter & Search**: Pills by type (Environmental, Gamification, etc.) and text search.
- **Notification List**: Grouped by Today, Yesterday, Earlier.
  - **Action**: "Mark as Read" (single item).
  - **Action**: "Mark All as Read".

**Expected Endpoints:**
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `POST /api/notifications/read-all`

### 4.9. Profile

**Purpose:** Personalized user view of impact and history.

**UI Sections & Interactions:**
- **User Identity Card**: Name, role, department.
- **Top Metrics**: Total XP, Badges, CSR Events.
- **Activity History**: Filterable timeline of all actions taken.

**Expected Endpoints:**
- `GET /api/profile/me` (Returns aggregated stats and info)
- `GET /api/profile/history` (Accepts `?type=Challenge|CSR|Reward`)

---

## 5. Shared Data Types (TypeScript Interfaces)

The frontend relies heavily on strict typings. Below are key examples of payloads expected by the frontend. (Refer to `src/types/*.ts` in the repository for the exhaustive list).

```typescript
// Shared Types
export type ESGPillar = 'Environmental' | 'Social' | 'Governance';
export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type Status = 'Pending' | 'Active' | 'Completed' | 'Resolved' | 'Overdue';

// Example: Transaction Object
export interface CarbonTransaction {
  id: string;
  date: string;
  source: string;
  category: string;
  amount: number; // tCO2e
  status: 'Verified' | 'Pending' | 'Flagged';
  department: string;
}

// Example: Challenge Object
export interface GameChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  type: ESGPillar;
  deadline: string;
  participants: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isActive: boolean;
  userStatus?: 'NotStarted' | 'InProgress' | 'Completed';
}
```

---

## 6. Error Handling & Edge Cases

The backend should adhere to standard RESTful HTTP status codes:
- **200 OK / 201 Created**: Standard success. Frontend expects JSON payload.
- **400 Bad Request**: Validation errors. Should return `{ error: "Message", fields: { email: "Invalid" } }`.
- **401 Unauthorized**: Token expired. Frontend should intercept and redirect to Auth gateway.
- **403 Forbidden**: User lacks RBAC permissions (e.g. Employee trying to approve CSR).
- **500 Internal Error**: Generic fallback.

**Empty States:**
When collections are empty (e.g., 0 notifications, 0 transactions), APIs should return an empty array `[]` rather than `404` or `null`. The frontend has dedicated empty-state UI components that trigger on `.length === 0`.

---

## 7. Implementation Checklist for Backend

- [ ] **Database Schema**: Design relational/NoSQL schema mapping to the `src/types` definitions.
- [ ] **Authentication**: Implement JWT flow for Login/Signup.
- [ ] **RBAC**: Implement middleware to restrict admin actions (Settings, Approvals, Issue generation).
- [ ] **Dashboard API**: Implement data aggregation endpoints for top-level summaries.
- [ ] **CRUD Operations**: Implement standard CRUD for Transactions, CSR Events, Audits, Issues.
- [ ] **Gamification Engine**: Implement logic to award XP upon challenge completion and trigger badge unlocks if thresholds are met.
- [ ] **Reporting Engine**: Implement background job or PDF generation service for the Reports module.
- [ ] **Master Data APIs**: Expose endpoints for dynamic dropdowns (Departments, Categories).
