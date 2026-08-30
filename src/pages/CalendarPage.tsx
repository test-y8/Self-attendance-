import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { AttendanceRecord, AppSettings, CalendarDayInfo } from '../types';
import {
  getTodayDateStr,
  formatDateStr,
  parseDate,
  isWorkingDay,
  isHoliday,
  calculateAttendanceMetrics
} from '../services/calculations';

interface CalendarPageProps {
  records: Record<string, AttendanceRecord>;
  settings: AppSettings;
  onOpenDateModal: (dateStr: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  records,
  settings,
  onOpenDateModal
}) => {
  const todayStr = getTodayDateStr();
  const todayDate = parseDate(todayStr);

  const [currentYear, setCurrentYear] = useState<number>(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(todayDate.getMonth()); // 0-11

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(todayDate.getFullYear());
    setCurrentMonth(todayDate.getMonth());
  };

  const monthYearStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthTitle = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Calculate metrics for this viewed month
  const monthMetrics = calculateAttendanceMetrics(records, settings, 'month', monthYearStr);

  // Generate calendar grid days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const firstWeekday = firstDayOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Days from previous month to fill first row
  const prevMonthDaysCount = new Date(currentYear, currentMonth, 0).getDate();
  const calendarDays: CalendarDayInfo[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    const dNum = prevMonthDaysCount - i;
    const pYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const pMonth = currentMonth === 0 ? 12 : currentMonth;
    const dStr = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
    const dt = parseDate(dStr);
    const hol = isHoliday(dStr, settings.holidays);

    calendarDays.push({
      dateStr: dStr,
      dayNumber: dNum,
      dayOfWeek: dt.getDay(),
      isCurrentMonth: false,
      isToday: dStr === todayStr,
      isSelected: false,
      isFuture: dStr > todayStr,
      isWorkingDay: isWorkingDay(dStr, settings),
      isHoliday: hol.isHol,
      holidayName: hol.name,
      record: records[dStr],
      status: records[dStr]?.status || 'no_data'
    });
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dt = parseDate(dStr);
    const hol = isHoliday(dStr, settings.holidays);
    const rec = records[dStr];
    const isWk = isWorkingDay(dStr, settings);

    calendarDays.push({
      dateStr: dStr,
      dayNumber: d,
      dayOfWeek: dt.getDay(),
      isCurrentMonth: true,
      isToday: dStr === todayStr,
      isSelected: false,
      isFuture: dStr > todayStr,
      isWorkingDay: isWk,
      isHoliday: hol.isHol,
      holidayName: hol.name,
      record: rec,
      status: rec?.status || (hol.isHol ? 'holiday' : !isWk ? 'weekend' : dStr > todayStr ? 'future' : 'no_data')
    });
  }

  // Days from next month to fill remaining grid cells (multiple of 7)
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const nMonth = currentMonth === 11 ? 1 : currentMonth + 2;
    const dStr = `${nYear}-${String(nMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dt = parseDate(dStr);
    const hol = isHoliday(dStr, settings.holidays);

    calendarDays.push({
      dateStr: dStr,
      dayNumber: d,
      dayOfWeek: dt.getDay(),
      isCurrentMonth: false,
      isToday: dStr === todayStr,
      isSelected: false,
      isFuture: true,
      isWorkingDay: isWorkingDay(dStr, settings),
      isHoliday: hol.isHol,
      holidayName: hol.name,
      record: records[dStr],
      status: 'future'
    });
  }

  const weekHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-5">
      {/* Calendar Header & Month Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {monthTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any day to view or record attendance details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleJumpToToday}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
            >
              Today
            </button>
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/60">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Viewed Month Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Working Days</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
              {monthMetrics.totalWorkingDays}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 flex items-center justify-between">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Present</span>
            <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300 font-mono">
              {monthMetrics.presentCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 flex items-center justify-between">
            <span className="text-xs text-rose-700 dark:text-rose-400 font-medium">Absent</span>
            <span className="text-sm font-bold text-rose-800 dark:text-rose-300 font-mono">
              {monthMetrics.absentCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 flex items-center justify-between">
            <span className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">Attendance</span>
            <span className="text-sm font-bold text-indigo-900 dark:text-indigo-200 font-mono">
              {monthMetrics.attendancePercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center pb-2 border-b border-slate-100 dark:border-slate-800">
          {weekHeaders.map((header, idx) => {
            const isUserWorkingDay = settings.workingDays.includes(idx);
            return (
              <div
                key={header}
                className={`text-xs font-bold py-1 ${
                  isUserWorkingDay
                    ? 'text-slate-800 dark:text-slate-200'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {header}
              </div>
            );
          })}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {calendarDays.map((day, idx) => {
            const isCurrentMonth = day.isCurrentMonth;
            const record = day.record;
            const status = record?.status;

            let cardBg = 'bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200';
            let indicatorBg = 'bg-slate-300 dark:bg-slate-600';
            let statusText = '';

            if (status === 'present') {
              cardBg = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200 hover:bg-emerald-100/80';
              indicatorBg = 'bg-emerald-500';
              statusText = 'Present';
            } else if (status === 'absent') {
              cardBg = 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-950 dark:text-rose-200 hover:bg-rose-100/80';
              indicatorBg = 'bg-rose-500';
              statusText = 'Absent';
            } else if (status === 'leave') {
              cardBg = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-200 hover:bg-amber-100/80';
              indicatorBg = 'bg-amber-500';
              statusText = 'Leave';
            } else if (day.isHoliday) {
              cardBg = 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60 text-sky-950 dark:text-sky-300';
              indicatorBg = 'bg-sky-500';
              statusText = day.holidayName || 'Holiday';
            } else if (!day.isWorkingDay) {
              cardBg = 'bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600';
            }

            if (!isCurrentMonth) {
              cardBg += ' opacity-30';
            }

            return (
              <button
                key={`${day.dateStr}-${idx}`}
                onClick={() => onOpenDateModal(day.dateStr)}
                className={`min-h-[72px] sm:min-h-[90px] p-2 rounded-2xl border border-transparent transition-all flex flex-col justify-between text-left group relative ${
                  day.isToday ? 'ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900' : ''
                } ${cardBg}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs sm:text-sm font-bold font-mono ${day.isToday ? 'text-indigo-600 dark:text-indigo-400 font-black' : ''}`}>
                    {day.dayNumber}
                  </span>

                  {status && (
                    <span className={`w-2 h-2 rounded-full ${indicatorBg}`} />
                  )}
                  {day.isHoliday && !status && (
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                  )}
                </div>

                <div className="w-full mt-auto">
                  {status ? (
                    <span className="text-[10px] sm:text-[11px] font-bold block truncate leading-tight">
                      {statusText}
                    </span>
                  ) : day.isHoliday ? (
                    <span className="text-[9px] sm:text-[10px] text-sky-600 dark:text-sky-400 font-semibold block truncate leading-tight">
                      🎉 {day.holidayName}
                    </span>
                  ) : !day.isWorkingDay && isCurrentMonth ? (
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">
                      Off
                    </span>
                  ) : null}

                  {record?.note && (
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block truncate mt-0.5 opacity-80">
                      📝 {record.note}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4 flex-wrap text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Leave</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Holiday</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>Non-working</span>
          </div>
        </div>
      </div>
    </div>
  );
};
