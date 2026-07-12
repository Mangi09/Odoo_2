import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Cloud, Target, TrendingDown, Activity, 
  CheckCircle2, Zap, Droplets, Plane, Trash2, RefreshCw, Calculator, Plus
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { environmental as envApi } from '../lib/api';

const Card = ({ children, className = '', darkMode = false }: { children: React.ReactNode; className?: string; darkMode?: boolean }) => (
  <div className={`${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-green-100'} rounded-2xl shadow-sm border p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', darkMode = false }: { children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'default'; darkMode?: boolean }) => {
  const styles = {
    success: darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-700',
    warning: darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-700',
    error: darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700',
    default: darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-50 text-gray-700'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>{children}</span>;
};

const StatusBadge = ({ status, darkMode = false }: { status: string; darkMode?: boolean }) => {
  if (status === 'Verified' || status === 'Achieved' || status === 'On Track' || status === 'ON_TRACK' || status === 'COMPLETED') {
    return <Badge variant="success" darkMode={darkMode}>{status}</Badge>;
  }
  if (status === 'Pending' || status === 'At Risk' || status === 'ACTIVE') {
    return <Badge variant="warning" darkMode={darkMode}>{status}</Badge>;
  }
  return <Badge variant="error" darkMode={darkMode}>{status}</Badge>;
};

const TypeIcon = ({ type }: { type: string }) => {
  switch(type) {
    case 'Energy':
    case 'Electricity':
      return <Zap className="w-4 h-4 text-yellow-500" />;
    case 'Fleet':
    case 'Fuel':
      return <Droplets className="w-4 h-4 text-blue-500" />;
    case 'Travel': return <Plane className="w-4 h-4 text-indigo-500" />;
    case 'Waste': return <Trash2 className="w-4 h-4 text-slate-500" />;
    default: return <Activity className="w-4 h-4 text-slate-400" />;
  }
};

interface Tx { id: string; date: string; source: string; category: string; amount: number; status: string; department: string; }
interface Goal { id: string; name: string; target: number; current: number; unit: string; deadline: string; status: string; department: string; }

export const Environmental = ({ activePage, onPageChange, darkMode, setDarkMode }: {
  activePage?: string;
  onPageChange?: (page: string) => void;
  darkMode?: boolean;
  setDarkMode?: (mode: boolean) => void;
}) => {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [txs, gs] = await Promise.all([envApi.transactions(), envApi.goals()]);
      setTransactions(txs as Tx[]);
      setGoals(gs as Goal[]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.source.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, statusFilter]);

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const result = await envApi.calculate({ source_type: 'Fleet', quantity: 100 });
      const newTx = result.transaction as unknown as Tx;
      setTransactions(prev => [newTx, ...prev]);
      showNotification(`✅ Auto-calculated ${newTx.amount} tCO₂e from ${newTx.source}`);
      await loadData(); // refresh goals
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(e.message || 'Calculation failed', 'error');
    } finally {
      setCalculating(false);
    }
  };

  const totalEmissions = transactions.reduce((s, t) => s + (t.amount || 0), 0);
  const verifiedCount = transactions.filter(t => t.status === 'Verified').length;

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange} darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-7xl mx-auto space-y-6 relative">
        {notification && (
          <div className={`fixed top-20 right-8 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2 ${notification.type === 'success' ? 'bg-slate-800 text-white' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Cloud className="w-5 h-5 text-red-400" />}
            <p className="text-sm font-medium">{notification.msg}</p>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Environmental Tracking</h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Monitor carbon emissions and sustainability goals in real-time.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => loadData()} className={`p-2.5 rounded-xl transition-all shadow-sm ${
              darkMode ? 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`} title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleCalculate} disabled={calculating}
              className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-70">
              {calculating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Calculator className="w-4 h-4" />}
              Auto Calculate Emission
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Cloud, label: 'Total Emissions', value: `${totalEmissions.toFixed(1)} tCO₂e`, color: 'text-slate-600', bg: darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-50' },
            { icon: CheckCircle2, label: 'Verified', value: verifiedCount.toString(), color: 'text-green-600', bg: darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-green-50' },
            { icon: Target, label: 'Active Goals', value: goals.filter(g => ['ACTIVE', 'ON_TRACK', 'ACTIVE', 'On Track'].includes(g.status)).length.toString(), color: 'text-blue-600', bg: darkMode ? 'bg-green-500/20 text-green-400' : 'bg-blue-50' },
            { icon: TrendingDown, label: 'Transactions', value: transactions.length.toString(), color: 'text-indigo-600', bg: darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-50' },
          ].map((s, i) => (
            <Card key={i} darkMode={darkMode} className="hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.bg}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-slate-900' : 'text-slate-900'}`}>{loading ? '–' : s.value}</div>
              <div className="text-slate-500 text-sm mt-1">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Transactions Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card darkMode={darkMode} className="lg:col-span-2 flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Carbon Transactions</h3>
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                  <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className={`pl-9 pr-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 transition-all outline-none w-full sm:w-48 ${
                      darkMode ? 'bg-slate-700 border border-slate-600 text-slate-200 focus:bg-slate-600' : 'bg-gray-50 border border-gray-200 text-gray-700 focus:bg-white focus:border-green-500'
                    }`} />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className={`px-3 py-2 rounded-lg text-sm focus:ring-green-500 outline-none ${
                    darkMode ? 'bg-slate-700 border border-slate-600 text-slate-200' : 'bg-gray-50 border border-gray-200 text-gray-700'
                  }`}>
                  <option value="All">All Status</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                  <option value="Flagged">Flagged</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className={`text-xs uppercase ${darkMode ? 'text-slate-400 bg-slate-700 border-b border-slate-600' : 'text-gray-500 bg-gray-50 border-b border-gray-200'}`}>
                  <tr>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium text-right">CO₂e (t)</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className={darkMode ? 'text-slate-300' : 'text-gray-600'}>
                  {loading ? (
                    Array(4).fill(0).map((_, i) => (
                      <tr key={i} className={`border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                        {Array(5).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>)}
                      </tr>
                    ))
                  ) : filteredTransactions.map(tx => (
                    <tr key={tx.id} className={`border-b transition-colors ${
                      darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50/50'
                    }`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TypeIcon type={tx.category} />
                          <span className={`font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{tx.source}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{tx.category}</td>
                      <td className="px-4 py-3">{tx.department}</td>
                      <td className="px-4 py-3 text-right font-semibold">{tx.amount.toFixed(2)}</td>
                      <td className="px-4 py-3"><StatusBadge status={tx.status} darkMode={darkMode} /></td>
                    </tr>
                  ))}
                  {!loading && filteredTransactions.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No transactions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Goals */}
          <Card darkMode={darkMode} className="flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Environmental Goals</h3>
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{goals.filter(g => g.status === 'COMPLETED' || g.status === 'Achieved').length}/{goals.length} completed</span>
            </div>
            <div className="space-y-6">
              {loading ? (
                Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)
              ) : goals.map(goal => {
                const pct = goal.target > 0 ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
                const onTrack = ['ON_TRACK', 'COMPLETED', 'On Track', 'Achieved'].includes(goal.status);
                return (
                  <div key={goal.id}>
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{goal.name}</h4>
                        <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{goal.current.toFixed(1)} / {goal.target} {goal.unit} • Due {goal.deadline}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={goal.status} darkMode={darkMode} />
                        <span className="text-sm font-bold">{pct}%</span>
                      </div>
                    </div>
                    <div className={`w-full rounded-full h-2 overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <div className={`h-2 rounded-full transition-all ${onTrack ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {!loading && goals.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No goals configured yet.</p>}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Environmental;
