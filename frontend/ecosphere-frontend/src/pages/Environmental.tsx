import React, { useState, useMemo } from 'react';
import {
  Leaf, Search, Plus, Cloud, Target, TrendingDown, Activity,
  CheckCircle2, Clock, Zap, Droplets, Plane, Trash2
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  initialSummary, initialTransactions, initialGoals, environmentalActivities
} from '../data/mockEnvironmentalData';
import type { CarbonTransaction, EnvironmentalGoal } from '../types/environmental';

// Reusable Components
const Card = ({ children, className = '', darkMode = false }: { children: React.ReactNode; className?: string; darkMode?: boolean }) => (
  <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-green-100'} rounded-2xl shadow-sm border p-6 ${className}`}>
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
  if (status === 'Verified' || status === 'Achieved' || status === 'On Track') {
    return <Badge variant="success" darkMode={darkMode}>{status}</Badge>;
  }
  if (status === 'Pending' || status === 'At Risk') {
    return <Badge variant="warning" darkMode={darkMode}>{status}</Badge>;
  }
  return <Badge variant="error" darkMode={darkMode}>{status}</Badge>;
};

const TypeIcon = ({ type, darkMode = false }: { type: string; darkMode?: boolean }) => {
  switch (type) {
    case 'Electricity': return <Zap className={`w-4 h-4 text-yellow-500`} />;
    case 'Fuel': return <Droplets className={`w-4 h-4 text-blue-500`} />;
    case 'Travel': return <Plane className={`w-4 h-4 text-indigo-500`} />;
    case 'Waste': return <Trash2 className={`w-4 h-4 text-gray-500`} />;
    default: return <Activity className={`w-4 h-4 text-gray-500`} />;
  }
};

export const Environmental = ({ activePage, onPageChange, darkMode, setDarkMode }: {
  activePage?: string;
  onPageChange?: (page: string) => void;
  darkMode?: boolean;
  setDarkMode?: (mode: boolean) => void;
}) => {
  const [summary, setSummary] = useState(initialSummary);
  const [transactions, setTransactions] = useState<CarbonTransaction[]>(initialTransactions);
  const [goals, setGoals] = useState<EnvironmentalGoal[]>(initialGoals);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.source.toLowerCase().includes(searchQuery.toLowerCase()) || t.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, statusFilter]);

  const handleAutoCalculate = () => {
    // Simulate auto-calculating a new emission
    const newEmissionValue = 2.5; // tCO2e
    const newTransaction: CarbonTransaction = {
      id: `tx-00${transactions.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      source: 'Auto Calculated API Sync',
      type: 'Electricity',
      amount: 6000,
      unit: 'kWh',
      co2e: newEmissionValue,
      status: 'Pending'
    };

    setTransactions([newTransaction, ...transactions]);

    // Update summary
    setSummary(prev => ({
      ...prev,
      totalEmissions: prev.totalEmissions + newEmissionValue
    }));

    // Update first goal progress as a simulation
    setGoals(prev => {
      const newGoals = [...prev];
      if (newGoals[0]) {
        newGoals[0] = {
          ...newGoals[0],
          current: Math.min(newGoals[0].current + 6000, newGoals[0].target)
        };
      }
      return newGoals;
    });
  };

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange} darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Environmental Dashboard</h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Monitor carbon emissions, environmental goals, and sustainability metrics.</p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAutoCalculate}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-sm ${darkMode ? 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                }`}
            >
              <Zap className="w-4 h-4 text-yellow-500" />
              Auto Calculate
            </button>
            <button className="px-4 py-2.5 bg-green-600 border border-transparent rounded-xl text-sm font-medium text-white hover:bg-green-700 transition-all shadow-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Log
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
                }`}>
                <Cloud className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total CO₂ Emissions</h3>
              <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.totalEmissions.toLocaleString()} <span className="text-base font-normal text-gray-500">tCO₂e</span></div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-50 text-teal-600'
                }`}>
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Active Goals</h3>
              <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.activeGoals}</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
                }`}>
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Emissions Reduced</h3>
              <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.emissionsReduced.toLocaleString()} <span className="text-base font-normal text-gray-500">tCO₂e</span></div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                }`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Goal Completion</h3>
              <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.goalCompletionRate}%</div>
            </div>
          </Card>
        </div>

        {/* Transactions & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Carbon Transactions */}
          <Card darkMode={darkMode} className="lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Carbon Transactions</h3>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-9 pr-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 transition-all outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-gray-50 border-gray-200 text-gray-700 focus:bg-white focus:border-green-500'
                      }`}
                  />
                </div>
                <select
                  className={`rounded-lg text-sm focus:ring-green-500 outline-none px-3 ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
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
                    <th className="px-4 py-3 font-medium">Source & Type</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Emissions (tCO₂e)</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className={darkMode ? 'text-slate-300' : 'text-gray-600'}>
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className={`border-b transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50/50'
                      }`}>
                      <td className="px-4 py-3">
                        <div className={`font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{tx.source}</div>
                        <div className={`flex items-center gap-1 mt-0.5 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          <TypeIcon type={tx.type} darkMode={darkMode} />
                          {tx.type}
                        </div>
                      </td>
                      <td className="px-4 py-3">{tx.date}</td>
                      <td className="px-4 py-3">{tx.amount.toLocaleString()} <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>{tx.unit}</span></td>
                      <td className="px-4 py-3 font-medium">{tx.co2e}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={tx.status} darkMode={darkMode} />
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className={`px-4 py-8 text-center ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Environmental Goals */}
          <Card darkMode={darkMode} className="flex flex-col">
            <div className="mb-6">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Active Goals</h3>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Tracking progress vs targets</p>
            </div>
            <div className="space-y-6">
              {goals.map(goal => {
                const progressPercentage = Math.min(100, (goal.current / goal.target) * 100);
                return (
                  <div key={goal.id}>
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{goal.title}</h4>
                        <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Target: {goal.target.toLocaleString()} {goal.unit}</p>
                      </div>
                      <StatusBadge status={goal.status} darkMode={darkMode} />
                    </div>
                    <div className={`w-full rounded-full h-2 overflow-hidden mb-1.5 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${goal.status === 'On Track' ? 'bg-green-500' : goal.status === 'Achieved' ? 'bg-teal-500' : 'bg-orange-500'
                          }`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className={`flex justify-between text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-gray-700'}`}>
                      <span>{goal.current.toLocaleString()} {goal.unit}</span>
                      <span>{goal.deadline}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Bottom Section: Activities */}
        <div className="grid grid-cols-1">
          <Card darkMode={darkMode}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-base font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Recent Environmental Activity</h3>
              <button className={`text-sm font-medium text-green-600 hover:text-green-700`}>View All</button>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-2">
              {environmentalActivities.map(activity => (
                <div key={activity.id} className={`min-w-[280px] p-4 rounded-xl border transition-colors ${darkMode ? 'bg-slate-700 border-slate-600 hover:border-slate-500' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                        }`}>
                        <Leaf className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-800'}`}>
                        <span className={`font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{activity.user}</span> {activity.action}
                      </p>
                      <p className={`text-sm font-medium mt-0.5 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{activity.target}</p>
                      <div className={`flex items-center gap-1 mt-1.5 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        <Clock className="w-3 h-3" /> {activity.time}
                      </div>
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

export default Environmental;
