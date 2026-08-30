import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  SunMedium,
  Sparkles
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, CalendarDayInfo } from '../types';
import { formatDateToISO, formatMonthYear, isWeekend } from '../utils/attendance';

interface AttendanceCalendarProps {
  records: Record<string, AttendanceRecord>;
  onSelectDate: (dateStr: string) => void;
  selectedDateStr?: string;
  onQuickMarkDate: (dateStr: string, status: AttendanceStatus) => void;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  records,
  onSelectDate,
  selectedDateStr,
  onQuickMarkDate: _onQuickMarkDate
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(y => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(y => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const jumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    onSelectDate(formatDateToISO(now));
  };

  // Generate calendar grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays: CalendarDayInfo[] = [];

  // 1. Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthDate = new Date(currentYear, currentMonth - 1, dayNum);
    const dateStr = formatDateToISO(prevMonthDate);
    const record = records[dateStr];
    calendarDays.push({
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: formatDateToISO(today) === dateStr,
      isSelected: selectedDateStr === dateStr,
      isFuture: prevMonthDate > today,
      isWeekend: isWeekend(prevMonthDate),
      record,
      status: record?.status || (isWeekend(prevMonthDate) ? 'WEEKEND' : 'NO_DATA')
    });
  }

  // 2. Current month days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const date = new Date(currentYear, currentMonth, dayNum);
    const dateStr = formatDateToISO(date);
    const isToday = formatDateToISO(today) === dateStr;
    const isFuture = date > today;
    const isWk = isWeekend(date);
    const record = records[dateStr];

    let status: AttendanceStatus = 'NO_DATA';
    if (record) {
      status = record.status;
    } else if (isFuture) {
      status = 'FUTURE';
    } else if (isWk) {
      status = 'WEEKEND';
    }

    calendarDays.push({
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday,
      isSelected: selectedDateStr === dateStr,
      isFuture,
      isWeekend: isWk,
      record,
      status
    });
  }

  // 3. Next month leading days to complete grid
  const remainingCells = 42 - calendarDays.length;
  if (remainingCells < 7 && remainingCells > 0) {
    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      const nextMonthDate = new Date(currentYear, currentMonth + 1, dayNum);
      const dateStr = formatDateToISO(nextMonthDate);
      const record = records[dateStr];
      calendarDays.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: formatDateToISO(today) === dateStr,
        isSelected: selectedDateStr === dateStr,
        isFuture: true,
        isWeekend: isWeekend(nextMonthDate),
        record,
        status: 'FUTURE'
      });
    }
  }

  const getStatusIndicator = (day: CalendarDayInfo) => {
    switch (day.status) {
      case 'PRESENT':
        return (
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-sm shadow-emerald-500/30">
            ✓
          </span>
        );
      case 'ABSENT':
        return (
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shadow-sm shadow-rose-500/30">
            ✕
          </span>
        );
      case 'HALF_DAY':
        return (
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm shadow-amber-500/30">
            ½
          </span>
        );
      case 'HOLIDAY':
        return (
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-sm shadow-indigo-500/30">
            ★
          </span>
        );
      case 'WEEKEND':
        return (
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        );
      default:
        return null;
    }
  };

  const weekDayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Calendar Header & Month Navigation */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {formatMonthYear(currentYear, currentMonth)}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={jumpToToday}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
            <button
              onClick={prevMonth}
              aria-label="Previous month"
              className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              aria-label="Next month"
              className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
        {weekDayLabels.map((day, idx) => (
          <div
            key={day}
            className={`text-[11px] font-bold tracking-wider py-1 ${
              idx === 0 || idx === 6
                ? 'text-rose-500/80 dark:text-rose-400/80'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((day) => {
          const isSelected = selectedDateStr === day.dateStr;

          return (
            <button
              key={day.dateStr}
              onClick={() => onSelectDate(day.dateStr)}
              className={`min-h-[58px] sm:min-h-[70px] p-1.5 sm:p-2 rounded-xl flex flex-col items-center justify-between transition-all relative border text-left ${
                !day.isCurrentMonth
                  ? 'opacity-35 bg-slate-50/40 dark:bg-slate-900/30 border-transparent text-slate-400'
                  : isSelected
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 dark:border-indigo-400 shadow-sm ring-2 ring-indigo-500/20 z-10'
                  : day.isToday
                  ? 'bg-slate-50 dark:bg-slate-800/80 border-indigo-300 dark:border-indigo-700'
                  : 'bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-100 dark:border-slate-800/80'
              }`}
            >
              {/* Day Number + Today dot */}
              <div className="w-full flex items-center justify-between">
                <span
                  className={`text-xs font-semibold ${
                    day.isToday
                      ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold'
                      : day.isCurrentMonth
                      ? 'text-slate-700 dark:text-slate-200'
                      : 'text-slate-400'
                  }`}
                >
                  {day.dayNumber}
                </span>

                {day.record?.workingHours ? (
                  <span className="hidden sm:inline-block text-[9px] font-medium text-slate-500 dark:text-slate-400">
                    {day.record.workingHours}h
                  </span>
                ) : null}
              </div>

              {/* Status Graphic */}
              <div className="my-auto flex items-center justify-center">
                {getStatusIndicator(day)}
              </div>

              {/* Google Sync dot */}
              {day.record?.syncedToGoogleCalendar && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500" title="Synced to Google Calendar" />
              )}
            </button>
          );
        })}
      </div>

      {/* Visual Legend */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
          <span>Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold">✕</span>
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-bold">½</span>
          <span>Half Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[9px] font-bold">★</span>
          <span>Holiday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full border border-indigo-500 bg-indigo-500 text-white flex items-center justify-center text-[9px]">T</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};
