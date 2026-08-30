import React from 'react';
import {
  Check,
  X,
  Flame,
  Trophy,
  Calendar,
  Clock,
  Target,
  ArrowUpRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, AppSettings, AttendanceMetrics } from '../types';
import {
  getTodayDateStr,
  formatDisplayDate,
  isWorkingDay,
  isHoliday,
  formatDateStr
} from '../services/calculations';
import { StreakBadge } from '../components/StreakBadge';

interface DashboardProps {
  records: Record<string, AttendanceRecord>;
  settings: AppSettings;
  metrics: AttendanceMetrics;
  onMarkAttendance: (status: AttendanceStatus) => void;
  onOpenDateModal: (dateStr: string) => void;
  onNavigateTab: (tab: 'calendar' | 'history' | 'stats' | 'settings') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  records,
  settings,
  metrics,
  onMarkAttendance,
  onOpenDateModal,
  onNavigateTab
}) => {
  const todayStr = getTodayDateStr();
  const todayRecord = records[todayStr];
  const formattedDate = formatDisplayDate(todayStr, { showDay: true });
  const isWork = isWorkingDay(todayStr, settings);
  const holidayInfo = isHoliday(todayStr, settings.holidays);

  // 7-day recent strip calculation
  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = formatDateStr(d);
    const rec = records[dStr];
    const isWk = isWorkingDay(dStr, settings);
    const hol = isHoliday(dStr, settings.holidays);
    return {
      dateStr: dStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayNum: d.getDate(),
      isToday: dStr === todayStr,
      record: rec,
      isWork: isWk,
      isHoliday: hol.isHol
    };
  });

  return (
    <div className="space-y-6">
      {/* Greeting & Date Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-indigo-700/40 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
            {holidayInfo.isHol && (
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-[10px]">
                🎉 {holidayInfo.name}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Hello, {settings.userName || 'there'} 👋
          </h1>
          <p className="text-xs text-indigo-200/80 max-w-md">
            {todayRecord
              ? `You've recorded today's attendance as ${todayRecord.status.toUpperCase()}.`
              : isWork
              ? "Don't forget to log your attendance for today's work schedule."
              : 'Today is a configured non-working day or holiday.'}
          </p>
        </div>

        {/* Badges in Hero: Month % & Streak Badge */}
        <div className="flex items-center gap-2.5 relative z-10 self-start sm:self-auto flex-wrap">
          <StreakBadge
            compact
            currentStreak={metrics.currentStreak}
            bestStreak={metrics.bestStreak}
          />

          {/* Current Month % Pill in Hero */}
          <div className="shrink-0 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200 block">
                This Month
              </span>
              <span className="text-base sm:text-lg font-black text-white font-mono">
                {metrics.attendancePercentage}%
              </span>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${
                metrics.isTargetAchieved ? 'bg-emerald-400 ring-4 ring-emerald-400/20' : 'bg-amber-400 ring-4 ring-amber-400/20'
              }`}
            />
          </div>
        </div>
      </div>

      {/* QUICK ATTENDANCE ACTION CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
              Quick Action
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Mark Today's Attendance
            </h2>
          </div>

          {todayRecord && (
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 ${
                  todayRecord.status === 'present'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : todayRecord.status === 'absent'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {todayRecord.status === 'present' ? (
                  <Check className="w-3.5 h-3.5" />
                ) : todayRecord.status === 'absent' ? (
                  <X className="w-3.5 h-3.5" />
                ) : (
                  <span>🏖</span>
                )}
                {todayRecord.status.toUpperCase()}
              </span>
              <button
                onClick={() => onOpenDateModal(todayStr)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                title="Edit note or details"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* 3 LARGE ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Present Button */}
          <button
            onClick={() => onMarkAttendance('present')}
            className={`py-4 px-5 rounded-2xl border flex items-center justify-center sm:flex-col gap-2.5 transition-all text-sm font-bold active:scale-[0.98] ${
              todayRecord?.status === 'present'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/25 ring-2 ring-emerald-600/50'
                : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:border-emerald-300'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                todayRecord?.status === 'present'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-200/80 dark:bg-emerald-800/80 text-emerald-900 dark:text-emerald-100'
              }`}
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="text-left sm:text-center">
              <span>Present</span>
              <span className="block text-[11px] font-normal opacity-80">Full Day Work</span>
            </div>
          </button>

          {/* Absent Button */}
          <button
            onClick={() => onMarkAttendance('absent')}
            className={`py-4 px-5 rounded-2xl border flex items-center justify-center sm:flex-col gap-2.5 transition-all text-sm font-bold active:scale-[0.98] ${
              todayRecord?.status === 'absent'
                ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/25 ring-2 ring-rose-600/50'
                : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:border-rose-300'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                todayRecord?.status === 'absent'
                  ? 'bg-white/20 text-white'
                  : 'bg-rose-200/80 dark:bg-rose-800/80 text-rose-900 dark:text-rose-100'
              }`}
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="text-left sm:text-center">
              <span>Absent</span>
              <span className="block text-[11px] font-normal opacity-80">Missed Day</span>
            </div>
          </button>

          {/* Leave Button */}
          <button
            onClick={() => onMarkAttendance('leave')}
            className={`py-4 px-5 rounded-2xl border flex items-center justify-center sm:flex-col gap-2.5 transition-all text-sm font-bold active:scale-[0.98] ${
              todayRecord?.status === 'leave'
                ? 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-600/25 ring-2 ring-amber-600/50'
                : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:border-amber-300'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base ${
                todayRecord?.status === 'leave'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-200/80 dark:bg-amber-800/80 text-amber-900 dark:text-amber-100'
              }`}
            >
              🏖
            </div>
            <div className="text-left sm:text-center">
              <span>Leave</span>
              <span className="block text-[11px] font-normal opacity-80">Approved Time Off</span>
            </div>
          </button>
        </div>

        {todayRecord?.note && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="truncate">Note: {todayRecord.note}</span>
            <button
              onClick={() => onOpenDateModal(todayStr)}
              className="text-indigo-600 dark:text-indigo-400 font-semibold shrink-0 ml-2"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* DASHBOARD STATISTICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Working Days */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Working Days</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {metrics.totalWorkingDays}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Through today
            </span>
          </div>
        </div>

        {/* Present Days */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Present Days</span>
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
              ✓
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {metrics.presentCount}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Logged as attended
            </span>
          </div>
        </div>

        {/* Absent Days */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Absent Days</span>
            <div className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center text-[10px] font-bold">
              ✕
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              {metrics.absentCount}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Unattended
            </span>
          </div>
        </div>

        {/* Leave Days */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Leave Days</span>
            <span className="text-xs">🏖</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {metrics.leaveCount}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Time off recorded
            </span>
          </div>
        </div>
      </div>

      {/* STREAK & TARGET FORECAST BENTO ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Attendance Percentage Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-500" />
              Monthly Goal
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">
              Goal: {settings.targetPercentage}%
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {metrics.attendancePercentage}%
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  metrics.isTargetAchieved
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {metrics.isTargetAchieved ? 'Target Met ✓' : 'In Progress'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  metrics.isTargetAchieved ? 'bg-emerald-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(metrics.attendancePercentage, 100)}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {metrics.isTargetAchieved
                ? `Great job! You have ${metrics.canMissDays} safe buffer day(s) while maintaining your ${settings.targetPercentage}% goal.`
                : `Need ${metrics.neededDays} more consecutive present day(s) to reach your ${settings.targetPercentage}% goal.`}
            </p>
          </div>
        </div>

        {/* Prominent Streak Badge Card */}
        <StreakBadge
          currentStreak={metrics.currentStreak}
          bestStreak={metrics.bestStreak}
        />

        {/* 7-Day Recent Strip */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Recent 7 Days
            </span>
            <button
              onClick={() => onNavigateTab('calendar')}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline"
            >
              Full Calendar <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 py-1">
            {recentDays.map((d) => {
              const status = d.record?.status;
              const bgColor =
                status === 'present'
                  ? 'bg-emerald-500 text-white'
                  : status === 'absent'
                  ? 'bg-rose-500 text-white'
                  : status === 'leave'
                  ? 'bg-amber-500 text-white'
                  : d.isHoliday
                  ? 'bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-300'
                  : d.isWork
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  : 'bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-800';

              return (
                <button
                  key={d.dateStr}
                  onClick={() => onOpenDateModal(d.dateStr)}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all hover:scale-105 ${
                    d.isToday ? 'ring-2 ring-indigo-600' : ''
                  } ${bgColor}`}
                  title={`${d.dateStr} (${status || 'No record'})`}
                >
                  <span className="text-[9px] uppercase font-bold opacity-80">{d.dayName}</span>
                  <span className="text-xs font-black font-mono">{d.dayNum}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Present</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Absent</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Leave</span>
          </div>
        </div>
      </div>
    </div>
  );
};
