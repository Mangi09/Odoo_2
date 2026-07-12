import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Heart, Award, Clock, HeartHandshake, Search, CheckCircle2, UserPlus, RefreshCw, X
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { social as socApi } from '../lib/api';

const Card = ({ children, className = '', darkMode = false }: { children: React.ReactNode; className?: string; darkMode?: boolean }) => (
  <div className={`${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-green-100'} rounded-2xl shadow-sm border p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', darkMode = false }: { children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'default' | 'info'; darkMode?: boolean }) => {
  const styles = {
    success: darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-700',
    warning: darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-700',
    error: darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700',
    info: darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-50 text-teal-700',
    default: darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-50 text-gray-700'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>{children}</span>;
};

interface CSRActivity {
  id: string;
  title: string;
  description: string;
  points: number;
  participants: number;
  status: string;
  isProofRequired?: boolean;
}

interface EmployeeParticipation {
  id: string;
  employeeName: string;
  activityTitle: string;
  dateSubmitted: string;
  proofUrl: string;
  status: string;
}

export const Social = ({ activePage, onPageChange, darkMode, setDarkMode }: {
  activePage?: string;
  onPageChange?: (page: string) => void;
  darkMode?: boolean;
  setDarkMode?: (mode: boolean) => void;
}) => {
  const [activities, setActivities] = useState<CSRActivity[]>([]);
  const [participations, setParticipations] = useState<EmployeeParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Join Modal State
  const [joiningActivity, setJoiningActivity] = useState<CSRActivity | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [acts, parts] = await Promise.all([
        socApi.activities(),
        socApi.participations()
      ]);
      setActivities(acts as CSRActivity[]);
      setParticipations(parts as EmployeeParticipation[]);
    } catch (err) {
      console.error(err);
      showNotification('Failed to load CSR activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleJoinInit = (activity: CSRActivity) => {
    setJoiningActivity(activity);
    setProofUrl('');
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joiningActivity) return;

    setActionLoading(`join-${joiningActivity.id}`);
    try {
      await socApi.join(joiningActivity.id, proofUrl || undefined);
      showNotification(`Successfully joined: ${joiningActivity.title}!`);
      setJoiningActivity(null);
      await loadData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(e.message || 'Failed to join activity');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (partId: string) => {
    setActionLoading(`approve-${partId}`);
    try {
      await socApi.approve(partId);
      showNotification('Approved participation and credited points!');
      await loadData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(e.message || 'Failed to approve participation');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredActivities = useMemo(() => {
    return activities.filter(a => 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activities, searchQuery]);

  const activeActivitiesCount = activities.filter(a => a.status === 'Open' || a.status === 'Ongoing').length;
  const pendingApprovalsCount = participations.filter(p => p.status === 'Pending').length;
  const approvedParticipations = participations.filter(p => p.status === 'Approved');

  // Sum points from approved participations as total points awarded
  // Note: we can map activity titles to find points, or count from approved ledger.
  const pointsAwarded = approvedParticipations.reduce((sum, p) => {
    const act = activities.find(a => a.title === p.activityTitle);
    return sum + (act ? act.points : 100);
  }, 0);

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange} darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-7xl mx-auto space-y-6 relative">
        
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-20 right-8 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2 ${
            darkMode ? 'bg-slate-700 text-slate-100 border border-slate-600' : 'bg-gray-800 text-white'
          }`}>
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <p className="text-sm font-medium">{notification}</p>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Social & CSR Dashboard</h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Manage community initiatives, track participation, and review impact.</p>
          </div>
          <button onClick={() => loadData()} className={`p-2.5 rounded-xl shadow-sm transition-all ${
            darkMode ? 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
          }`} title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Join Activity Modal */}
        {joiningActivity && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className={`rounded-2xl max-w-md w-full shadow-xl border animate-in zoom-in-95 ${
              darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-100'
            }`}>
              <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <h3 className="text-lg font-bold">Join CSR Activity</h3>
                <button onClick={() => setJoiningActivity(null)} className={`p-1 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleJoinSubmit} className="p-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-base mb-1">{joiningActivity.title}</h4>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-550'}`}>{joiningActivity.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Proof URL {joiningActivity.isProofRequired && <span className="text-red-500">* (Required)</span>}
                  </label>
                  <input 
                    type="url" 
                    required={joiningActivity.isProofRequired}
                    value={proofUrl}
                    onChange={e => setProofUrl(e.target.value)}
                    placeholder="https://example.com/my-proof.jpg"
                    className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${
                      darkMode ? 'bg-slate-700 border border-slate-600 text-slate-200 focus:border-green-500' : 'bg-slate-50 border border-slate-200 text-gray-700 focus:border-indigo-500'
                    }`}
                  />
                  <p className="text-xs text-slate-400 mt-1">Upload a photo of your participation and paste the link here.</p>
                </div>
                <button 
                  type="submit" 
                  disabled={actionLoading === `join-${joiningActivity.id}`}
                  className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading === `join-${joiningActivity.id}` ? 'Registering...' : 'Submit Entry'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                <HeartHandshake className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Active CSR Activities</h3>
              <div className="text-2xl font-semibold tracking-tight">{loading ? '–' : activeActivitiesCount}</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'}`}>
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Participants</h3>
              <div className="text-2xl font-semibold tracking-tight">{loading ? '–' : participations.length}</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Pending Approvals</h3>
              <div className="text-2xl font-semibold tracking-tight">{loading ? '–' : pendingApprovalsCount}</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Points Awarded</h3>
              <div className="text-2xl font-semibold tracking-tight">{loading ? '–' : pointsAwarded.toLocaleString()}</div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Area: CSR Activities */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Available Activities</h3>
              <div className="relative hidden sm:block">
                <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search initiatives..." 
                  className={`pl-9 pr-4 py-2 rounded-full text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none w-64 border ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-gray-200 text-gray-700'
                  }`}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                Array(2).fill(0).map((_, i) => <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />)
              ) : filteredActivities.map(activity => (
                <div key={activity.id} className={`rounded-xl border p-5 hover:shadow-md transition-all flex flex-col justify-between group ${
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-green-100'
                }`}>
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant={activity.status === 'Open' ? 'success' : activity.status === 'Ongoing' ? 'info' : 'default'} darkMode={darkMode}>
                        {activity.status}
                      </Badge>
                      <span className={`text-xs font-medium flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        <Award className="w-3 h-3 text-yellow-500" /> {activity.points} pts
                      </span>
                    </div>
                    <h4 className={`font-semibold text-base mb-2 group-hover:text-green-600 transition-colors ${
                      darkMode ? 'text-slate-100' : 'text-gray-900'
                    }`}>{activity.title}</h4>
                    <p className={`text-sm line-clamp-2 ${darkMode ? 'text-slate-350' : 'text-gray-600'}`}>{activity.description}</p>
                  </div>
                  <div className={`mt-5 flex items-center justify-between pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-green-50'}`}>
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      <Users className="w-4 h-4 text-slate-400" />
                      {activity.participants} Joined
                    </div>
                    {activity.status !== 'Completed' && (
                      <button 
                        onClick={() => handleJoinInit(activity)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                          darkMode ? 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white' : 'bg-green-50 text-green-700 hover:bg-green-600 hover:text-white'
                        }`}
                      >
                        <UserPlus className="w-3 h-3" /> Join Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!loading && filteredActivities.length === 0 && (
                <p className="text-slate-500 text-sm py-6 text-center col-span-2">No activities matching your query.</p>
              )}
            </div>

            {/* Employee Participation Table */}
            <Card darkMode={darkMode} className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Pending Participations</h3>
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full text-sm text-left ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  <thead className={`text-xs uppercase border-b ${
                    darkMode ? 'text-slate-400 bg-slate-700 border-slate-600' : 'text-gray-500 bg-gray-50 border-gray-200'
                  }`}>
                    <tr>
                      <th className="px-4 py-3 font-medium">Employee</th>
                      <th className="px-4 py-3 font-medium">Activity</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array(2).fill(0).map((_, i) => (
                        <tr key={i} className={`border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                          <td colSpan={5} className="px-4 py-3"><div className="h-6 bg-slate-100 rounded animate-pulse" /></td>
                        </tr>
                      ))
                    ) : participations.map(p => {
                      return (
                        <tr key={p.id} className={`border-b transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50/50'}`}>
                          <td className={`px-4 py-3 font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{p.employeeName}</td>
                          <td className={`px-4 py-3 ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>{p.activityTitle}</td>
                          <td className={`px-4 py-3 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{p.dateSubmitted ? p.dateSubmitted.split('T')[0] : ''}</td>
                          <td className="px-4 py-3">
                            <Badge variant={p.status === 'Approved' ? 'success' : p.status === 'Pending' ? 'warning' : 'error'} darkMode={darkMode}>
                              {p.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {p.status === 'Pending' ? (
                              <button 
                                onClick={() => handleApprove(p.id)}
                                disabled={!!actionLoading}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                  darkMode ? 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white' : 'bg-green-50 text-green-700 hover:bg-green-600 hover:text-white'
                                }`}
                              >
                                {actionLoading === `approve-${p.id}` ? '...' : 'Approve'}
                              </button>
                            ) : (
                              <span className={`text-xs italic ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>Processed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {!loading && participations.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-550">No participations listed.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right Sidebar: Impact Quote & Info */}
          <div className="space-y-6">
            <Card darkMode={darkMode} className={`${
              darkMode ? 'bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/20' : 'bg-gradient-to-br from-green-600/10 to-teal-600/10 border-none'
            } relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Heart className={`w-32 h-32 ${darkMode ? 'text-green-400' : 'text-green-700'}`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 relative z-10 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Make an Impact</h3>
              <p className={`text-sm relative z-10 mb-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                Our community has contributed significantly to CSR this quarter, logging activities and strengthening team bonds!
              </p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Social;
