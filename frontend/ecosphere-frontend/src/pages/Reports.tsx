import React, { useState, useEffect } from 'react';
import { 
  FileText, Leaf, Users, Shield, Download, Filter, 
  CheckCircle2, FileDown, Plus, Calendar, LayoutDashboard, RefreshCw
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { reports as reportsApi, dashboard as dashApi } from '../lib/api';

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

const IconWrapper = ({ name, className = '' }: { name: string, className?: string }) => {
  switch (name) {
    case 'Leaf': return <Leaf className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'FileText': return <FileText className={className} />;
    default: return <FileText className={className} />;
  }
};

interface ReportHistoryEntry {
  id: string;
  module: string;
  format: string;
  status: string;
  downloadUrl: string;
  generatedAt: string;
}

export const Reports = ({ activePage, onPageChange, darkMode, setDarkMode }: {
  activePage?: string;
  onPageChange?: (page: string) => void;
  darkMode?: boolean;
  setDarkMode?: (mode: boolean) => void;
}) => {
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
    { id: '1', title: 'Environmental Disclosures', type: 'Environmental', icon: 'Leaf', desc: 'Carbon footprints, Scope 1/2/3 greenhouse gas emissions, energy usage metrics.' },
    { id: '2', title: 'CSR & Community Engagement', type: 'Social', icon: 'Users', desc: 'Volunteer activities, hours spent, CSR points ledger, and participant directory.' },
    { id: '3', title: 'Compliance & Audits', type: 'Governance', icon: 'Shield', desc: 'Outstanding compliance violations, active policies acknowledgment rate, audit logs.' },
    { id: '4', title: 'Complete Executive ESG Report', type: 'All', icon: 'FileText', desc: 'High-level aggregated ESG scores, summaries from all departments, and year-over-year progress.' }
  ];

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange} darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-7xl mx-auto space-y-6 relative">
        
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-20 right-8 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2 ${darkMode ? 'bg-slate-700 text-slate-100' : 'bg-gray-800 text-white'}`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <FileDown className="w-5 h-5 text-teal-400" />
            )}
            <p className="text-sm font-medium">{notification.msg}</p>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Reports & Analytics</h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Generate, filter, and export your ESG data for stakeholders and compliance.</p>
          </div>
          <button onClick={() => loadData()} className={`p-2.5 rounded-xl shadow-sm transition-all ${
            darkMode ? 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
          }`} title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                <FileDown className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Reports Logged</h3>
              <div className="text-2xl font-semibold tracking-tight">{loading ? '–' : history.length}</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                <LayoutDashboard className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Overall ESG Score</h3>
              <div className="text-2xl font-semibold tracking-tight">{loading ? '–' : stats.esgScore}/100</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'}`}>
                <Leaf className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Carbon Offset (t)</h3>
              <div className="text-2xl font-semibold tracking-tight">{loading ? '–' : stats.carbonOffset.toFixed(1)}</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Active Targets</h3>
              <div className="text-2xl font-semibold tracking-tight">{loading ? '–' : stats.activeGoals}</div>
            </div>
          </Card>
        </div>

        {/* Report Categories */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Quick Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickReportCategories.map(cat => (
              <div 
                key={cat.id} 
                className={`p-5 rounded-xl hover:shadow-md transition-all group cursor-pointer border ${
                  darkMode ? 'bg-slate-800 border-slate-700 hover:border-green-500/50' : 'bg-white border-green-100 hover:border-green-300'
                }`}
                onClick={() => {
                  setSelectedModule(cat.type);
                  setSelectedFormat('PDF');
                  handleGenerateReport();
                }}
              >
                <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${
                  cat.type === 'Environmental' ? (darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600') :
                  cat.type === 'Social' ? (darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-600') :
                  cat.type === 'Governance' ? (darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600') :
                  (darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600')
                }`}>
                  <IconWrapper name={cat.icon} className="w-6 h-6" />
                </div>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{cat.title}</h4>
                <p className={`text-sm line-clamp-2 mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{cat.desc}</p>
                <div className={`flex items-center text-sm font-medium ${darkMode ? 'text-green-400 group-hover:text-green-300' : 'text-green-600 group-hover:text-green-750'}`}>
                  <Download className="w-4 h-4 mr-1.5" /> Export PDF
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Custom Report Builder */}
          <Card darkMode={darkMode} className="lg:col-span-1 h-fit">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-green-500" />
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Custom Report</h3>
            </div>
            <form onSubmit={handleGenerateReport} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Module</label>
                <select 
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none border ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-green-500' : 'bg-gray-50 border-gray-200 text-gray-700 focus:bg-white focus:border-green-500'
                  }`}
                >
                  <option value="Environmental">Environmental Focus</option>
                  <option value="Social">Social Focus</option>
                  <option value="Governance">Governance Focus</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Department Filter</label>
                <select 
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none border ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-green-500' : 'bg-gray-50 border-gray-200 text-gray-700 focus:bg-white focus:border-green-500'
                  }`}
                >
                  <option value="All">All Departments</option>
                  <option value="HQ">Headquarters</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="HR">Human Resources</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PDF', 'CSV', 'XLSX'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSelectedFormat(fmt)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        selectedFormat === fmt 
                          ? (darkMode ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-green-55 border-green-200 text-green-700') 
                          : (darkMode ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')
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
                className="w-full mt-2 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
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
          <Card darkMode={darkMode} className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Generated Reports</h3>
            </div>
            <div className="overflow-x-auto">
              <table className={`w-full text-sm text-left ${darkMode ? 'text-slate-300' : 'text-gray-650'}`}>
                <thead className={`text-xs uppercase border-b ${darkMode ? 'text-slate-400 bg-slate-700 border-slate-600' : 'text-gray-500 bg-gray-50 border-gray-200'}`}>
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
                      <tr key={i} className={`border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                        <td colSpan={5} className="px-4 py-3"><div className="h-6 bg-slate-100 rounded animate-pulse" /></td>
                      </tr>
                    ))
                  ) : history.map(item => (
                    <tr key={item.id} className={`border-b transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50/50'}`}>
                      <td className="px-4 py-3">
                        <div className={`font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{item.module} Audit Segment</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          <Calendar className={`w-3.5 h-3.5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                          {item.generatedAt.split('T')[0]}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={item.status === 'COMPLETED' ? 'success' : 'warning'} darkMode={darkMode}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border ${
                          darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-gray-55 border-gray-200 text-gray-650'
                        }`}>
                          {item.format}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleDownload(item.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            darkMode ? 'text-green-400 hover:bg-slate-700' : 'text-green-600 hover:bg-green-50'
                          }`}
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
