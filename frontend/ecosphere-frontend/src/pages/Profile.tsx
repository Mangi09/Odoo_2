import React, { useState } from 'react';
import {
  Mail, MapPin, Building, Calendar, Star, Leaf, Heart, Activity,
  Medal, Gift, Flame, Zap, LogOut
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  currentUser, currentProfileStats, profileHistory
} from '../data/mockProfileData';
import { initialBadges } from '../data/mockGamificationData';


// Reusable Components
const Card = ({ children, className = '', darkMode = false }: { children: React.ReactNode; className?: string; darkMode?: boolean }) => (
  <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-green-100'} rounded-2xl shadow-sm border p-6 ${className}`}>
    {children}
  </div>
);

const IconWrapper = ({ name, className = '' }: { name: string; className?: string }) => {
  switch (name) {
    case 'Leaf': return <Leaf className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Heart': return <Heart className={className} />;
    default: return <Star className={className} />;
  }
};

export const Profile = ({ activePage, onPageChange, darkMode, setDarkMode, onLogout }: {
  activePage?: string;
  onPageChange?: (page: string) => void;
  darkMode?: boolean;
  setDarkMode?: (mode: boolean) => void;
  onLogout?: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Challenge' | 'CSR' | 'Reward'>('All');

  const filteredHistory = activeTab === 'All'
    ? profileHistory
    : profileHistory.filter(h => h.type === activeTab);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange} darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-7xl mx-auto space-y-6 relative">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>My Profile</h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>View your ESG impact, gamification stats, and activity history.</p>
          </div>
          <button
            onClick={handleLogout}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${darkMode
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left Column: User Card & Badges */}
          <div className="lg:col-span-1 space-y-6">

            {/* User Profile Card */}
            <Card className="text-center pb-8" darkMode={darkMode}>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold text-3xl mx-auto mb-4 shadow-lg ring-4 ring-green-50 dark:ring-green-500/30">
                {currentUser.avatarInitials}
              </div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{currentUser.name}</h2>
              <p className="text-sm font-medium text-green-600 mb-6">{currentUser.role}</p>

              <div className="space-y-3 text-left">
                <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  <Building className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                  <span>{currentUser.department}</span>
                </div>
                <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  <MapPin className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                  <span>{currentUser.location}</span>
                </div>
                <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  <Mail className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                  <span>{currentUser.email}</span>
                </div>
                <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  <Calendar className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                  <span>Joined {currentUser.joinDate}</span>
                </div>
              </div>
            </Card>

            {/* Badges Earned */}
            <Card darkMode={darkMode}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                  <Medal className="w-5 h-5 text-green-500" /> Badges Earned
                </h3>
                <span className={`text-sm font-bold text-green-600 px-2 py-0.5 rounded-full ${darkMode ? 'bg-green-500/20' : 'bg-green-50'}`}>
                  {currentProfileStats.badgesEarned}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {initialBadges.filter(b => b.isUnlocked).map(badge => (
                  <div key={badge.id} className={`flex flex-col items-center p-2 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-100'
                    }`} title={badge.description}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 shadow-sm ${badge.tier === 'Bronze' ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                        badge.tier === 'Silver' ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white' :
                          badge.tier === 'Gold' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                            'bg-gradient-to-br from-green-400 to-green-600 text-white'
                      }`}>
                      <IconWrapper name={badge.iconName} className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-semibold text-center leading-tight line-clamp-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                      {badge.title}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* Right Column: Stats & History */}
          <div className="lg:col-span-2 space-y-6">

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-default group border-teal-100 dark:border-teal-500/20 bg-gradient-to-b from-white dark:from-slate-800 to-teal-50/30 dark:to-teal-500/10" darkMode={darkMode}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform ${darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-600'
                  }`}>
                  <Star className="w-5 h-5" />
                </div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{currentProfileStats.totalXP.toLocaleString()}</p>
                <p className={`text-[11px] font-semibold uppercase tracking-wider mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total XP</p>
              </Card>

              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-default group border-green-100 dark:border-green-500/20 bg-gradient-to-b from-white dark:from-slate-800 to-green-50/30 dark:to-green-500/10" darkMode={darkMode}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                  }`}>
                  <Leaf className="w-5 h-5" />
                </div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{currentProfileStats.carbonSaved}</p>
                <p className={`text-[11px] font-semibold uppercase tracking-wider mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>kg CO₂e Saved</p>
              </Card>

              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-default group border-orange-100 dark:border-orange-500/20 bg-gradient-to-b from-white dark:from-slate-800 to-orange-50/30 dark:to-orange-500/10" darkMode={darkMode}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform ${darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
                  }`}>
                  <Flame className="w-5 h-5" />
                </div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{currentProfileStats.challengesCompleted}</p>
                <p className={`text-[11px] font-semibold uppercase tracking-wider mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Challenges</p>
              </Card>

              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-default group border-teal-100 dark:border-teal-500/20 bg-gradient-to-b from-white dark:from-slate-800 to-teal-50/30 dark:to-teal-500/10" darkMode={darkMode}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform ${darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-600'
                  }`}>
                  <Heart className="w-5 h-5" />
                </div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{currentProfileStats.csrEventsAttended}</p>
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

              <div className={`flex p-1 rounded-xl mb-4 shrink-0 overflow-x-auto hide-scrollbar ${darkMode ? 'bg-slate-700' : 'bg-gray-100'
                }`}>
                {['All', 'Challenge', 'CSR', 'Reward'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 text-xs font-semibold py-2 px-4 rounded-lg transition-colors whitespace-nowrap ${activeTab === tab
                        ? (darkMode ? 'bg-slate-600 text-green-400 shadow-sm' : 'bg-white shadow-sm text-green-700')
                        : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700')
                      }`}
                  >
                    {tab === 'All' ? 'All Activity' : tab === 'CSR' ? 'CSR Events' : `${tab}s`}
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto pr-2 space-y-3 flex-1 custom-scrollbar">
                {filteredHistory.map((item) => (
                  <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${darkMode
                      ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                    }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'Challenge' ? (darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-500') :
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
                          <span className={`font-medium ${item.status === 'Completed' ? 'text-green-600' :
                              item.status === 'Attended' ? 'text-teal-600' :
                                'text-amber-600'
                            }`}>
                            {item.status}
                          </span>
                          <span>•</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-bold ${item.type === 'Reward' ? 'text-red-500' : 'text-green-500'}`}>
                        {item.type === 'Reward' ? '-' : '+'}{item.points.toLocaleString()}
                      </span>
                      <p className={`text-[10px] font-medium mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                        {item.type === 'Reward' ? 'XP Spent' : 'XP Earned'}
                      </p>
                    </div>
                  </div>
                ))}

                {filteredHistory.length === 0 && (
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
