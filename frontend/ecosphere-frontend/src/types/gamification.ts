export interface GamificationSummary {
  activeChallenges: number;
  totalXP: number;
  badgesUnlocked: number;
  rewardsRedeemed: number;
}

export interface GameChallenge {
  id: string;
  title: string;
  description: string;
  xp: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  deadline: string;
  participants: number;
  status: 'Active' | 'Completed';
  category: 'Energy' | 'Waste' | 'Community' | 'Transport';
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string; // e.g., 'Leaf', 'Zap', 'Droplets'
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  isUnlocked: boolean;
  progress: number; // 0 to 100
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  department: string;
  score: number;
  rank: number;
  trend: 'up' | 'down' | 'same';
  avatarInitials: string;
}

export interface RewardItem {
  id: string;
  title: string;
  cost: number;
  stock: number;
  imageIcon: string;
}
