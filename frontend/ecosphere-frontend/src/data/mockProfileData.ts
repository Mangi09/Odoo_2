import type { UserProfile, ProfileStats, ProfileHistoryItem } from '../types/profile';
import { initialBadges } from './mockGamificationData';

export const currentUser: UserProfile = {
  id: 'usr-1',
  name: 'Alex Johnson',
  role: 'Senior Product Manager',
  department: 'Product',
  location: 'San Francisco, CA',
  joinDate: 'March 2024',
  email: 'alex.j@ecosphere.inc',
  avatarInitials: 'AJ',
};

export const currentProfileStats: ProfileStats = {
  totalXP: 12450,
  esgPoints: 850,
  challengesCompleted: 12,
  csrEventsAttended: 4,
  badgesEarned: initialBadges.filter(b => b.isUnlocked).length,
  carbonSaved: 45.2,
};

export const profileHistory: ProfileHistoryItem[] = [
  { id: 'ph-1', title: 'Zero Waste Week Challenge', date: '2026-06-25', type: 'Challenge', points: 500, status: 'Completed' },
  { id: 'ph-2', title: 'Beach Cleanup Volunteering', date: '2026-06-12', type: 'CSR', points: 300, status: 'Attended' },
  { id: 'ph-3', title: 'Eco-Store Gift Card ($25)', date: '2026-05-30', type: 'Reward', points: 5000, status: 'Redeemed' },
  { id: 'ph-4', title: 'Bike to Work Month', date: '2026-05-15', type: 'Challenge', points: 1200, status: 'Completed' },
  { id: 'ph-5', title: 'Mentorship Program', date: '2026-04-10', type: 'CSR', points: 250, status: 'Attended' },
];
