import type { SocialSummary, CSRActivity, EmployeeParticipation } from '../types/social';
import type { Activity } from '../types/dashboard';

export const initialSocialSummary: SocialSummary = {
  activeActivities: 8,
  totalParticipants: 342,
  pendingApprovals: 15,
  pointsAwarded: 45000,
};

export const initialCSRActivities: CSRActivity[] = [
  { id: 'csr-1', title: 'Community Beach Clean-up', description: 'Join us this weekend to clean up the local beach and protect marine life.', participants: 45, points: 500, status: 'Open', category: 'Environment' },
  { id: 'csr-2', title: 'Code for Good Hackathon', description: 'Mentor underprivileged students in basic web development.', participants: 12, points: 1000, status: 'Ongoing', category: 'Community' },
  { id: 'csr-3', title: 'Blood Donation Drive', description: 'Annual blood donation drive at the HQ.', participants: 89, points: 300, status: 'Completed', category: 'Health' },
  { id: 'csr-4', title: 'Tree Planting Initiative', description: 'Planting 1,000 trees in the city outskirts.', participants: 120, points: 600, status: 'Open', category: 'Environment' },
];

export const initialParticipations: EmployeeParticipation[] = [
  { id: 'p-1', employeeName: 'Sarah Jenkins', activityTitle: 'Community Beach Clean-up', dateSubmitted: '2026-07-11', proofUrl: '/proof1.jpg', status: 'Pending' },
  { id: 'p-2', employeeName: 'Michael Chen', activityTitle: 'Code for Good Hackathon', dateSubmitted: '2026-07-10', proofUrl: '/proof2.jpg', status: 'Pending' },
  { id: 'p-3', employeeName: 'Aditi Rao', activityTitle: 'Blood Donation Drive', dateSubmitted: '2026-07-09', proofUrl: '/proof3.jpg', status: 'Approved' },
  { id: 'p-4', employeeName: 'James Wilson', activityTitle: 'Tree Planting Initiative', dateSubmitted: '2026-07-12', proofUrl: '/proof4.jpg', status: 'Pending' },
];

export const socialActivities: Activity[] = [
  { id: 'sa-1', user: 'HR Team', action: 'published new activity', target: 'Tree Planting Initiative', time: '2 hours ago', type: 'social' },
  { id: 'sa-2', user: 'Aditi Rao', action: 'earned 300 points', target: 'Blood Donation Drive', time: '5 hours ago', type: 'gamification' },
  { id: 'sa-3', user: 'Manager', action: 'approved participation', target: 'Aditi Rao - Blood Donation', time: '5 hours ago', type: 'social' },
];
