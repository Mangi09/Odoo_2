export interface GlobalSettings {
  autoEmissionCalc: boolean;
  requireCSREvidence: boolean;
  autoBadgeAward: boolean;
  notificationAlerts: boolean;
  weeklyReports: boolean;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  employeeCount: number;
}

export interface MasterCategory {
  id: string;
  name: string;
  type: 'Environmental' | 'Social' | 'Governance';
  description: string;
}

export interface OrganizationInfo {
  name: string;
  industry: string;
  headquarters: string;
  foundedYear: string;
}
