import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Flame,
  Trophy,
  Target,
  Clock,
  PieChart,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { AttendanceRecord, AppSettings } from '../types';
import {
  calculateAttendanceMetrics,
  getMonthlySummaryList,
  getTodayDateStr,
  parseDate
} from '../services/calculations';
import { StreakBadge } from '../components/StreakBadge';

interface StatisticsPageProps {
  records: Record<string, AttendanceRecord>;
  settings: AppSettings;
}

export const StatisticsPage: React.FC<StatisticsPageProps> = ({ records, settings }) => {
  const todayStr = getTodayDateStr();
  const currentYM = todayStr.substring(0, 7);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentYM);

  // High level metrics
  const monthMetrics = useMemo(() => {
    return calculateAttendanceMetrics(records, settings, 'month', selectedMonth);
  }, [records, settings, selectedMonth]);

  const yearMetrics = useMemo(() => {
    return calculateAttendanceMetrics(records, settings, 'year');
  }, [records, settings]);

  const overallMetrics = useMemo(() => {
    return calculateAttendanceMetrics(records, settings, 'overall');
  }, [records, settings]);

  // Monthly summary list (last 12 months)
  const monthlySummaries = useMemo(() => {
    return getMonthlySummaryList(records, settings, 6);
  }, [records, settings]);

  // Day of week distribution breakdown
  const dayOfWeekStats = useMemo(() => {
    const counts = [
      { name: 'Mon', day: 1, present: 0, total: 0 },
      { name: 'Tue', day: 2, present: 0, total: 0 },
      { name: 'Wed', day: 3, present: 0, total: 0 },
      { name: 'Thu', day: 4, present: 0, total: 0 },
      { name: 'Fri', day: 5, present: 0, total: 0 },
      { name: 'Sat', day: 6, present: 0, total: 0 },
      { name: 'Sun', day: 0, present: 0, total: 0 }
    ];

    (Object.values(records) as AttendanceRecord[]).forEach((r) => {
      const dt = parseDate(r.date);
      const dow = dt.getDay();
      const target = counts.find((c) => c.day === dow);
      if (target) {
        target.total++;
        if (r.status === 'present') target.present++;
      }
    });

    return counts;
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
            Performance Analytics
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Attendance Statistics
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Period:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            {monthlySummaries.map((m) => (
              <option key={m.yearMonth} value={m.yearMonth}>
                {m.monthLabel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 3 Metric Cards: Overall vs Year vs Selected Month */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Selected Month % */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Selected Month</span>
            <span className="text-indigo-600 dark:text-indigo-400">Target: {settings.targetPercentage}%</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {monthMetrics.attendancePercentage}%
            </span>
            <span className="text-xs text-slate-400">
              {monthMetrics.presentCount} / {monthMetrics.totalWorkingDays} days
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(monthMetrics.attendancePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Current Year % */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Current Year ({new Date().getFullYear()})</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {yearMetrics.attendancePercentage}%
            </span>
            <span className="text-xs text-slate-400">
              {yearMetrics.presentCount} / {yearMetrics.totalWorkingDays} days
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(yearMetrics.attendancePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Overall All-Time % */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>All-Time Overall</span>
            <Target className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
              {overallMetrics.attendancePercentage}%
            </span>
            <span className="text-xs text-slate-400">
              {overallMetrics.presentCount} total present
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 dark:bg-slate-200 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(overallMetrics.attendancePercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* STREAKS & DISTRIBUTION ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Streak Metrics Card with Dynamic StreakBadge */}
        <StreakBadge
          currentStreak={overallMetrics.currentStreak}
          bestStreak={overallMetrics.bestStreak}
        />

        {/* Selected Month Status Breakdown Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Breakdown ({monthlySummaries.find((m) => m.yearMonth === selectedMonth)?.monthLabel})
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              Val: {monthMetrics.totalAttendanceValue} / {monthMetrics.totalWorkingDays}
            </span>
          </div>

          {/* Breakdown 6-Item Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">
                Present (P)
              </span>
              <span className="text-lg font-black text-emerald-900 dark:text-emerald-200 font-mono">
                {monthMetrics.presentCount}
              </span>
              <span className="text-[10px] text-slate-400 block">val: 1</span>
            </div>

            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40">
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 block">
                Half Day (1/2)
              </span>
              <span className="text-lg font-black text-teal-900 dark:text-teal-200 font-mono">
                {monthMetrics.halfDayCount || 0}
              </span>
              <span className="text-[10px] text-slate-400 block">val: 0.5</span>
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/40">
              <span className="text-[11px] font-bold text-cyan-700 dark:text-cyan-400 block">
                1.5 Day (P1/2)
              </span>
              <span className="text-lg font-black text-cyan-900 dark:text-cyan-200 font-mono">
                {monthMetrics.oneAndHalfDayCount || 0}
              </span>
              <span className="text-[10px] text-slate-400 block">val: 1.5</span>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40">
              <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 block">
                Double (PP)
              </span>
              <span className="text-lg font-black text-purple-900 dark:text-purple-200 font-mono">
                {monthMetrics.doubleShiftCount || 0}
              </span>
              <span className="text-[10px] text-slate-400 block">val: 2.0</span>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 block">
                Absent (A)
              </span>
              <span className="text-lg font-black text-rose-900 dark:text-rose-200 font-mono">
                {monthMetrics.absentCount}
              </span>
              <span className="text-[10px] text-slate-400 block">val: 0</span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block">
                Leave (L)
              </span>
              <span className="text-lg font-black text-amber-900 dark:text-amber-200 font-mono">
                {monthMetrics.leaveCount}
              </span>
              <span className="text-[10px] text-slate-400 block">val: 0</span>
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTWEIGHT MONTHLY COMPARISON SVG BAR CHART */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              6-Month Trend Overview
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Target Line: {settings.targetPercentage}%</span>
        </div>

        {/* Lightweight SVG Visualizer */}
        <div className="pt-2">
          <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-40 border-b border-slate-200 dark:border-slate-700 pb-2 relative">
            {/* Target line overlay */}
            <div
              className="absolute left-0 right-0 border-b-2 border-dashed border-indigo-400/50 pointer-events-none z-10"
              style={{ bottom: `${settings.targetPercentage}%` }}
            />

            {monthlySummaries.slice().reverse().map((item) => {
              const pct = item.attendancePercentage;
              const isTargetMet = pct >= settings.targetPercentage;
              return (
                <div key={item.yearMonth} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {pct}%
                  </span>
                  <div
                    className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 ${
                      isTargetMet ? 'bg-indigo-600 group-hover:bg-indigo-500' : 'bg-amber-500 group-hover:bg-amber-400'
                    }`}
                    style={{ height: `${Math.max(pct, 6)}%` }}
                  />
                  <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">
                    {item.monthLabel.split(' ')[0].substring(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MONTHLY SUMMARY TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Monthly Attendance Summary Table
          </h3>
          <span className="text-xs text-slate-400">Past 6 months</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Month</th>
                <th className="px-3 py-3 text-center">Work Days</th>
                <th className="px-2 py-3 text-center text-emerald-600">P (1)</th>
                <th className="px-2 py-3 text-center text-teal-600">1/2 (0.5)</th>
                <th className="px-2 py-3 text-center text-cyan-600">P1/2 (1.5)</th>
                <th className="px-2 py-3 text-center text-purple-600">PP (2)</th>
                <th className="px-2 py-3 text-center text-rose-600">A (0)</th>
                <th className="px-2 py-3 text-center text-amber-600">L (0)</th>
                <th className="px-3 py-3 text-center text-indigo-600">Val</th>
                <th className="px-4 py-3 text-right">Att %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {monthlySummaries.map((row) => {
                const isMet = row.attendancePercentage >= settings.targetPercentage;
                return (
                  <tr key={row.yearMonth} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                    <td className="px-4 py-3.5 font-sans font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {row.monthLabel}
                    </td>
                    <td className="px-3 py-3.5 text-center text-slate-600 dark:text-slate-400">
                      {row.workingDays}
                    </td>
                    <td className="px-2 py-3.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                      {row.presentCount}
                    </td>
                    <td className="px-2 py-3.5 text-center text-teal-600 dark:text-teal-400 font-bold">
                      {row.halfDayCount || 0}
                    </td>
                    <td className="px-2 py-3.5 text-center text-cyan-600 dark:text-cyan-400 font-bold">
                      {row.oneAndHalfDayCount || 0}
                    </td>
                    <td className="px-2 py-3.5 text-center text-purple-600 dark:text-purple-400 font-bold">
                      {row.doubleShiftCount || 0}
                    </td>
                    <td className="px-2 py-3.5 text-center text-rose-600 dark:text-rose-400 font-bold">
                      {row.absentCount}
                    </td>
                    <td className="px-2 py-3.5 text-center text-amber-600 dark:text-amber-400 font-bold">
                      {row.leaveCount}
                    </td>
                    <td className="px-3 py-3.5 text-center text-indigo-600 dark:text-indigo-400 font-bold">
                      {row.totalAttendanceValue}
                    </td>
                    <td className="px-4 py-3.5 text-right font-black whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg text-xs ${
                          isMet
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {row.attendancePercentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
