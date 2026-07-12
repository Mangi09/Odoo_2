import React, { useState, useEffect } from 'react';
import { 
  Mail, MapPin, Building, Calendar, Star, Leaf, Heart, Activity,
  Medal, Gift, Flame, RefreshCw
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { profile as profileApi, gamification as gamApi } from '../lib/api';

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 ${className}`}>
    {children}
  </div>
);

interface ProfileData {
  name: string;
  email: string;
  role: string;
  department: string;
  location: string;
  joinDate: string;
  xp: number;
  points: number;
  badgesEarned: number;
  carbonSaved: number;
  challengesCompleted: number;
  csrEventsAttended: number;
  avatarInitials: string;
}

interface HistoryItem {
  id: string;
  title: string;
  type: 'Challenge' | 'CSR' | 'Reward';
  status: string;
  date: string;
  points: number;
}

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export const Profile = ({ activePage, onPageChange }: { activePage?: string, onPageChange?: (page: string) => void }) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Challenge' | 'CSR' | 'Reward'>('All');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prof, hist, bds] = await Promise.all([
        profileApi.me(),
        profileApi.history(activeTab === 'All' ? undefined : activeTab),
        gamApi.badges()
      ]);
      setProfile(prof as unknown as ProfileData);

      setHistory(hist as HistoryItem[]);
      setBadges(bds as BadgeItem[]);
    } catch (err) {
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange}>
      <div className="max-w-7xl mx-auto space-y-8 relative">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
            <p className="text-slate-500 mt-1 text-sm">View your ESG impact, gamification stats, and activity history.</p>
          </div>
          <button onClick={() => loadData()} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: User Card & Badges */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* User Profile Card */}
            <Card className="text-center pb-8">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="w-24 h-24 rounded-full bg-slate-100 mx-auto" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto" />
                  <div className="h-3 bg-slate-100 rounded w-1/3 mx-auto" />
                </div>
              ) : profile && (
                <>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-3xl mx-auto mb-4 shadow-lg ring-4 ring-indigo-50">
                    {profile.avatarInitials || (profile.name || '?').slice(0,2).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                  <p className="text-sm font-medium text-indigo-600 mb-6">{profile.role}</p>
                  
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span>{profile.department || 'HQ'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{profile.location || 'San Francisco, CA'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Joined {profile.joinDate ? profile.joinDate.split('T')[0] : 'Just now'}</span>
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* Badges Earned */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Medal className="w-5 h-5 text-indigo-500" /> Badges Earned
                </h3>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {loading ? '–' : badges.filter(b => b.unlocked).length}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {loading ? (
                  Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)
                ) : badges.filter(b => b.unlocked).map(badge => (
                  <div key={badge.id} className="flex flex-col items-center p-2 bg-slate-50 border border-slate-100 rounded-xl" title={badge.description}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 shadow-sm bg-indigo-50 text-indigo-600 text-lg">
                      {badge.icon}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-700 text-center leading-tight line-clamp-2">
                      {badge.name}
                    </span>
                  </div>
                ))}
                {!loading && badges.filter(b => b.unlocked).length === 0 && (
                  <p className="col-span-3 text-slate-400 text-xs text-center py-4">No badges unlocked yet.</p>
                )}
              </div>
            </Card>

          </div>

          {/* Right Column: Stats & History */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-default group border-indigo-100 bg-gradient-to-b from-white to-indigo-50/30">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Star className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{loading ? '–' : profile?.xp.toLocaleString()}</p>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">Total XP</p>
              </Card>

              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-default group border-green-100 bg-gradient-to-b from-white to-green-50/30">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Leaf className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{loading ? '–' : profile?.carbonSaved || 0}</p>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">kg CO₂e Saved</p>
              </Card>

              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-default group border-orange-100 bg-gradient-to-b from-white to-orange-50/30">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Flame className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{loading ? '–' : profile?.challengesCompleted || 0}</p>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">Challenges</p>
              </Card>

              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-default group border-blue-100 bg-gradient-to-b from-white to-blue-50/30">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Heart className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{loading ? '–' : profile?.csrEventsAttended || 0}</p>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">CSR Events</p>
              </Card>
            </div>

            {/* History Tabs & List */}
            <Card className="h-[480px] flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-slate-400" /> Activity History
                </h3>
              </div>
              
              <div className="flex bg-slate-100 p-1 rounded-xl mb-4 shrink-0 overflow-x-auto hide-scrollbar">
                {(['All', 'Challenge', 'CSR', 'Reward'] as const).map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 text-xs font-semibold py-2 px-4 rounded-lg transition-colors whitespace-nowrap ${
                      activeTab === tab 
                        ? 'bg-white shadow-sm text-indigo-700' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab === 'All' ? 'All Activity' : tab === 'CSR' ? 'CSR Events' : `${tab}s`}
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto pr-2 space-y-3 flex-1 custom-scrollbar">
                {loading ? (
                  Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)
                ) : history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        item.type === 'Challenge' ? 'bg-orange-50 text-orange-500' :
                        item.type === 'CSR' ? 'bg-blue-50 text-blue-500' :
                        'bg-green-50 text-green-500'
                      }`}>
                        {item.type === 'Challenge' ? <Flame className="w-5 h-5" /> :
                         item.type === 'CSR' ? <Heart className="w-5 h-5" /> :
                         <Gift className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className={`font-medium ${
                            item.status === 'Completed' || item.status === 'Approved' ? 'text-green-600' :
                            'text-amber-600'
                          }`}>
                            {item.status}
                          </span>
                          <span>•</span>
                          <span>{item.date ? item.date.split('T')[0] : ''}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`text-sm font-bold ${item.type === 'Reward' ? 'text-red-500' : 'text-green-500'}`}>
                        {item.type === 'Reward' ? '-' : '+'}{item.points.toLocaleString()}
                      </span>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">{item.type === 'Reward' ? 'Points spent' : 'XP earned'}</p>
                    </div>
                  </div>
                ))}
                
                {!loading && history.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-slate-500 text-sm">No {activeTab.toLowerCase()} history found.</p>
                  </div>
                )}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
