export interface KPIMetric {
  id: string;
  title: string;
  value: string | number;
  trend: number;
  trendLabel: string;
  category: 'overall' | 'environmental' | 'social' | 'governance';
}

export interface ChartData {
  name: string;
  value: number;
  benchmark?: number;
}

export interface Goal {
  id: string;
  title: string;
  progress: number;
  target: string;
  status: 'on-track' | 'at-risk' | 'behind';
}

export interface Challenge {
  id: string;
  title: string;
  xp: number;
  participants: number;
  deadline: string;
}

export interface ComplianceIssue {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  department: string;
  dueDate: string;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: 'carbon' | 'social' | 'governance' | 'gamification';
}
