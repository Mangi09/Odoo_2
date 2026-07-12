import React, { useState } from 'react';
import {
  Target, Star, Gift, Shield, CheckCircle2, Trophy, Flame, TrendingUp, TrendingDown,
  Leaf, Recycle, Zap, Heart, Sun, Package, Coffee, Gamepad2, Gem, Swords, Sparkles, Award, Crown, Medal
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
      <div className="max-w-7xl mx-auto space-y-8 relative">

        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-20 right-4 md:right-8 z-50 animate-in fade-in slide-in-from-top-2 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${darkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white text-slate-900 border border-slate-200'}`}>
            {notification.icon}
            <p className="text-sm font-medium">{notification.msg}</p>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg shadow-yellow-500/20">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold tracking-tight flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Gamification Hub <Sparkles className="w-6 h-6 text-yellow-500" />
              </h1>
              <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Level up your sustainability impact. Earn XP, unlock badges, and redeem rewards!</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`rounded-2xl p-6 transition-all hover:shadow-lg border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white flex items-center justify-center shadow-md shadow-yellow-500/20">
                <Target className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-yellow-500 font-semibold text-sm mb-1">Active Quests</h3>
            <div className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{summary.activeChallenges}</div>
          </div>

          <div className={`rounded-2xl p-6 transition-all hover:shadow-lg border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 text-white flex items-center justify-center shadow-md shadow-yellow-500/20">
                <Star className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-yellow-500 font-semibold text-sm mb-1">Total XP</h3>
            <div className="text-3xl font-bold text-yellow-500 tracking-tight">{summary.totalXP.toLocaleString()} ✨</div>
          </div>

          <div className={`rounded-2xl p-6 transition-all hover:shadow-lg border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <Medal className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-yellow-500 font-semibold text-sm mb-1">Badges Unlocked</h3>
            <div className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{summary.badgesUnlocked}</div>
          </div>

          <div className={`rounded-2xl p-6 transition-all hover:shadow-lg border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Gift className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-yellow-500 font-semibold text-sm mb-1">Rewards Redeemed</h3>
            <div className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{summary.rewardsRedeemed}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">

            {/* Active Quests */}
            <div className={`rounded-2xl p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Flame className="w-5 h-5 text-orange-500" /> Active Quests
              </h3>
              <div className="space-y-4">
                {challenges.filter(c => c.status === 'Active').map(challenge => (
                  <div key={challenge.id} className={`p-4 rounded-xl border transition-all ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
                          <Flame className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold mb-0.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{challenge.title}</h4>
                          <p className={`text-xs mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{challenge.description}</p>
                          <div className="flex items-center gap-3 text-xs font-semibold">
                            <span className="flex items-center gap-1 text-yellow-500"><Star className="w-3 h-3" /> +{challenge.xp} XP</span>
                            <span className={`px-2 py-0.5 rounded-full ${challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                              {challenge.difficulty}
                            </span>
                            <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>Ends {challenge.deadline}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCompleteChallenge(challenge.id)}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 rounded-lg text-sm font-bold transition-all shadow-md shadow-yellow-500/20 shrink-0 whitespace-nowrap"
                      >
                        Complete Quest
                      </button>
                    </div>
                  </div>
                ))}
                {challenges.filter(c => c.status === 'Active').length === 0 && (
                  <div className={`p-8 text-center rounded-xl border ${darkMode ? 'bg-slate-700/30 border-slate-600 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    No active quests. Check back later!
                  </div>
                )}
              </div>
            </div>

            {/* Trophy Case */}
            <div className={`rounded-2xl p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Award className="w-5 h-5 text-yellow-500" /> Trophy Case
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {badges.map(badge => (
                  <div key={badge.id} className={`p-4 rounded-xl border transition-all text-center ${badge.isUnlocked ? (darkMode ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200') : (darkMode ? 'bg-slate-700/30 border-slate-600 opacity-60' : 'bg-slate-50 border-slate-200 opacity-70')}`}>
                    <div className={`w-16 h-16 rounded-2xl mb-3 flex items-center justify-center shadow-lg mx-auto ${badge.tier === 'Bronze' ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/20' : badge.tier === 'Silver' ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-500/20' : badge.tier === 'Gold' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-yellow-500/20' : 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-indigo-500/20'}`}>
                      <IconWrapper name={badge.iconName} className="w-8 h-8" />
                    </div>
                    <h4 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{badge.title}</h4>
                    {!badge.isUnlocked ? (
                      <div className="w-full mt-2">
                        <div className={`w-full rounded-full h-2 overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-slate-200'}`}>
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full" style={{ width: `${badge.progress}%` }} />
                        </div>
                        <span className={`text-[10px] font-semibold mt-1 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{badge.progress}%</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-yellow-600 mt-2 inline-block bg-yellow-100 border border-yellow-200 px-2 py-0.5 rounded-full">✨ Unlocked!</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards Shop */}
            <div className={`rounded-2xl p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Gift className="w-5 h-5 text-green-500" /> Rewards Shop
                </h3>
                <span className="text-sm font-bold text-yellow-500 flex items-center gap-1 bg-yellow-100 dark:bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-500/30">
                  <Gem className="w-4 h-4" /> {summary.totalXP.toLocaleString()} XP
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rewardsCatalog.map(reward => {
                  const canAfford = summary.totalXP >= reward.cost;
                  return (
                    <div key={reward.id} className={`p-4 rounded-xl border transition-all ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                            <IconWrapper name={reward.imageIcon} className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{reward.title}</h4>
                            <span className="text-xs font-bold text-yellow-500 flex items-center gap-1">
                              <Star className="w-3 h-3" /> {reward.cost.toLocaleString()} XP
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRedeem(reward)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md shrink-0 whitespace-nowrap ${canAfford ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-yellow-500/20' : (darkMode ? 'bg-slate-700 text-slate-500 cursor-not-allowed shadow-slate-900/20' : 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-slate-200/20')}`}
                        >
                          Redeem
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Leaderboard */}
            <div className={`rounded-2xl p-6 border flex flex-col ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className={`text-base font-bold mb-5 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Crown className="w-5 h-5 text-yellow-500" /> Leaderboard
              </h3>
              <div className={`flex p-1 rounded-lg mb-4 shrink-0 border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-yellow-100 border-yellow-200'}`}>
                <button
                  onClick={() => setLeaderboardType('employees')}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-colors ${leaderboardType === 'employees' ? (darkMode ? 'bg-slate-600 text-yellow-400 shadow-sm' : 'bg-white shadow-sm text-yellow-700') : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800')}`}
                >
                  Players
                </button>
                <button
                  onClick={() => setLeaderboardType('departments')}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-colors ${leaderboardType === 'departments' ? (darkMode ? 'bg-slate-600 text-yellow-400 shadow-sm' : 'bg-white shadow-sm text-yellow-700') : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800')}`}
                >
                  Guilds
                </button>
              </div>

              <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                {leaderboardData.map((entry, idx) => (
                  <div key={entry.id} className={`p-3 rounded-xl border transition-all flex items-center justify-between ${entry.name === 'You' ? (darkMode ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200') : (darkMode ? 'border-slate-600 hover:bg-slate-700/30' : 'border-slate-200 hover:bg-slate-50')}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-7 text-center font-bold text-lg ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {idx === 0 ? <Crown className="w-5 h-5" /> : idx === 1 ? <Medal className="w-5 h-5" /> : idx === 2 ? <Award className="w-5 h-5" /> : `#${entry.rank}`}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
                        {entry.avatarInitials}
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold line-clamp-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{entry.name}</h4>
                        <p className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>{entry.department}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-yellow-500 flex items-center gap-1">
                        <Star className="w-3 h-3" /> {entry.score.toLocaleString()}
                      </span>
                      {entry.trend === 'up' ? <TrendingUp className="w-3 h-3 text-green-500" /> : entry.trend === 'down' ? <TrendingDown className="w-3 h-3 text-red-500" /> : <div className="w-3 h-3 flex items-center justify-center"><div className={`w-2 h-0.5 ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`} /></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-2xl p-6 border relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-emerald-600/20 to-green-700/20 border-emerald-500/30' : 'bg-gradient-to-br from-emerald-600 to-green-700 border-emerald-700'}`}>
              <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
                <Sparkles className="w-24 h-24 text-white" />
              </div>
              <div className="relative z-10">
                <span className="text-emerald-700 bg-white px-2 py-0.5 rounded-full text-xs font-semibold">Pro Tip</span>
                <h3 className="text-lg font-bold mt-3 mb-2 text-white">Want to level up faster?</h3>
                <p className="text-sm text-emerald-100 mb-5">Join the 'Zero Waste Week' challenge to earn a massive 500 XP boost and unlock the Platinum badge.</p>
                <button className="w-full py-2 bg-white text-green-700 hover:bg-emerald-50 rounded-lg text-sm font-bold transition-colors shadow-md">
                  View Quest
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Gamification;
