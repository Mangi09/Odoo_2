import type { GamificationSummary, GameChallenge, Badge, LeaderboardEntry, RewardItem } from '../types/gamification';

export const initialGamificationSummary: GamificationSummary = {
  activeChallenges: 5,
  totalXP: 12450,
  badgesUnlocked: 8,
  rewardsRedeemed: 2,
};

export const initialChallenges: GameChallenge[] = [
  { id: 'c-1', title: 'Zero Waste Week', description: 'Produce zero landfill waste for 5 consecutive days.', xp: 500, difficulty: 'Hard', deadline: '2026-07-20', participants: 142, status: 'Active', category: 'Waste' },
  { id: 'c-2', title: 'Bike to Work', description: 'Commute by bike for 3 days this week.', xp: 300, difficulty: 'Medium', deadline: '2026-07-18', participants: 89, status: 'Active', category: 'Transport' },
  { id: 'c-3', title: 'Energy Saver', description: 'Turn off all monitors and lights after hours for a week.', xp: 150, difficulty: 'Easy', deadline: '2026-07-25', participants: 256, status: 'Active', category: 'Energy' },
];

export const initialBadges: Badge[] = [
  { id: 'b-1', title: 'Eco Starter', description: 'Log your first green activity.', iconName: 'Leaf', tier: 'Bronze', isUnlocked: true, progress: 100, unlockedAt: '2026-01-15' },
  { id: 'b-2', title: 'Recycling Pro', description: 'Recycle 50kg of material.', iconName: 'Recycle', tier: 'Silver', isUnlocked: true, progress: 100, unlockedAt: '2026-05-10' },
  { id: 'b-3', title: 'Energy Saver', description: 'Save 1000 kWh of energy.', iconName: 'Zap', tier: 'Gold', isUnlocked: false, progress: 85 },
  { id: 'b-4', title: 'Community Hero', description: 'Participate in 5 CSR events.', iconName: 'Heart', tier: 'Platinum', isUnlocked: false, progress: 40 },
];

export const employeeLeaderboard: LeaderboardEntry[] = [
  { id: 'l-1', name: 'Sarah Jenkins', department: 'Engineering', score: 15400, rank: 1, trend: 'up', avatarInitials: 'SJ' },
  { id: 'l-2', name: 'Michael Chen', department: 'Design', score: 14250, rank: 2, trend: 'same', avatarInitials: 'MC' },
  { id: 'l-3', name: 'You', department: 'Product', score: 12450, rank: 3, trend: 'up', avatarInitials: 'ME' },
  { id: 'l-4', name: 'Aditi Rao', department: 'Marketing', score: 11800, rank: 4, trend: 'down', avatarInitials: 'AR' },
  { id: 'l-5', name: 'James Wilson', department: 'Sales', score: 9500, rank: 5, trend: 'same', avatarInitials: 'JW' },
];

export const departmentLeaderboard: LeaderboardEntry[] = [
  { id: 'dl-1', name: 'Engineering', department: 'HQ', score: 45000, rank: 1, trend: 'same', avatarInitials: 'EN' },
  { id: 'dl-2', name: 'Product', department: 'HQ', score: 38000, rank: 2, trend: 'up', avatarInitials: 'PR' },
  { id: 'dl-3', name: 'Design', department: 'HQ', score: 32000, rank: 3, trend: 'down', avatarInitials: 'DE' },
];

export const rewardsCatalog: RewardItem[] = [
  { id: 'r-1', title: '$25 Eco-Store Gift Card', cost: 5000, stock: 15, imageIcon: 'Gift' },
  { id: 'r-2', title: 'Extra PTO Day', cost: 15000, stock: 5, imageIcon: 'Sun' },
  { id: 'r-3', title: 'Company Swag Pack', cost: 8000, stock: 20, imageIcon: 'Package' },
  { id: 'r-4', title: 'Lunch with CEO', cost: 25000, stock: 2, imageIcon: 'Coffee' },
];
