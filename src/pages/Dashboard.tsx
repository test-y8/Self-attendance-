import React, { useMemo } from 'react';
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
  ChevronRight,
  Coffee
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, AppSettings, AttendanceMetrics } from '../types';
import {
  getTodayDateStr,
  formatDisplayDate,
  isWorkingDay,
  isHoliday,
  formatDateStr,
  ATTENDANCE_STATUS_OPTIONS,
  getAttendanceStatusMeta
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
  const todayMeta = todayRecord ? getAttendanceStatusMeta(todayRecord.status) : null;
  const formattedDate = formatDisplayDate(todayStr, { showDay: true });
  const isWork = isWorkingDay(todayStr, settings);
  const holidayInfo = isHoliday(todayStr, settings.holidays);

  // 7-day recent strip calculation (memoized)
  const recentDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dStr = formatDateStr(d);
      const rec = records[dStr];
      const isWk = isWorkingDay(dStr, settings);
      const hol = isHoliday(dStr, settings.holidays);
      const meta = rec ? getAttendanceStatusMeta(rec.status) : null;
      return {
        dateStr: dStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dayNum: d.getDate(),
        isToday: dStr === todayStr,
        record: rec,
        meta,
        isWork: isWk,
        isHoliday: hol.isHol
      };
    });
  }, [records, settings, todayStr]);

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
            {todayRecord && todayMeta
              ? `Today's attendance recorded as: ${todayMeta.fullLabel} (${todayMeta.shortCode}) — Value: ${todayMeta.value}.`
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

      {/* QUICK ATTENDANCE ACTION CARD WITH ALL 6 STATUS OPTIONS */}
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

          {todayRecord && todayMeta && (
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 ${todayMeta.badgeBg} ${todayMeta.textColor} ${todayMeta.borderColor} border`}
              >
                <span className="font-mono">{todayMeta.shortCode}</span>
                <span>{todayMeta.label}</span>
                <span className="text-[10px] opacity-80">(Val: {todayMeta.value})</span>
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

        {/* 6 QUICK ACTION BUTTONS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {ATTENDANCE_STATUS_OPTIONS.map((opt) => {
            const isSelected = todayMeta?.canonicalKey === opt.canonicalKey;

            return (
              <button
                key={opt.canonicalKey}
                onClick={() => onMarkAttendance(opt.canonicalKey)}
                className={`py-3.5 px-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold active:scale-[0.98] ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-2 ring-indigo-600/50'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`font-mono text-xs font-black px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                    }`}
                  >
                    {opt.shortCode}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {opt.value}
                  </span>
                </div>
                <div className="w-full text-center">
                  <div className="font-bold text-xs truncate leading-tight">
                    {opt.label}
                  </div>
                  <div
                    className={`text-[10px] truncate leading-tight mt-0.5 ${
                      isSelected ? 'text-indigo-100' : 'text-slate-400'
                    }`}
                  >
                    {opt.description}
                  </div>
                </div>
              </button>
            );
          })}
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

      {/* DASHBOARD STATISTICS SUMMARY GRID (Including all 6 statuses and Total Attendance Value) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Monthly Attendance Metrics
          </h3>
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
            Total Value: {metrics.totalAttendanceValue} / {metrics.totalWorkingDays}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {/* Present (P) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              <span>Present (P)</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">val: 1</span>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {metrics.presentCount}
              </div>
              <span className="text-[10px] text-slate-400 block">Full days</span>
            </div>
          </div>

          {/* Half Day (1/2) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              <span>Half Day (1/2)</span>
              <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400">val: 0.5</span>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 font-mono">
                {metrics.halfDayCount || 0}
              </div>
              <span className="text-[10px] text-slate-400 block">0.5 day each</span>
            </div>
          </div>

          {/* 1.5 Day (P1/2) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              <span>1.5 Day (P1/2)</span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">val: 1.5</span>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                {metrics.oneAndHalfDayCount || 0}
              </div>
              <span className="text-[10px] text-slate-400 block">1.5 day each</span>
            </div>
          </div>

          {/* Double Hajri (PP) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              <span>Double Hajri (PP)</span>
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">val: 2</span>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                {metrics.doubleShiftCount || 0}
              </div>
              <span className="text-[10px] text-slate-400 block">2.0 day each</span>
            </div>
          </div>

          {/* Absent (A) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              <span>Absent (A)</span>
              <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400">val: 0</span>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {metrics.absentCount}
              </div>
              <span className="text-[10px] text-slate-400 block">Unattended</span>
            </div>
          </div>

          {/* Leave (L) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              <span>Leave (L)</span>
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">val: 0</span>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {metrics.leaveCount}
              </div>
              <span className="text-[10px] text-slate-400 block">Approved leave</span>
            </div>
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
              const meta = d.meta;
              let bgColor = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
              let badgeText = d.dayName;

              if (meta) {
                bgColor = `${meta.badgeBg} ${meta.textColor} ${meta.borderColor} border font-bold`;
                badgeText = meta.shortCode;
              } else if (d.isHoliday) {
                bgColor = 'bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-300';
              } else if (!d.isWork) {
                bgColor = 'bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-800';
              }

              return (
                <button
                  key={d.dateStr}
                  onClick={() => onOpenDateModal(d.dateStr)}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all hover:scale-105 ${
                    d.isToday ? 'ring-2 ring-indigo-600' : ''
                  } ${bgColor}`}
                  title={`${d.dateStr} (${meta?.label || 'No record'})`}
                >
                  <span className="text-[9px] uppercase font-bold opacity-80">{badgeText}</span>
                  <span className="text-xs font-black font-mono">{d.dayNum}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 flex-wrap gap-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> P (1)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500 inline-block" /> 1/2</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> PP (2)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> A (0)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> L (0)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
