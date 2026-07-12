import React, { useState, useEffect } from 'react';
import { Users, Heart, Award, HeartHandshake, CheckCircle2, UserPlus, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { social as socialApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 ${className}`}>{children}</div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'success' | 'warning' | 'error' | 'default' | 'info' }) => {
  const styles = { success: 'bg-green-100 text-green-700', warning: 'bg-orange-100 text-orange-700', error: 'bg-red-100 text-red-700', info: 'bg-blue-100 text-blue-700', default: 'bg-slate-100 text-slate-700' };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>{children}</span>;
};

interface CSRActivity { id: string; title: string; description: string; participants?: number; points: number; status: string; category: string; evidenceRequired?: boolean; }
interface Participation { id: string; employeeName: string; activityTitle: string; status: string; pointsEarned: number; submittedAt: string; proofUrl?: string; }

export const Social = ({ activePage, onPageChange }: { activePage?: string, onPageChange?: (page: string) => void }) => {
  const { permissions } = useAuth();
  const [activities, setActivities] = useState<CSRActivity[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const canApprove = permissions.includes('approve_participations');

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [acts, parts] = await Promise.all([socialApi.activities(), socialApi.participations()]);
      setActivities(acts as CSRActivity[]);
      setParticipations(parts as Participation[]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleJoin = async (activity: CSRActivity) => {
    setActionLoading(`join-${activity.id}`);
    try {
      await socialApi.join(activity.id);
      showNotification(`✅ Successfully joined ${activity.title}!`);
      await loadData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(`❌ ${e.message || 'Failed to join activity'}`);
    } finally { setActionLoading(null); }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(`approve-${id}`);
    try {
      const result = await socialApi.approve(id);
      showNotification(`✅ Approved! +${(result as { pointsAwarded?: number }).pointsAwarded || 0} points awarded`);
      await loadData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(`❌ ${e.message || 'Failed to approve'}`);
    } finally { setActionLoading(null); }
  };

  const handleReject = async (id: string) => {
    setActionLoading(`reject-${id}`);
    try {
      await socialApi.reject(id);
      showNotification('Participation rejected.');
      await loadData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(`❌ ${e.message || 'Failed to reject'}`);
    } finally { setActionLoading(null); }
  };

  const pendingCount = participations.filter(p => p.status === 'Pending').length;
  const approvedCount = participations.filter(p => p.status === 'Approved').length;

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange}>
      <div className="max-w-7xl mx-auto space-y-8 relative">
        {notification && (
          <div className="fixed top-20 right-8 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            <p className="text-sm font-medium">{notification}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Social & CSR</h1>
            <p className="text-slate-500 mt-1 text-sm">Join CSR activities, earn points, and make a social impact.</p>
          </div>
          <button onClick={() => loadData()} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: HeartHandshake, label: 'Total Activities', value: activities.length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Users, label: 'Total Joined', value: participations.length, color: 'text-green-600', bg: 'bg-green-50' },
            { icon: Award, label: 'Pending Approvals', value: pendingCount, color: 'text-orange-600', bg: 'bg-orange-50' },
            { icon: Heart, label: 'Approved', value: approvedCount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((s, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-4`}><s.icon className="w-5 h-5" /></div>
              <div className="text-2xl font-bold text-slate-900">{loading ? '–' : s.value}</div>
              <div className="text-slate-500 text-sm mt-1">{s.label}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CSR Activities */}
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-5">Open CSR Activities</h3>
            <div className="space-y-4">
              {loading ? (
                Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)
              ) : activities.filter(a => a.status === 'OPEN').map(activity => (
                <div key={activity.id} className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/20 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-slate-900">{activity.title}</h4>
                        {activity.evidenceRequired && <Badge variant="warning">Evidence Req.</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{activity.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="info">{activity.category}</Badge>
                        <span className="text-xs font-bold text-green-600">+{activity.points} pts</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoin(activity)}
                      disabled={actionLoading === `join-${activity.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-semibold transition-colors shrink-0 disabled:opacity-70"
                    >
                      {actionLoading === `join-${activity.id}` ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                      Join Now
                    </button>
                  </div>
                </div>
              ))}
              {!loading && activities.filter(a => a.status === 'OPEN').length === 0 && (
                <p className="text-slate-500 text-sm text-center py-6">No open activities at the moment.</p>
              )}
            </div>
          </Card>

          {/* Participations */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900">Employee Participations</h3>
              {canApprove && pendingCount > 0 && (
                <Badge variant="warning">{pendingCount} pending</Badge>
              )}
            </div>
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {loading ? (
                Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)
              ) : participations.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{p.employeeName}</p>
                    <p className="text-xs text-slate-500 truncate">{p.activityTitle} • {p.submittedAt}</p>
                    {p.pointsEarned > 0 && <p className="text-xs font-semibold text-green-600">+{p.pointsEarned} pts</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={p.status === 'Approved' ? 'success' : p.status === 'Rejected' ? 'error' : 'warning'}>{p.status}</Badge>
                    {canApprove && p.status === 'Pending' && (
                      <>
                        <button onClick={() => handleApprove(p.id)} disabled={!!actionLoading}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50" title="Approve">
                          {actionLoading === `approve-${p.id}` ? <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleReject(p.id)} disabled={!!actionLoading}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Reject">
                          {actionLoading === `reject-${p.id}` ? <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {!loading && participations.length === 0 && <p className="text-slate-500 text-sm text-center py-6">No participations yet.</p>}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Social;
