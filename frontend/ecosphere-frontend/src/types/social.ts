export interface SocialSummary {
  activeActivities: number;
  totalParticipants: number;
  pendingApprovals: number;
  pointsAwarded: number;
}

export interface CSRActivity {
  id: string;
  title: string;
  description: string;
  participants: number;
  points: number;
  status: 'Open' | 'Ongoing' | 'Completed';
  category: 'Community' | 'Environment' | 'Health';
}

export interface EmployeeParticipation {
  id: string;
  employeeName: string;
  activityTitle: string;
  dateSubmitted: string;
  proofUrl: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}
