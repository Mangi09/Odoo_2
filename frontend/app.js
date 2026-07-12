const STORAGE_KEY = "ecosphere-demo-state-v1";
const TODAY = "2026-07-12";

const seedState = {
  settings: {
    autoEmission: true,
    evidenceRequired: true,
    autoBadge: true,
    complianceAlerts: true
  },
  currentUser: {
    id: "u-aditi",
    name: "Aditi Rao",
    department: "Manufacturing"
  },
  scores: {
    environmental: 82,
    social: 74,
    governance: 88,
    overall: 81
  },
  departments: [
    { id: "dept-mfg", name: "Manufacturing", code: "MFG", head: "S. Nair", parent: "-", employees: 134, status: "Active" },
    { id: "dept-log", name: "Logistics", code: "LOG", head: "R. Iyer", parent: "Manufacturing", employees: 58, status: "Active" },
    { id: "dept-cor", name: "Corporate", code: "COR", head: "A. Mehta", parent: "-", employees: 41, status: "Active" },
    { id: "dept-rnd", name: "R&D", code: "RND", head: "P. Desai", parent: "-", employees: 36, status: "Active" }
  ],
  emissionsTrend: [
    { month: "Aug", co2e: 68 },
    { month: "Sep", co2e: 72 },
    { month: "Oct", co2e: 66 },
    { month: "Nov", co2e: 58 },
    { month: "Dec", co2e: 61 },
    { month: "Jan", co2e: 55 },
    { month: "Feb", co2e: 50 },
    { month: "Mar", co2e: 48 },
    { month: "Apr", co2e: 44 },
    { month: "May", co2e: 41 },
    { month: "Jun", co2e: 39 },
    { month: "Jul", co2e: 37 }
  ],
  departmentRanking: [
    { name: "Manufacturing", score: 86 },
    { name: "Corporate", score: 82 },
    { name: "Logistics", score: 78 },
    { name: "R&D", score: 75 }
  ],
  recentActivity: [
    { text: "Karan Shah completed ESG Workshop", type: "Social", time: "Today" },
    { text: "New compliance issue opened in Manufacturing", type: "Governance", time: "Today" },
    { text: "42 carbon transactions imported from fleet data", type: "Environmental", time: "Yesterday" },
    { text: "R&D acknowledged Anti-Corruption Policy", type: "Governance", time: "Yesterday" }
  ],
  notifications: [
    { title: "Compliance issue opened", body: "Missing MSDS sheets assigned to R. Iyer.", read: false },
    { title: "CSR approval pending", body: "Aditi Rao submitted proof for Tree Plantation.", read: false }
  ],
  emissionFactors: [
    { sourceType: "Fleet", unit: "liters", co2ePerUnit: 2.68 },
    { sourceType: "Manufacturing", unit: "units", co2ePerUnit: 0.42 },
    { sourceType: "Expense", unit: "usd", co2ePerUnit: 0.08 },
    { sourceType: "Purchase", unit: "kg", co2ePerUnit: 1.15 }
  ],
  carbonTransactions: [
    { id: "ct-1", department: "Logistics", sourceType: "Fleet", quantity: 120, unit: "liters", co2e: 321.6, date: "2026-07-10" },
    { id: "ct-2", department: "Manufacturing", sourceType: "Manufacturing", quantity: 400, unit: "units", co2e: 168, date: "2026-07-09" },
    { id: "ct-3", department: "Corporate", sourceType: "Expense", quantity: 900, unit: "usd", co2e: 72, date: "2026-07-08" }
  ],
  environmentalGoals: [
    { name: "Reduce Fleet Emissions", department: "Logistics", target: 500, current: 390, deadline: "2026-12-31", status: "Active" },
    { name: "Cut Packaging Waste", department: "Manufacturing", target: 120, current: 98, deadline: "2026-09-30", status: "On Track" },
    { name: "Office Energy Cut", department: "Corporate", target: 80, current: 80, deadline: "2026-06-30", status: "Completed" }
  ],
  csrActivities: [
    { id: "csr-tree", title: "Tree Plantation", category: "Community", joined: 24, points: 50, evidenceRequired: true, status: "Open" },
    { id: "csr-blood", title: "Blood Donation", category: "Health", joined: 18, points: 50, evidenceRequired: true, status: "Open" },
    { id: "csr-beach", title: "Beach Cleanup", category: "Environment", joined: 31, points: 40, evidenceRequired: false, status: "Open" },
    { id: "csr-workshop", title: "ESG Workshop", category: "Training", joined: 52, points: 30, evidenceRequired: false, status: "Open" }
  ],
  participations: [
    { id: "part-1", employee: "Aditi Rao", activity: "Tree Plantation", proof: "photo.jpg", points: 50, status: "Pending" },
    { id: "part-2", employee: "Karan Shah", activity: "ESG Workshop", proof: "cert.pdf", points: 30, status: "Approved" }
  ],
  audits: [
    { title: "Q2 Waste Audit", department: "Manufacturing", auditor: "S. Nair", date: "2026-06-12", findings: "3 minor issues", status: "Completed" },
    { title: "Vendor Compliance Check", department: "Procurement", auditor: "R. Iyer", date: "2026-07-01", findings: "1 open issue", status: "Under Review" }
  ],
  complianceIssues: [
    { id: "issue-1", issue: "Missing MSDS sheets", severity: "High", department: "Manufacturing", owner: "R. Iyer", dueDate: "2026-07-18", status: "Open" },
    { id: "issue-2", issue: "Late vendor disclosure", severity: "Medium", department: "Procurement", owner: "A. Mehta", dueDate: "2026-07-02", status: "Resolved" }
  ],
  challenges: [
    { id: "ch-sprint", title: "Sustainability Sprint", xp: 200, difficulty: "Hard", deadline: "2026-07-20", status: "Active", joined: false, completed: false },
    { id: "ch-recycle", title: "Recycle Challenge", xp: 80, difficulty: "Easy", deadline: "2026-07-15", status: "Active", joined: true, completed: false },
    { id: "ch-commute", title: "Commute Green Week", xp: 120, difficulty: "Medium", deadline: "2026-07-25", status: "Draft", joined: false, completed: false }
  ],
  badges: [
    { name: "Green Beginner", rule: "First approved activity", unlocked: false },
    { name: "Carbon Saver", rule: "Earn 500 ESG points", unlocked: true },
    { name: "Sustainability Champion", rule: "Complete a hard challenge", unlocked: false },
    { name: "Team Player", rule: "Join 3 CSR activities", unlocked: false }
  ],
  rewards: [
    { id: "rw-kit", name: "Reusable Kit", points: 120, stock: 8 },
    { id: "rw-voucher", name: "Eco Voucher", points: 500, stock: 3 },
    { id: "rw-donation", name: "Donation Credit", points: 250, stock: 5 }
  ],
  employeePoints: 3910,
  leaderboard: [
    { name: "Manufacturing Dept", xp: 4820 },
    { name: "Aditi Rao", xp: 3910 },
    { name: "Corporate Dept", xp: 3505 },
    { name: "Karan Shah", xp: 2380 }
  ]
};

