import React from 'react';
import {
  CheckCircle2,
  XCircle,
  SunMedium,
  Briefcase,
  TrendingUp,
  Award,
  AlertCircle,
  Sliders
} from 'lucide-react';
import { AttendanceMetrics } from '../types';
import { AttendanceRing } from './AttendanceRing';

interface AttendanceOverviewProps {
  metrics: AttendanceMetrics;
  targetPercentage: number;
  onOpenTargetSimulator: () => void;
}

export const AttendanceOverview: React.FC<AttendanceOverviewProps> = ({
  metrics,
  targetPercentage,
  onOpenTargetSimulator
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Attendance Overview</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time percentage and goal projection
          </p>
        </div>

        <button
          onClick={onOpenTargetSimulator}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Goal Simulator</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Ring gauge column */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60">
          <AttendanceRing
            percentage={metrics.attendancePercentage}
            targetPercentage={targetPercentage}
            size={144}
            strokeWidth={13}
          />
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
            {metrics.isTargetAchieved ? (
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Target Met ({targetPercentage}%)
              </span>
            ) : (
              <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Below Target ({targetPercentage}%)
              </span>
            )}
          </div>
        </div>

        {/* Breakdown Stats Grid */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Present */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-3.5 transition-all">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1">
              <span className="text-xs font-semibold">Present</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black tracking-tight text-emerald-900 dark:text-emerald-200">
              {metrics.presentCount}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
              Full days
            </span>
          </div>

          {/* Absent */}
          <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl p-3.5 transition-all">
            <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-1">
              <span className="text-xs font-semibold">Absent</span>
              <XCircle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black tracking-tight text-rose-900 dark:text-rose-200">
              {metrics.absentCount}
            </div>
            <span className="text-[11px] text-rose-600 dark:text-rose-400">
              Missed days
            </span>
          </div>

          {/* Half Day */}
          <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-3.5 transition-all">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
              <span className="text-xs font-semibold">Half Day</span>
              <SunMedium className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black tracking-tight text-amber-900 dark:text-amber-200">
              {metrics.halfDayCount}
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400">
              0.5 day credit
            </span>
          </div>

          {/* Working Days */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 transition-all">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mb-1">
              <span className="text-xs font-semibold">Total Days</span>
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {metrics.workingDays}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Working days
            </span>
          </div>
        </div>
      </div>

      {/* Target Status Banner */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        {metrics.workingDays === 0 ? (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <span>Mark your first attendance record to see target calculations.</span>
          </div>
        ) : metrics.isTargetAchieved ? (
          <div className="flex items-center justify-between flex-wrap gap-2 p-3.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-semibold">
                  Target Achieved! ({metrics.attendancePercentage}% vs {targetPercentage}%)
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  You can safely miss up to <strong className="font-bold underline">{metrics.canMissDays} {metrics.canMissDays === 1 ? 'day' : 'days'}</strong> without falling below your {targetPercentage}% target.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
              Safe Buffer: +{metrics.canMissDays}d
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-2 p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-semibold">
                  {metrics.attendancePercentage}% attendance (Target is {targetPercentage}%)
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  You need <strong className="font-bold underline">{metrics.neededDays} consecutive present {metrics.neededDays === 1 ? 'day' : 'days'}</strong> to reach your {targetPercentage}% attendance goal.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-600 text-white">
              Need: {metrics.neededDays}d
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
