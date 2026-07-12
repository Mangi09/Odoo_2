import React, { useState, useEffect } from 'react';
import { Target, Star, Gift, Shield, CheckCircle2, Trophy, Flame, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { gamification as gamApi } from '../lib/api';

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 ${className}`}>{children}</div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'success' | 'warning' | 'error' | 'info' | 'default' }) => {
  const styles = { success: 'bg-green-100 text-green-700', warning: 'bg-orange-100 text-orange-700', error: 'bg-red-100 text-red-700', info: 'bg-indigo-100 text-indigo-700', default: 'bg-slate-100 text-slate-700' };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>{children}</span>;
};

interface Challenge { id: string; title: string; description: string; xpReward: number; type: string; difficulty: string; deadline: string; participants: number; isActive: boolean; userStatus: string; }
interface BadgeItem { id: string; name: string; description: string; icon: string; unlocked: boolean; unlockedAt?: string; }
interface LeaderEntry { id: string; name: string; xp: number; points: number; department: string; rank: number; role: string; }
interface Reward { id: string; name: string; description: string; pointsRequired: number; stock: number; status: string; available: boolean; }

export const Gamification = ({ activePage, onPageChange }: { activePage?: string, onPageChange?: (page: string) => void }) => {
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [chs, bds, lb, rws] = await Promise.all([
        gamApi.challenges(), gamApi.badges(), gamApi.leaderboard(leaderType), gamApi.rewards()
      ]);
      setChallenges(chs as Challenge[]);
      setBadges(bds as BadgeItem[]);
      setLeaderboard(lb as LeaderEntry[]);
      setRewards(rws as Reward[]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

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
  const unlockedBadges = badges.filter(b => b.unlocked).length;

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange}>
      <div className="max-w-7xl mx-auto space-y-8 relative">
        {notification && (
          <div className="fixed top-20 right-8 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2">
            {notification.icon}
            <p className="text-sm font-medium">{notification.msg}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gamification</h1>
            <p className="text-slate-500 mt-1 text-sm">Level up your sustainability impact. Earn XP, unlock badges, redeem rewards.</p>
          </div>
          <button onClick={() => loadData()} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Target, label: 'Active Challenges', value: activeChallenges.length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Star, label: 'Badges Unlocked', value: unlockedBadges, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { icon: Trophy, label: 'Total Challenges', value: challenges.length, color: 'text-orange-600', bg: 'bg-orange-50' },
            { icon: Gift, label: 'Rewards Available', value: rewards.filter(r => r.available).length, color: 'text-green-600', bg: 'bg-green-50' },
          ].map((s, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-4`}><s.icon className="w-5 h-5" /></div>
              <div className="text-2xl font-bold text-slate-900">{loading ? '–' : s.value}</div>
              <div className="text-slate-500 text-sm mt-1">{s.label}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Challenges */}
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Active Challenges</h3>
              <div className="space-y-4">
                {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />) :
                  challenges.filter(c => c.isActive).map(ch => (
                    <div key={ch.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-colors gap-4 ${ch.userStatus === 'Completed' ? 'border-green-200 bg-green-50/30' : 'border-slate-100 hover:border-blue-200 hover:bg-blue-50/30'}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${ch.userStatus === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          {ch.userStatus === 'Completed' ? <CheckCircle2 className="w-6 h-6" /> : <Flame className="w-6 h-6" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 mb-0.5">{ch.title}</h4>
                          <p className="text-xs text-slate-500 max-w-sm">{ch.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs font-medium">
                            <span className="text-orange-600">+{ch.xpReward} XP</span>
                            <span className={`px-2 py-0.5 rounded-full ${ch.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : ch.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{ch.difficulty}</span>
                            <span className="text-slate-400">Ends {ch.deadline}</span>
                            <span className="text-slate-400">{ch.participants} joined</span>
                          </div>
                        </div>
                      </div>
                      {ch.userStatus !== 'Completed' ? (
                        <button onClick={() => handleComplete(ch)} disabled={actionLoading === `complete-${ch.id}`}
                          className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors shrink-0 disabled:opacity-70 flex items-center gap-2">
                          {actionLoading === `complete-${ch.id}` ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                          Complete
                        </button>
                      ) : (
                        <Badge variant="success">Completed ✓</Badge>
                      )}
                    </div>
                  ))
                }
                {!loading && challenges.filter(c => c.isActive).length === 0 && (
                  <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-100">No active challenges. Check back later!</div>
                )}
              </div>
            </Card>

            {/* Badge Gallery */}
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Badge Gallery</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />) :
                  badges.map(b => (
                    <div key={b.id} className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${b.unlocked ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                      <div className="text-3xl mb-2">{b.icon}</div>
                      <h4 className="text-xs font-semibold text-slate-900 mb-1">{b.name}</h4>
                      {b.unlocked ? (
                        <span className="text-[10px] font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Unlocked</span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400">Locked</span>
                      )}
                    </div>
                  ))
                }
              </div>
            </Card>

            {/* Rewards Catalog */}
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Rewards Catalog</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />) :
                  rewards.map(r => (
                    <div key={r.id} className="p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-lg shrink-0">
                          🎁
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-900">{r.name}</h4>
                          <span className="text-xs font-bold text-orange-600">{r.pointsRequired.toLocaleString()} pts</span>
                          <span className="text-xs text-slate-400 ml-2">{r.stock} left</span>
                        </div>
                      </div>
                      <button onClick={() => handleRedeem(r)} disabled={!r.available || !!actionLoading}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${r.available ? 'bg-green-50 text-green-700 hover:bg-green-600 hover:text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                        {actionLoading === `redeem-${r.id}` ? '...' : r.available ? 'Redeem' : 'Out of Stock'}
                      </button>
                    </div>
                  ))
                }
              </div>
            </Card>
          </div>

          {/* Leaderboard */}
          <div className="space-y-6">
            <Card className="flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" /> Leaderboard
                </h3>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
                {(['employee', 'department'] as const).map(type => (
                  <button key={type} onClick={() => switchLeaderboard(type)}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${leaderType === type ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                    {type === 'employee' ? 'Employees' : 'Departments'}
                  </button>
                ))}
              </div>
              <div className="overflow-y-auto space-y-3 max-h-[350px]">
                {loading ? Array(5).fill(0).map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />) :
                  leaderboard.slice(0, 10).map((entry, idx) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 text-center font-bold text-sm ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-600' : 'text-slate-400'}`}>
                          #{entry.rank}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                          {(entry.name || '?').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-900 line-clamp-1">{entry.name}</h4>
                          <p className="text-[10px] text-slate-500">{entry.department}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-slate-700">{(entry.xp || 0).toLocaleString()} XP</span>
                        {idx === 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-slate-300" />}
                      </div>
                    </div>
                  ))
                }
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Gamification;
