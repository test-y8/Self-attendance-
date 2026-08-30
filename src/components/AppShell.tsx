import React from 'react';
import {
  Home,
  Calendar,
  History,
  BarChart3,
  Sparkles,
  User,
  CheckCircle2,
  Moon,
  Sun,
  X
} from 'lucide-react';
import { NavigationTab, ToastNotification, UserProfile } from '../types';

interface AppShellProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  userProfile: UserProfile;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  toasts: ToastNotification[];
  onDismissToast: (id: number) => void;
  hasWorkspaceAuth: boolean;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onSelectTab,
  userProfile,
  darkMode,
  onToggleDarkMode,
  toasts,
  onDismissToast,
  hasWorkspaceAuth,
  children
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Today', icon: Home },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'history', label: 'History', icon: History },
    { id: 'reports', label: 'Analytics', icon: BarChart3 },
    { id: 'workspace', label: 'Google Sync', icon: Sparkles },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Toast Notifications Floater */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-200 ${
              toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : toast.type === 'warning'
                ? 'bg-amber-500 text-white border-amber-600'
                : toast.type === 'info'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-700'
                : 'bg-emerald-600 text-white border-emerald-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => onDismissToast(toast.id)}
              className="p-1 rounded hover:bg-black/20 text-white/80 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 h-screen shrink-0 p-4 justify-between z-20">
        <div className="space-y-6">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Self Attendance
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Personal Tracker
              </p>
            </div>
          </div>

          {/* Nav list */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.id === 'workspace' && hasWorkspaceAuth && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Settings */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between px-2">
            <button
              onClick={onToggleDarkMode}
              className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          <div
            onClick={() => onSelectTab('profile')}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
              {userProfile.name.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {userProfile.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {userProfile.role}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (fixed bottom on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="grid grid-cols-6 h-16 items-center px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center h-full gap-1 transition-all relative ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-semibold tracking-tight ${isActive ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
                {item.id === 'workspace' && hasWorkspaceAuth && (
                  <div className="absolute top-2 right-4 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
