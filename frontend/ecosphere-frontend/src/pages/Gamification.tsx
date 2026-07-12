import React, { useState } from 'react';
import {
  Target, Star, Gift, Shield, CheckCircle2, Trophy, Flame, TrendingUp, TrendingDown,
  Leaf, Recycle, Zap, Heart, Sun, Package, Coffee, Gamepad2, Gem, Swords, Sparkles, Award, Crown, Medal, Lock, Zap as ZapIcon
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  initialGamificationSummary, initialChallenges, initialBadges, employeeLeaderboard, departmentLeaderboard, rewardsCatalog
} from '../data/mockGamificationData';
import type { GameChallenge, Badge as BadgeType, RewardItem } from '../types/gamification';

const IconWrapper = ({ name, className = '' }: { name: string, className?: string }) => {
  switch (name) {
    case 'Leaf': return <Leaf className={className} />;
    case 'Recycle': return <Recycle className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Sun': return <Sun className={className} />;
    case 'Package': return <Package className={className} />;
    case 'Coffee': return <Coffee className={className} />;
    case 'Gift': return <Gift className={className} />;
    case 'Gamepad': return <Gamepad2 className={className} />;
    case 'Gem': return <Gem className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Award': return <Award className={className} />;
    case 'Crown': return <Crown className={className} />;
    case 'Medal': return <Medal className={className} />;
    default: return <Star className={className} />;
  }
};

