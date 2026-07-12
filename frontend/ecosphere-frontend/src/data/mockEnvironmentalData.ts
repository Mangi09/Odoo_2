import type { EnvironmentalSummary, CarbonTransaction, EnvironmentalGoal } from '../types/environmental';
import type { Activity } from '../types/dashboard';

export const initialSummary: EnvironmentalSummary = {
  totalEmissions: 12450.5,
  activeGoals: 12,
  emissionsReduced: 2400.2,
  goalCompletionRate: 68,
};

export const initialTransactions: CarbonTransaction[] = [
  { id: 'tx-001', date: '2026-07-10', source: 'HQ Office Power', type: 'Electricity', amount: 4500, unit: 'kWh', co2e: 1.8, status: 'Verified' },
  { id: 'tx-002', date: '2026-07-09', source: 'Delivery Fleet', type: 'Fuel', amount: 1200, unit: 'Gallons', co2e: 10.6, status: 'Pending' },
  { id: 'tx-003', date: '2026-07-08', source: 'Executive Flight', type: 'Travel', amount: 3500, unit: 'Miles', co2e: 0.9, status: 'Flagged' },
  { id: 'tx-004', date: '2026-07-07', source: 'Factory A Power', type: 'Electricity', amount: 15000, unit: 'kWh', co2e: 6.0, status: 'Verified' },
  { id: 'tx-005', date: '2026-07-06', source: 'Warehouse Heating', type: 'Fuel', amount: 800, unit: 'Gallons', co2e: 7.1, status: 'Verified' },
];

export const initialGoals: EnvironmentalGoal[] = [
  { id: 'g-001', title: 'Reduce Office Electricity Usage', target: 50000, current: 34000, unit: 'kWh', deadline: '2026-12-31', status: 'On Track' },
  { id: 'g-002', title: 'Transition to EV Fleet', target: 100, current: 45, unit: '%', deadline: '2027-06-30', status: 'At Risk' },
  { id: 'g-003', title: 'Zero Waste to Landfill', target: 100, current: 85, unit: '%', deadline: '2026-10-15', status: 'On Track' },
];

export const environmentalActivities: Activity[] = [
  { id: 'ea-1', user: 'Aditi Rao', action: 'logged carbon offset', target: 'Solar Farm Project', time: '10 mins ago', type: 'carbon' },
  { id: 'ea-2', user: 'System', action: 'auto-calculated emissions', target: 'HQ Office Power', time: '1 hour ago', type: 'carbon' },
  { id: 'ea-3', user: 'Karan Shah', action: 'flagged anomalous usage', target: 'Delivery Fleet', time: '3 hours ago', type: 'carbon' },
  { id: 'ea-4', user: 'System', action: 'verified transaction', target: 'Factory A Power', time: '1 day ago', type: 'carbon' },
];
