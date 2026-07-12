import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Building, Bell, Users, LayoutList,
  CheckCircle2, Plus, Trash2, Edit2, Info
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  initialGlobalSettings, initialDepartments, initialCategories, initialOrgInfo
} from '../data/mockSettingsData';
import type { Department, MasterCategory, GlobalSettings, OrganizationInfo } from '../types/settings';

// Reusable Components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 ${className}`}>
    {children}
  </div>
);

const Toggle = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => (
  <button 
    type="button" 
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
  >
    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

export const Settings = ({ activePage, onPageChange }: { activePage?: string, onPageChange?: (page: string) => void }) => {
  // State
  const [settings, setSettings] = useState<GlobalSettings>(initialGlobalSettings);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [categories, setCategories] = useState<MasterCategory[]>(initialCategories);
  const [orgInfo] = useState<OrganizationInfo>(initialOrgInfo);
  
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'info'} | null>(null);

  // Forms State
  const [newDeptName, setNewDeptName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'Environmental' | 'Social' | 'Governance'>('Environmental');

  const showNotification = (msg: string, type: 'success' | 'info' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggle = (key: keyof GlobalSettings) => {
    setSettings(prev => {
      const newState = !prev[key];
      showNotification(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${newState ? 'Enabled' : 'Disabled'}`);
      return { ...prev, [key]: newState };
    });
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName) return;
    
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name: newDeptName,
      head: 'Unassigned',
      employeeCount: 0
    };
    
    setDepartments([...departments, newDept]);
    setNewDeptName('');
    showNotification(`Department "${newDeptName}" added successfully.`);
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
    showNotification('Department removed.', 'info');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    
    const newCat: MasterCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName,
      type: newCatType,
      description: 'Custom category'
    };
    
    setCategories([...categories, newCat]);
    setNewCatName('');
    showNotification(`Category "${newCatName}" added successfully.`);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    showNotification('Category removed.', 'info');
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
                  <p className="text-sm font-semibold text-slate-900">{orgInfo.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Industry</label>
                  <p className="text-sm font-semibold text-slate-900">{orgInfo.industry}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Headquarters</label>
                  <p className="text-sm font-semibold text-slate-900">{orgInfo.headquarters}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Founded</label>
                  <p className="text-sm font-semibold text-slate-900">{orgInfo.foundedYear}</p>
                </div>
                <button className="w-full mt-2 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-6">
                <SettingsIcon className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-semibold text-slate-900">ESG Configuration</h3>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">Auto Emission Calc</h4>
                    <p className="text-xs text-slate-500">Automatically calculate tCO2e.</p>
                  </div>
                  <Toggle enabled={settings.autoEmissionCalc} onChange={() => handleToggle('autoEmissionCalc')} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">CSR Evidence Required</h4>
                    <p className="text-xs text-slate-500">Require proof for social points.</p>
                  </div>
                  <Toggle enabled={settings.requireCSREvidence} onChange={() => handleToggle('requireCSREvidence')} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">Auto Badge Award</h4>
                    <p className="text-xs text-slate-500">System assigns gamification badges.</p>
                  </div>
                  <Toggle enabled={settings.autoBadgeAward} onChange={() => handleToggle('autoBadgeAward')} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">System Alerts</h4>
                    <p className="text-xs text-slate-500">Important governance alerts.</p>
                  </div>
                  <Toggle enabled={settings.notificationAlerts} onChange={() => handleToggle('notificationAlerts')} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">Weekly Reports</h4>
                    <p className="text-xs text-slate-500">Receive automated ESG digests.</p>
                  </div>
                  <Toggle enabled={settings.weeklyReports} onChange={() => handleToggle('weeklyReports')} />
                </div>
              </div>
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
              
              <form onSubmit={handleAddDepartment} className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  placeholder="New department name..." 
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>

              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Department Name</th>
                      <th className="px-4 py-3 font-medium">Head</th>
                      <th className="px-4 py-3 font-medium">Employees</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(dept => (
                      <tr key={dept.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">{dept.name}</td>
                        <td className="px-4 py-3">{dept.head}</td>
                        <td className="px-4 py-3">{dept.employeeCount}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteDepartment(dept.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {departments.length === 0 && (
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
              
              <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2 mb-4">
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="New category name..." 
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
                <select 
                  value={newCatType}
                  onChange={e => setNewCatType(e.target.value as any)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="Environmental">Environmental</option>
                  <option value="Social">Social</option>
                  <option value="Governance">Governance</option>
                </select>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>

              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Category Name</th>
                      <th className="px-4 py-3 font-medium">ESG Pillar</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => (
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
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
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
