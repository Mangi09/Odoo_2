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
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'success' | 'warning' | 'error' | 'default' | 'info' }) => {
  const styles = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-orange-100 text-orange-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    default: 'bg-slate-100 text-slate-700'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>{children}</span>;
};

export const Social = ({ activePage, onPageChange }: { activePage?: string, onPageChange?: (page: string) => void }) => {
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
    <DashboardLayout activePage={activePage} onPageChange={onPageChange}>
      <div className="max-w-7xl mx-auto space-y-8 relative">
        
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-20 right-8 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <p className="text-sm font-medium">{notification}</p>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Social & CSR Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage community initiatives, track participation, and review impact.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">Active CSR Activities</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.activeActivities}</div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">Total Participants</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.totalParticipants.toLocaleString()}</div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">Pending Approvals</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.pendingApprovals}</div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">Points Awarded</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.pointsAwarded.toLocaleString()}</div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Area: CSR Activities */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Available Activities</h3>
              <div className="relative hidden sm:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search initiatives..." 
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none w-64"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activities.map(activity => (
                <div key={activity.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant={activity.status === 'Open' ? 'success' : activity.status === 'Ongoing' ? 'info' : 'default'}>
                        {activity.status}
                      </Badge>
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1"><Award className="w-3 h-3 text-yellow-500" /> {activity.points} pts</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-base mb-2 group-hover:text-blue-600 transition-colors">{activity.title}</h4>
                    <p className="text-sm text-slate-600 line-clamp-2">{activity.description}</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Users className="w-4 h-4 text-slate-400" />
                      {activity.participants} Joined
                    </div>
                    {activity.status !== 'Completed' && (
                      <button 
                        onClick={() => handleJoin(activity)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" /> Join Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Employee Participation Table */}
            <Card className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Pending Participations</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
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
                        <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-900">{p.employeeName}</td>
                          <td className="px-4 py-3 text-slate-700">{p.activityTitle}</td>
                          <td className="px-4 py-3 text-slate-500">{p.dateSubmitted}</td>
                          <td className="px-4 py-3">
                            <Badge variant={p.status === 'Approved' ? 'success' : p.status === 'Pending' ? 'warning' : 'error'}>
                              {p.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {p.status === 'Pending' && (
                              <button 
                                onClick={() => handleApprove(p.id, pts, p.activityTitle, p.employeeName)}
                                className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white rounded-lg text-xs font-medium transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            {p.status === 'Approved' && (
                              <span className="text-xs text-slate-400 italic">Processed</span>
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
            <Card className="bg-slate-900 text-white border-none relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Heart className="w-32 h-32 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 relative z-10">Make an Impact</h3>
              <p className="text-sm text-slate-300 relative z-10 mb-6">Our community has contributed over {summary.pointsAwarded.toLocaleString()} points this quarter!</p>
              <button className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors relative z-10 flex items-center justify-center gap-2">
                Propose New Initiative
              </button>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-slate-900">Activity Stream</h3>
              </div>
              <div className="space-y-5">
                {recentLog.map(activity => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="mt-0.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        activity.type === 'gamification' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {activity.type === 'gamification' ? <Award className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-800">
                        <span className="font-medium text-slate-900">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-sm font-medium text-slate-900 mt-0.5">{activity.target}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" /> {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1">
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
