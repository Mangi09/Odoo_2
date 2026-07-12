import React, { useState } from 'react';
import {
  Users, Heart, Award, Clock, HeartHandshake, Search, Activity, CheckCircle2, ChevronRight, UserPlus
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  initialSocialSummary, initialCSRActivities, initialParticipations, socialActivities
} from '../data/mockSocialData';
import type { CSRActivity, EmployeeParticipation } from '../types/social';
import type { Activity as ActivityType } from '../types/dashboard';

// Reusable Components
const Card = ({ children, className = '', darkMode = false }: { children: React.ReactNode; className?: string; darkMode?: boolean }) => (
  <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-green-100'} rounded-2xl shadow-sm border p-6 ${className}`}>
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

export const Social = ({ activePage, onPageChange, darkMode, setDarkMode }: {
  activePage?: string;
  onPageChange?: (page: string) => void;
  darkMode?: boolean;
  setDarkMode?: (mode: boolean) => void;
}) => {
  const [summary, setSummary] = useState(initialSocialSummary);
  const [activities] = useState<CSRActivity[]>(initialCSRActivities);
  const [participations, setParticipations] = useState<EmployeeParticipation[]>(initialParticipations);
  const [recentLog, setRecentLog] = useState<ActivityType[]>(socialActivities);
  const [notification, setNotification] = useState<string | null>(null);

  const handleJoin = (activity: CSRActivity) => {
    // Check if already joined
    if (participations.find(p => p.activityTitle === activity.title && p.employeeName === 'You')) {
      showNotification("You've already joined this activity!");
      return;
    }

    const newParticipation: EmployeeParticipation = {
      id: `p-${Date.now()}`,
      employeeName: 'You',
      activityTitle: activity.title,
      dateSubmitted: new Date().toISOString().split('T')[0],
      proofUrl: 'Pending upload...',
      status: 'Pending'
    };

    setParticipations([newParticipation, ...participations]);
    setSummary(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals + 1 }));
    showNotification(`Successfully joined ${activity.title}!`);
  };

  const handleApprove = (participationId: string, points: number, activityTitle: string, employeeName: string) => {
    setParticipations(prev =>
      prev.map(p => p.id === participationId ? { ...p, status: 'Approved' } : p)
    );

    setSummary(prev => ({
      ...prev,
      pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
      pointsAwarded: prev.pointsAwarded + points,
      totalParticipants: prev.totalParticipants + 1
    }));

    const newActivity: ActivityType = {
      id: `sa-${Date.now()}`,
      user: 'Manager (You)',
      action: `approved participation & awarded ${points} pts`,
      target: `${employeeName} - ${activityTitle}`,
      time: 'Just now',
      type: 'gamification'
    };

    setRecentLog([newActivity, ...recentLog]);
    showNotification(`Approved participation for ${employeeName}!`);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange} darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-7xl mx-auto space-y-6 relative">

        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-20 right-8 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2 ${darkMode ? 'bg-slate-700 text-slate-100' : 'bg-gray-800 text-white'
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
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-50 text-teal-600'
                }`}>
                <HeartHandshake className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Active CSR Activities</h3>
              <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.activeActivities}</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
                }`}>
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Participants</h3>
              <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.totalParticipants.toLocaleString()}</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'
                }`}>
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Pending Approvals</h3>
              <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.pendingApprovals}</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-50 text-yellow-600'
                }`}>
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Points Awarded</h3>
              <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.pointsAwarded.toLocaleString()}</div>
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
                  placeholder="Search initiatives..."
                  className={`pl-9 pr-4 py-2 rounded-full text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none w-64 ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-gray-200 text-gray-700'
                    }`}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activities.map(activity => (
                <div key={activity.id} className={`rounded-xl border p-5 hover:shadow-md transition-all flex flex-col justify-between group ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-green-100'
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
                    <h4 className={`font-semibold text-base mb-2 group-hover:text-green-600 transition-colors ${darkMode ? 'text-slate-100' : 'text-gray-900'
                      }`}>{activity.title}</h4>
                    <p className={`text-sm line-clamp-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>{activity.description}</p>
                  </div>
                  <div className={`mt-5 flex items-center justify-between pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-green-50'
                    }`}>
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      <Users className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                      {activity.participants} Joined
                    </div>
                    {activity.status !== 'Completed' && (
                      <button
                        onClick={() => handleJoin(activity)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${darkMode ? 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white' : 'bg-green-50 text-green-700 hover:bg-green-600 hover:text-white'
                          }`}
                      >
                        <UserPlus className="w-3 h-3" /> Join Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Employee Participation Table */}
            <Card darkMode={darkMode} className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Pending Participations</h3>
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full text-sm text-left ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  <thead className={`text-xs uppercase border-b ${darkMode ? 'text-slate-400 bg-slate-700 border-slate-600' : 'text-gray-500 bg-gray-50 border-gray-200'
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
                    {participations.map(p => {
                      const activityObj = activities.find(a => a.title === p.activityTitle);
                      const pts = activityObj ? activityObj.points : 0;
                      return (
                        <tr key={p.id} className={`border-b transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50/50'
                          }`}>
                          <td className={`px-4 py-3 font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{p.employeeName}</td>
                          <td className={`px-4 py-3 ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>{p.activityTitle}</td>
                          <td className={`px-4 py-3 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{p.dateSubmitted}</td>
                          <td className="px-4 py-3">
                            <Badge variant={p.status === 'Approved' ? 'success' : p.status === 'Pending' ? 'warning' : 'error'} darkMode={darkMode}>
                              {p.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {p.status === 'Pending' && (
                              <button
                                onClick={() => handleApprove(p.id, pts, p.activityTitle, p.employeeName)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${darkMode ? 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white' : 'bg-green-50 text-green-700 hover:bg-green-600 hover:text-white'
                                  }`}
                              >
                                Approve
                              </button>
                            )}
                            {p.status === 'Approved' && (
                              <span className={`text-xs italic ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>Processed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right Sidebar: Recent Activities */}
          <div className="space-y-6">
            <Card darkMode={darkMode} className={`${darkMode ? 'bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/20' : 'bg-gradient-to-br from-green-600/10 to-teal-600/10 border-none'
              } relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Heart className={`w-32 h-32 ${darkMode ? 'text-green-400' : 'text-green-700'}`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 relative z-10 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Make an Impact</h3>
              <p className={`text-sm relative z-10 mb-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>Our community has contributed over {summary.pointsAwarded.toLocaleString()} points this quarter!</p>
              <button className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors relative z-10 flex items-center justify-center gap-2 shadow-sm">
                Propose New Initiative
              </button>
            </Card>

            <Card darkMode={darkMode}>
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-base font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Activity Stream</h3>
              </div>
              <div className="space-y-5">
                {recentLog.map(activity => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="mt-0.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${darkMode
                          ? (activity.type === 'gamification' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-teal-500/20 text-teal-400')
                          : (activity.type === 'gamification' ? 'bg-yellow-100 text-yellow-600' : 'bg-teal-100 text-teal-600')
                        }`}>
                        {activity.type === 'gamification' ? <Award className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                      </div>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-800'}`}>
                        <span className={`font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{activity.user}</span> {activity.action}
                      </p>
                      <p className={`text-sm font-medium mt-0.5 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{activity.target}</p>
                      <div className={`flex items-center gap-1 mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        <Clock className="w-3 h-3" /> {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className={`w-full mt-6 py-2 text-sm font-medium hover:bg-green-50 rounded-lg transition-colors flex items-center justify-center gap-1 ${darkMode ? 'text-green-400 hover:bg-green-500/20' : 'text-green-600 hover:text-green-700'
                }`}>
                View All Activity <ChevronRight className="w-4 h-4" />
              </button>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Social;
