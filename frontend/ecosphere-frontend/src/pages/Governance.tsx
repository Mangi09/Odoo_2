import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, FileText, CheckCircle2, Clock, 
  BookOpen, UserCheck, CheckCircle, RefreshCw, X
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { governance as govApi } from '../lib/api';

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'success' | 'warning' | 'error' | 'info' | 'default' }) => {
  const styles = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-orange-100 text-orange-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    default: 'bg-slate-100 text-slate-700'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>{children}</span>;
};

interface Audit { id: string; title: string; auditor: string; date: string; status: string; department: string; }
interface ComplianceIssue { id: string; title: string; severity: 'Low' | 'Medium' | 'High' | 'Critical'; status: 'Pending' | 'Active' | 'Completed' | 'Resolved' | 'Overdue'; owner?: string; dueDate?: string; category?: string; }
interface Policy { id: string; title: string; version: string; lastUpdated: string; isAcknowledged: boolean; description?: string; }

export const Governance = ({ activePage, onPageChange }: { activePage?: string, onPageChange?: (page: string) => void }) => {

  const [audits, setAudits] = useState<Audit[]>([]);
  const [issues, setIssues] = useState<ComplianceIssue[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & Form State
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formSeverity, setFormSeverity] = useState('Medium');
  const [formCategory, setFormCategory] = useState('Environmental');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notification, setNotification] = useState<{msg: string, type: 'success'|'info'|'error'} | null>(null);

  const showNotification = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [auds, iss, pols] = await Promise.all([
        govApi.audits(),
        govApi.issues(),
        govApi.policies()
      ]);
      setAudits(auds as Audit[]);
      setIssues(iss as ComplianceIssue[]);
      setPolicies(pols as Policy[]);
    } catch (err) {
      console.error(err);
      showNotification('Failed to load compliance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await govApi.createIssue({
        title: formTitle,
        severity: formSeverity,
        category: formCategory
      });
      showNotification('New compliance issue reported successfully.', 'success');
      setShowForm(false);
      setFormTitle('');
      await loadData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(e.message || 'Failed to report issue', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveIssue = async (issueId: string) => {
    try {
      await govApi.resolveIssue(issueId, 'Resolved');
      showNotification('Issue marked as resolved!');
      await loadData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(e.message || 'Failed to resolve issue', 'error');
    }
  };

  const handleAcknowledgePolicy = async (policyId: string) => {
    try {
      await govApi.acknowledge(policyId);
      showNotification('Policy successfully acknowledged!');
      await loadData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(e.message || 'Failed to acknowledge policy', 'error');
    }
  };

  const openIssues = issues.filter(i => i.status !== 'Resolved' && i.status !== 'Completed');
  const highSeverityIssues = openIssues.filter(i => i.severity === 'High' || i.severity === 'Critical');
  const upcomingAudits = audits.filter(a => a.status !== 'Completed');
  const policyComplianceRate = policies.length > 0 
    ? Math.round((policies.filter(p => p.isAcknowledged).length / policies.length) * 100) 
    : 100;

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange}>
      <div className="max-w-7xl mx-auto space-y-8 relative">
        
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-20 right-8 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'error' ? 'bg-red-600' : 'bg-slate-800'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : notification.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-white" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            )}
            <p className="text-sm font-medium">{notification.msg}</p>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Governance & Compliance</h1>
            <p className="text-slate-500 mt-1 text-sm">Monitor audits, manage policies, and track organizational compliance.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => loadData()}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setShowForm(true)}
              className="px-4 py-2.5 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-medium hover:bg-red-100 transition-all flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Report Issue
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 animate-in zoom-in-95">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Report Compliance Issue</h3>
                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleReportIssue} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Issue Title</label>
                  <input 
                    type="text" 
                    required 
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="Describe the compliance issue..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
                    <select 
                      value={formSeverity} 
                      onChange={e => setFormSeverity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select 
                      value={formCategory} 
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                    >
                      <option value="Environmental">Environmental</option>
                      <option value="Social">Social</option>
                      <option value="Governance">Governance</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">Open Issues</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{loading ? '–' : openIssues.length}</div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">High/Critical Severity</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{loading ? '–' : highSeverityIssues.length}</div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">Upcoming Audits</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{loading ? '–' : upcomingAudits.length}</div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">Policy Compliance</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{loading ? '–' : policyComplianceRate}%</div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Area: Tables */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Compliance Issues Table */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Active Compliance Issues</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">Issue</th>
                      <th className="px-4 py-3 font-medium">Severity</th>
                      <th className="px-4 py-3 font-medium">Due Date</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array(3).fill(0).map((_, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td colSpan={5} className="px-4 py-3"><div className="h-6 bg-slate-100 rounded animate-pulse" /></td>
                        </tr>
                      ))
                    ) : issues.filter(i => i.status !== 'Resolved' && i.status !== 'Completed').map(issue => (
                      <tr key={issue.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{issue.title}</div>
                          <div className="text-xs text-slate-500">Category: {issue.category || 'General'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={issue.severity === 'Critical' || issue.severity === 'High' ? 'error' : issue.severity === 'Medium' ? 'warning' : 'info'}>
                            {issue.severity}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium">{issue.dueDate || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <Badge variant={issue.status === 'Overdue' ? 'error' : 'warning'}>{issue.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => handleResolveIssue(issue.id)}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!loading && issues.filter(i => i.status !== 'Resolved' && i.status !== 'Completed').length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                          No active issues! Great job.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Audits Table */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Audit Schedule</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">Audit Title</th>
                      <th className="px-4 py-3 font-medium">Auditor</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array(2).fill(0).map((_, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td colSpan={4} className="px-4 py-3"><div className="h-6 bg-slate-100 rounded animate-pulse" /></td>
                        </tr>
                      ))
                    ) : audits.map(audit => (
                      <tr key={audit.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{audit.title}</div>
                          <div className="text-xs text-slate-500">{audit.department}</div>
                        </td>
                        <td className="px-4 py-3">{audit.auditor}</td>
                        <td className="px-4 py-3 font-medium">{audit.date}</td>
                        <td className="px-4 py-3">
                          <Badge variant={audit.status === 'Completed' ? 'success' : audit.status === 'In Progress' ? 'info' : 'default'}>
                            {audit.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Policies */}
            <Card>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" /> My Policies
                </h3>
              </div>
              <div className="space-y-4">
                {loading ? (
                  Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)
                ) : policies.map(policy => (
                  <div key={policy.id} className="p-3 rounded-xl border border-slate-100 flex flex-col gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{policy.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Version {policy.version} • Updated {policy.lastUpdated}</p>
                    </div>
                    {policy.isAcknowledged ? (
                      <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg justify-center">
                        <CheckCircle className="w-4 h-4" /> Acknowledged
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleAcknowledgePolicy(policy.id)}
                        className="flex items-center justify-center gap-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <UserCheck className="w-4 h-4" /> Acknowledge
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Governance;
