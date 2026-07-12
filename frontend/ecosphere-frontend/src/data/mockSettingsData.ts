import type { GlobalSettings, Department, MasterCategory, OrganizationInfo } from '../types/settings';

export const initialGlobalSettings: GlobalSettings = {
  autoEmissionCalc: true,
  requireCSREvidence: false,
  autoBadgeAward: true,
  notificationAlerts: true,
  weeklyReports: false,
};

export const initialDepartments: Department[] = [
  { id: 'dept-1', name: 'Engineering', head: 'Sarah Jenkins', employeeCount: 145 },
  { id: 'dept-2', name: 'Manufacturing', head: 'Marcus Chen', employeeCount: 450 },
  { id: 'dept-3', name: 'Human Resources', head: 'Elena Rodriguez', employeeCount: 24 },
  { id: 'dept-4', name: 'Sales & Marketing', head: 'James Wilson', employeeCount: 89 },
];

export const initialCategories: MasterCategory[] = [
  { id: 'cat-1', name: 'Scope 1 Emissions', type: 'Environmental', description: 'Direct emissions from owned or controlled sources.' },
  { id: 'cat-2', name: 'Scope 2 Emissions', type: 'Environmental', description: 'Indirect emissions from the generation of purchased energy.' },
  { id: 'cat-3', name: 'Community Volunteering', type: 'Social', description: 'Local community support and engagement programs.' },
  { id: 'cat-4', name: 'Diversity Training', type: 'Social', description: 'Internal DEI training sessions and workshops.' },
  { id: 'cat-5', name: 'Supplier Audits', type: 'Governance', description: 'Compliance checks for third-party vendors.' },
];

export const initialOrgInfo: OrganizationInfo = {
  name: 'EcoSphere Inc.',
  industry: 'Technology & Software',
  headquarters: 'San Francisco, CA',
  foundedYear: '2024',
};
