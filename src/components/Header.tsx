import React from 'react';
import { Calendar, Moon, Sun, Laptop, Keyboard, ShieldCheck } from 'lucide-react';
import { formatDisplayDate, getTodayDateStr } from '../services/calculations';
import { AttendanceRecord, AppSettings } from '../types';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  settings: AppSettings;
  todayRecord?: AttendanceRecord;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  settings,
  todayRecord,
  onOpenShortcuts
}) => {
  const todayStr = getTodayDateStr();
  const formattedToday = formatDisplayDate(todayStr, { showDay: true });

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand title & Date */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-600/30">
            ✓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Self Attendance
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" />
                Local-First
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {formattedToday}
            </p>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2">
          {/* Today's status pill */}
          {todayRecord && (
            <div
              className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold ${
                todayRecord.status === 'present'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : todayRecord.status === 'absent'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Today: {todayRecord.status.toUpperCase()}
            </div>
          )}

          {/* Shortcuts button */}
          <button
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts (?)"
            className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
