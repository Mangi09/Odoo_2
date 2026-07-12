import type { KPIMetric, ChartData, Goal, Challenge, ComplianceIssue, Activity } from '../types/dashboard';

export const kpiData: KPIMetric[] = [
  { id: '1', title: 'Overall ESG Score', value: '84/100', trend: 2.4, trendLabel: 'vs last month', category: 'overall' },
  { id: '2', title: 'Carbon Offset', value: '1,240 tCO2e', trend: 12.1, trendLabel: 'vs last month', category: 'environmental' },
  { id: '3', title: 'Employee Engagement', value: '92%', trend: 5.0, trendLabel: 'vs last month', category: 'social' },
  { id: '4', title: 'Compliance Rate', value: '99.1%', trend: -0.4, trendLabel: 'vs last month', category: 'governance' },
];

export const carbonEmissionsData: ChartData[] = [
  { name: 'Jan', value: 400, benchmark: 450 }, { name: 'Feb', value: 380, benchmark: 440 },
  { name: 'Mar', value: 410, benchmark: 430 }, { name: 'Apr', value: 390, benchmark: 420 },
  { name: 'May', value: 350, benchmark: 410 }, { name: 'Jun', value: 320, benchmark: 400 },
  { name: 'Jul', value: 310, benchmark: 390 }, { name: 'Aug', value: 290, benchmark: 380 },
  { name: 'Sep', value: 275, benchmark: 370 }, { name: 'Oct', value: 260, benchmark: 360 },
  { name: 'Nov', value: 240, benchmark: 350 }, { name: 'Dec', value: 220, benchmark: 340 },
];

export const departmentRankings: ChartData[] = [
  { name: 'Corporate', value: 92 },
  { name: 'Logistics', value: 85 },
  { name: 'Manufacturing', value: 78 },
  { name: 'Retail', value: 71 },
];

export const activeGoals: Goal[] = [
  { id: 'g1', title: 'Zero Waste to Landfill', progress: 75, target: '100% by 2027', status: 'on-track' },
  { id: 'g2', title: 'Renewable Energy Transition', progress: 45, target: '80% by 2030', status: 'at-risk' },
  { id: 'g3', title: 'Supply Chain Audit', progress: 90, target: '100% audited', status: 'on-track' },
];

export const activeChallenges: Challenge[] = [
  { id: 'c1', title: 'Bike to Work Week', xp: 500, participants: 142, deadline: '2 days left' },
  { id: 'c2', title: 'Paperless Office Initiative', xp: 300, participants: 89, deadline: '5 days left' },
  { id: 'c3', title: 'Community Volunteering', xp: 1000, participants: 56, deadline: '12 days left' },
];

export const complianceIssues: ComplianceIssue[] = [
  { id: 'iss1', title: 'Missing Q2 Emissions Report', severity: 'high', department: 'Manufacturing', dueDate: 'Today' },
  { id: 'iss2', title: 'Supplier Code of Conduct unsigned', severity: 'medium', department: 'Logistics', dueDate: 'In 3 days' },
  { id: 'iss3', title: 'Annual Diversity Training pending', severity: 'low', department: 'Corporate', dueDate: 'In 2 weeks' },
];

export const recentActivities: Activity[] = [
  { id: 'a1', user: 'Aditi Rao', action: 'logged carbon offset', target: 'Solar Farm Project', time: '10 mins ago', type: 'carbon' },
  { id: 'a2', user: 'Karan Shah', action: 'unlocked badge', target: 'Eco Warrior Level 3', time: '1 hour ago', type: 'gamification' },
  { id: 'a3', user: 'S. Nair', action: 'approved CSR initiative', target: 'Clean Water Fund', time: '3 hours ago', type: 'social' },
  { id: 'a4', user: 'System', action: 'flagged compliance risk', target: 'Logistics Vendor A', time: '5 hours ago', type: 'governance' },
  { id: 'a5', user: 'R. Iyer', action: 'completed audit', target: 'Q3 Factory Inspection', time: '1 day ago', type: 'governance' },
];
