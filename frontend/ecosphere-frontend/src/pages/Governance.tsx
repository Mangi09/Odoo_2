import React, { useState } from 'react';
import {
  Shield, AlertTriangle, FileText, CheckCircle2, Search, Clock,
  Activity, BookOpen, UserCheck, Plus, CheckCircle
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  initialGovernanceSummary, initialAudits, initialComplianceIssues, initialPolicies, governanceActivities
} from '../data/mockGovernanceData';
import type { Audit, ComplianceIssue, Policy } from '../types/governance';
import type { Activity as ActivityType } from '../types/dashboard';

// Reusable Components
const Card = ({ children, className = '', darkMode = false }: { children: React.ReactNode; className?: string; darkMode?: boolean }) => (
  <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-green-100'} rounded-2xl shadow-sm border p-6 ${className}`}>
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

export const Governance = ({ activePage, onPageChange, darkMode, setDarkMode }: {
  activePage?: string;
  onPageChange?: (page: string) => void;
  darkMode?: boolean;
  setDarkMode?: (mode: boolean) => void;
}) => {
  const [summary, setSummary] = useState(initialGovernanceSummary);
  const [audits] = useState<Audit[]>(initialAudits);
  const [issues, setIssues] = useState<ComplianceIssue[]>(initialComplianceIssues);
  const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
  const [recentLog, setRecentLog] = useState<ActivityType[]>(governanceActivities);
  const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'info' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'info' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReportIssue = () => {
    const newIssue: ComplianceIssue = {
      id: `ci-${Date.now()}`,
      title: 'Simulated Compliance Violation',
      severity: 'High',
      owner: 'You',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Open'
    };

    setIssues([newIssue, ...issues]);
    setSummary(prev => ({
      ...prev,
      openIssues: prev.openIssues + 1,
      highSeverityIssues: prev.highSeverityIssues + 1
    }));

    showNotification('New compliance issue reported.', 'info');
  };

  const handleResolveIssue = (issueId: string, severity: string) => {
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, status: 'Resolved' } : i));

    setSummary(prev => ({
      ...prev,
      openIssues: Math.max(0, prev.openIssues - 1),
      highSeverityIssues: severity === 'High' ? Math.max(0, prev.highSeverityIssues - 1) : prev.highSeverityIssues
    }));

    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      const newActivity: ActivityType = {
        id: `ga-${Date.now()}`,
        user: 'You',
        action: 'resolved compliance issue',
        target: issue.title,
        time: 'Just now',
        type: 'governance'
      };
      setRecentLog([newActivity, ...recentLog]);
    }

    showNotification('Issue marked as resolved!');
  };

  const handleAcknowledgePolicy = (policyId: string) => {
    setPolicies(prev => prev.map(p => p.id === policyId ? { ...p, isAcknowledged: true } : p));

    // Recalculate percentage
    setPolicies(newPolicies => {
      const ackCount = newPolicies.filter(p => p.isAcknowledged).length;
      const newRate = Math.round((ackCount / newPolicies.length) * 100);
      setSummary(prev => ({ ...prev, policyComplianceRate: newRate }));
      return newPolicies;
    });

    const policy = policies.find(p => p.id === policyId);
    if (policy) {
      const newActivity: ActivityType = {
        id: `ga-${Date.now()}`,
        user: 'You',
        action: 'acknowledged policy',
        target: policy.title,
        time: 'Just now',
        type: 'governance'
      };
      setRecentLog([newActivity, ...recentLog]);
    }

    showNotification('Policy successfully acknowledged!');
  };

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange} darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-7xl mx-auto space-y-6 relative">

        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-20 right-8 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2 ${darkMode ? 'bg-slate-700 text-slate-100' : 'bg-gray-800 text-white'
            }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
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
              onClick={handleReportIssue}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${darkMode ? 'bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30' : 'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100'
                }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Report Issue
            </button>
            <button className={`px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-sm flex items-center gap-2 ${darkMode ? 'bg-slate-600 text-slate-100' : 'bg-gray-900 text-white'
              }`}>
              <Plus className="w-4 h-4" />
              New Policy
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'
                }`}>
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Open Issues</h3>
              <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.openIssues}</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'
                }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>High Severity</h3>
              <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.highSeverityIssues}</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-50 text-teal-600'
                }`}>
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Upcoming Audits</h3>
              <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.upcomingAudits}</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
                }`}>
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Policy Compliance</h3>
              <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.policyComplianceRate}%</div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Area: Tables */}
          <div className="lg:col-span-2 space-y-6">

            {/* Compliance Issues Table */}
            <Card darkMode={darkMode}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Active Compliance Issues</h3>
                <div className="relative hidden sm:block">
                  <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    className={`pl-9 pr-4 py-2 rounded-lg text-sm transition-all outline-none w-48 ${darkMode ? 'bg-slate-700 border border-slate-600 text-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20' : 'bg-gray-50 border border-gray-200 text-gray-700 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200'
                      }`}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full text-sm text-left ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  <thead className={`text-xs uppercase border-b ${darkMode ? 'text-slate-400 bg-slate-700 border-slate-600' : 'text-gray-500 bg-gray-50 border-gray-200'
                    }`}>
                    <tr>
                      <th className="px-4 py-3 font-medium">Issue</th>
                      <th className="px-4 py-3 font-medium">Severity</th>
                      <th className="px-4 py-3 font-medium">Due Date</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.filter(i => i.status !== 'Resolved').map(issue => (
                      <tr key={issue.id} className={`border-b transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50/50'
                        }`}>
                        <td className="px-4 py-3">
                          <div className={`font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{issue.title}</div>
                          <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Owner: {issue.owner}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={issue.severity === 'High' ? 'error' : issue.severity === 'Medium' ? 'warning' : 'info'} darkMode={darkMode}>
                            {issue.severity}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium">{issue.dueDate}</td>
                        <td className="px-4 py-3">
                          <Badge variant={issue.status === 'Open' ? 'warning' : 'info'} darkMode={darkMode}>{issue.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleResolveIssue(issue.id, issue.severity)}
                            className={`text-xs font-semibold ${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}`}
                          >
                            Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                    {issues.filter(i => i.status !== 'Resolved').length === 0 && (
                      <tr>
                        <td colSpan={5} className={`px-4 py-8 text-center ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
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
                  <thead className={`text-xs uppercase border-b ${darkMode ? 'text-slate-400 bg-slate-700 border-slate-600' : 'text-gray-500 bg-gray-50 border-gray-200'
                    }`}>
                    <tr>
                      <th className="px-4 py-3 font-medium">Audit Title</th>
                      <th className="px-4 py-3 font-medium">Auditor</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audits.map(audit => (
                      <tr key={audit.id} className={`border-b transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50/50'
                        }`}>
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
                {policies.map(policy => (
                  <div key={policy.id} className={`p-3 rounded-xl border flex flex-col gap-3 ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-100'
                    }`}>
                    <div>
                      <h4 className={`text-sm font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{policy.title}</h4>
                      <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Version {policy.version} • Updated {policy.lastUpdated}</p>
                    </div>
                    {policy.isAcknowledged ? (
                      <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg justify-center ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
                        }`}>
                        <CheckCircle className="w-4 h-4" /> Acknowledged
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAcknowledgePolicy(policy.id)}
                        className={`flex items-center justify-center gap-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors`}
                      >
                        <UserCheck className="w-4 h-4" /> Acknowledge
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Activity Stream */}
            <Card darkMode={darkMode}>
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-base font-semibold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                  <Activity className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} /> Recent Activity
                </h3>
              </div>
              <div className="space-y-5">
                {recentLog.map(activity => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="mt-0.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                        <Activity className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-800'}`}>
                        <span className={`font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{activity.user}</span> {activity.action}
                      </p>
                      <p className={`text-sm font-medium mt-0.5 line-clamp-1 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{activity.target}</p>
                      <div className={`flex items-center gap-1 mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        <Clock className="w-3 h-3" /> {activity.time}
                      </div>
                    </div>
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
