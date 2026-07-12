import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, FileText, CheckCircle2, Clock, 
  BookOpen, UserCheck, CheckCircle, RefreshCw, X
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { governance as govApi } from '../lib/api';

const Card = ({ children, className = '', darkMode = false }: { children: React.ReactNode; className?: string; darkMode?: boolean }) => (
  <div className={`${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-green-100'} rounded-2xl shadow-sm border p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', darkMode = false }: { children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'info' | 'default'; darkMode?: boolean }) => {
  const styles = {
    success: darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-700',
    warning: darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-700',
    error: darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700',
    info: darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-50 text-teal-700',
    default: darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-50 text-gray-700'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>{children}</span>;
};

interface Audit { id: string; title: string; auditor: string; date: string; status: string; department: string; }
interface ComplianceIssue { id: string; title: string; severity: 'Low' | 'Medium' | 'High' | 'Critical'; status: 'Pending' | 'Active' | 'Completed' | 'Resolved' | 'Overdue'; owner?: string; dueDate?: string; category?: string; }
interface Policy { id: string; title: string; version: string; lastUpdated: string; isAcknowledged: boolean; description?: string; }

export const Governance = ({ activePage, onPageChange, darkMode, setDarkMode }: {
  activePage?: string;
  onPageChange?: (page: string) => void;
  darkMode?: boolean;
  setDarkMode?: (mode: boolean) => void;
}) => {
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
    <DashboardLayout activePage={activePage} onPageChange={onPageChange} darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-7xl mx-auto space-y-6 relative">
        
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
            <h1 className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Governance & Compliance</h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Monitor audits, manage policies, and track organizational compliance.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => loadData()}
              className={`p-2.5 rounded-xl shadow-sm transition-all ${
                darkMode ? 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setShowForm(true)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                darkMode ? 'bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30' : 'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Report Issue
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className={`rounded-2xl max-w-md w-full shadow-xl border animate-in zoom-in-95 ${
              darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-100'
            }`}>
              <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <h3 className="text-lg font-bold">Report Compliance Issue</h3>
                <button onClick={() => setShowForm(false)} className={`p-1 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleReportIssue} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Issue Title</label>
                  <input 
                    type="text" 
                    required 
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="Describe the compliance issue..."
                    className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${
                      darkMode ? 'bg-slate-700 border border-slate-600 text-slate-200 focus:border-green-500' : 'bg-slate-50 border border-slate-200 text-gray-700 focus:border-indigo-500'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Severity</label>
                    <select 
                      value={formSeverity} 
                      onChange={e => setFormSeverity(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${
                        darkMode ? 'bg-slate-700 border border-slate-600 text-slate-200' : 'bg-slate-50 border border-slate-200 text-gray-700'
                      }`}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select 
                      value={formCategory} 
                      onChange={e => setFormCategory(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${
                        darkMode ? 'bg-slate-700 border border-slate-600 text-slate-200' : 'bg-slate-50 border border-slate-200 text-gray-700'
                      }`}
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
                  className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Open Issues</h3>
              <div className="text-3xl font-bold tracking-tight">{loading ? '–' : openIssues.length}</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>High/Critical Severity</h3>
              <div className="text-3xl font-bold tracking-tight">{loading ? '–' : highSeverityIssues.length}</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Upcoming Audits</h3>
              <div className="text-3xl font-bold tracking-tight">{loading ? '–' : upcomingAudits.length}</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'}`}>
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Policy Compliance</h3>
              <div className="text-3xl font-bold tracking-tight">{loading ? '–' : policyComplianceRate}%</div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Area: Tables */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Compliance Issues Table */}
            <Card darkMode={darkMode}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Active Compliance Issues</h3>
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full text-sm text-left ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  <thead className={`text-xs uppercase border-b ${darkMode ? 'text-slate-400 bg-slate-700 border-slate-600' : 'text-gray-500 bg-gray-50 border-gray-200'}`}>
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
                        <tr key={i} className={`border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                          <td colSpan={5} className="px-4 py-3"><div className="h-6 bg-slate-100 rounded animate-pulse" /></td>
                        </tr>
                      ))
                    ) : issues.filter(i => i.status !== 'Resolved' && i.status !== 'Completed').map(issue => (
                      <tr key={issue.id} className={`border-b transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50/50'}`}>
                        <td className="px-4 py-3">
                          <div className={`font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{issue.title}</div>
                          <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Category: {issue.category || 'General'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={issue.severity === 'Critical' || issue.severity === 'High' ? 'error' : issue.severity === 'Medium' ? 'warning' : 'info'} darkMode={darkMode}>
                            {issue.severity}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium">{issue.dueDate || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <Badge variant={issue.status === 'Overdue' ? 'error' : 'warning'} darkMode={darkMode}>{issue.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => handleResolveIssue(issue.id)}
                            className={`text-xs font-semibold ${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}`}
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
            <Card darkMode={darkMode}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Audit Schedule</h3>
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full text-sm text-left ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  <thead className={`text-xs uppercase border-b ${darkMode ? 'text-slate-400 bg-slate-700 border-slate-600' : 'text-gray-500 bg-gray-50 border-gray-200'}`}>
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
                        <tr key={i} className={`border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                          <td colSpan={4} className="px-4 py-3"><div className="h-6 bg-slate-100 rounded animate-pulse" /></td>
                        </tr>
                      ))
                    ) : audits.map(audit => (
                      <tr key={audit.id} className={`border-b transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50/50'}`}>
                        <td className="px-4 py-3">
                          <div className={`font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{audit.title}</div>
                          <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{audit.department}</div>
                        </td>
                        <td className="px-4 py-3">{audit.auditor}</td>
                        <td className="px-4 py-3 font-medium">{audit.date}</td>
                        <td className="px-4 py-3">
                          <Badge variant={audit.status === 'Completed' ? 'success' : audit.status === 'In Progress' ? 'info' : 'default'} darkMode={darkMode}>
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
            <Card darkMode={darkMode}>
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-base font-semibold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                  <BookOpen className="w-5 h-5 text-green-500" /> My Policies
                </h3>
              </div>
              <div className="space-y-4">
                {loading ? (
                  Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)
                ) : policies.map(policy => (
                  <div key={policy.id} className={`p-3 rounded-xl border flex flex-col gap-3 ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-100'}`}>
                    <div>
                      <h4 className={`text-sm font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{policy.title}</h4>
                      <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Version {policy.version} • Updated {policy.lastUpdated}</p>
                    </div>
                    {policy.isAcknowledged ? (
                      <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg justify-center ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'}`}>
                        <CheckCircle className="w-4 h-4" /> Acknowledged
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleAcknowledgePolicy(policy.id)}
                        className="flex items-center justify-center gap-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors"
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
