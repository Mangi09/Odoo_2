import React, { useState, useMemo } from 'react';
import { 
  Bell, CheckCircle2, ShieldAlert, Heart, Trophy, Search, Check, Info, Leaf
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  initialNotificationSummary, initialNotifications 
} from '../data/mockNotificationsData';
import type { NotificationEntry, NotificationType } from '../types/notifications';

// Reusable Components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 ${className}`}>
    {children}
  </div>
);

const getIconForType = (type: NotificationType) => {
  switch (type) {
    case 'Environmental': return <Leaf className="w-5 h-5 text-green-500" />;
    case 'Social': return <Heart className="w-5 h-5 text-blue-500" />;
    case 'Governance': return <ShieldAlert className="w-5 h-5 text-red-500" />;
    case 'Gamification': return <Trophy className="w-5 h-5 text-yellow-500" />;
    case 'System': return <Info className="w-5 h-5 text-slate-500" />;
    default: return <Bell className="w-5 h-5 text-slate-500" />;
  }
};

const getBgForType = (type: NotificationType) => {
  switch (type) {
    case 'Environmental': return 'bg-green-50';
    case 'Social': return 'bg-blue-50';
    case 'Governance': return 'bg-red-50';
    case 'Gamification': return 'bg-yellow-50';
    case 'System': return 'bg-slate-50';
    default: return 'bg-slate-50';
  }
};

export const Notifications = ({ activePage, onPageChange }: { activePage?: string, onPageChange?: (page: string) => void }) => {
  const [summary, setSummary] = useState(initialNotificationSummary);
  const [notifications, setNotifications] = useState<NotificationEntry[]>(initialNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'All'>('All');

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id && !n.isRead) {
        setSummary(s => ({ ...s, totalUnread: Math.max(0, s.totalUnread - 1) }));
        return { ...n, isRead: true };
      }
      return n;
    }));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setSummary(s => ({ ...s, totalUnread: 0 }));
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesFilter = activeFilter === 'All' || n.type === activeFilter;
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            n.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [notifications, searchQuery, activeFilter]);

  const todayNotifications = filteredNotifications.filter(n => n.category === 'Today');
  const yesterdayNotifications = filteredNotifications.filter(n => n.category === 'Yesterday');
  const earlierNotifications = filteredNotifications.filter(n => n.category === 'Earlier');

  const renderNotificationGroup = (title: string, group: NotificationEntry[]) => {
    if (group.length === 0) return null;
    return (
      <div className="mb-8 last:mb-0">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{title}</h3>
        <div className="space-y-3">
          {group.map(n => (
            <div 
              key={n.id} 
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                n.isRead 
                  ? 'bg-white border-slate-100 hover:border-slate-200 opacity-70' 
                  : 'bg-indigo-50/30 border-indigo-100 hover:border-indigo-200 shadow-sm'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getBgForType(n.type)}`}>
                {getIconForType(n.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <h4 className={`text-sm truncate ${n.isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                    {n.title}
                  </h4>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                </div>
                <p className={`text-sm ${n.isRead ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                  {n.description}
                </p>
              </div>

              {!n.isRead && (
                <button 
                  onClick={() => handleMarkAsRead(n.id)}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              Notifications 
              {summary.totalUnread > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-sm font-bold px-2.5 py-0.5 rounded-full">
                  {summary.totalUnread} new
                </span>
              )}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Stay updated on your ESG goals, alerts, and team activities.</p>
          </div>
          
          <button 
            onClick={handleMarkAllAsRead}
            disabled={summary.totalUnread === 0}
            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
              summary.totalUnread > 0 
                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm' 
                : 'bg-slate-50 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all as read
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Unread</p>
              <p className="text-xl font-bold text-slate-900">{summary.totalUnread}</p>
            </div>
          </Card>
          
          <Card className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Alerts</p>
              <p className="text-xl font-bold text-slate-900">{summary.complianceAlerts}</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">CSR</p>
              <p className="text-xl font-bold text-slate-900">{summary.csrUpdates}</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Badges</p>
              <p className="text-xl font-bold text-slate-900">{summary.badgeUnlocks}</p>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {['All', 'Environmental', 'Social', 'Governance', 'Gamification'].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type as NotificationType | 'All')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
                    activeFilter === type 
                      ? 'bg-slate-800 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            
            <div className="relative shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search notifications..." 
                className="pl-9 pr-4 py-2 w-full md:w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div>
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">No notifications found</h3>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <>
                {renderNotificationGroup('Today', todayNotifications)}
                {renderNotificationGroup('Yesterday', yesterdayNotifications)}
                {renderNotificationGroup('Earlier', earlierNotifications)}
              </>
            )}
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default Notifications;