const Card = ({ children, className = '', darkMode = false }: { children: React.ReactNode; className?: string; darkMode?: boolean }) => (
  <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-green-100'} rounded-2xl shadow-sm border p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', darkMode = false }: { children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'default', darkMode?: boolean }) => {
  const styles = {
    success: darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-700',
    warning: darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-700',
    error: darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700',
    default: darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-700'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>{children}</span>;
};

export const Gamification = ({ activePage, onPageChange, darkMode, setDarkMode }: { activePage?: string, onPageChange?: (page: string) => void, darkMode?: boolean, setDarkMode?: (v: boolean) => void }) => {
  const [summary, setSummary] = useState(initialGamificationSummary);
  const [challenges, setChallenges] = useState<GameChallenge[]>(initialChallenges);
  const [badges, setBadges] = useState<BadgeType[]>(initialBadges);
  const [leaderboardType, setLeaderboardType] = useState<'employees' | 'departments'>('employees');
  const [employees, setEmployees] = useState(employeeLeaderboard);
  const [notification, setNotification] = useState<{ msg: string, icon: React.ReactNode } | null>(null);

  const showNotification = (msg: string, icon: React.ReactNode = <CheckCircle2 className="w-5 h-5 text-green-400" />) => {
    setNotification({ msg, icon });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCompleteChallenge = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, status: 'Completed' } : c));
    setSummary(prev => ({ ...prev, totalXP: prev.totalXP + challenge.xp, activeChallenges: prev.activeChallenges - 1 }));

    setEmployees(prev => {
      const newLeaderboard = [...prev];
      const myIndex = newLeaderboard.findIndex(e => e.name === 'You');
      if (myIndex > -1) {
        newLeaderboard[myIndex] = { ...newLeaderboard[myIndex], score: newLeaderboard[myIndex].score + challenge.xp, trend: 'up' };
        newLeaderboard.sort((a, b) => b.score - a.score);
        newLeaderboard.forEach((e, idx) => { e.rank = idx + 1; });
      }
      return newLeaderboard;
    });

    let unlockedBadge = false;
    setBadges(prev => {
      const newBadges = [...prev];
      const energyBadge = newBadges.find(b => b.id === 'b-3' && !b.isUnlocked);
      if (energyBadge && summary.totalXP + challenge.xp >= 13000) {
        energyBadge.isUnlocked = true;
        energyBadge.progress = 100;
        energyBadge.unlockedAt = new Date().toISOString().split('T')[0];
        unlockedBadge = true;
        setSummary(s => ({ ...s, badgesUnlocked: s.badgesUnlocked + 1 }));
      }
      return newBadges;
    });

    if (unlockedBadge) {
      showNotification(`Challenge Completed! You earned ${challenge.xp} XP and unlocked a new Badge!`, <Trophy className="w-5 h-5 text-yellow-400" />);
    } else {
      showNotification(`Challenge Completed! You earned ${challenge.xp} XP!`, <Flame className="w-5 h-5 text-orange-400" />);
    }
  };

  const handleRedeem = (reward: RewardItem) => {
    if (summary.totalXP < reward.cost) {
      showNotification(`Not enough XP to redeem ${reward.title}.`, <Shield className="w-5 h-5 text-red-400" />);
      return;
    }

    setSummary(prev => ({ ...prev, totalXP: prev.totalXP - reward.cost, rewardsRedeemed: prev.rewardsRedeemed + 1 }));
    showNotification(`Successfully redeemed: ${reward.title}!`, <Gift className="w-5 h-5 text-green-400" />);
  };

  const leaderboardData = leaderboardType === 'employees' ? employees : departmentLeaderboard;

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange} darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-7xl mx-auto space-y-6 relative">

        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-20 right-4 md:right-8 z-50 animate-in fade-in slide-in-from-top-4 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 ${darkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white text-slate-900 border border-slate-100'}`}>
            {notification.icon}
            <p className="text-sm font-medium">{notification.msg}</p>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Gamification Hub</h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Earn XP, unlock badges, and redeem rewards through sustainable actions.</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${darkMode ? 'bg-slate-800 border border-slate-700 text-yellow-400' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            <Star className="w-4 h-4" /> {summary.totalXP.toLocaleString()} XP Available
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Active Challenges', value: summary.activeChallenges, icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Total XP Earned', value: summary.totalXP.toLocaleString(), icon: Star, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Badges Unlocked', value: summary.badgesUnlocked, icon: Award, color: 'text-teal-600', bg: 'bg-teal-50' },
            { label: 'Rewards Redeemed', value: summary.rewardsRedeemed, icon: Gift, color: 'text-lime-600', bg: 'bg-lime-50' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} darkMode={darkMode} className="hover:shadow-md transition-shadow cursor-default">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-slate-700 text-green-400' : `${item.bg} ${item.color}`} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</h3>
                  <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{item.value}</div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">

            {/* Active Challenges */}
            <Card darkMode={darkMode}>
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-base font-semibold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  <Flame className="w-5 h-5 text-orange-500" /> Active Challenges
                </h3>
                <Badge variant="default" darkMode={darkMode}>{challenges.filter(c => c.status === 'Active').length} Active</Badge>
              </div>
              <div className="space-y-3">
                {challenges.filter(c => c.status === 'Active').map(challenge => (
                  <div key={challenge.id} className={`p-4 rounded-xl border transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-green-50 hover:border-green-100 hover:bg-green-50/50'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                          <Flame className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{challenge.title}</h4>
                          <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{challenge.description}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                              <Star className="w-3 h-3" /> +{challenge.xp} XP
                            </span>
                            <Badge
                              variant={challenge.difficulty === 'Easy' ? 'success' : challenge.difficulty === 'Medium' ? 'warning' : 'error'}
                              darkMode={darkMode}
                            >
                              {challenge.difficulty}
                            </Badge>
                            <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Ends {challenge.deadline}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCompleteChallenge(challenge.id)}
                        className="px-4 py-2.5 bg-green-600 border border-transparent rounded-xl text-sm font-medium text-white hover:bg-green-700 transition-all shadow-sm shrink-0 whitespace-nowrap"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                ))}
                {challenges.filter(c => c.status === 'Active').length === 0 && (
                  <div className={`p-8 text-center rounded-xl border ${darkMode ? 'bg-slate-700/30 border-slate-600 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                    <p className="text-sm font-medium">No active challenges. Check back later!</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Trophy Case */}
            <Card darkMode={darkMode}>
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-base font-semibold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  <Award className="w-5 h-5 text-yellow-500" /> Trophy Case
                </h3>
                <button className="text-green-600 text-sm font-medium hover:text-green-700" aria-label="View all badges">View All</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {badges.map(badge => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-xl border transition-colors text-center ${badge.isUnlocked
                      ? (darkMode ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50/50 border-green-200')
                      : (darkMode ? 'bg-slate-700/30 border-slate-600 opacity-70' : 'bg-slate-50 border-slate-200 opacity-80')
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center mx-auto ${badge.tier === 'Bronze'
                      ? (darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600')
                      : badge.tier === 'Silver'
                        ? (darkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-500')
                        : badge.tier === 'Gold'
                          ? (darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-50 text-yellow-600')
                          : (darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600')
                      }`}>
                      {badge.isUnlocked ? (
                        <IconWrapper name={badge.iconName} className="w-6 h-6" />
                      ) : (
                        <Lock className="w-6 h-6" />
                      )}
                    </div>
                    <h4 className={`text-xs font-medium mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{badge.title}</h4>
                    {!badge.isUnlocked ? (
                      <div className="w-full">
                        <div className={`w-full rounded-full h-1.5 overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <div className={`h-1.5 rounded-full ${badge.progress > 60 ? 'bg-green-500' : 'bg-orange-500'} transition-all duration-700`} style={{ width: `${badge.progress}%` }} />
                        </div>
                        <span className={`text-xs mt-1.5 block ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{badge.progress}%</span>
                      </div>
                    ) : (
                      <Badge variant="success" darkMode={darkMode}>Unlocked</Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Rewards Shop */}
            <Card darkMode={darkMode}>
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-base font-semibold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  <Gift className="w-5 h-5 text-emerald-500" /> Rewards Shop
                </h3>
                <span className={`text-sm font-medium flex items-center gap-1.5 ${darkMode ? 'text-yellow-400' : 'text-green-700'}`}>
                  <Gem className="w-4 h-4" /> {summary.totalXP.toLocaleString()} XP
                </span>
              </div>
              <div className="space-y-3">
                {rewardsCatalog.map(reward => {
                  const canAfford = summary.totalXP >= reward.cost;
                  return (
                    <div key={reward.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors group cursor-pointer ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-green-50 hover:border-green-100 hover:bg-green-50/50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                          <IconWrapper name={reward.imageIcon} className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{reward.title}</h4>
                          <p className={`text-xs flex items-center gap-1 mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Star className="w-3 h-3" /> {reward.cost.toLocaleString()} XP
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${canAfford
                          ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                          : (darkMode ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed')
                          }`}
                      >
                        Redeem
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">

            {/* Leaderboard */}
            <Card darkMode={darkMode} className="flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-base font-semibold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  <Crown className="w-5 h-5 text-yellow-500" /> Leaderboard
                </h3>
              </div>
              <div className={`flex p-1 rounded-xl mb-4 shrink-0 ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <button
                  onClick={() => setLeaderboardType('employees')}
                  className={`flex-1 text-xs font-medium py-2 px-3 rounded-lg transition-all ${leaderboardType === 'employees'
                    ? (darkMode ? 'bg-slate-600 text-green-400 shadow-sm' : 'bg-white shadow-sm text-green-700')
                    : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')
                    }`}
                >
                  Employees
                </button>
                <button
                  onClick={() => setLeaderboardType('departments')}
                  className={`flex-1 text-xs font-medium py-2 px-3 rounded-lg transition-all ${leaderboardType === 'departments'
                    ? (darkMode ? 'bg-slate-600 text-green-400 shadow-sm' : 'bg-white shadow-sm text-green-700')
                    : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')
                    }`}
                >
                  Departments
                </button>
              </div>

              <div className="overflow-y-auto space-y-2 flex-1">
                {leaderboardData.map((entry, idx) => (
                  <div key={entry.id} className={`p-3 rounded-xl border transition-colors flex items-center justify-between ${entry.name === 'You'
                    ? (darkMode ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200')
                    : (darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50')
                    }`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-6 text-center text-xs font-semibold ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-600' : (darkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${entry.rank}`}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-xs font-medium text-white shrink-0">
                        {entry.avatarInitials}
                      </div>
                      <div>
                        <h4 className={`text-sm font-medium line-clamp-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{entry.name}</h4>
                        <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{entry.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {entry.score.toLocaleString()}
                      </span>
                      {entry.trend === 'up' ? (
                        <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                      ) : entry.trend === 'down' ? (
                        <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <div className={`w-3 h-0.5 ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pro Tip CTA Card */}
            <Card darkMode={darkMode} className={`relative overflow-hidden ${darkMode ? '!bg-gradient-to-br !from-green-500/10 !to-emerald-500/10 !border-green-500/20' : '!bg-gradient-to-br !from-green-500/10 !to-emerald-500/10 !border-none'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-green-500/10 opacity-50" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Pro Tip</h3>
                  <p className={`text-2xl font-semibold mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Level Up Faster</p>
                  <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Join the 'Zero Waste Week' challenge to earn 500 XP and unlock the Platinum badge.</p>
                </div>
                <button className="mt-4 w-full px-4 py-2.5 bg-green-600 border border-transparent rounded-xl text-sm font-medium text-white hover:bg-green-700 transition-all shadow-sm flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" /> View Challenge
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Gamification;
