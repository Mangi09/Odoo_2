import React, { useState } from 'react';
import { 
  Bell, Search, LayoutDashboard, Settings, 
  Leaf, Users, Shield, Award, BarChart3, ChevronLeft, ChevronRight
} from 'lucide-react';

export const DashboardLayout: React.FC<{ children: React.ReactNode, activePage?: string, onPageChange?: (page: string) => void }> = ({ children, activePage = 'Dashboard', onPageChange }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: Leaf, label: 'Environmental' },
    { icon: Users, label: 'Social' },
    { icon: Award, label: 'Gamification' },
    { icon: Shield, label: 'Governance' },
    { icon: BarChart3, label: 'Reports' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && <span className="font-bold text-lg tracking-tight">EcoSphere</span>}
          </div>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item, i) => (
            <button 
              key={i} 
              onClick={() => onPageChange && onPageChange(item.label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activePage === item.label ? 'bg-green-50 text-green-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}>
              <item.icon className={`w-5 h-5 shrink-0 ${activePage === item.label ? 'text-green-600' : 'text-slate-400'}`} />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="hover:text-slate-800 cursor-pointer transition-colors" onClick={() => onPageChange && onPageChange('Dashboard')}>EcoSphere</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">{activePage}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none w-64"
              />
            </div>
            <button className="p-2 relative text-slate-500 hover:bg-slate-100 rounded-full transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <button 
              onClick={() => onPageChange && onPageChange('Profile')}
              className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-medium text-sm cursor-pointer ml-2 hover:bg-slate-700 transition-colors"
            >
              JD
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
