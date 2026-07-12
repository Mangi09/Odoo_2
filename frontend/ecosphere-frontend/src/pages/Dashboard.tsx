import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Leaf, Users, Shield, Award, 
  Plus, FileText, AlertTriangle, Activity as ActivityIcon, RefreshCw
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { dashboard as dashApi } from '../lib/api';

// Reusable Components
const Card = ({ children, className = '', darkMode = false }: { children: React.ReactNode; className?: string; darkMode?: boolean }) => (
  <div className={`${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-green-100'} rounded-2xl shadow-sm border p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', darkMode = false }: { children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'default', darkMode?: boolean }) => {
  const styles = {
    success: darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-700',
    warning: darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-700',
    error: darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700',
    default: darkMode ? 'bg-slate-700 text-slate-350' : 'bg-slate-50 text-slate-750'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>{children}</span>;
};

interface KPIMetric {
  id: string;
  title: string;
  value: string;
  trend: number;
  category: 'overall' | 'environmental' | 'social' | 'governance';
}

const KPICard = ({ metric, darkMode = false }: { metric: KPIMetric; darkMode?: boolean }) => {
  const isPositive = metric.trend > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  const theme = {
    overall: { icon: ActivityIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    environmental: { icon: Leaf, color: 'text-green-500', bg: 'bg-green-500/10' },
    social: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    governance: { icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' }
  }[metric.category];

  const Icon = theme.icon;

  return (
    <Card className="hover:shadow-md transition-shadow group cursor-default" darkMode={darkMode}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl ${theme.bg} ${theme.color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <TrendIcon className="w-4 h-4" />
          <span>{Math.abs(metric.trend)}%</span>
        </div>
      </div>
      <div>
        <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{metric.title}</h3>
        <div className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{metric.value}</div>
      </div>
    </Card>
  );
};

interface ChartItem { name: string; value: number; benchmark: number; }
interface DeadlineItem { id: string; title: string; due: string; progress: number; type: string; }
interface ChallengeItem { id: string; title: string; xp: number; participants: number; deadline: string; }
interface IssueItem { id: string; title: string; severity: string; dueDate: string; }

export const Dashboard = ({ activePage = 'Dashboard', onPageChange, darkMode, setDarkMode }: {
  activePage?: string;
  onPageChange?: (page: string) => void;
  darkMode?: boolean;
  setDarkMode?: (mode: boolean) => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [trendRange, setTrendRange] = useState('6M');
  
  // States loaded from API
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<ChallengeItem[]>([]);
  const [complianceIssues, setComplianceIssues] = useState<IssueItem[]>([]);

  const loadData = async (range = trendRange) => {
    setLoading(true);
    try {
      const [sum, trend, deads] = await Promise.all([
        dashApi.summary(),
        dashApi.emissionsTrend(range),
        dashApi.deadlines()
      ]);

      if (sum) {
        // Map summary object to KPIMetrics array
        const metrics: KPIMetric[] = [
          { id: '1', title: 'Overall ESG Score', value: `${sum.esgScore}/100`, trend: (sum.esgScoreTrend as number) || 4.2, category: 'overall' },
          { id: '2', title: 'Carbon Footprint', value: `${sum.carbonOffset} t`, trend: (sum.carbonTrend as number) || -12.5, category: 'environmental' },
          { id: '3', title: 'CSR Contribution', value: `${sum.volunteerHours} hrs`, trend: (sum.socialTrend as number) || 8.1, category: 'social' },
          { id: '4', title: 'Compliance Rate', value: `${sum.complianceRate}%`, trend: (sum.governanceTrend as number) || 0.5, category: 'governance' }
        ];
        setKpiMetrics(metrics);
      }

      setChartData((trend || []) as ChartItem[]);

      if (deads) {
        const dData = deads as {
          goals?: DeadlineItem[];
          challenges?: ChallengeItem[];
          issues?: IssueItem[];
        };
        setDeadlines(dData.goals || []);
        setActiveChallenges(dData.challenges || []);
        setComplianceIssues(dData.issues || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRangeChange = (range: string) => {
    setTrendRange(range);
    loadData(range);
  };

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange} darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Executive Dashboard</h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Monitor your real-time ESG performance and organizational goals.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => loadData()} className={`p-2.5 rounded-xl transition-all shadow-sm ${
              darkMode ? 'bg-slate-800 border border-slate-700 text-slate-450 hover:bg-slate-700' : 'bg-white border border-slate-205 text-slate-500 hover:bg-slate-50'
            }`} title="Refresh Dashboard">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => onPageChange?.('Reports')} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-705 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
              <FileText className="w-4 h-4 text-slate-400" />
              Generate Report
            </button>
            <button onClick={() => onPageChange?.('Environmental')} className="px-4 py-2.5 bg-green-600 border border-transparent rounded-xl text-sm font-medium text-white hover:bg-green-700 transition-all shadow-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Log Data
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)
          ) : kpiMetrics.map(metric => (
            <KPICard key={metric.id} metric={metric} darkMode={darkMode} />
          ))}
        </div>

        {/* Main Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Carbon Emissions Trend */}
          <Card className="lg:col-span-2 flex flex-col" darkMode={darkMode}>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Carbon Emissions Trend</h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Trailing period (tCO₂e)</p>
              </div>
              <select 
                value={trendRange}
                onChange={e => handleRangeChange(e.target.value)}
                className={`border text-sm rounded-lg focus:ring-green-500 block p-2 outline-none cursor-pointer ${
                  darkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="6M">6 Months</option>
                <option value="1Y">1 Year</option>
              </select>
            </div>
            
            <div className="flex-1 min-h-[300px]">
              {loading ? (
                <div className="w-full h-full bg-slate-100 rounded-lg animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#f1f5f9'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        backgroundColor: darkMode ? '#1e293b' : '#ffffff', 
                        color: darkMode ? '#f1f5f9' : '#0f172a',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                      }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#16A34A" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    <Area type="monotone" dataKey="benchmark" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Department Standings or Performance Chart */}
          <Card className="flex flex-col" darkMode={darkMode}>
            <div className="mb-6">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Department Performance</h3>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Average CSR points per department</p>
            </div>
            
            <div className="flex-1 min-h-[300px]">
              {loading ? (
                <div className="w-full h-full bg-slate-100 rounded-lg animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'HQ', value: 450 },
                    { name: 'Mfg', value: 380 },
                    { name: 'Sales', value: 310 },
                    { name: 'HR', value: 240 }
                  ]} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={darkMode ? '#334155' : '#f1f5f9'} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} />
                    <Tooltip 
                      cursor={{fill: darkMode ? '#334155' : '#f8fafc'}} 
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none', 
                        backgroundColor: darkMode ? '#1e293b' : '#ffffff', 
                        color: darkMode ? '#f1f5f9' : '#0f172a',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                      }} 
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* Bottom Widgets Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Environmental Goals */}
          <Card darkMode={darkMode}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-base font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Environmental Targets</h3>
              <button onClick={() => onPageChange?.('Environmental')} className="text-green-600 text-sm font-medium hover:text-green-750" aria-label="View all goals">View All</button>
            </div>
            <div className="space-y-6">
              {loading ? (
                Array(3).fill(0).map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />)
              ) : deadlines.map(goal => (
                <div key={goal.id}>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{goal.title}</h4>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>Due: {goal.due}</p>
                    </div>
                    <span className={`text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{goal.progress}%</span>
                  </div>
                  <div className={`w-full rounded-full h-2 overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <div 
                      className={`h-2 rounded-full ${goal.type === 'ON_TRACK' || goal.type === 'Achieved' ? 'bg-green-500' : 'bg-orange-500'}`} 
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
              {!loading && deadlines.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-8">No active goals configured 🎉</p>
              )}
            </div>
          </Card>

          {/* Active Challenges */}
          <Card darkMode={darkMode}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-base font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Active Quests</h3>
              <button onClick={() => onPageChange?.('Gamification')} className="text-orange-500 text-sm font-medium hover:text-orange-655" aria-label="Explore challenges">Explore</button>
            </div>
            <div className="space-y-4">
              {loading ? (
                Array(3).fill(0).map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />)
              ) : activeChallenges.map(challenge => (
                <div key={challenge.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors group cursor-pointer ${
                  darkMode ? 'border-slate-700 hover:border-orange-500/50 hover:bg-orange-500/5' : 'border-slate-100 hover:border-orange-200 hover:bg-orange-50/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-550 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{challenge.title}</h4>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-1 mt-0.5`}>
                        <Users className="w-3 h-3" /> {challenge.participants} joined
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-sans">
                    <span className="block text-sm font-bold text-orange-500">+{challenge.xp} XP</span>
                  </div>
                </div>
              ))}
              {!loading && activeChallenges.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-8">No active quests right now.</p>
              )}
            </div>
          </Card>

          {/* Compliance & Activity */}
          <div className="space-y-6 flex flex-col justify-between">
            <Card className="flex-1" darkMode={darkMode}>
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-base font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Compliance Items</h3>
                <button onClick={() => onPageChange?.('Governance')} className="text-red-500 text-sm font-medium hover:text-red-655" aria-label="Review issues">Review</button>
              </div>
              <div className="space-y-3">
                {loading ? (
                  Array(2).fill(0).map((_, i) => <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />)
                ) : complianceIssues.map(issue => (
                  <div key={issue.id} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{issue.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={issue.severity === 'High' || issue.severity === 'Critical' ? 'error' : 'warning'} darkMode={darkMode}>
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-slate-500">{issue.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {!loading && complianceIssues.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-6">All clear! No compliance issues.</p>
                )}
              </div>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
