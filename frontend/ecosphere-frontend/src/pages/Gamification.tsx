import React, { useState } from 'react';
import { 
  Target, Star, Gift, Shield, CheckCircle2, Trophy, Flame, TrendingUp, TrendingDown,
  Leaf, Recycle, Zap, Heart, Sun, Package, Coffee
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  initialGamificationSummary, initialChallenges, initialBadges, employeeLeaderboard, departmentLeaderboard, rewardsCatalog 
} from '../data/mockGamificationData';
import type { GameChallenge, Badge as BadgeType, RewardItem } from '../types/gamification';

// Reusable Components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'success' | 'warning' | 'error' | 'info' | 'default' }) => {
  const styles = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-orange-100 text-orange-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-indigo-100 text-indigo-700',
    default: 'bg-slate-100 text-slate-700'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>{children}</span>;
};

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
    default: return <Star className={className} />;
  }
};

export const Gamification = ({ activePage, onPageChange }: { activePage?: string, onPageChange?: (page: string) => void }) => {
  const [summary, setSummary] = useState(initialGamificationSummary);
  const [challenges, setChallenges] = useState<GameChallenge[]>(initialChallenges);
  const [badges, setBadges] = useState<BadgeType[]>(initialBadges);
  const [leaderboardType, setLeaderboardType] = useState<'employees' | 'departments'>('employees');
  const [employees, setEmployees] = useState(employeeLeaderboard);
  const [notification, setNotification] = useState<{msg: string, icon: React.ReactNode} | null>(null);

  const showNotification = (msg: string, icon: React.ReactNode = <CheckCircle2 className="w-5 h-5 text-green-400" />) => {
    setNotification({ msg, icon });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCompleteChallenge = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    // Update Challenges
    setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, status: 'Completed' } : c));
    
    // Update Summary XP
    setSummary(prev => ({ ...prev, totalXP: prev.totalXP + challenge.xp, activeChallenges: prev.activeChallenges - 1 }));
    
    // Update Leaderboard
    setEmployees(prev => {
      const newLeaderboard = [...prev];
      const myIndex = newLeaderboard.findIndex(e => e.name === 'You');
      if (myIndex > -1) {
        newLeaderboard[myIndex] = {
          ...newLeaderboard[myIndex],
          score: newLeaderboard[myIndex].score + challenge.xp,
          trend: 'up'
        };
        // Re-sort leaderboard
        newLeaderboard.sort((a, b) => b.score - a.score);
        // Update ranks
        newLeaderboard.forEach((e, idx) => { e.rank = idx + 1; });
      }
      return newLeaderboard;
    });

    // Check for badge unlocks (e.g. Energy Saver badge if XP is high enough)
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
    
    setSummary(prev => ({
      ...prev,
      totalXP: prev.totalXP - reward.cost,
      rewardsRedeemed: prev.rewardsRedeemed + 1
    }));
    
    showNotification(`Successfully redeemed: ${reward.title}!`, <Gift className="w-5 h-5 text-blue-400" />);
  };

  const leaderboardData = leaderboardType === 'employees' ? employees : departmentLeaderboard;

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange}>
      <div className="max-w-7xl mx-auto space-y-8 relative">
        
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-20 right-8 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2">
            {notification.icon}
            <p className="text-sm font-medium">{notification.msg}</p>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gamification</h1>
            <p className="text-slate-500 mt-1 text-sm">Level up your sustainability impact. Earn XP, unlock badges, and redeem rewards.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <Target className="w-16 h-16 text-blue-900" />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-slate-500 font-medium text-sm mb-1">Active Challenges</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.activeChallenges}</div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <Star className="w-16 h-16 text-yellow-900" />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-slate-500 font-medium text-sm mb-1">Total XP</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.totalXP.toLocaleString()}</div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <Shield className="w-16 h-16 text-indigo-900" />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-slate-500 font-medium text-sm mb-1">Badges Unlocked</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.badgesUnlocked}</div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <Gift className="w-16 h-16 text-green-900" />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-slate-500 font-medium text-sm mb-1">Rewards Redeemed</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.rewardsRedeemed}</div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Challenges */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Active Challenges</h3>
              </div>
              <div className="space-y-4">
                {challenges.filter(c => c.status === 'Active').map(challenge => (
                  <div key={challenge.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                        <Flame className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-0.5">{challenge.title}</h4>
                        <p className="text-xs text-slate-500 max-w-sm">{challenge.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs font-medium">
                          <span className="text-orange-600">+{challenge.xp} XP</span>
                          <span className={`px-2 py-0.5 rounded-full ${challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {challenge.difficulty}
                          </span>
                          <span className="text-slate-400">Ends {challenge.deadline}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCompleteChallenge(challenge.id)}
                      className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors shrink-0 whitespace-nowrap"
                    >
                      Complete
                    </button>
                  </div>
                ))}
                {challenges.filter(c => c.status === 'Active').length === 0 && (
                  <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                    No active challenges. Check back later!
                  </div>
                )}
              </div>
            </Card>

            {/* Badge Gallery */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Badge Gallery</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {badges.map(badge => (
                  <div key={badge.id} className={`p-4 rounded-xl border ${badge.isUnlocked ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-100 bg-slate-50 grayscale opacity-70'} flex flex-col items-center text-center transition-all hover:grayscale-0 hover:opacity-100`}>
                    <div className={`w-14 h-14 rounded-full mb-3 flex items-center justify-center ${
                      badge.tier === 'Bronze' ? 'bg-amber-100 text-amber-700' :
                      badge.tier === 'Silver' ? 'bg-slate-200 text-slate-600' :
                      badge.tier === 'Gold' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-indigo-100 text-indigo-600'
                    }`}>
                      <IconWrapper name={badge.iconName} className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">{badge.title}</h4>
                    {!badge.isUnlocked ? (
                      <div className="w-full mt-2">
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${badge.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium mt-1 block">{badge.progress}%</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-medium text-indigo-600 mt-2 bg-indigo-100 px-2 py-0.5 rounded-full">Unlocked</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Rewards Catalog */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Rewards Catalog</h3>
                <span className="text-sm font-bold text-yellow-600 flex items-center gap-1">
                  <Star className="w-4 h-4" /> {summary.totalXP.toLocaleString()} XP Available
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rewardsCatalog.map(reward => {
                  const canAfford = summary.totalXP >= reward.cost;
                  return (
                    <div key={reward.id} className="p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                          <IconWrapper name={reward.imageIcon} className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-900">{reward.title}</h4>
                          <span className="text-xs font-bold text-yellow-600">{reward.cost.toLocaleString()} XP</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRedeem(reward)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          canAfford ? 'bg-green-50 text-green-700 hover:bg-green-600 hover:text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
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
          <div className="space-y-6">
            
            {/* Leaderboard */}
            <Card className="flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" /> Leaderboard
                </h3>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg mb-4 shrink-0">
                <button 
                  onClick={() => setLeaderboardType('employees')}
                  className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${leaderboardType === 'employees' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Employees
                </button>
                <button 
                  onClick={() => setLeaderboardType('departments')}
                  className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${leaderboardType === 'departments' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Departments
                </button>
              </div>
              
              <div className="overflow-y-auto pr-2 space-y-3 flex-1 custom-scrollbar">
                {leaderboardData.map((entry, idx) => (
                  <div key={entry.id} className={`flex items-center justify-between p-3 rounded-xl border ${entry.name === 'You' ? 'border-blue-200 bg-blue-50/50' : 'border-slate-100 hover:bg-slate-50'} transition-colors`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 text-center font-bold text-sm ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-600' : 'text-slate-400'}`}>
                        #{entry.rank}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                        {entry.avatarInitials}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 line-clamp-1">{entry.name}</h4>
                        <p className="text-[10px] text-slate-500">{entry.department}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-slate-700">{entry.score.toLocaleString()}</span>
                      {entry.trend === 'up' ? <TrendingUp className="w-3 h-3 text-green-500" /> : entry.trend === 'down' ? <TrendingDown className="w-3 h-3 text-red-500" /> : <div className="w-3 h-3 flex items-center justify-center"><div className="w-2 h-0.5 bg-slate-300" /></div>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
                <Star className="w-24 h-24 text-white" />
              </div>
              <div className="relative z-10">
                <Badge variant="info"><span className="text-white">Pro Tip</span></Badge>
                <h3 className="text-lg font-bold mt-3 mb-2">Want to level up faster?</h3>
                <p className="text-sm text-indigo-100 mb-5">Join the 'Zero Waste Week' challenge to earn a massive 500 XP boost and unlock the Platinum badge.</p>
                <button className="w-full py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg text-sm font-semibold transition-colors">
                  View Challenge
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
