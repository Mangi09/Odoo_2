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

export const Governance = ({ activePage, onPageChange }: { activePage?: string, onPageChange?: (page: string) => void }) => {
  const [summary, setSummary] = useState(initialGovernanceSummary);
  const [audits] = useState<Audit[]>(initialAudits);
  const [issues, setIssues] = useState<ComplianceIssue[]>(initialComplianceIssues);
  const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
  const [recentLog, setRecentLog] = useState<ActivityType[]>(governanceActivities);
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'info'} | null>(null);

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
    <DashboardLayout activePage={activePage} onPageChange={onPageChange}>
      <div className="max-w-7xl mx-auto space-y-8 relative">
        
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-20 right-8 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2">
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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Governance & Compliance</h1>
            <p className="text-slate-500 mt-1 text-sm">Monitor audits, manage policies, and track organizational compliance.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleReportIssue}
              className="px-4 py-2.5 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-medium hover:bg-red-100 transition-all flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Report Issue
            </button>
            <button className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Policy
            </button>
          </div>
        </div>

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
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.openIssues}</div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">High Severity</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.highSeverityIssues}</div>
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
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.upcomingAudits}</div>
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
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.policyComplianceRate}%</div>
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
                <div className="relative hidden sm:block">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search issues..." 
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none w-48"
                  />
                </div>
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
                    {issues.filter(i => i.status !== 'Resolved').map(issue => (
                      <tr key={issue.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{issue.title}</div>
                          <div className="text-xs text-slate-500">Owner: {issue.owner}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={issue.severity === 'High' ? 'error' : issue.severity === 'Medium' ? 'warning' : 'info'}>
                            {issue.severity}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium">{issue.dueDate}</td>
                        <td className="px-4 py-3">
                          <Badge variant={issue.status === 'Open' ? 'warning' : 'info'}>{issue.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => handleResolveIssue(issue.id, issue.severity)}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                    {issues.filter(i => i.status !== 'Resolved').length === 0 && (
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
                    {audits.map(audit => (
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
                {policies.map(policy => (
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

            {/* Activity Stream */}
            <Card>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-slate-400" /> Recent Activity
                </h3>
              </div>
              <div className="space-y-5">
                {recentLog.map(activity => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="mt-0.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-800">
                        <span className="font-medium text-slate-900">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-sm font-medium text-slate-900 mt-0.5 line-clamp-1">{activity.target}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
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
