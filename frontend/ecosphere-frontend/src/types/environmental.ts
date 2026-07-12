export interface EnvironmentalSummary {
  totalEmissions: number;
  activeGoals: number;
  emissionsReduced: number;
  goalCompletionRate: number;
}

export interface CarbonTransaction {
  id: string;
  date: string;
  source: string;
  type: 'Electricity' | 'Fuel' | 'Travel' | 'Waste';
  amount: number;
  unit: string;
  co2e: number;
  status: 'Verified' | 'Pending' | 'Flagged';
}

export interface EnvironmentalGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  status: 'On Track' | 'At Risk' | 'Achieved';
}