let state = loadState();
let currentRoute = "dashboard";

const app = document.querySelector("#app");
const title = document.querySelector("#page-title");
const toast = document.querySelector("#toast");
const navList = document.querySelector("#nav-list");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : clone(seedState);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetState() {
  state = clone(seedState);
  saveState();
  showToast("Demo data reset.");
  render();
}

function showToast(message) {
  toast.textContent = message;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.textContent = "";
  }, 3500);
}

function statusClass(status) {
  const clean = String(status).toLowerCase();
  if (clean.includes("approved") || clean.includes("active") || clean.includes("completed") || clean.includes("resolved")) return "approved";
  if (clean.includes("pending") || clean.includes("review") || clean.includes("track")) return "pending";
  if (clean.includes("open") || clean.includes("high") || clean.includes("rejected")) return "open";
  return "";
}

function addActivity(text, type) {
  state.recentActivity.unshift({ text, type, time: "Just now" });
  state.recentActivity = state.recentActivity.slice(0, 8);
}

function addNotification(titleText, body) {
  state.notifications.unshift({ title: titleText, body, read: false });
}

function updateHeader() {
  document.querySelector("#notification-count").textContent = `${state.notifications.filter((item) => !item.read).length} notifications`;
  document.querySelector("#points-balance").textContent = state.employeePoints.toLocaleString();
  [...navList.querySelectorAll("button")].forEach((button) => {
    const isCurrent = button.dataset.route === currentRoute;
    button.toggleAttribute("aria-current", isCurrent);
    if (isCurrent) button.setAttribute("aria-current", "page");
  });
}

