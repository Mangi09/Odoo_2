import React, { useState, useEffect } from 'react';
import { 
  Mail, MapPin, Building, Calendar, Star, Leaf, Heart, Activity,
  Medal, Gift, Flame, RefreshCw, LogOut
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { profile as profileApi, gamification as gamApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Card = ({ children, className = '', darkMode = false }: { children: React.ReactNode; className?: string; darkMode?: boolean }) => (
  <div className={`${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-green-100'} rounded-2xl shadow-sm border p-6 ${className}`}>
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

export const Profile = ({ activePage, onPageChange, darkMode, setDarkMode }: {
  activePage?: string;
  onPageChange?: (page: string) => void;
  darkMode?: boolean;
  setDarkMode?: (mode: boolean) => void;
}) => {
  const { logout } = useAuth();
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
    <DashboardLayout activePage={activePage} onPageChange={onPageChange} darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-7xl mx-auto space-y-6 relative">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>My Profile</h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>View your ESG impact, gamification stats, and activity history.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => loadData()} className={`p-2.5 rounded-xl shadow-sm transition-all ${
              darkMode ? 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`} title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => logout()}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                darkMode ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Left Column: User Card & Badges */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* User Profile Card */}
            <Card className="text-center pb-8" darkMode={darkMode}>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="w-24 h-24 rounded-full bg-slate-100 mx-auto" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto" />
                  <div className="h-3 bg-slate-100 rounded w-1/3 mx-auto" />
                </div>
              ) : profile && (
                <>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold text-3xl mx-auto mb-4 shadow-lg ring-4 ring-green-50 dark:ring-green-500/30">
                    {profile.avatarInitials || (profile.name || '?').slice(0,2).toUpperCase()}
                  </div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{profile.name}</h2>
                  <p className="text-sm font-medium text-green-600 mb-6">{profile.role}</p>
                  
                  <div className="space-y-3 text-left">
                    <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                      <Building className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-450'}`} />
                      <span>{profile.department || 'HQ'}</span>
                    </div>
                    <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                      <MapPin className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-455'}`} />
                      <span>{profile.location || 'San Francisco, CA'}</span>
                    </div>
                    <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                      <Mail className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-460'}`} />
                      <span>{profile.email}</span>
                    </div>
                    <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                      <Calendar className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-465'}`} />
                      <span>Joined {profile.joinDate ? profile.joinDate.split('T')[0] : 'Just now'}</span>
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* Badges Earned */}
            <Card darkMode={darkMode}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                  <Medal className="w-5 h-5 text-indigo-500" /> Badges Earned
                </h3>
                <span className={`text-sm font-bold text-green-600 px-2 py-0.5 rounded-full ${darkMode ? 'bg-green-500/20' : 'bg-green-50'}`}>
                  {loading ? '–' : badges.filter(b => b.unlocked).length}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {loading ? (
                  Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)
                ) : badges.filter(b => b.unlocked).map(badge => (
                  <div key={badge.id} className={`flex flex-col items-center p-2 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-100'}`} title={badge.description}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 shadow-sm bg-indigo-50 text-indigo-600 text-lg">
                      {badge.icon}
                    </div>
                    <span className={`text-[10px] font-semibold text-center leading-tight line-clamp-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
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
              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-default group border-teal-100 dark:border-teal-500/20 bg-gradient-to-b from-white dark:from-slate-800 to-teal-50/30 dark:to-teal-500/10" darkMode={darkMode}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform ${darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-600'}`}>
                  <Star className="w-5 h-5" />
                </div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{loading ? '–' : profile?.xp.toLocaleString()}</p>
                <p className={`text-[11px] font-semibold uppercase tracking-wider mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total XP</p>
              </Card>

              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-default group border-green-100 dark:border-green-500/20 bg-gradient-to-b from-white dark:from-slate-800 to-green-50/30 dark:to-green-500/10" darkMode={darkMode}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
                  <Leaf className="w-5 h-5" />
                </div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{loading ? '–' : profile?.carbonSaved || 0}</p>
                <p className={`text-[11px] font-semibold uppercase tracking-wider mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>kg CO₂e Saved</p>
              </Card>

              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-default group border-orange-100 dark:border-orange-500/20 bg-gradient-to-b from-white dark:from-slate-800 to-orange-50/30 dark:to-orange-500/10" darkMode={darkMode}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform ${darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
                  <Flame className="w-5 h-5" />
                </div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{loading ? '–' : profile?.challengesCompleted || 0}</p>
                <p className={`text-[11px] font-semibold uppercase tracking-wider mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Challenges</p>
              </Card>

              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-default group border-teal-100 dark:border-teal-500/20 bg-gradient-to-b from-white dark:from-slate-800 to-teal-50/30 dark:to-teal-500/10" darkMode={darkMode}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform ${darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-600'}`}>
                  <Heart className="w-5 h-5" />
                </div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{loading ? '–' : profile?.csrEventsAttended || 0}</p>
                <p className={`text-[11px] font-semibold uppercase tracking-wider mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>CSR Events</p>
              </Card>
            </div>

            {/* History Tabs & List */}
            <Card className="h-[480px] flex flex-col" darkMode={darkMode}>
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                  <Activity className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} /> Activity History
                </h3>
              </div>
              
              <div className={`flex p-1 rounded-xl mb-4 shrink-0 overflow-x-auto hide-scrollbar ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                {(['All', 'Challenge', 'CSR', 'Reward'] as const).map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 text-xs font-semibold py-2 px-4 rounded-lg transition-colors whitespace-nowrap ${
                      activeTab === tab 
                        ? (darkMode ? 'bg-slate-600 text-green-400 shadow-sm' : 'bg-white shadow-sm text-green-700') 
                        : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700')
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
                  <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                    darkMode ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        item.type === 'Challenge' ? (darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-500') :
                        item.type === 'CSR' ? (darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-50 text-teal-500') :
                        (darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-500')
                      }`}>
                        {item.type === 'Challenge' ? <Flame className="w-5 h-5" /> :
                         item.type === 'CSR' ? <Heart className="w-5 h-5" /> :
                         <Gift className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{item.title}</h4>
                        <div className={`flex items-center gap-2 text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
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
                      <p className={`text-[10px] font-medium mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>{item.type === 'Reward' ? 'Points spent' : 'XP earned'}</p>
                    </div>
                  </div>
                ))}
                
                {!loading && history.length === 0 && (
                  <div className="text-center py-10">
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>No {activeTab.toLowerCase()} history found.</p>
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
