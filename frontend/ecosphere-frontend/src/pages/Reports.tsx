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

const IconWrapper = ({ name, className = '' }: { name: string, className?: string }) => {
  switch (name) {
    case 'Leaf': return <Leaf className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'FileText': return <FileText className={className} />;
    default: return <FileText className={className} />;
  }
};

export const Reports = ({ activePage, onPageChange }: { activePage?: string, onPageChange?: (page: string) => void }) => {
  const [summary, setSummary] = useState(initialReportsSummary);
  const [history, setHistory] = useState<ReportHistoryEntry[]>(initialReportHistory);
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'info'} | null>(null);

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
              <h3 className="text-slate-500 font-medium text-sm mb-1">Reports Generated</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.reportsGenerated}</div>
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
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.esgScore}/100</div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">Carbon (tCO₂e)</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.carbonEmissions.toLocaleString()}</div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-medium text-sm mb-1">Compliance Rate</h3>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{summary.complianceRate}%</div>
            </div>
          </Card>
        </div>

        {/* Report Categories */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportCategories.map(cat => (
              <div key={cat.id} className="p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer" onClick={() => handleQuickExport(cat)}>
                <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${
                  cat.type === 'Environmental' ? 'bg-green-100 text-green-600' :
                  cat.type === 'Social' ? 'bg-blue-100 text-blue-600' :
                  cat.type === 'Governance' ? 'bg-orange-100 text-orange-600' :
                  'bg-indigo-100 text-indigo-600'
                }`}>
                  <IconWrapper name={cat.icon} className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">{cat.title}</h4>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{cat.description}</p>
                <div className="flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
                  <Download className="w-4 h-4 mr-1.5" /> Export PDF
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Report Title (Optional)</label>
                <input 
                  type="text" 
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. Q3 Carbon Output" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Module</label>
                <select 
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                >
                  <option value="Summary">ESG Summary (All)</option>
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
                  {['PDF', 'CSV', 'Excel'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSelectedFormat(fmt as 'PDF' | 'CSV' | 'Excel')}
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
                className="w-full mt-2 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Generate Report
              </button>
            </form>
          </Card>

          {/* Report History */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Generated Reports</h3>
              <div className="relative hidden sm:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search history..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none w-48"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
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
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{item.title}</div>
                        <div className="text-xs text-slate-500">{item.type} • {item.department}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {item.dateGenerated}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={item.status === 'Ready' ? 'success' : item.status === 'Processing' ? 'warning' : 'error'}>
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
                          onClick={() => showNotification(`Downloading ${item.title}...`)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
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
