import React from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Leaf, Users, Shield, Award, 
  Plus, FileText, AlertTriangle, ArrowRight, Activity as ActivityIcon, Clock
} from 'lucide-react';

import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  kpiData, carbonEmissionsData, departmentRankings, 
  activeGoals, activeChallenges, complianceIssues 
} from '../data/mockDashboardData';
import type { KPIMetric } from '../types/dashboard';

// Reusable Components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'success' | 'warning' | 'error' | 'default' }) => {
  const styles = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-orange-100 text-orange-700',
    error: 'bg-red-100 text-red-700',
    default: 'bg-slate-100 text-slate-700'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>{children}</span>;
};

// KPI Card Component
const KPICard = ({ metric }: { metric: KPIMetric }) => {
  const isPositive = metric.trend > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  const theme = {
    overall: { icon: ActivityIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    environmental: { icon: Leaf, color: 'text-green-600', bg: 'bg-green-50' },
    social: { icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    governance: { icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' }
  }[metric.category];

  const Icon = theme.icon;

  return (
    <Card className="hover:shadow-md transition-shadow group cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl ${theme.bg} ${theme.color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          <TrendIcon className="w-4 h-4" />
          <span>{Math.abs(metric.trend)}%</span>
        </div>
      </div>
      <div>
        <h3 className="text-slate-500 font-medium text-sm mb-1">{metric.title}</h3>
        <div className="text-3xl font-bold text-slate-900 tracking-tight">{metric.value}</div>
      </div>
    </Card>
  );
};

export const Dashboard = ({ activePage = 'Dashboard', onPageChange }: { activePage?: string, onPageChange?: (page: string) => void }) => {
  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm">Monitor your real-time ESG performance and organizational goals.</p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm">
              <FileText className="w-4 h-4 text-slate-400" />
              Generate Report
            </button>
            <button className="px-4 py-2.5 bg-green-600 border border-transparent rounded-xl text-sm font-medium text-white hover:bg-green-700 transition-all shadow-sm shadow-green-600/20 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Log Data
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map(metric => (
            <KPICard key={metric.id} metric={metric} />
          ))}
        </div>

        {/* Main Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carbon Emissions Trend */}
          <Card className="lg:col-span-2 flex flex-col">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Carbon Emissions Trend</h3>
                <p className="text-sm text-slate-500">Trailing 12 months (tCO2e)</p>
              </div>
              <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2 outline-none cursor-pointer">
                <option>2026</option>
                <option>2025</option>
              </select>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={carbonEmissionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#16A34A" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  <Area type="monotone" dataKey="benchmark" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Department Rankings */}
          <Card className="flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Department Ranking</h3>
              <p className="text-sm text-slate-500">Overall ESG Score by Dept</p>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentRankings} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13, fontWeight: 500}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Bottom Widgets Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Environmental Goals */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-slate-900">Environmental Goals</h3>
              <button className="text-green-600 text-sm font-medium hover:text-green-700" aria-label="View all goals">View All</button>
            </div>
            <div className="space-y-6">
              {activeGoals.map(goal => (
                <div key={goal.id}>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900">{goal.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Target: {goal.target}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full ${goal.status === 'on-track' ? 'bg-green-500' : 'bg-orange-500'}`} 
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Active Challenges */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-slate-900">Active Challenges</h3>
              <button className="text-orange-600 text-sm font-medium hover:text-orange-700" aria-label="Explore challenges">Explore</button>
            </div>
            <div className="space-y-4">
              {activeChallenges.map(challenge => (
                <div key={challenge.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900">{challenge.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3" /> {challenge.participants} joined
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-bold text-orange-600">+{challenge.xp} XP</span>
                    <span className="block text-xs text-slate-400 mt-0.5">{challenge.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Compliance & Activity */}
          <div className="space-y-6 flex flex-col">
            <Card className="flex-1">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-slate-900">Compliance Action Items</h3>
              </div>
              <div className="space-y-3">
                {complianceIssues.map(issue => (
                  <div key={issue.id} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {issue.severity === 'high' ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-800">{issue.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={issue.severity === 'high' ? 'error' : 'warning'}>
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-slate-500">{issue.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="flex-1 bg-slate-900 border-none text-white overflow-hidden relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-300">Live Activity Feed</h3>
                  <p className="text-2xl font-bold mt-1">124 Actions Today</p>
                </div>
                <div className="flex items-center gap-2 mt-4 text-sm font-medium text-green-400 group-hover:translate-x-1 transition-transform">
                  View full feed <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
