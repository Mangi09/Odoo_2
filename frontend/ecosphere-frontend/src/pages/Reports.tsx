import React, { useState, useEffect } from 'react';
import { 
  FileText, Leaf, Users, Shield, Download, Filter, 
  CheckCircle2, FileDown, Plus, Calendar, LayoutDashboard, RefreshCw
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { reports as reportsApi, dashboard as dashApi } from '../lib/api';


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

interface ReportHistoryEntry {
  id: string;
  module: string;
  format: string;
  status: string;
  downloadUrl: string;
  generatedAt: string;
}

export const Reports = ({ activePage, onPageChange }: { activePage?: string, onPageChange?: (page: string) => void }) => {
  const [history, setHistory] = useState<ReportHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'info'|'error'} | null>(null);

  // Stats from dashboard/summary
  const [stats, setStats] = useState({
    esgScore: 0,
    carbonOffset: 0,
    activeGoals: 0,
    volunteerHours: 0
  });

  // Form State
  const [selectedModule, setSelectedModule] = useState('Environmental');
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'CSV' | 'XLSX'>('PDF');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  const showNotification = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [hist, summaryData] = await Promise.all([
        reportsApi.history(),
        dashApi.summary()
      ]);
      setHistory(hist as ReportHistoryEntry[]);
      if (summaryData) {
        setStats({
          esgScore: (summaryData.esgScore as number) || 0,
          carbonOffset: (summaryData.carbonOffset as number) || 0,
          activeGoals: (summaryData.activeGoals as number) || 0,
          volunteerHours: (summaryData.volunteerHours as number) || 0
        });
      }
    } catch (err) {
      console.error(err);
      showNotification('Failed to load reports history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateReport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGenerating(true);
    try {
      const payload = {
        module: selectedModule,
        format: selectedFormat,
        departmentId: selectedDepartment === 'All' ? '' : selectedDepartment,
        dateRange: {
          from: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0]
        }
      };
      await reportsApi.generate(payload);
      showNotification(`Successfully generated report: ${selectedModule}`);
      await loadData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(e.message || 'Report generation failed', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (id: string) => {
    showNotification('Downloading report...', 'info');
    reportsApi.download(id);
  };

  const quickReportCategories = [
    { id: '1', title: 'Environmental Disclosures', type: 'Environmental', icon: Leaf, desc: 'Carbon footprints, Scope 1/2/3 greenhouse gas emissions, energy usage metrics.' },
    { id: '2', title: 'CSR & Community Engagement', type: 'Social', icon: Users, desc: 'Volunteer activities, hours spent, CSR points ledger, and participant directory.' },
    { id: '3', title: 'Compliance & Audits', type: 'Governance', icon: Shield, desc: 'Outstanding compliance violations, active policies acknowledgment rate, audit logs.' },
    { id: '4', title: 'Complete Executive ESG Report', type: 'All', icon: FileText, desc: 'High-level aggregated ESG scores, summaries from all departments, and year-over-year progress.' }
  ];

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange}>
      <div className="max-w-7xl mx-auto space-y-8 relative">
        
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-20 right-8 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <FileDown className="w-5 h-5 text-blue-400" />
            )}
            <p className="text-sm font-medium">{notification.msg}</p>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
            <p className="text-slate-500 mt-1 text-sm">Generate, filter, and export your ESG data for stakeholders and compliance.</p>
          </div>
          <button onClick={() => loadData()} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileDown className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">Reports Logged</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{loading ? '–' : history.length}</div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">Overall ESG Score</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{loading ? '–' : stats.esgScore}/100</div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">Carbon Offset (t)</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{loading ? '–' : stats.carbonOffset.toFixed(1)}</div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">Active Targets</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{loading ? '–' : stats.activeGoals}</div>
            </div>
          </Card>
        </div>

        {/* Report Categories */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickReportCategories.map(cat => (
              <div 
                key={cat.id} 
                className="p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer"
                onClick={() => {
                  setSelectedModule(cat.type);
                  setSelectedFormat('PDF');
                  handleGenerateReport();
                }}
              >
                <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${
                  cat.type === 'Environmental' ? 'bg-green-100 text-green-600' :
                  cat.type === 'Social' ? 'bg-blue-100 text-blue-600' :
                  cat.type === 'Governance' ? 'bg-orange-100 text-orange-600' :
                  'bg-indigo-100 text-indigo-600'
                }`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">{cat.title}</h4>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{cat.desc}</p>
                <div className="flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
                  <Download className="w-4 h-4 mr-1.5" /> Quick Export PDF
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Custom Report Builder */}
          <Card className="lg:col-span-1 h-fit">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-slate-900">Custom Report</h3>
            </div>
            <form onSubmit={handleGenerateReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Module</label>
                <select 
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                >
                  <option value="Environmental">Environmental Focus</option>
                  <option value="Social">Social Focus</option>
                  <option value="Governance">Governance Focus</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Department Filter</label>
                <select 
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                >
                  <option value="All">All Departments</option>
                  <option value="HQ">Headquarters</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="HR">Human Resources</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PDF', 'CSV', 'XLSX'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSelectedFormat(fmt)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        selectedFormat === fmt 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                disabled={generating}
                className="w-full mt-2 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                {generating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Generate Report
                  </>
                )}
              </button>
            </form>
          </Card>

          {/* Report History */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Generated Reports</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Report Scope</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Format</th>
                    <th className="px-4 py-3 font-medium text-right">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td colSpan={5} className="px-4 py-3"><div className="h-6 bg-slate-100 rounded animate-pulse" /></td>
                      </tr>
                    ))
                  ) : history.map(item => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{item.module} Audit Segment</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {item.generatedAt.split('T')[0]}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={item.status === 'COMPLETED' ? 'success' : 'warning'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-600 border border-slate-200">
                          {item.format}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleDownload(item.id)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Download File"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && history.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No reports generated yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
