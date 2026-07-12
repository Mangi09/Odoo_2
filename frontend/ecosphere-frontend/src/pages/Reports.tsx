import React, { useState } from 'react';
import {
  FileText, Leaf, Users, Shield, Download, Filter,
  CheckCircle2, FileDown, Plus, Search, Calendar, LayoutDashboard
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  initialReportsSummary, reportCategories, initialReportHistory
} from '../data/mockReportsData';
import type { ReportHistoryEntry, ReportCategory } from '../types/reports';

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

const IconWrapper = ({ name, className = '' }: { name: string, className?: string }) => {
  switch (name) {
    case 'Leaf': return <Leaf className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'FileText': return <FileText className={className} />;
    default: return <FileText className={className} />;
  }
};

export const Reports = ({ activePage, onPageChange, darkMode, setDarkMode }: {
  activePage?: string;
  onPageChange?: (page: string) => void;
  darkMode?: boolean;
  setDarkMode?: (mode: boolean) => void;
}) => {
  const [summary, setSummary] = useState(initialReportsSummary);
  const [history, setHistory] = useState<ReportHistoryEntry[]>(initialReportHistory);
  const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'info' } | null>(null);

  // Form State
  const [reportTitle, setReportTitle] = useState('');
  const [selectedModule, setSelectedModule] = useState('Summary');
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'CSV' | 'Excel'>('PDF');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  const showNotification = (msg: string, type: 'success' | 'info' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGenerateReport = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const title = reportTitle || `Custom ${selectedModule} Report`;

    const newReport: ReportHistoryEntry = {
      id: `rep-${Date.now()}`,
      title,
      type: selectedModule,
      department: selectedDepartment,
      dateGenerated: new Date().toISOString().split('T')[0],
      status: 'Ready',
      format: selectedFormat,
      size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`
    };

    setHistory([newReport, ...history]);
    setSummary(prev => ({ ...prev, reportsGenerated: prev.reportsGenerated + 1 }));
    setReportTitle(''); // reset

    showNotification(`Successfully generated and downloaded: ${title}`);
  };

  const handleQuickExport = (category: ReportCategory) => {
    const newReport: ReportHistoryEntry = {
      id: `rep-${Date.now()}`,
      title: `${category.title} Export`,
      type: category.type,
      department: 'All',
      dateGenerated: new Date().toISOString().split('T')[0],
      status: 'Ready',
      format: 'PDF',
      size: '1.2 MB'
    };

    setHistory([newReport, ...history]);
    setSummary(prev => ({ ...prev, reportsGenerated: prev.reportsGenerated + 1 }));
    showNotification(`Exported ${category.title} to PDF.`);
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
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-50 text-teal-600'
                }`}>
                <FileDown className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Reports Generated</h3>
              <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.reportsGenerated}</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                }`}>
                <LayoutDashboard className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Overall ESG Score</h3>
              <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.esgScore}/100</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
                }`}>
                <Leaf className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Carbon (tCO₂e)</h3>
              <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.carbonEmissions.toLocaleString()}</div>
            </div>
          </Card>

          <Card darkMode={darkMode} className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-50 text-teal-600'
                }`}>
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`font-medium text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Compliance Rate</h3>
              <div className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{summary.complianceRate}%</div>
            </div>
          </Card>
        </div>

        {/* Report Categories */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Quick Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportCategories.map(cat => (
              <div key={cat.id} className={`p-5 rounded-xl hover:shadow-md transition-all group cursor-pointer ${darkMode
                  ? 'bg-slate-800 border-slate-700 hover:border-green-500/50'
                  : 'bg-white border-green-100 hover:border-green-300'
                } border`} onClick={() => handleQuickExport(cat)}>
                <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${cat.type === 'Environmental' ? (darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600') :
                    cat.type === 'Social' ? (darkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-600') :
                      cat.type === 'Governance' ? (darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600') :
                        (darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600')
                  }`}>
                  <IconWrapper name={cat.icon} className="w-6 h-6" />
                </div>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{cat.title}</h4>
                <p className={`text-sm line-clamp-2 mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{cat.description}</p>
                <div className={`flex items-center text-sm font-medium ${darkMode ? 'text-green-400 group-hover:text-green-300' : 'text-green-600 group-hover:text-green-700'}`}>
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
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Report Title (Optional)</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. Q3 Carbon Output"
                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none ${darkMode
                      ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                      : 'bg-gray-50 border-gray-200 text-gray-700 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200'
                    } border`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Module</label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none ${darkMode
                      ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                      : 'bg-gray-50 border-gray-200 text-gray-700 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200'
                    } border`}
                >
                  <option value="Summary">ESG Summary (All)</option>
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
                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none ${darkMode
                      ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                      : 'bg-gray-50 border-gray-200 text-gray-700 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200'
                    } border`}
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
                  {['PDF', 'CSV', 'Excel'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSelectedFormat(fmt as 'PDF' | 'CSV' | 'Excel')}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${selectedFormat === fmt
                          ? (darkMode ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-green-50 border-green-200 text-green-700')
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
                className="w-full mt-2 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Generate Report
              </button>
            </form>
          </Card>

          {/* Report History */}
          <Card darkMode={darkMode} className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Generated Reports</h3>
              <div className="relative hidden sm:block">
                <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search history..."
                  className={`pl-9 pr-4 py-2 rounded-lg text-sm transition-all outline-none ${darkMode
                      ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                      : 'bg-gray-50 border-gray-200 text-gray-700 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200'
                    } border w-48`}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className={`w-full text-sm text-left ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                <thead className={`text-xs uppercase border-b ${darkMode ? 'text-slate-400 bg-slate-700 border-slate-600' : 'text-gray-500 bg-gray-50 border-gray-200'
                  }`}>
                  <tr>
                    <th className="px-4 py-3 font-medium">Report Name</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Format</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(item => (
                    <tr key={item.id} className={`border-b transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50/50'
                      }`}>
                      <td className="px-4 py-3">
                        <div className={`font-medium ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{item.title}</div>
                        <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{item.type} • {item.department}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1.5 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                          <Calendar className={`w-3.5 h-3.5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                          {item.dateGenerated}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={item.status === 'Ready' ? 'success' : item.status === 'Processing' ? 'warning' : 'error'} darkMode={darkMode}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border ${darkMode
                            ? 'bg-slate-700 border-slate-600 text-slate-300'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                          }`}>
                          {item.format}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => showNotification(`Downloading ${item.title}...`)}
                          className={`p-1.5 rounded-lg transition-colors ${darkMode
                              ? 'text-green-400 hover:bg-green-500/20'
                              : 'text-green-600 hover:bg-green-50'
                            }`}
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={5} className={`px-4 py-8 text-center ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
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