function setRoute(route) {
  currentRoute = route;
  render();
  app.focus();
}

function render() {
  const labels = {
    dashboard: "Dashboard",
    settings: "Settings",
    environmental: "Environmental",
    social: "Social",
    governance: "Governance",
    gamification: "Gamification",
    reports: "Reports"
  };

  title.textContent = labels[currentRoute];
  updateHeader();

  const renderers = {
    dashboard: renderDashboard,
    settings: renderSettings,
    environmental: renderEnvironmental,
    social: renderSocial,
    governance: renderGovernance,
    gamification: renderGamification,
    reports: renderReports
  };

  app.innerHTML = renderers[currentRoute]();
}

function renderDashboard() {
  const maxEmission = Math.max(...state.emissionsTrend.map((item) => item.co2e));
  return `
    <section class="grid four" aria-label="ESG score summary">
      ${scoreCard("Environmental", state.scores.environmental, "Carbon and goals", "environmental")}
      ${scoreCard("Social", state.scores.social, "CSR and engagement", "social")}
      ${scoreCard("Governance", state.scores.governance, "Policies and risk", "governance")}
      ${scoreCard("Overall ESG", state.scores.overall, "Weighted score", "overall")}
    </section>

    <section class="grid two">
      <div class="panel">
        <div class="card-title">
          <div>
            <h2>Emissions Trend</h2>
            <p class="muted">Last 12 months, CO2e estimate</p>
          </div>
          <span class="pill strong">Down 18%</span>
        </div>
        <div class="chart-bars" aria-label="Monthly emissions bar chart">
          ${state.emissionsTrend.map((item) => `
            <div class="bar-wrap">
              <div class="bar" style="height:${Math.max(12, Math.round((item.co2e / maxEmission) * 150))}px" title="${item.month}: ${item.co2e} t CO2e"></div>
              <span class="bar-label">${item.month}</span>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="panel">
        <h2>Department ESG Ranking</h2>
        ${state.departmentRanking.map((dept, index) => `
          <div class="ranking-row">
            <div>
              <strong>${index + 1}. ${dept.name}</strong>
              <div class="progress" aria-label="${dept.name} score ${dept.score}">
                <span style="width:${dept.score}%"></span>
              </div>
            </div>
            <span class="pill strong">${dept.score}</span>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="grid two">
      <div class="panel">
        <h2>Recent Activity</h2>
        ${state.recentActivity.map((item) => `
          <div class="activity-row">
            <div>
              <strong>${item.text}</strong>
              <p class="muted">${item.type}</p>
            </div>
            <span class="pill">${item.time}</span>
          </div>
        `).join("")}
      </div>

      <div class="panel">
        <h2>Quick Actions</h2>
        <div class="actions">
          <button class="primary" type="button" data-action="sample-carbon">Auto Carbon Demo</button>
          <button class="secondary" type="button" data-route="social">Open Approval Queue</button>
          <button class="secondary" type="button" data-route="reports">View Reports</button>
        </div>
        <hr>
        <h3>Notifications</h3>
        ${state.notifications.slice(0, 4).map((item) => `
          <div class="notification-row">
            <div>
              <strong>${item.title}</strong>
              <p class="muted">${item.body}</p>
            </div>
            <span class="status ${item.read ? "" : "pending"}">${item.read ? "Read" : "New"}</span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function scoreCard(label, value, meta, className) {
  return `
    <article class="panel score-card ${className}">
      <span class="muted">${label}</span>
      <strong class="score-value">${value}/100</strong>
      <span class="score-meta">${meta}</span>
    </article>
  `;
}

function renderSettings() {
  return `
    <section class="grid two">
      <div class="panel">
        <h2>Departments</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Code</th><th>Head</th><th>Parent</th><th>Employees</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${state.departments.map((dept) => `
                <tr>
                  <td>${dept.name}</td>
                  <td>${dept.code}</td>
                  <td>${dept.head}</td>
                  <td>${dept.parent}</td>
                  <td>${dept.employees}</td>
                  <td><span class="status active">${dept.status}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <h2>ESG Configuration</h2>
        ${toggleRow("autoEmission", "Enable auto emission calculation", "Carbon records are calculated from fleet, purchase, manufacturing, and expense data.")}
        ${toggleRow("evidenceRequired", "Require evidence for CSR approval", "Managers cannot approve proof-required activities without a file.")}
        ${toggleRow("autoBadge", "Auto-award badges", "Employees receive badges when XP or challenge rules are met.")}
        ${toggleRow("complianceAlerts", "Notification alerts", "Create alerts for compliance issues, approvals, reminders, and badge unlocks.")}
      </div>
    </section>
  `;
}

function toggleRow(key, label, help) {
  return `
    <div class="toggle-row">
      <div>
        <strong>${label}</strong>
        <p class="muted">${help}</p>
      </div>
      <button class="switch" type="button" data-action="toggle-setting" data-key="${key}" aria-label="${label}" aria-pressed="${state.settings[key]}"></button>
    </div>
  `;
}

function renderEnvironmental() {
  return `
    <section class="panel">
      <div class="card-title">
        <div>
          <h2>Auto Carbon Calculation</h2>
          <p class="muted">Demo how business data becomes a carbon transaction.</p>
        </div>
        <span class="pill ${state.settings.autoEmission ? "strong" : ""}">${state.settings.autoEmission ? "Auto enabled" : "Auto disabled"}</span>
      </div>

      <form class="form-grid" data-form="carbon">
        <div class="field">
          <label for="carbon-department">Department</label>
          <select id="carbon-department" name="department">
            ${state.departments.map((dept) => `<option>${dept.name}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="carbon-source">Source type</label>
          <select id="carbon-source" name="sourceType">
            ${state.emissionFactors.map((factor) => `<option>${factor.sourceType}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="carbon-quantity">Quantity</label>
          <input id="carbon-quantity" name="quantity" type="number" min="1" value="100">
        </div>
        <button class="primary" type="submit">Create Carbon Transaction</button>
      </form>
    </section>

    <section class="grid two">
      <div class="panel">
        <h2>Environmental Goals</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Department</th><th>Target CO2e</th><th>Current</th><th>Progress</th><th>Deadline</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${state.environmentalGoals.map((goal) => {
                const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
                return `
                  <tr>
                    <td>${goal.name}</td>
                    <td>${goal.department}</td>
                    <td>${goal.target} t</td>
                    <td>${goal.current.toFixed(1)} t</td>
                    <td>
                      <div class="progress"><span style="width:${progress}%"></span></div>
                      <span class="muted">${progress}%</span>
                    </td>
                    <td>${goal.deadline}</td>
                    <td><span class="status ${statusClass(goal.status)}">${goal.status}</span></td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <h2>Carbon Transactions</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Department</th><th>Source</th><th>Quantity</th><th>CO2e</th></tr>
            </thead>
            <tbody>
              ${state.carbonTransactions.map((tx) => `
                <tr>
                  <td>${tx.date}</td>
                  <td>${tx.department}</td>
                  <td>${tx.sourceType}</td>
                  <td>${tx.quantity} ${tx.unit}</td>
                  <td>${tx.co2e.toFixed(1)} kg</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function renderSocial() {
  return `
    <section class="grid two">
      <div class="panel">
        <h2>CSR Activities</h2>
        <div class="card-list">
          ${state.csrActivities.map((activity) => `
            <article class="mini-card">
              <div class="card-title">
                <div>
                  <strong>${activity.title}</strong>
                  <p class="muted">${activity.category} - ${activity.joined} joined</p>
                </div>
                <span class="status ${statusClass(activity.status)}">${activity.status}</span>
              </div>
              <p>${activity.points} points ${activity.evidenceRequired ? "- evidence required" : "- no proof needed"}</p>
              <button class="secondary" type="button" data-action="join-csr" data-id="${activity.id}">Join Activity</button>
            </article>
          `).join("")}
        </div>
      </div>

      <div class="panel">
        <h2>Employee Participation Approval</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Employee</th><th>Activity</th><th>Proof</th><th>Points</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${state.participations.map((row) => `
                <tr>
                  <td>${row.employee}</td>
                  <td>${row.activity}</td>
                  <td>${row.proof || "-"}</td>
                  <td>${row.points}</td>
                  <td><span class="status ${statusClass(row.status)}">${row.status}</span></td>
                  <td>
                    ${row.status === "Pending"
                      ? `<button class="primary" type="button" data-action="approve-participation" data-id="${row.id}">Approve</button>`
                      : `<span class="muted">Done</span>`}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function renderGovernance() {
  return `
    <section class="panel">
      <h2>Create Compliance Issue</h2>
      <form class="form-grid" data-form="issue">
        <div class="field">
          <label for="issue-text">Issue</label>
          <input id="issue-text" name="issue" required value="Expired safety certificate">
        </div>
        <div class="field">
          <label for="issue-severity">Severity</label>
          <select id="issue-severity" name="severity">
            <option>Low</option>
            <option>Medium</option>
            <option selected>High</option>
            <option>Critical</option>
          </select>
        </div>
        <div class="field">
          <label for="issue-owner">Owner</label>
          <input id="issue-owner" name="owner" required value="R. Iyer">
        </div>
        <div class="field">
          <label for="issue-due">Due date</label>
          <input id="issue-due" name="dueDate" type="date" required value="2026-07-25">
        </div>
        <button class="primary" type="submit">Create Issue</button>
      </form>
    </section>

    <section class="grid two">
      <div class="panel">
        <h2>Audits</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Title</th><th>Department</th><th>Auditor</th><th>Date</th><th>Findings</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${state.audits.map((audit) => `
                <tr>
                  <td>${audit.title}</td>
                  <td>${audit.department}</td>
                  <td>${audit.auditor}</td>
                  <td>${audit.date}</td>
                  <td>${audit.findings}</td>
                  <td><span class="status ${statusClass(audit.status)}">${audit.status}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <h2>Compliance Issues</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Issue</th><th>Severity</th><th>Department</th><th>Owner</th><th>Due</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${state.complianceIssues.map((issue) => `
                <tr>
                  <td>${issue.issue}</td>
                  <td><span class="status ${statusClass(issue.severity)}">${issue.severity}</span></td>
                  <td>${issue.department}</td>
                  <td>${issue.owner}</td>
                  <td>${issue.dueDate}</td>
                  <td><span class="status ${statusClass(issue.status)}">${issue.status}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function renderGamification() {
  return `
    <section class="grid three">
      <div class="panel">
        <h2>Challenges</h2>
        <div class="card-list">
          ${state.challenges.map((challenge) => `
            <article class="mini-card">
              <div class="card-title">
                <div>
                  <strong>${challenge.title}</strong>
                  <p class="muted">${challenge.xp} XP - ${challenge.difficulty} - deadline ${challenge.deadline}</p>
                </div>
                <span class="status ${statusClass(challenge.status)}">${challenge.status}</span>
              </div>
              <div class="actions">
                <button class="secondary" type="button" data-action="join-challenge" data-id="${challenge.id}" ${challenge.joined || challenge.status !== "Active" ? "disabled" : ""}>Join</button>
                <button class="primary" type="button" data-action="complete-challenge" data-id="${challenge.id}" ${!challenge.joined || challenge.completed ? "disabled" : ""}>Complete</button>
              </div>
            </article>
          `).join("")}
        </div>
      </div>

      <div class="panel">
        <h2>Badge Gallery</h2>
        <div class="card-list">
          ${state.badges.map((badge) => `
            <article class="mini-card">
              <strong>${badge.name}</strong>
              <p class="muted">${badge.rule}</p>
              <span class="status ${badge.unlocked ? "approved" : "pending"}">${badge.unlocked ? "Unlocked" : "Locked"}</span>
            </article>
          `).join("")}
        </div>
      </div>

      <div class="panel">
        <h2>Rewards</h2>
        <div class="card-list">
          ${state.rewards.map((reward) => `
            <article class="mini-card">
              <div>
                <strong>${reward.name}</strong>
                <p class="muted">${reward.points} points - ${reward.stock} left</p>
              </div>
              <button class="primary" type="button" data-action="redeem-reward" data-id="${reward.id}">Redeem</button>
            </article>
          `).join("")}
        </div>
      </div>
    </section>

    <section class="panel">
      <h2>Leaderboard</h2>
      ${state.leaderboard.sort((a, b) => b.xp - a.xp).map((row, index) => `
        <div class="leader-row">
          <strong>${index + 1}. ${row.name}</strong>
          <span class="pill strong">${row.xp.toLocaleString()} XP</span>
        </div>
      `).join("")}
    </section>
  `;
}

function renderReports() {
  return `
    <section class="panel">
      <div class="card-title">
        <div>
          <h2>ESG Summary Report</h2>
          <p class="muted">Filter by department, module, and date range. Export is CSV for the hackathon MVP.</p>
        </div>
        <button class="primary" type="button" data-action="export-report">Export CSV</button>
      </div>
      <div class="form-grid">
        <div class="field">
          <label for="report-dept">Department</label>
          <select id="report-dept">
            <option>All Departments</option>
            ${state.departments.map((dept) => `<option>${dept.name}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="report-module">Module</label>
          <select id="report-module">
            <option>All Modules</option>
            <option>Environmental</option>
            <option>Social</option>
            <option>Governance</option>
            <option>Gamification</option>
          </select>
        </div>
        <div class="field">
          <label for="report-from">From</label>
          <input id="report-from" type="date" value="2026-07-01">
        </div>
        <div class="field">
          <label for="report-to">To</label>
          <input id="report-to" type="date" value="${TODAY}">
        </div>
      </div>
    </section>

    <section class="grid four">
      ${scoreCard("Environmental", state.scores.environmental, `${state.carbonTransactions.length} carbon records`, "environmental")}
      ${scoreCard("Social", state.scores.social, `${state.participations.length} participations`, "social")}
      ${scoreCard("Governance", state.scores.governance, `${state.complianceIssues.length} issues tracked`, "governance")}
      ${scoreCard("Overall ESG", state.scores.overall, "Ready for management review", "overall")}
    </section>

    <section class="panel">
      <h2>Report Details</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Metric</th><th>Value</th><th>Meaning</th></tr>
          </thead>
          <tbody>
            <tr><td>Carbon Transactions</td><td>${state.carbonTransactions.length}</td><td>Operational records converted into CO2e values.</td></tr>
            <tr><td>CSR Participation</td><td>${state.participations.filter((item) => item.status === "Approved").length} approved</td><td>Employee social engagement.</td></tr>
            <tr><td>Compliance Issues</td><td>${state.complianceIssues.filter((item) => item.status !== "Resolved").length} open</td><td>Governance risk requiring ownership.</td></tr>
            <tr><td>Unlocked Badges</td><td>${state.badges.filter((item) => item.unlocked).length}</td><td>Gamification progress.</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function createCarbonTransaction(formData) {
  if (!state.settings.autoEmission) {
    showToast("Auto emission is disabled in Settings.");
    return;
  }

  const sourceType = formData.get("sourceType");
  const department = formData.get("department");
  const quantity = Number(formData.get("quantity"));
  const factor = state.emissionFactors.find((item) => item.sourceType === sourceType);
  const co2e = quantity * factor.co2ePerUnit;

  state.carbonTransactions.unshift({
    id: `ct-${Date.now()}`,
    department,
    sourceType,
    quantity,
    unit: factor.unit,
    co2e,
    date: TODAY
  });

  const goal = state.environmentalGoals.find((item) => item.department === department);
  if (goal) {
    goal.current = Math.min(goal.target, goal.current + co2e / 1000);
    if (goal.current >= goal.target) goal.status = "Completed";
  }

  state.scores.environmental = Math.min(100, state.scores.environmental + 1);
  state.scores.overall = Math.min(100, state.scores.overall + 1);
  addActivity(`${department} ${sourceType} record created ${co2e.toFixed(1)} kg CO2e`, "Environmental");
  saveState();
  showToast("Carbon transaction calculated and saved.");
  render();
}

function approveParticipation(id) {
  const row = state.participations.find((item) => item.id === id);
  if (!row) return;

  const activity = state.csrActivities.find((item) => item.title === row.activity);
  if (state.settings.evidenceRequired && activity?.evidenceRequired && !row.proof) {
    showToast("Approval blocked: proof file is required.");
    return;
  }

  row.status = "Approved";
  state.employeePoints += row.points;
  state.scores.social = Math.min(100, state.scores.social + 2);
  state.scores.overall = Math.min(100, state.scores.overall + 1);

  const leader = state.leaderboard.find((item) => item.name === row.employee);
  if (leader) leader.xp += row.points;

  const greenBadge = state.badges.find((badge) => badge.name === "Green Beginner");
  if (state.settings.autoBadge && greenBadge && !greenBadge.unlocked) {
    greenBadge.unlocked = true;
    addNotification("Badge unlocked", `${row.employee} unlocked Green Beginner.`);
  }

  addActivity(`${row.employee} approved for ${row.activity} and earned ${row.points} points`, "Social");
  addNotification("CSR approved", `${row.employee} earned ${row.points} points for ${row.activity}.`);
  saveState();
  showToast("Participation approved and points awarded.");
  render();
}

function joinCsr(id) {
  const activity = state.csrActivities.find((item) => item.id === id);
  if (!activity) return;

  const exists = state.participations.some((item) => item.employee === state.currentUser.name && item.activity === activity.title);
  if (exists) {
    showToast("Employee already joined this activity.");
    return;
  }

  activity.joined += 1;
  state.participations.unshift({
    id: `part-${Date.now()}`,
    employee: state.currentUser.name,
    activity: activity.title,
    proof: activity.evidenceRequired ? "uploaded-proof.jpg" : "",
    points: activity.points,
    status: "Pending"
  });
  addActivity(`${state.currentUser.name} joined ${activity.title}`, "Social");
  saveState();
  showToast("CSR activity joined. Manager approval is now pending.");
  render();
}

function joinChallenge(id) {
  const challenge = state.challenges.find((item) => item.id === id);
  if (!challenge || challenge.status !== "Active") return;
  challenge.joined = true;
  addActivity(`${state.currentUser.name} joined ${challenge.title}`, "Gamification");
  saveState();
  showToast("Challenge joined.");
  render();
}

function completeChallenge(id) {
  const challenge = state.challenges.find((item) => item.id === id);
  if (!challenge || !challenge.joined || challenge.completed) return;

  challenge.completed = true;
  challenge.status = "Completed";
  state.employeePoints += challenge.xp;
  state.scores.social = Math.min(100, state.scores.social + 1);

  const leader = state.leaderboard.find((item) => item.name === state.currentUser.name);
  if (leader) leader.xp += challenge.xp;

  if (state.settings.autoBadge && challenge.difficulty === "Hard") {
    const badge = state.badges.find((item) => item.name === "Sustainability Champion");
    if (badge) badge.unlocked = true;
    addNotification("Badge unlocked", `${state.currentUser.name} unlocked Sustainability Champion.`);
  }

  addActivity(`${state.currentUser.name} completed ${challenge.title} and earned ${challenge.xp} XP`, "Gamification");
  saveState();
  showToast("Challenge completed. XP and badge rules applied.");
  render();
}

function redeemReward(id) {
  const reward = state.rewards.find((item) => item.id === id);
  if (!reward) return;
  if (reward.stock <= 0) {
    showToast("Reward is out of stock.");
    return;
  }
  if (state.employeePoints < reward.points) {
    showToast("Not enough points for this reward.");
    return;
  }

  reward.stock -= 1;
  state.employeePoints -= reward.points;
  addActivity(`${state.currentUser.name} redeemed ${reward.name}`, "Gamification");
  addNotification("Reward redeemed", `${reward.name} stock reduced to ${reward.stock}.`);
  saveState();
  showToast("Reward redeemed. Points and stock updated.");
  render();
}

function createIssue(formData) {
  const issue = String(formData.get("issue")).trim();
  const owner = String(formData.get("owner")).trim();
  const dueDate = formData.get("dueDate");
  const severity = formData.get("severity");

  if (!issue || !owner || !dueDate) {
    showToast("Issue, owner, and due date are required.");
    return;
  }

  state.complianceIssues.unshift({
    id: `issue-${Date.now()}`,
    issue,
    severity,
    department: "Manufacturing",
    owner,
    dueDate,
    status: dueDate < TODAY ? "Overdue" : "Open"
  });

  state.scores.governance = Math.max(0, state.scores.governance - 1);
  addActivity(`New ${severity} compliance issue: ${issue}`, "Governance");
  if (state.settings.complianceAlerts) {
    addNotification("Compliance issue created", `${issue} assigned to ${owner}, due ${dueDate}.`);
  }
  saveState();
  showToast("Compliance issue created with owner and due date.");
  render();
}

function exportReport() {
  const rows = [
    ["Metric", "Value"],
    ["Environmental Score", state.scores.environmental],
    ["Social Score", state.scores.social],
    ["Governance Score", state.scores.governance],
    ["Overall ESG Score", state.scores.overall],
    ["Carbon Transactions", state.carbonTransactions.length],
    ["Approved CSR Participations", state.participations.filter((item) => item.status === "Approved").length],
    ["Open Compliance Issues", state.complianceIssues.filter((item) => item.status !== "Resolved").length],
    ["Unlocked Badges", state.badges.filter((item) => item.unlocked).length]
  ];
  const csv = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ecosphere-esg-summary.csv";
  link.click();
  URL.revokeObjectURL(url);
  showToast("CSV report exported.");
}

document.addEventListener("click", (event) => {
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) {
    setRoute(routeButton.dataset.route);
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const action = actionButton.dataset.action;
  if (action === "reset-demo") resetState();
  if (action === "toggle-setting") {
    const key = actionButton.dataset.key;
    state.settings[key] = !state.settings[key];
    saveState();
    showToast("Setting updated.");
    render();
  }
  if (action === "sample-carbon") {
    const data = new FormData();
    data.set("department", "Logistics");
    data.set("sourceType", "Fleet");
    data.set("quantity", "75");
    createCarbonTransaction(data);
  }
  if (action === "join-csr") joinCsr(actionButton.dataset.id);
  if (action === "approve-participation") approveParticipation(actionButton.dataset.id);
  if (action === "join-challenge") joinChallenge(actionButton.dataset.id);
  if (action === "complete-challenge") completeChallenge(actionButton.dataset.id);
  if (action === "redeem-reward") redeemReward(actionButton.dataset.id);
  if (action === "export-report") exportReport();
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!form.matches("[data-form]")) return;
  event.preventDefault();
  const formData = new FormData(form);
  if (form.dataset.form === "carbon") createCarbonTransaction(formData);
  if (form.dataset.form === "issue") createIssue(formData);
});

render();

