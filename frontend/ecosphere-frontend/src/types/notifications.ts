export interface NotificationSummary {
  totalUnread: number;
  complianceAlerts: number;
  csrUpdates: number;
  badgeUnlocks: number;
}

export type NotificationType = 'Environmental' | 'Social' | 'Governance' | 'Gamification' | 'System';
export type NotificationCategory = 'Today' | 'Yesterday' | 'Earlier';

export interface NotificationEntry {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: NotificationType;
  isRead: boolean;
  category: NotificationCategory;
}
