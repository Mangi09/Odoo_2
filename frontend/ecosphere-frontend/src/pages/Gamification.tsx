import React, { useState, useEffect } from 'react';
import { 
  Target, Star, Gift, Shield, CheckCircle2, Trophy, Flame, TrendingUp, TrendingDown,
  Gamepad2, Gem, Sparkles, Award, Crown, Medal, RefreshCw
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { gamification as gamApi } from '../lib/api';

interface Challenge { id: string; title: string; description: string; xpReward: number; type: string; difficulty: string; deadline: string; participants: number; isActive: boolean; userStatus: string; }
interface BadgeItem { id: string; name: string; description: string; icon: string; unlocked: boolean; unlockedAt?: string; tier?: string; }
interface LeaderEntry { id: string; name: string; xp: number; points: number; department: string; rank: number; role: string; avatarInitials?: string; trend?: 'up' | 'down' | 'same'; }
interface Reward { id: string; name: string; description: string; pointsRequired: number; stock: number; status: string; available: boolean; imageIcon: string; }

export const Gamification = ({ activePage, onPageChange, darkMode, setDarkMode }: {
  activePage?: string;
  onPageChange?: (page: string) => void;
  darkMode?: boolean;
  setDarkMode?: (mode: boolean) => void;
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [leaderType, setLeaderType] = useState<'employee' | 'department'>('employee');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ msg: string; icon: React.ReactNode } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const showNotification = (msg: string, icon: React.ReactNode = <CheckCircle2 className="w-5 h-5 text-green-400" />) => {
    setNotification({ msg, icon });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = async (type = leaderType) => {
    setLoading(true);
    try {
      const [chs, bds, lb, rws] = await Promise.all([
        gamApi.challenges(), gamApi.badges(), gamApi.leaderboard(type), gamApi.rewards()
      ]);
      setChallenges(chs as Challenge[]);
      setBadges(bds as BadgeItem[]);
      setLeaderboard(lb as LeaderEntry[]);
      setRewards(rws as Reward[]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadData();
  }, []);

  const switchLeaderboard = async (type: 'employee' | 'department') => {
    setLeaderType(type);
    try {
      const lb = await gamApi.leaderboard(type);
      setLeaderboard(lb as LeaderEntry[]);
    } catch (err) { console.error(err); }
  };

  const handleComplete = async (challenge: Challenge) => {
    setActionLoading(`complete-${challenge.id}`);
    try {
      const result = await gamApi.complete(challenge.id);
      const res = result as { xpAwarded: number };
      showNotification(`🏆 Challenge Completed! +${res.xpAwarded} XP earned!`, <Trophy className="w-5 h-5 text-yellow-400" />);
      await loadData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(`❌ ${e.message || 'Failed to complete challenge'}`, <Shield className="w-5 h-5 text-red-400" />);
    } finally { setActionLoading(null); }
  };

  const handleRedeem = async (reward: Reward) => {
    setActionLoading(`redeem-${reward.id}`);
    try {
      await gamApi.redeem(reward.id);
      showNotification(`🎁 Successfully redeemed: ${reward.name}!`, <Gift className="w-5 h-5 text-blue-400" />);
      await loadData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(`❌ ${e.message || 'Redemption failed'}`, <Shield className="w-5 h-5 text-red-400" />);
    } finally { setActionLoading(null); }
  };

  const activeChallenges = challenges.filter(c => c.isActive && c.userStatus !== 'Completed');
  const unlockedBadgesCount = badges.filter(b => b.unlocked).length;
  const totalXpValue = leaderboard.find(e => e.name === 'You')?.xp || leaderboard.find(e => e.role === 'Admin')?.xp || 12000;

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange} darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-7xl mx-auto space-y-8 relative">
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
          <button onClick={() => loadData()} className={`p-2.5 rounded-xl shadow-sm transition-all ${
            darkMode ? 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`rounded-2xl p-6 transition-all hover:shadow-lg border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white flex items-center justify-center shadow-md shadow-yellow-500/20">
                <Target className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-yellow-500 font-semibold text-sm mb-1">Active Quests</h3>
            <div className="text-3xl font-bold tracking-tight">{loading ? '–' : activeChallenges.length}</div>
          </div>

          <div className={`rounded-2xl p-6 transition-all hover:shadow-lg border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 text-white flex items-center justify-center shadow-md shadow-yellow-500/20">
                <Star className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-yellow-500 font-semibold text-sm mb-1">Total XP</h3>
            <div className="text-3xl font-bold text-yellow-500 tracking-tight">{loading ? '–' : totalXpValue.toLocaleString()} ✨</div>
          </div>

          <div className={`rounded-2xl p-6 transition-all hover:shadow-lg border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <Medal className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-yellow-500 font-semibold text-sm mb-1">Badges Unlocked</h3>
            <div className="text-3xl font-bold tracking-tight">{loading ? '–' : unlockedBadgesCount}</div>
          </div>

          <div className={`rounded-2xl p-6 transition-all hover:shadow-lg border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Gift className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-yellow-500 font-semibold text-sm mb-1">Rewards Catalog</h3>
            <div className="text-3xl font-bold tracking-tight">{loading ? '–' : rewards.filter(r => r.available).length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Active Quests */}
            <div className={`rounded-2xl p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Flame className="w-5 h-5 text-orange-500" /> Active Quests
              </h3>
              <div className="space-y-4">
                {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />) :
                  challenges.filter(c => c.isActive).map(ch => (
                    <div key={ch.id} className={`p-4 rounded-xl border transition-all ${ch.userStatus === 'Completed' ? 'border-green-200 bg-green-50/10' : (darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200')}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${ch.userStatus === 'Completed' ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-green-500/20' : 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-orange-500/20'}`}>
                            <Flame className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className={`text-sm font-bold mb-0.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{ch.title}</h4>
                            <p className={`text-xs mb-2 ${darkMode ? 'text-slate-400' : 'text-gray-550'}`}>{ch.description}</p>
                            <div className="flex items-center gap-3 text-xs font-semibold">
                              <span className="flex items-center gap-1 text-yellow-500"><Star className="w-3 h-3" /> +{ch.xpReward} XP</span>
                              <span className={`px-2 py-0.5 rounded-full ${ch.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : ch.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                {ch.difficulty}
                              </span>
                              <span className={darkMode ? 'text-slate-550' : 'text-slate-400'}>Ends {ch.deadline}</span>
                            </div>
                          </div>
                        </div>
                        {ch.userStatus !== 'Completed' ? (
                          <button
                            onClick={() => handleComplete(ch)}
                            disabled={actionLoading === `complete-${ch.id}`}
                            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 rounded-lg text-sm font-bold transition-all shadow-md shadow-yellow-500/20 shrink-0 whitespace-nowrap"
                          >
                            Complete Quest
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">Completed ✓</span>
                        )}
                      </div>
                    </div>
                  ))
                }
                {!loading && challenges.filter(c => c.isActive).length === 0 && (
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
                {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />) :
                  badges.map(badge => (
                    <div key={badge.id} className={`p-4 rounded-xl border transition-all text-center ${badge.unlocked ? (darkMode ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200') : (darkMode ? 'bg-slate-700/30 border-slate-600 opacity-60' : 'bg-slate-50 border-slate-200 opacity-70')}`}>
                      <div className={`w-16 h-16 rounded-2xl mb-3 flex items-center justify-center shadow-lg mx-auto ${badge.tier === 'Bronze' ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/20' : badge.tier === 'Silver' ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-500/20' : badge.tier === 'Gold' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-yellow-500/20' : 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-indigo-500/20'}`}>
                        <span className="text-2xl">{badge.icon}</span>
                      </div>
                      <h4 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{badge.name}</h4>
                      {badge.unlocked ? (
                        <span className="text-[10px] font-bold text-yellow-600 mt-2 inline-block bg-yellow-100 border border-yellow-200 px-2 py-0.5 rounded-full">✨ Unlocked!</span>
                      ) : (
                        <span className={`text-[10px] font-semibold mt-2 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Locked</span>
                      )}
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Rewards Shop */}
            <div className={`rounded-2xl p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Gift className="w-5 h-5 text-green-500" /> Rewards Shop
                </h3>
                <span className="text-sm font-bold text-yellow-500 flex items-center gap-1 bg-yellow-100 dark:bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-500/30">
                  <Gem className="w-4 h-4" /> {loading ? '–' : totalXpValue.toLocaleString()} XP
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loading ? Array(2).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />) :
                  rewards.map(reward => {
                    const canAfford = totalXpValue >= reward.pointsRequired;
                    return (
                      <div key={reward.id} className={`p-4 rounded-xl border transition-all ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 text-xl">
                              {reward.imageIcon || '🎁'}
                            </div>
                            <div>
                              <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{reward.name}</h4>
                              <span className="text-xs font-bold text-yellow-500 flex items-center gap-1">
                                <Star className="w-3 h-3" /> {reward.pointsRequired.toLocaleString()} XP
                              </span>
                              <span className={`text-[10px] ml-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{reward.stock} stock</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRedeem(reward)}
                            disabled={!reward.available || !canAfford || !!actionLoading}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md shrink-0 whitespace-nowrap ${
                              (reward.available && canAfford) 
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-yellow-500/20' 
                                : (darkMode ? 'bg-slate-700 text-slate-500 cursor-not-allowed shadow-slate-900/20' : 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-slate-200/20')
                            }`}
                          >
                            {actionLoading === `redeem-${reward.id}` ? '...' : reward.available ? 'Redeem' : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                }
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
                  onClick={() => switchLeaderboard('employee')}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-colors ${leaderType === 'employee' ? (darkMode ? 'bg-slate-600 text-yellow-400 shadow-sm' : 'bg-white shadow-sm text-yellow-700') : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800')}`}
                >
                  Players
                </button>
                <button
                  onClick={() => switchLeaderboard('department')}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-colors ${leaderType === 'department' ? (darkMode ? 'bg-slate-600 text-yellow-400 shadow-sm' : 'bg-white shadow-sm text-yellow-700') : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800')}`}
                >
                  Guilds
                </button>
              </div>

              <div className="overflow-y-auto pr-2 space-y-3 flex-1 max-h-[350px]">
                {loading ? Array(5).fill(0).map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />) :
                  leaderboard.map((entry, idx) => (
                    <div key={entry.id} className={`p-3 rounded-xl border transition-all flex items-center justify-between ${entry.name === 'You' ? (darkMode ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200') : (darkMode ? 'border-slate-600 hover:bg-slate-700/30' : 'border-slate-200 hover:bg-slate-50')}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-7 text-center font-bold text-lg ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {idx === 0 ? <Crown className="w-5 h-5" /> : idx === 1 ? <Medal className="w-5 h-5" /> : idx === 2 ? <Award className="w-5 h-5" /> : `#${entry.rank}`}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
                          {entry.avatarInitials || (entry.name || '?').slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className={`text-sm font-semibold line-clamp-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{entry.name}</h4>
                          <p className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>{entry.department}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-yellow-500 flex items-center gap-1">
                          <Star className="w-3 h-3" /> {(entry.xp || 0).toLocaleString()}
                        </span>
                        {entry.trend === 'up' ? <TrendingUp className="w-3 h-3 text-green-500" /> : entry.trend === 'down' ? <TrendingDown className="w-3 h-3 text-red-500" /> : <div className="w-3 h-3 flex items-center justify-center"><div className={`w-2 h-0.5 ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`} /></div>}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Gamification;
