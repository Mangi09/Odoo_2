import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Building, Users, LayoutList,
  CheckCircle2, Plus, Trash2, Info, RefreshCw
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { settings as settingsApi } from '../lib/api';

const Card = ({ children, className = '', darkMode = false }: { children: React.ReactNode; className?: string; darkMode?: boolean }) => (
  <div className={`${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-green-100'} rounded-2xl shadow-sm border p-6 ${className}`}>
    {children}
  </div>
);

const Toggle = ({ enabled, onChange, darkMode = false }: { enabled: boolean, onChange: () => void, darkMode?: boolean }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-205 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 ${
      darkMode 
        ? (enabled ? 'bg-green-600 focus:ring-offset-slate-900' : 'bg-slate-600 focus:ring-offset-slate-900') 
        : (enabled ? 'bg-green-600' : 'bg-gray-200')
    }`}
  >
    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-205 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

interface Department { id: string; name: string; manager?: string; employeeCount?: number; }
interface MasterCategory { id: string; name: string; type: string; description?: string; }
interface OrgInfo { name: string; industry: string; employees: number; activeProjects: number; }
interface ConfigSettings { allowEmployeeSelfLogs: boolean; autoApproveThreshold: number; enableNotifications: boolean; enablePointLedger: boolean; }

export const Settings = ({ activePage, onPageChange, darkMode, setDarkMode }: {
  activePage?: string;
  onPageChange?: (page: string) => void;
  darkMode?: boolean;
  setDarkMode?: (mode: boolean) => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [orgInfo] = useState<OrgInfo | null>({ name: 'EcoSphere Ltd', industry: 'CleanTech / Sustainability', employees: 145, activeProjects: 12 });
  const [config, setConfig] = useState<ConfigSettings>({
    allowEmployeeSelfLogs: true,
    autoApproveThreshold: 500,
    enableNotifications: true,
    enablePointLedger: true
  });

  const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'info' | 'error' } | null>(null);

  // Forms State
  const [newDeptName, setNewDeptName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'Environmental' | 'Social' | 'Governance'>('Environmental');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showNotification = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [depts, cats, conf] = await Promise.all([
        settingsApi.departments(),
        settingsApi.categories(),
        settingsApi.config()
      ]);
      setDepartments(depts as Department[]);
      setCategories(cats as MasterCategory[]);
      if (conf) {
        setConfig(conf as unknown as ConfigSettings);
      }
    } catch (err) {
      console.error(err);
      showNotification('Failed to load settings data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateConfig = async (updated: Partial<ConfigSettings>) => {
    const nextConfig = { ...config, ...updated };
    setConfig(nextConfig);
    try {
      await settingsApi.updateConfig(updated);
      showNotification('Configuration saved successfully.');
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(e.message || 'Failed to save configuration', 'error');
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    setIsSubmitting(true);
    try {
      await settingsApi.createDepartment({ name: newDeptName });
      setNewDeptName('');
      showNotification(`Department "${newDeptName}" added successfully.`);
      await loadData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(e.message || 'Failed to add department', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      await settingsApi.deleteDepartment(id);
      showNotification('Department removed.', 'info');
      await loadData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(e.message || 'Failed to delete department', 'error');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsSubmitting(true);
    try {
      await settingsApi.createCategory({ name: newCatName, type: newCatType });
      setNewCatName('');
      showNotification(`Category "${newCatName}" added successfully.`);
      await loadData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(e.message || 'Failed to add category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await settingsApi.deleteCategory(id);
      showNotification('Category removed.', 'info');
      await loadData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(e.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <DashboardLayout activePage={activePage} onPageChange={onPageChange} darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-7xl mx-auto space-y-6 relative">
        
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-20 right-8 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'error' ? 'bg-red-650' : (darkMode ? 'bg-slate-700 text-slate-100' : 'bg-gray-800 text-white')
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <Info className="w-5 h-5 text-teal-400" />
            )}
            <p className="text-sm font-medium">{notification.msg}</p>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Organization Settings</h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Configure EcoSphere parameters, manage master data, and update organization profiles.</p>
          </div>
          <button onClick={() => loadData()} className={`p-2.5 rounded-xl shadow-sm transition-all ${
            darkMode ? 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
          }`} title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Left Column: Config & Info */}
          <div className="lg:col-span-1 space-y-6">
            
            <Card darkMode={darkMode}>
              <div className="flex items-center gap-2 mb-6">
                <Building className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Organization Info</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Company Name</label>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{loading ? '–' : orgInfo?.name}</p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Industry</label>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{loading ? '–' : orgInfo?.industry}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Employees</label>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{loading ? '–' : orgInfo?.employees}</p>
                  </div>
                  <div>
                    <label className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Active Projects</label>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{loading ? '–' : orgInfo?.activeProjects}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card darkMode={darkMode}>
              <div className="flex items-center gap-2 mb-6">
                <SettingsIcon className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Global Configurations</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Self Logging</h4>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Allow employees to self-log CSR activities</p>
                  </div>
                  <Toggle 
                    enabled={config.allowEmployeeSelfLogs} 
                    onChange={() => handleUpdateConfig({ allowEmployeeSelfLogs: !config.allowEmployeeSelfLogs })} 
                    darkMode={darkMode} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Push Notifications</h4>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Enable automated browser push notices</p>
                  </div>
                  <Toggle 
                    enabled={config.enableNotifications} 
                    onChange={() => handleUpdateConfig({ enableNotifications: !config.enableNotifications })} 
                    darkMode={darkMode} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Real Points Ledger</h4>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Require strict transactional auditing</p>
                  </div>
                  <Toggle 
                    enabled={config.enablePointLedger} 
                    onChange={() => handleUpdateConfig({ enablePointLedger: !config.enablePointLedger })} 
                    darkMode={darkMode} 
                  />
                </div>
              </div>
            </Card>

          </div>

          {/* Right Column: Master Data Tables */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Departments */}
            <Card darkMode={darkMode}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Departments</h3>
                </div>
              </div>
              
              <form onSubmit={handleAddDepartment} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  required
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  placeholder="New department name..." 
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all outline-none border ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-green-500' : 'bg-gray-50 border-gray-200 text-gray-700 focus:bg-white focus:border-green-500'
                  }`}
                />
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>

              <div className="overflow-x-auto max-h-[250px]">
                <table className={`w-full text-sm text-left ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  <thead className={`text-xs uppercase border-b ${darkMode ? 'text-slate-400 bg-slate-700 border-slate-600' : 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                    <tr>
                      <th className="px-4 py-3 font-medium">Department</th>
                      <th className="px-4 py-3 font-medium">Head / Manager</th>
                      <th className="px-4 py-3 font-medium">Employees</th>
                      <th className="px-4 py-3 font-medium text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array(2).fill(0).map((_, i) => (
                        <tr key={i} className={`border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                          <td colSpan={4} className="px-4 py-3"><div className="h-6 bg-slate-100 rounded animate-pulse" /></td>
                        </tr>
                      ))
                    ) : departments.map(dept => (
                      <tr key={dept.id} className={`border-b transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50/50'}`}>
                        <td className="px-4 py-3 font-medium">{dept.name}</td>
                        <td className="px-4 py-3">{dept.manager || 'Unassigned'}</td>
                        <td className="px-4 py-3">{dept.employeeCount || 0}</td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => handleDeleteDepartment(dept.id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Master Categories */}
            <Card darkMode={darkMode}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <LayoutList className="w-5 h-5 text-green-500" />
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>Master Categories</h3>
                </div>
              </div>
              
              <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
                <input 
                  type="text" 
                  required
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="New category..." 
                  className={`px-3 py-2 rounded-lg text-sm transition-all outline-none border ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-green-500' : 'bg-gray-50 border-gray-200 text-gray-700 focus:bg-white focus:border-green-500'
                  }`}
                />
                <select
                  value={newCatType}
                  onChange={e => setNewCatType(e.target.value as any)}
                  className={`px-3 py-2 rounded-lg text-sm outline-none border ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <option value="Environmental">Environmental</option>
                  <option value="Social">Social</option>
                  <option value="Governance">Governance</option>
                </select>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </form>

              <div className="overflow-x-auto max-h-[250px]">
                <table className={`w-full text-sm text-left ${darkMode ? 'text-slate-300' : 'text-gray-650'}`}>
                  <thead className={`text-xs uppercase border-b ${darkMode ? 'text-slate-400 bg-slate-700 border-slate-600' : 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                    <tr>
                      <th className="px-4 py-3 font-medium">Category Name</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array(2).fill(0).map((_, i) => (
                        <tr key={i} className={`border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                          <td colSpan={3} className="px-4 py-3"><div className="h-6 bg-slate-100 rounded animate-pulse" /></td>
                        </tr>
                      ))
                    ) : categories.map(cat => (
                      <tr key={cat.id} className={`border-b transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50/50'}`}>
                        <td className="px-4 py-3 font-medium">{cat.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            cat.type === 'Environmental' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                            cat.type === 'Social' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                            'bg-yellow-100 text-yellow-750 dark:bg-yellow-550/20 dark:text-yellow-450'
                          }`}>
                            {cat.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
