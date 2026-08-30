import React from 'react';
import { CheckCircle2, Moon, Sun, Calendar, Sparkles, Keyboard } from 'lucide-react';
import { getTodayDateStr, formatDisplayDate } from '../utils/attendance';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  userName: string;
  hasWorkspaceAuth: boolean;
  onOpenWorkspace: () => void;
  onOpenShortcuts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  userName,
  hasWorkspaceAuth,
  onOpenWorkspace,
  onOpenShortcuts
}) => {
  const todayStr = getTodayDateStr();
  const formattedToday = formatDisplayDate(todayStr);

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Self Attendance
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Personal Tracker
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Track your daily attendance with ease.
            </p>
          </div>
        </div>

        {/* Action badges & controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Today badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>{formattedToday}</span>
          </div>

          {/* Google Workspace status indicator */}
          <button
            onClick={onOpenWorkspace}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              hasWorkspaceAuth
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800 hover:bg-indigo-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-200'
            }`}
            title="Google Calendar & Forms Integration"
          >
            <Sparkles className={`w-3.5 h-3.5 ${hasWorkspaceAuth ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
            <span className="hidden xs:inline">
              {hasWorkspaceAuth ? 'Google Connected' : 'Google Sync'}
            </span>
          </button>

          {/* Keyboard shortcuts modal button */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              aria-label="Keyboard Shortcuts"
              title="Keyboard Shortcuts (?)"
              className="hidden sm:flex w-9 h-9 rounded-lg items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label="Toggle dark mode"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
