import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from 'recharts';
import {
  TrendingUp, TrendingDown, Leaf, Users, Shield, Award,
  Plus, FileText, AlertTriangle, ArrowRight, Activity as ActivityIcon, Clock,
  CheckCircle, BarChart2, FileCheck, Zap, Trophy
} from 'lucide-react';

import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  kpiData, carbonEmissionsData, departmentRankings,
  activeGoals, activeChallenges, complianceIssues
} from '../data/mockDashboardData';
import type { KPIMetric } from '../types/dashboard';

// Reusable Components
const Card = ({ children, className = '', darkMode = false }: { children: React.ReactNode; className?: string, darkMode?: boolean }) => (
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

// KPI Card Component
const KPICard = ({ metric, darkMode = false }: { metric: KPIMetric, darkMode?: boolean }) => {
  const isPositive = metric.trend > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const theme = {
    overall: { icon: ActivityIcon, color: 'text-green-600', bg: 'bg-green-50' },
    environmental: { icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    social: { icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
    governance: { icon: Shield, color: 'text-lime-600', bg: 'bg-lime-50' }
  }[metric.category];

  const Icon = theme.icon;

  return (
    <Card darkMode={darkMode} className="hover:shadow-md transition-shadow group cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-slate-700 text-green-400' : `${theme.bg} ${theme.color}`} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-red-400' : 'text-red-600')}`}>
          <TrendIcon className="w-4 h-4" />
          <span>{Math.abs(metric.trend)}%</span>
        </div>
      </div>
      <div>
        <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{metric.title}</h3>
        <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{metric.value}</div>
      </div>
    </Card>
  );
};

export const Dashboard = ({ activePage = 'Dashboard', onPageChange, darkMode, setDarkMode }: { activePage?: string, onPageChange?: (page: string) => void, darkMode?: boolean, setDarkMode?: (mode: boolean) => void }) => {
  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange} darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Executive Dashboard</h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Monitor your real-time ESG performance and organizational goals.</p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-sm ${darkMode ? 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300'}`}>
              <FileText className="w-4 h-4 text-green-500" />
              Generate Report
            </button>
            <button className="px-4 py-2.5 bg-green-600 border border-transparent rounded-xl text-sm font-medium text-white hover:bg-green-700 transition-all shadow-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Log Data
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpiData.map(metric => (
            <KPICard key={metric.id} metric={metric} darkMode={darkMode} />
          ))}
        </div>

        {/* Main Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Carbon Emissions Trend */}
          <Card darkMode={darkMode} className="lg:col-span-2 flex flex-col">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Carbon Emissions Trend</h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Trailing 12 months (tCO2e)</p>
              </div>
              <select className={`rounded-lg text-sm focus:ring-green-500 focus:border-green-500 block p-2 outline-none cursor-pointer ${darkMode ? 'bg-slate-700 border border-slate-600 text-slate-200' : 'bg-slate-50 border border-slate-200 text-slate-700'}`}>
                <option>2026</option>
                <option>2025</option>
              </select>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={carbonEmissionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#f3f4f6'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#e2e8f0' : '#1e293b' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                  <Area type="monotone" dataKey="benchmark" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Department Rankings */}
          <Card darkMode={darkMode} className="flex flex-col">
            <div className="mb-6">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Department Ranking</h3>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Overall ESG Score by Dept</p>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentRankings} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="greenBar" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={darkMode ? '#334155' : '#f3f4f6'} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: darkMode ? '#94a3b8' : '#475569', fontSize: 13, fontWeight: 500 }} width={100} />
                  <Tooltip cursor={{ fill: darkMode ? '#1e293b' : '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#e2e8f0' : '#1e293b' }} />
                  <Bar dataKey="value" fill="url(#greenBar)" radius={[0, 6, 6, 0]} barSize={24} label={{ fill: '#22c55e', fontSize: 11, fontWeight: 600, position: 'right' }}>
                    <LabelList dataKey="value" position="right" fill={darkMode ? '#4ade80' : '#166534'} fontSize={12} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Recent Activity, Quick Actions & Live Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Activity */}
          <Card darkMode={darkMode} className="lg:col-span-1">
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-base font-semibold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                <Clock className="w-5 h-5 text-green-500" /> Recent Activity
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Priya completed 'Zero Waste Week'</p>
              </div>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>New compliance issue in Logistics</p>
              </div>
              <div className="flex items-center gap-3">
                <BarChart2 className="w-4 h-4 text-blue-500" />
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>42 new Carbon Transactions logged</p>
              </div>
              <div className="flex items-center gap-3">
                <FileCheck className="w-4 h-4 text-lime-500" />
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>R&D acknowledged Anti-Corruption Policy</p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card darkMode={darkMode} className="lg:col-span-1">
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-base font-semibold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                <Zap className="w-5 h-5 text-yellow-500" /> Quick Actions
              </h3>
            </div>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-green-500 text-white font-medium rounded-xl shadow-sm hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Log Carbon Data
              </button>
              <button className="w-full px-4 py-3 bg-orange-500 text-white font-medium rounded-xl shadow-sm hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" /> Start Challenge
              </button>
              <button className={`w-full px-4 py-3 font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                <FileText className="w-5 h-5" /> View Reports
              </button>
            </div>
          </Card>

          {/* Live Activity Feed */}
          <Card darkMode={darkMode} className={`lg:col-span-1 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-none overflow-hidden relative group cursor-pointer ${darkMode ? 'border border-green-500/20' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-green-500/10 opacity-50 group-hover:opacity-80 transition-opacity" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <h3 className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Live Activity Feed</h3>
                <p className={`text-2xl font-semibold mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>124 Actions Today</p>
              </div>
              <div className={`flex items-center gap-2 mt-4 text-sm font-medium group-hover:translate-x-1 transition-transform ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                View full feed <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Widgets Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* Environmental Goals */}
          <Card darkMode={darkMode}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-base font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Environmental Goals</h3>
              <button className="text-green-600 text-sm font-medium hover:text-green-700" aria-label="View all goals">View All</button>
            </div>
            <div className="space-y-5">
              {activeGoals.map(goal => (
                <div key={goal.id}>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{goal.title}</h4>
                      <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Target: {goal.target}</p>
                    </div>
                    <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{goal.progress}%</span>
                  </div>
                  <div className={`w-full rounded-full h-2 overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
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
          <Card darkMode={darkMode}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-base font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Active Challenges</h3>
              <button className="text-green-600 text-sm font-medium hover:text-green-700" aria-label="Explore challenges">Explore</button>
            </div>
            <div className="space-y-4">
              {activeChallenges.map(challenge => (
                <div key={challenge.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors group cursor-pointer ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-green-50 hover:border-green-100 hover:bg-green-50/50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'}`}>
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{challenge.title}</h4>
                      <p className={`text-xs flex items-center gap-1 mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Users className="w-3 h-3" /> {challenge.participants} joined
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-semibold text-green-600">+{challenge.xp} XP</span>
                    <span className={`block text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{challenge.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Compliance Action Items */}
          <Card darkMode={darkMode} className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-base font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Compliance Action Items</h3>
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
                    <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{issue.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={issue.severity === 'high' ? 'error' : 'warning'} darkMode={darkMode}>
                        {issue.severity.toUpperCase()}
                      </Badge>
                      <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{issue.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
