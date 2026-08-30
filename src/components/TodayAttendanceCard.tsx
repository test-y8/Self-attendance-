import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  CalendarCheck,
  Edit3,
  RotateCcw,
  Sparkles,
  SunMedium,
  Check
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { formatDisplayDate, formatTime12h, getTodayDateStr } from '../utils/attendance';

interface TodayAttendanceCardProps {
  todayRecord?: AttendanceRecord;
  userName: string;
  onOpenMarkModal: (dateStr: string) => void;
  onQuickMark: (status: AttendanceStatus) => void;
  onResetToday: () => void;
  onSyncGoogleCalendar?: (record: AttendanceRecord) => void;
  hasWorkspaceAuth: boolean;
}

export const TodayAttendanceCard: React.FC<TodayAttendanceCardProps> = ({
  todayRecord,
  userName,
  onOpenMarkModal,
  onQuickMark,
  onResetToday,
  onSyncGoogleCalendar,
  hasWorkspaceAuth
}) => {
  const todayStr = getTodayDateStr();
  const formattedDate = formatDisplayDate(todayStr);

  // Determine greeting based on current time
  const currentHour = new Date().getHours();
  let greeting = 'Good morning';
  if (currentHour >= 12 && currentHour < 17) greeting = 'Good afternoon';
  if (currentHour >= 17) greeting = 'Good evening';

  const isMarked = !!todayRecord && todayRecord.status !== 'NO_DATA';

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            Present
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
            <XCircle className="w-3.5 h-3.5" />
            Absent
          </span>
        );
      case 'HALF_DAY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            <SunMedium className="w-3.5 h-3.5" />
            Half Day
          </span>
        );
      case 'HOLIDAY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
            <Sparkles className="w-3.5 h-3.5" />
            Holiday
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
      {/* Decorative subtle background gradient */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-50/50 dark:from-indigo-950/20 to-transparent rounded-bl-full pointer-events-none" />

      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>{greeting}, {userName.split(' ')[0] || 'there'}</span>
            <span className="text-xl">👋</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Keep your attendance on track today • {formattedDate}
          </p>
        </div>

        {isMarked && (
          <div className="self-start sm:self-auto">
            {getStatusBadge(todayRecord.status)}
          </div>
        )}
      </div>

      {!isMarked ? (
        /* Not Marked State */
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Today's status: Not Marked
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose a quick option or customize your check-in time
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenMarkModal(todayStr)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark Attendance
            </button>
          </div>

          {/* 1-Tap Quick Mark Action Bar */}
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              Quick 1-Tap Action
            </span>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <button
                onClick={() => onQuickMark('PRESENT')}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-semibold text-sm transition-all active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Present</span>
              </button>

              <button
                onClick={() => onQuickMark('ABSENT')}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-rose-50 hover:bg-rose-100/90 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 font-semibold text-sm transition-all active:scale-[0.98]"
              >
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Absent</span>
              </button>

              <button
                onClick={() => onQuickMark('HALF_DAY')}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-amber-50 hover:bg-amber-100/90 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 font-semibold text-sm transition-all active:scale-[0.98]"
              >
                <SunMedium className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Half Day</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Marked State */
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {todayRecord.checkIn && (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                  Check-in Time
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  {formatTime12h(todayRecord.checkIn)}
                </span>
              </div>
            )}

            {todayRecord.checkOut && (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                  Check-out Time
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  {formatTime12h(todayRecord.checkOut)}
                </span>
              </div>
            )}

            {todayRecord.workingHours !== undefined && todayRecord.workingHours > 0 && (
              <div className="col-span-2 sm:col-span-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                  Calculated Hours
                </span>
                <span className="text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-400">
                  {todayRecord.workingHours} hrs
                </span>
              </div>
            )}
          </div>

          {todayRecord.notes && (
            <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Notes: </span>
              {todayRecord.notes}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Today's attendance recorded
              </span>
              {todayRecord.syncedToGoogleCalendar && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-800">
                  Synced to Calendar
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasWorkspaceAuth && !todayRecord.syncedToGoogleCalendar && onSyncGoogleCalendar && (
                <button
                  onClick={() => onSyncGoogleCalendar(todayRecord)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Sync to Calendar
                </button>
              )}

              <button
                onClick={() => onOpenMarkModal(todayStr)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>

              <button
                onClick={onResetToday}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Reset today's status"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
