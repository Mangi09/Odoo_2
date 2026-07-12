export interface ReportsSummary {
  reportsGenerated: number;
  esgScore: number;
  carbonEmissions: number; // in tCO2e
  complianceRate: number; // percentage
}

export interface ReportCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'Environmental' | 'Social' | 'Governance' | 'Summary';
}

export interface ReportHistoryEntry {
  id: string;
  title: string;
  type: string;
  department: string;
  dateGenerated: string;
  status: 'Ready' | 'Processing' | 'Failed';
  format: 'PDF' | 'CSV' | 'Excel';
  size?: string;
}
