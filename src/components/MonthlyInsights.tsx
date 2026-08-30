import React from 'react';
import {
  Flame,
  Clock,
  BarChart3,
  Award,
  CalendarCheck,
  TrendingUp,
  Sun,
  ShieldCheck
} from 'lucide-react';
import { AttendanceMetrics, AttendanceRecord } from '../types';

interface MonthlyInsightsProps {
  metrics: AttendanceMetrics;
  records: Record<string, AttendanceRecord>;
  targetPercentage: number;
}

export const MonthlyInsights: React.FC<MonthlyInsightsProps> = ({
  metrics,
  records,
  targetPercentage
}) => {
  // Calculate day-of-week attendance distribution (Mon-Fri)
  const dayCounts: Record<number, { present: number; total: number }> = {
    1: { present: 0, total: 0 }, // Monday
    2: { present: 0, total: 0 }, // Tuesday
    3: { present: 0, total: 0 }, // Wednesday
    4: { present: 0, total: 0 }, // Thursday
    5: { present: 0, total: 0 }  // Friday
  };

  (Object.values(records) as AttendanceRecord[]).forEach((r) => {
    const [y, m, d] = r.date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      if (r.status === 'PRESENT' || r.status === 'HALF_DAY') {
        dayCounts[dayOfWeek].present += (r.status === 'HALF_DAY' ? 0.5 : 1);
        dayCounts[dayOfWeek].total += 1;
      } else if (r.status === 'ABSENT') {
        dayCounts[dayOfWeek].total += 1;
      }
    }
  });

  const dayLabels = [
    { dayNum: 1, label: 'Mon' },
    { dayNum: 2, label: 'Tue' },
    { dayNum: 3, label: 'Wed' },
    { dayNum: 4, label: 'Thu' },
    { dayNum: 5, label: 'Fri' }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Active Streak
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.streak} {metrics.streak === 1 ? 'Day' : 'Days'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Consecutive attendance on record
          </p>
        </div>

        {/* Total Working Hours */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-indigo-500 mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Total Hours
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center">
              <Clock className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.totalWorkingHours}h
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Logged across all recorded sessions
          </p>
        </div>

        {/* Average Daily Hours */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-emerald-500 mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Daily Average
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
              <Sun className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.avgHoursPerDay}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Average hours per present day
          </p>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-indigo-500 mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Attendance Rating
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.attendancePercentage >= 90
              ? 'Exemplary'
              : metrics.attendancePercentage >= targetPercentage
              ? 'On Track'
              : 'Attention'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Based on {targetPercentage}% minimum target
          </p>
        </div>
      </div>

      {/* Analytics Breakdown & Day of Week Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Breakdown Bar */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                <span>Attendance Composition</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distribution across recorded working days
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {metrics.workingDays} Total Days
            </span>
          </div>

          {metrics.workingDays > 0 ? (
            <div>
              {/* Stacked percentage bar */}
              <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                <div
                  style={{ width: `${(metrics.presentCount / metrics.workingDays) * 100}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Present: ${metrics.presentCount} days`}
                />
                <div
                  style={{ width: `${(metrics.halfDayCount / metrics.workingDays) * 100}%` }}
                  className="bg-amber-500 transition-all duration-500"
                  title={`Half Day: ${metrics.halfDayCount} days`}
                />
                <div
                  style={{ width: `${(metrics.absentCount / metrics.workingDays) * 100}%` }}
                  className="bg-rose-500 transition-all duration-500"
                  title={`Absent: ${metrics.absentCount} days`}
                />
              </div>

              {/* Legend with exact percentages */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                  <span className="block text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                    Present
                  </span>
                  <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                    {metrics.workingDays ? Math.round((metrics.presentCount / metrics.workingDays) * 100) : 0}%
                  </span>
                  <span className="block text-[10px] text-emerald-600 dark:text-emerald-400">
                    ({metrics.presentCount}d)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                  <span className="block text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                    Half Day
                  </span>
                  <span className="text-sm font-bold text-amber-900 dark:text-amber-100">
                    {metrics.workingDays ? Math.round((metrics.halfDayCount / metrics.workingDays) * 100) : 0}%
                  </span>
                  <span className="block text-[10px] text-amber-600 dark:text-amber-400">
                    ({metrics.halfDayCount}d)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                  <span className="block text-[11px] font-semibold text-rose-800 dark:text-rose-300">
                    Absent
                  </span>
                  <span className="text-sm font-bold text-rose-900 dark:text-rose-100">
                    {metrics.workingDays ? Math.round((metrics.absentCount / metrics.workingDays) * 100) : 0}%
                  </span>
                  <span className="block text-[10px] text-rose-600 dark:text-rose-400">
                    ({metrics.absentCount}d)
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">
              No attendance data to display breakdown.
            </p>
          )}
        </div>

        {/* Day of Week Consistency */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <span>Weekday Consistency</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Attendance rate by day of the week
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {dayLabels.map(({ dayNum, label }) => {
              const data = dayCounts[dayNum];
              const pct = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;

              return (
                <div key={dayNum} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{label}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {data.total > 0 ? `${pct}% (${data.present}/${data.total})` : 'No data'}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
