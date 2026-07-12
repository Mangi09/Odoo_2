import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, CheckCircle2, ShieldAlert, Heart, Trophy, Search, Check, Info, Leaf, RefreshCw
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { notifications as notifApi } from '../lib/api';

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 ${className}`}>
    {children}
  </div>
);

type NotificationType = 'Environmental' | 'Social' | 'Governance' | 'Gamification' | 'System';

interface NotificationEntry {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  isRead: boolean;
  timestamp: string;
  category: 'Today' | 'Yesterday' | 'Earlier';
}

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
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'All'>('All');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await notifApi.list(activeFilter === 'All' ? undefined : activeFilter);
      
      // Map API notifications to UI entries
      const mapped = (data as Array<{ id: string; title: string; message: string; type: string; is_read: boolean; created_at: string }>)
        .map(n => {
          const date = new Date(n.created_at);
          const diffMs = Date.now() - date.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          
          let cat: 'Today' | 'Yesterday' | 'Earlier' = 'Earlier';
          if (diffDays === 0) cat = 'Today';
          else if (diffDays === 1) cat = 'Yesterday';

          // Format timestamp
          const timestamp = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + date.toLocaleDateString();

          return {
            id: n.id,
            title: n.title,
            description: n.message,
            type: (n.type || 'System') as NotificationType,
            isRead: n.is_read,
            timestamp,
            category: cat
          };
        });

      setNotifications(mapped);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFilter]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notifApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notifApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            n.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [notifications, searchQuery]);

  const totalUnread = notifications.filter(n => !n.isRead).length;
  const complianceAlerts = notifications.filter(n => n.type === 'Governance' && !n.isRead).length;
  const csrUpdates = notifications.filter(n => n.type === 'Social' && !n.isRead).length;
  const badgeUnlocks = notifications.filter(n => n.type === 'Gamification' && !n.isRead).length;

  const todayNotifications = filteredNotifications.filter(n => n.category === 'Today');
  const yesterdayNotifications = filteredNotifications.filter(n => n.category === 'Yesterday');
  const earlierNotifications = filteredNotifications.filter(n => n.category === 'Earlier');

  const renderNotificationGroup = (title: string, group: NotificationEntry[]) => {
    if (group.length === 0) return null;
    return (
      <div className="mb-8 last:mb-0 animate-in fade-in slide-in-from-top-2">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{title}</h3>
        <div className="space-y-3">
          {group.map(n => (
            <div 
              key={n.id} 
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                n.isRead 
                  ? 'bg-white border-slate-100 hover:border-slate-200 opacity-75' 
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
              {totalUnread > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-sm font-bold px-2.5 py-0.5 rounded-full">
                  {totalUnread} new
                </span>
              )}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Stay updated on your ESG goals, alerts, and team activities.</p>
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => loadData()} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleMarkAllAsRead}
              disabled={totalUnread === 0}
              className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
                totalUnread > 0 
                  ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm' 
                  : 'bg-slate-50 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark all as read
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Unread</p>
              <p className="text-xl font-bold text-slate-900">{loading ? '–' : totalUnread}</p>
            </div>
          </Card>
          
          <Card className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Alerts</p>
              <p className="text-xl font-bold text-slate-900">{loading ? '–' : complianceAlerts}</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">CSR</p>
              <p className="text-xl font-bold text-slate-900">{loading ? '–' : csrUpdates}</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Badges</p>
              <p className="text-xl font-bold text-slate-900">{loading ? '–' : badgeUnlocks}</p>
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
            {loading ? (
              <div className="space-y-4">
                {Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
            ) : filteredNotifications.length === 0 ? (
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
