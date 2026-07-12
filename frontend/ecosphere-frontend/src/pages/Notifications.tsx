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
const Card = ({ children, className = '', darkMode = false }: { children: React.ReactNode; className?: string; darkMode?: boolean }) => (
  <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-green-100'} rounded-2xl shadow-sm border p-6 ${className}`}>
    {children}
  </div>
);

const getIconForType = (type: NotificationType) => {
  switch (type) {
    case 'Environmental': return <Leaf className="w-5 h-5 text-green-500" />;
    case 'Social': return <Heart className="w-5 h-5 text-teal-500" />;
    case 'Governance': return <ShieldAlert className="w-5 h-5 text-red-500" />;
    case 'Gamification': return <Trophy className="w-5 h-5 text-yellow-500" />;
    case 'System': return <Info className="w-5 h-5 text-gray-500" />;
    default: return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

const getBgForType = (type: NotificationType, darkMode: boolean) => {
  switch (type) {
    case 'Environmental': return darkMode ? 'bg-green-500/20' : 'bg-green-50';
    case 'Social': return darkMode ? 'bg-teal-500/20' : 'bg-teal-50';
    case 'Governance': return darkMode ? 'bg-red-500/20' : 'bg-red-50';
    case 'Gamification': return darkMode ? 'bg-yellow-500/20' : 'bg-yellow-50';
    case 'System': return darkMode ? 'bg-slate-700' : 'bg-gray-50';
    default: return darkMode ? 'bg-slate-700' : 'bg-gray-50';
  }
};

export const Notifications = ({ activePage, onPageChange, darkMode, setDarkMode }: {
  activePage?: string;
  onPageChange?: (page: string) => void;
  darkMode?: boolean;
  setDarkMode?: (mode: boolean) => void;
}) => {
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
        <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{title}</h3>
        <div className="space-y-3">
          {group.map(n => (
            <div
              key={n.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${n.isRead
                  ? (darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600 opacity-70' : 'bg-white border-gray-100 hover:border-gray-200 opacity-70')
                  : (darkMode ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50 shadow-sm' : 'bg-green-50/30 border-green-100 hover:border-green-200 shadow-sm')
                }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getBgForType(n.type, darkMode)}`}>
                {getIconForType(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <h4 className={`text-sm truncate ${n.isRead ? (darkMode ? 'font-medium text-slate-300' : 'font-medium text-gray-700') : (darkMode ? 'font-bold text-slate-100' : 'font-bold text-gray-900')}`}>
                    {n.title}
                  </h4>
                  <span className={`text-xs whitespace-nowrap ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>{n.timestamp}</span>
                </div>
                <p className={`text-sm ${n.isRead ? (darkMode ? 'text-slate-400' : 'text-gray-500') : (darkMode ? 'text-slate-300 font-medium' : 'text-gray-600 font-medium')}`}>
                  {n.description}
                </p>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  className={`p-1.5 rounded-lg transition-colors shrink-0 ${darkMode ? 'text-green-400 hover:bg-green-500/20' : 'text-green-600 hover:bg-green-100'
                    }`}
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
    <DashboardLayout activePage={activePage} onPageChange={onPageChange} darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight flex items-center gap-3 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
              Notifications
              {summary.totalUnread > 0 && (
                <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                  }`}>
                  {summary.totalUnread} new
                </span>
              )}
            </h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Stay updated on your ESG goals, alerts, and team activities.</p>
          </div>

          <button
            onClick={handleMarkAllAsRead}
            disabled={summary.totalUnread === 0}
            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${summary.totalUnread > 0
                ? (darkMode ? 'bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-600 shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm')
                : (darkMode ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gray-50 text-gray-400 cursor-not-allowed')
              }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all as read
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card darkMode={darkMode} className="p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${darkMode ? 'bg-green-500/20' : 'bg-green-50'
              }`}>
              <Bell className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Unread</p>
              <p className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.totalUnread}</p>
            </div>
          </Card>

          <Card darkMode={darkMode} className="p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${darkMode ? 'bg-red-500/20' : 'bg-red-50'
              }`}>
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Alerts</p>
              <p className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.complianceAlerts}</p>
            </div>
          </Card>

          <Card darkMode={darkMode} className="p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${darkMode ? 'bg-teal-500/20' : 'bg-teal-50'
              }`}>
              <Heart className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>CSR</p>
              <p className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.csrUpdates}</p>
            </div>
          </Card>

          <Card darkMode={darkMode} className="p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${darkMode ? 'bg-yellow-500/20' : 'bg-yellow-50'
              }`}>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Badges</p>
              <p className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.badgeUnlocks}</p>
            </div>
          </Card>
        </div>

        <Card darkMode={darkMode} className="p-6">
          {/* Controls */}
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'
            }`}>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {['All', 'Environmental', 'Social', 'Governance', 'Gamification'].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type as NotificationType | 'All')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${activeFilter === type
                      ? (darkMode ? 'bg-slate-100 text-slate-900' : 'bg-gray-800 text-white')
                      : (darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="relative shrink-0">
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-400' : 'text-gray-400'
                }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
                className={`pl-9 pr-4 py-2 w-full md:w-64 rounded-lg text-sm transition-all outline-none ${darkMode
                    ? 'bg-slate-700 border border-slate-600 text-slate-200 placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 placeholder:text-gray-400 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200'
                  }`}
              />
            </div>
          </div>

          {/* List */}
          <div>
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-50'
                  }`}>
                  <Bell className={`w-6 h-6 ${darkMode ? 'text-slate-500' : 'text-gray-300'}`} />
                </div>
                <h3 className={`text-sm font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>No notifications found</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Try adjusting your filters or search query.</p>
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
