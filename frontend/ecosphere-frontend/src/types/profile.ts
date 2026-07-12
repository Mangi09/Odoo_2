export interface UserProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  joinDate: string;
  email: string;
  avatarInitials: string;
}

export interface ProfileStats {
  totalXP: number;
  esgPoints: number;
  challengesCompleted: number;
  csrEventsAttended: number;
  badgesEarned: number;
  carbonSaved: number; // in kg CO2e
}

export interface ProfileHistoryItem {
  id: string;
  title: string;
  date: string;
  type: 'Challenge' | 'CSR' | 'Reward';
  points: number; // XP or Points
  status: 'Completed' | 'Attended' | 'Redeemed';
}
