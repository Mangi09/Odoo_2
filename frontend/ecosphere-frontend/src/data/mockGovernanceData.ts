import type { GovernanceSummary, Audit, ComplianceIssue, Policy } from '../types/governance';
import type { Activity } from '../types/dashboard';

export const initialGovernanceSummary: GovernanceSummary = {
  openIssues: 12,
  highSeverityIssues: 3,
  upcomingAudits: 2,
  policyComplianceRate: 94,
};

export const initialAudits: Audit[] = [
  { id: 'a-1', title: 'Q3 Carbon Footprint Assessment', department: 'Operations', auditor: 'EcoCert Intl.', date: '2026-08-15', findings: 0, status: 'Scheduled' },
  { id: 'a-2', title: 'Supplier Code of Conduct Review', department: 'Procurement', auditor: 'Internal Audit Team', date: '2026-07-20', findings: 0, status: 'In Progress' },
  { id: 'a-3', title: 'ISO 14001 Annual Recertification', department: 'HQ', auditor: 'SGS Verification', date: '2026-06-10', findings: 4, status: 'Completed' },
];

export const initialComplianceIssues: ComplianceIssue[] = [
  { id: 'ci-1', title: 'Missing emissions data for UK office', severity: 'High', owner: 'Facilities Manager', dueDate: '2026-07-15', status: 'Open' },
  { id: 'ci-2', title: 'Vendor sustainability survey incomplete', severity: 'Medium', owner: 'Procurement', dueDate: '2026-07-22', status: 'Open' },
  { id: 'ci-3', title: 'Update internal recycling guidelines', severity: 'Low', owner: 'HR', dueDate: '2026-08-01', status: 'In Review' },
  { id: 'ci-4', title: 'Exceeded water usage threshold in Plant A', severity: 'High', owner: 'Plant Operations', dueDate: '2026-07-10', status: 'Resolved' },
];

export const initialPolicies: Policy[] = [
  { id: 'pol-1', title: 'Global ESG Framework Policy', version: 'v2.4', lastUpdated: '2026-01-10', isAcknowledged: false },
  { id: 'pol-2', title: 'Anti-Bribery and Corruption', version: 'v3.1', lastUpdated: '2025-11-20', isAcknowledged: true },
  { id: 'pol-3', title: 'Diversity & Inclusion Charter', version: 'v1.2', lastUpdated: '2026-03-15', isAcknowledged: false },
];

export const governanceActivities: Activity[] = [
  { id: 'ga-1', user: 'Admin System', action: 'generated automated report', target: 'Q2 Sustainability Report', time: '1 hour ago', type: 'governance' },
  { id: 'ga-2', user: 'John Doe', action: 'resolved a compliance issue', target: 'Exceeded water usage threshold', time: '4 hours ago', type: 'governance' },
  { id: 'ga-3', user: 'Legal Team', action: 'updated policy document', target: 'Global ESG Framework', time: '1 day ago', type: 'social' },
];
