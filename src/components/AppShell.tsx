import React from 'react';
import {
  Home,
  Calendar as CalendarIcon,
  Clock,
  BarChart3,
  Settings as SettingsIcon,
  ShieldCheck
} from 'lucide-react';
import { NavigationTab } from '../types';

interface AppShellProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onSelectTab,
  children
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }>; shortcut: string }[] = [
    { id: 'home', label: 'Home', icon: Home, shortcut: '1' },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, shortcut: '2' },
    { id: 'history', label: 'History', icon: Clock, shortcut: '3' },
    { id: 'stats', label: 'Stats', icon: BarChart3, shortcut: '4' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, shortcut: '5' }
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col md:flex-row pb-20 md:pb-0 transition-colors">
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-[#0F172A] p-4 space-y-6 shrink-0 sticky top-0 h-screen">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-base shadow-lg shadow-purple-600/30">
            ✓
          </div>
          <div>
            <span className="text-base font-extrabold text-white tracking-tight block">
              Self Attendance
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              Local-First Tracker
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:bg-[#161F37] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <kbd
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-purple-700/60 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.shortcut}
                </kbd>
              </button>
            );
          })}
        </nav>

        {/* Footer info in desktop sidebar */}
        <div className="p-3.5 rounded-2xl bg-[#161F37] border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Offline & Private
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Data resides strictly in your browser storage.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`min-h-[44px] min-w-[44px] flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-2xl transition-all ${
                isActive
                  ? 'text-purple-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
