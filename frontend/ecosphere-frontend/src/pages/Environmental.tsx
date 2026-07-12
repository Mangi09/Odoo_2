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

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'Verified' || status === 'Achieved' || status === 'On Track') {
    return <Badge variant="success">{status}</Badge>;
  }
  if (status === 'Pending' || status === 'At Risk') {
    return <Badge variant="warning">{status}</Badge>;
  }
  return <Badge variant="error">{status}</Badge>;
};

const TypeIcon = ({ type }: { type: string }) => {
  switch(type) {
    case 'Electricity': return <Zap className="w-4 h-4 text-yellow-500" />;
    case 'Fuel': return <Droplets className="w-4 h-4 text-blue-500" />;
    case 'Travel': return <Plane className="w-4 h-4 text-indigo-500" />;
    case 'Waste': return <Trash2 className="w-4 h-4 text-slate-500" />;
    default: return <Activity className="w-4 h-4 text-slate-400" />;
  }
};

export const Environmental = ({ activePage, onPageChange }: { activePage?: string, onPageChange?: (page: string) => void }) => {
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
    <DashboardLayout activePage={activePage} onPageChange={onPageChange}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Environmental Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm">Monitor carbon emissions, environmental goals, and sustainability metrics.</p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleAutoCalculate}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"
            >
              <Zap className="w-4 h-4 text-slate-400" />
              Auto Calculate Emission
            </button>
            <button className="px-4 py-2.5 bg-green-600 border border-transparent rounded-xl text-sm font-medium text-white hover:bg-green-700 transition-all shadow-sm shadow-green-600/20 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Log
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">Total CO₂ Emissions</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.totalEmissions.toLocaleString()} <span className="text-base text-slate-500 font-normal">tCO₂e</span></div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">Active Goals</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.activeGoals}</div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">Emissions Reduced</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.emissionsReduced.toLocaleString()} <span className="text-base text-slate-500 font-normal">tCO₂e</span></div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">Goal Completion</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.goalCompletionRate}%</div>
            </div>
          </Card>
        </div>

        {/* Transactions & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carbon Transactions */}
          <Card className="lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Carbon Transactions</h3>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search logs..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none w-48"
                  />
                </div>
                <select 
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 outline-none px-3"
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
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Source & Type</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Emissions (tCO₂e)</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{tx.source}</div>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
                          <TypeIcon type={tx.type} />
                          {tx.type}
                        </div>
                      </td>
                      <td className="px-4 py-3">{tx.date}</td>
                      <td className="px-4 py-3">{tx.amount.toLocaleString()} <span className="text-xs text-slate-400">{tx.unit}</span></td>
                      <td className="px-4 py-3 font-medium">{tx.co2e}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={tx.status} />
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Environmental Goals */}
          <Card className="flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Active Goals</h3>
              <p className="text-sm text-slate-500">Tracking progress vs targets</p>
            </div>
            <div className="space-y-6">
              {goals.map(goal => {
                const progressPercentage = Math.min(100, (goal.current / goal.target) * 100);
                return (
                  <div key={goal.id}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 leading-tight">{goal.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">Target: {goal.target.toLocaleString()} {goal.unit}</p>
                      </div>
                      <StatusBadge status={goal.status} />
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1.5">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${goal.status === 'On Track' ? 'bg-green-500' : goal.status === 'Achieved' ? 'bg-blue-500' : 'bg-orange-500'}`} 
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700">{goal.current.toLocaleString()} {goal.unit}</span>
                      <span className="text-slate-400">{goal.deadline}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Bottom Section: Activities */}
        <div className="grid grid-cols-1">
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-900">Recent Environmental Activity</h3>
              <button className="text-green-600 text-sm font-medium hover:text-green-700">View All</button>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-2">
              {environmentalActivities.map(activity => (
                <div key={activity.id} className="min-w-[280px] p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex gap-3">
                  <div className="mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <Leaf className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-800">
                      <span className="font-medium text-slate-900">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-0.5">{activity.target}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500">
                      <Clock className="w-3 h-3" /> {activity.time}
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
