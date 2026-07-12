import React, { useState } from 'react';
import { 
  Bell, Search, LayoutDashboard, Settings, 
  Leaf, Users, Shield, Award, BarChart3, ChevronLeft, ChevronRight, Moon, Sun, Menu, X
} from 'lucide-react';

export const DashboardLayout: React.FC<{ 
  children: React.ReactNode, 
  activePage?: string, 
  onPageChange?: (page: string) => void,
  darkMode?: boolean,
  setDarkMode?: (mode: boolean) => void
}> = ({ 
  children, 
  activePage = 'Dashboard', 
  onPageChange, 
  darkMode = false, 
  setDarkMode 
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className={`min-h-screen flex font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 flex flex-col
        ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}
        border-r
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarOpen ? 'w-64' : 'w-20'}
      `}>
        <div className={`h-16 flex items-center justify-between px-4 border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && <span className="font-bold text-lg tracking-tight">EcoSphere</span>}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setDarkMode && setDarkMode(!darkMode)}
              className={`p-1.5 rounded-md transition-colors ${
                darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className={`p-1.5 rounded-md text-slate-400 transition-colors hidden lg:block ${
                darkMode ? 'hover:text-slate-200 hover:bg-slate-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item, i) => (
            <button 
              key={i} 
              onClick={() => {
                onPageChange && onPageChange(item.label);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activePage === item.label 
                  ? (darkMode ? 'bg-slate-700 text-green-400 font-medium' : 'bg-green-50 text-green-700 font-medium') 
                  : (darkMode ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${
                activePage === item.label 
                  ? 'text-green-500' 
                  : (darkMode ? 'text-slate-500' : 'text-gray-400')
              }`} />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className={`h-16 border-b sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 transition-colors duration-300 ${
          darkMode ? 'bg-slate-800/80 backdrop-blur-md border-slate-700' : 'bg-white/80 backdrop-blur-md border-gray-200'
        }`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className={`p-2 rounded-md lg:hidden ${
                darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              <span 
                className={`cursor-pointer transition-colors ${darkMode ? 'hover:text-slate-200' : 'hover:text-gray-800'}`} 
                onClick={() => onPageChange && onPageChange('Dashboard')}
              >
                EcoSphere
              </span>
              <span className="mx-2">/</span>
              <span className={`font-medium ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>{activePage}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className={`pl-9 pr-4 py-2 rounded-full text-sm focus:ring-2 transition-all outline-none w-48 lg:w-64 ${
                  darkMode 
                    ? 'bg-slate-700 border-transparent text-slate-200 focus:bg-slate-600 focus:ring-green-500/50' 
                    : 'bg-gray-100 border-transparent text-gray-900 focus:bg-white focus:ring-green-200 focus:border-green-500'
                }`}
              />
            </div>
            <button 
              onClick={() => onPageChange && onPageChange('Notifications')}
              className={`p-2 relative rounded-full transition-colors ${
                darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-500 hover:bg-gray-100'
              }`} 
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <button 
              onClick={() => onPageChange && onPageChange('Profile')}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm cursor-pointer transition-colors ${
                darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
            >
              JD
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
