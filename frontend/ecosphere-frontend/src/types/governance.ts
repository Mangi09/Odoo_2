export interface GovernanceSummary {
  openIssues: number;
  highSeverityIssues: number;
  upcomingAudits: number;
  policyComplianceRate: number; // Percentage
}

export interface Audit {
  id: string;
  title: string;
  department: string;
  auditor: string;
  date: string;
  findings: number;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

export interface ComplianceIssue {
  id: string;
  title: string;
  severity: 'High' | 'Medium' | 'Low';
  owner: string;
  dueDate: string;
  status: 'Open' | 'In Review' | 'Resolved';
}

export interface Policy {
  id: string;
  title: string;
  version: string;
  lastUpdated: string;
  isAcknowledged: boolean;
}
