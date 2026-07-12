import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Leaf, Users, Shield, 
  Plus, FileText, AlertTriangle, ArrowRight, Activity as ActivityIcon, Clock, RefreshCw
} from 'lucide-react';


import { DashboardLayout } from '../components/layout/DashboardLayout';
import { dashboard as dashApi } from '../lib/api';

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

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
      <div className="h-8 bg-slate-200 rounded w-1/3" />
    </div>
  );
}

export const Dashboard = ({ activePage = 'Dashboard', onPageChange }: { activePage?: string, onPageChange?: (page: string) => void }) => {
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [trend, setTrend] = useState<unknown[]>([]);
  const [activities, setActivities] = useState<unknown[]>([]);
  const [deadlines, setDeadlines] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendRange, setTrendRange] = useState('6M');

  const load = async (range = trendRange) => {
    setLoading(true);
    try {
      const [sum, tr, acts, dl] = await Promise.all([
        dashApi.summary(),
        dashApi.emissionsTrend(range),
        dashApi.activities(),
        dashApi.deadlines(),
      ]);
      setSummary(sum);
      setTrend(tr);
      setActivities(acts);
      setDeadlines(dl);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRangeChange = (r: string) => {
    setTrendRange(r);
    dashApi.emissionsTrend(r).then(setTrend).catch(console.error);
  };

  const kpiData = summary ? [
    { id: 'overall', category: 'overall', title: 'ESG Score', value: `${summary.esgScore}/100`, trend: 2.4 },
    { id: 'env', category: 'environmental', title: 'Carbon Offset (tCO₂e)', value: (summary.carbonOffset as number)?.toFixed(1) ?? '0', trend: -1.8 },
    { id: 'social', category: 'social', title: 'Active Goals', value: String(summary.activeGoals ?? 0), trend: 5 },
    { id: 'gov', category: 'governance', title: 'Volunteer Hours', value: String(summary.volunteerHours ?? 0), trend: 12 },
  ] : [];

  const chartTheme: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    overall: { icon: ActivityIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    environmental: { icon: Leaf, color: 'text-green-600', bg: 'bg-green-50' },
    social: { icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    governance: { icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
  };

  // Transform trend for chart
  const chartData = (trend as Array<{ month: string; value: number }>).map(t => ({
    name: t.month,
    value: t.value,
    benchmark: Math.round(t.value * 1.1),
  }));

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm">Monitor your real-time ESG performance and organizational goals.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => load()}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => onPageChange?.('Reports')}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm">
              <FileText className="w-4 h-4 text-slate-400" />
              Generate Report
            </button>
            <button 
              onClick={() => onPageChange?.('Environmental')}
              className="px-4 py-2.5 bg-green-600 border border-transparent rounded-xl text-sm font-medium text-white hover:bg-green-700 transition-all shadow-sm shadow-green-600/20 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Log Data
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : kpiData.map(metric => {
              const isPositive = metric.trend > 0;
              const TrendIcon = isPositive ? TrendingUp : TrendingDown;
              const theme = chartTheme[metric.category];
              const Icon = theme.icon;
              return (
                <Card key={metric.id} className="hover:shadow-md transition-shadow group cursor-pointer">
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
            })
          }
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carbon Trend */}
          <Card className="lg:col-span-2 flex flex-col">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Carbon Emissions Trend</h3>
                <p className="text-sm text-slate-500">Trailing period (tCO₂e)</p>
              </div>
              <select 
                value={trendRange}
                onChange={e => handleRangeChange(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2 outline-none cursor-pointer"
              >
                <option value="6M">6 Months</option>
                <option value="1Y">1 Year</option>
              </select>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="value" stroke="#16A34A" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" name="Actual" />
                  <Area type="monotone" dataKey="benchmark" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Baseline" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Upcoming Deadlines</h3>
              <p className="text-sm text-slate-500">Goals, Audits & Issues</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                ))
              ) : (deadlines as Array<{ id: string; title: string; dueDate: string; type: string; status: string }>).slice(0, 6).map(d => (
                <div key={d.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="mt-0.5">
                    {d.status === 'Overdue' ? (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-slate-800 truncate">{d.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={d.status === 'Overdue' ? 'error' : 'warning'}>{d.type}</Badge>
                      <span className="text-xs text-slate-500">{d.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && deadlines.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-8">No upcoming deadlines 🎉</p>
              )}
            </div>
          </Card>
        </div>

        {/* Bottom: Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity Feed</h3>
            <button onClick={() => onPageChange?.('Notifications')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
              ))
            ) : (activities as Array<{ id: string; title: string; type: string; date: string; department: string; status: string }>).slice(0, 6).map(act => (
              <div key={act.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    act.type === 'Social' ? 'bg-blue-500' : 
                    act.type === 'Environmental' ? 'bg-green-500' : 
                    act.type === 'Governance' ? 'bg-purple-500' : 'bg-indigo-500'
                  }`}>
                    {act.type[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">{act.title}</h4>
                    <p className="text-xs text-slate-500">{act.department} • {act.date}</p>
                  </div>
                </div>
                <Badge variant={act.status === 'Approved' || act.status === 'Verified' ? 'success' : act.status === 'Pending' ? 'warning' : 'default'}>
                  {act.status}
                </Badge>
              </div>
            ))}
            {!loading && activities.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-6">No recent activity yet. Start by joining a CSR activity or completing a challenge.</p>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
