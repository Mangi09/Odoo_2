import type { NotificationEntry, NotificationSummary } from '../types/notifications';

export const initialNotificationSummary: NotificationSummary = {
  totalUnread: 4,
  complianceAlerts: 1,
  csrUpdates: 2,
  badgeUnlocks: 1,
};

export const initialNotifications: NotificationEntry[] = [
  // Today
  { id: 'notif-1', title: 'High Severity Issue', description: 'Missing emissions data for UK office.', timestamp: '10:30 AM', type: 'Governance', isRead: false, category: 'Today' },
  { id: 'notif-2', title: 'CSR Activity Approved', description: 'Your participation in "Beach Cleanup" was approved.', timestamp: '9:15 AM', type: 'Social', isRead: false, category: 'Today' },
  { id: 'notif-3', title: 'Badge Unlocked!', description: 'You unlocked the "Eco Starter" badge.', timestamp: '8:45 AM', type: 'Gamification', isRead: false, category: 'Today' },
  
  // Yesterday
  { id: 'notif-4', title: 'Emissions Goal Met', description: 'Facility A achieved 100% of its Q3 reduction goal.', timestamp: 'Yesterday, 2:00 PM', type: 'Environmental', isRead: false, category: 'Yesterday' },
  { id: 'notif-5', title: 'System Update', description: 'EcoSphere was updated to version 2.4.1.', timestamp: 'Yesterday, 10:00 AM', type: 'System', isRead: true, category: 'Yesterday' },
  
  // Earlier
  { id: 'notif-6', title: 'New Challenge Available', description: 'Join "Zero Waste Week" to earn 500 XP.', timestamp: 'July 10, 2026', type: 'Gamification', isRead: true, category: 'Earlier' },
  { id: 'notif-7', title: 'Policy Acknowledgment Required', description: 'Please review the updated Diversity & Inclusion Charter.', timestamp: 'July 05, 2026', type: 'Governance', isRead: true, category: 'Earlier' },
  { id: 'notif-8', title: 'Weekly ESG Digest', description: 'Your organization reduced emissions by 4% last week.', timestamp: 'July 01, 2026', type: 'System', isRead: true, category: 'Earlier' },
];
