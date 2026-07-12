import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Building, Users, LayoutList,
  CheckCircle2, Plus, Trash2, Info, RefreshCw
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { settings as settingsApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 ${className}`}>
    {children}
  </div>
);

const Toggle = ({ enabled, onChange, disabled }: { enabled: boolean, onChange: () => void, disabled?: boolean }) => (
  <button 
    type="button" 
    disabled={disabled}
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
  >
    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

interface Department { id: string; name: string; code: string; headName?: string | null; employeeCount: number; }
interface ESGConfig { auto_emission_enabled: boolean; evidence_required_for_csr: boolean; badge_auto_award_enabled: boolean; compliance_alerts_enabled: boolean; }
interface Category { id: string; name: string; type: string; }

export const Settings = ({ activePage, onPageChange }: { activePage?: string, onPageChange?: (page: string) => void }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [config, setConfig] = useState<ESGConfig | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'info'|'error'} | null>(null);

  // Forms State
  const [newDeptName, setNewDeptName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('Environmental');

  const showNotification = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [cfg, depts, cats] = await Promise.all([
        settingsApi.config(),
        settingsApi.departments(),
        settingsApi.categories()
      ]);
      setConfig(cfg as unknown as ESGConfig);
      setDepartments(depts as Department[]);
      setCategories(cats as Category[]);
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

  const handleUpdateConfig = async (key: keyof ESGConfig, val: boolean) => {
    if (!isAdmin) {
      showNotification('Only administrators can update ESG config', 'error');
      return;
    }
    try {
      const updated = await settingsApi.updateConfig({ [key]: val });
      setConfig(updated as unknown as ESGConfig);
      showNotification('Configuration updated successfully');
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(e.message || 'Failed to update config', 'error');
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    if (!isAdmin) {
      showNotification('Only administrators can manage departments', 'error');
      return;
    }
    try {
      await settingsApi.createDepartment({ name: newDeptName });
      setNewDeptName('');
      showNotification(`Department "${newDeptName}" added successfully.`);
      await loadData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(e.message || 'Failed to add department', 'error');
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!isAdmin) {
      showNotification('Only administrators can delete departments', 'error');
      return;
    }
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
    if (!isAdmin) {
      showNotification('Only administrators can manage ESG categories', 'error');
      return;
    }
    try {
      await settingsApi.createCategory({ name: newCatName, type: newCatType });
      setNewCatName('');
      showNotification(`Category "${newCatName}" added successfully.`);
      await loadData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      showNotification(e.message || 'Failed to add category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!isAdmin) {
      showNotification('Only administrators can delete categories', 'error');
      return;
    }
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
    <DashboardLayout activePage={activePage} onPageChange={onPageChange}>
      <div className="max-w-7xl mx-auto space-y-8 relative">
        
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-20 right-8 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : notification.type === 'error' ? (
              <Info className="w-5 h-5 text-red-400" />
            ) : (
              <Info className="w-5 h-5 text-blue-400" />
            )}
            <p className="text-sm font-medium">{notification.msg}</p>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Organization Settings</h1>
            <p className="text-slate-500 mt-1 text-sm">Configure EcoSphere parameters, manage master data, and update organization profiles.</p>
          </div>
          <button onClick={() => loadData()} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Config & Info */}
          <div className="lg:col-span-1 space-y-6">
            
            <Card>
              <div className="flex items-center gap-2 mb-6">
                <Building className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900">Organization Info</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500">Company Name</label>
                  <p className="text-sm font-semibold text-slate-900">{String(user?.orgName || 'EcoSphere ESG Enterprise')}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Current Role</label>
                  <p className="text-sm font-semibold text-slate-900">{String(user?.role || '')}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Email Address</label>
                  <p className="text-sm font-semibold text-slate-900">{String(user?.email || '')}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-6">
                <SettingsIcon className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-semibold text-slate-900">ESG Configuration</h3>
              </div>
              {loading ? (
                <div className="space-y-4">
                  <div className="h-6 bg-slate-100 rounded animate-pulse" />
                  <div className="h-6 bg-slate-100 rounded animate-pulse" />
                </div>
              ) : config && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900">Auto Emission Calc</h4>
                      <p className="text-xs text-slate-500">Automatically calculate carbon output.</p>
                    </div>
                    <Toggle 
                      enabled={config.auto_emission_enabled} 
                      onChange={() => handleUpdateConfig('auto_emission_enabled', !config.auto_emission_enabled)}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900">CSR Evidence Required</h4>
                      <p className="text-xs text-slate-500">Require proof URL for points credits.</p>
                    </div>
                    <Toggle 
                      enabled={config.evidence_required_for_csr} 
                      onChange={() => handleUpdateConfig('evidence_required_for_csr', !config.evidence_required_for_csr)}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900">Auto Badge Award</h4>
                      <p className="text-xs text-slate-500">System unlocks badges dynamically.</p>
                    </div>
                    <Toggle 
                      enabled={config.badge_auto_award_enabled} 
                      onChange={() => handleUpdateConfig('badge_auto_award_enabled', !config.badge_auto_award_enabled)}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900">Compliance Alerts</h4>
                      <p className="text-xs text-slate-500">Trigger warnings for flagged issues.</p>
                    </div>
                    <Toggle 
                      enabled={config.compliance_alerts_enabled} 
                      onChange={() => handleUpdateConfig('compliance_alerts_enabled', !config.compliance_alerts_enabled)}
                      disabled={!isAdmin}
                    />
                  </div>
                </div>
              )}
            </Card>

          </div>

          {/* Right Column: Master Data Tables */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Departments Management */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-slate-900">Departments</h3>
                </div>
              </div>
              
              {isAdmin && (
                <form onSubmit={handleAddDepartment} className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    value={newDeptName}
                    onChange={e => setNewDeptName(e.target.value)}
                    placeholder="New department name..." 
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                  />
                  <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </form>
              )}

              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Department Name</th>
                      <th className="px-4 py-3 font-medium">Code</th>
                      <th className="px-4 py-3 font-medium">Employees</th>
                      {isAdmin && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array(2).fill(0).map((_, i) => (
                        <tr key={i} className="border-b border-slate-50">
                          <td colSpan={4} className="px-4 py-3"><div className="h-6 bg-slate-100 rounded animate-pulse" /></td>
                        </tr>
                      ))
                    ) : departments.map(dept => (
                      <tr key={dept.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">{dept.name}</td>
                        <td className="px-4 py-3">{dept.code}</td>
                        <td className="px-4 py-3">{dept.employeeCount}</td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleDeleteDepartment(dept.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {!loading && departments.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-slate-500">No departments configured.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Categories Management */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <LayoutList className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-slate-900">ESG Categories</h3>
                </div>
              </div>
              
              {isAdmin && (
                <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2 mb-4">
                  <input 
                    type="text" 
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="New category name..." 
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                  />
                  <select 
                    value={newCatType}
                    onChange={e => setNewCatType(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                  >
                    <option value="Environmental">Environmental</option>
                    <option value="Social">Social</option>
                    <option value="Governance">Governance</option>
                  </select>
                  <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </form>
              )}

              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Category Name</th>
                      <th className="px-4 py-3 font-medium">ESG Pillar</th>
                      {isAdmin && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array(2).fill(0).map((_, i) => (
                        <tr key={i} className="border-b border-slate-50">
                          <td colSpan={3} className="px-4 py-3"><div className="h-6 bg-slate-100 rounded animate-pulse" /></td>
                        </tr>
                      ))
                    ) : categories.map(cat => (
                      <tr key={cat.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">{cat.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            cat.type === 'Environmental' ? 'bg-green-100 text-green-700' :
                            cat.type === 'Social' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {cat.type}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {!loading && categories.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-slate-500">No categories configured.</td>
                      </tr>
                    )}
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
