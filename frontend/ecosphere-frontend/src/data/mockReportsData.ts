import type { ReportsSummary, ReportCategory, ReportHistoryEntry } from '../types/reports';

export const initialReportsSummary: ReportsSummary = {
  reportsGenerated: 42,
  esgScore: 78,
  carbonEmissions: 14250,
  complianceRate: 94,
};

export const reportCategories: ReportCategory[] = [
  { id: 'cat-1', title: 'Environmental Impact', description: 'Analyze carbon footprint, energy usage, and waste management metrics.', icon: 'Leaf', type: 'Environmental' },
  { id: 'cat-2', title: 'Social Responsibility', description: 'Review employee engagement, CSR activities, and community impact.', icon: 'Users', type: 'Social' },
  { id: 'cat-3', title: 'Governance & Compliance', description: 'Export audit logs, policy acknowledgments, and risk assessments.', icon: 'Shield', type: 'Governance' },
  { id: 'cat-4', title: 'Comprehensive ESG Summary', description: 'Full integrated report for external stakeholders and investors.', icon: 'FileText', type: 'Summary' },
];

export const initialReportHistory: ReportHistoryEntry[] = [
  { id: 'rep-1', title: 'Q2 2026 ESG Summary', type: 'Summary', department: 'All', dateGenerated: '2026-07-01', status: 'Ready', format: 'PDF', size: '2.4 MB' },
  { id: 'rep-2', title: 'June Carbon Emissions', type: 'Environmental', department: 'Manufacturing', dateGenerated: '2026-06-30', status: 'Ready', format: 'CSV', size: '156 KB' },
  { id: 'rep-3', title: 'Diversity & Inclusion Metrics', type: 'Social', department: 'HR', dateGenerated: '2026-06-15', status: 'Ready', format: 'Excel', size: '890 KB' },
  { id: 'rep-4', title: 'Supplier Audit Log', type: 'Governance', department: 'Procurement', dateGenerated: '2026-06-05', status: 'Ready', format: 'PDF', size: '1.1 MB' },
];
