import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  SunMedium,
  Sparkles,
  Sliders,
  Flame,
  Clock,
  Edit3,
  RotateCcw,
  Check
} from 'lucide-react';
import {
  AttendanceMetrics,
  AttendanceRecord,
  AttendanceStatus,
  CalendarDayInfo
} from '../types';
import {
  formatDateToISO,
  formatDisplayDate,
  formatMonthYear,
  formatTime12h,
  getTodayDateStr,
  isWeekend
} from '../utils/attendance';

interface BentoDashboardProps {
  metrics: AttendanceMetrics;
  records: Record<string, AttendanceRecord>;
  targetPercentage: number;
  todayRecord?: AttendanceRecord;
  userName: string;
  onOpenMarkModal: (dateStr: string) => void;
  onQuickMarkToday: (status: AttendanceStatus) => void;
  onResetToday: () => void;
  onSelectDate: (dateStr: string) => void;
  selectedDateStr?: string;
  onOpenTargetSimulator: () => void;
  onSyncGoogleCalendar?: (record: AttendanceRecord) => void;
  hasWorkspaceAuth: boolean;
}

export const BentoDashboard: React.FC<BentoDashboardProps> = ({
  metrics,
  records,
  targetPercentage,
  todayRecord,
  userName: _userName,
  onOpenMarkModal,
  onQuickMarkToday,
  onResetToday,
  onSelectDate,
  selectedDateStr,
  onOpenTargetSimulator,
  onSyncGoogleCalendar,
  hasWorkspaceAuth
}) => {
  const todayStr = getTodayDateStr();
  const formattedToday = formatDisplayDate(todayStr);
  const isMarked = !!todayRecord && todayRecord.status !== 'NO_DATA';

  // Calendar month state
  const today = new Date();
  const [currentYear, setCurrentYear] = React.useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = React.useState<number>(today.getMonth()); // 0-indexed

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
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

  // Previous month trailing
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

  // Current month
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

  // Next month leading
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

  // Ring Calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const safePercentage = Math.min(Math.max(metrics.attendancePercentage, 0), 100);
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  // Mini 6-bar trend simulation
  const trendBars = [
    { height: '40%', active: false },
    { height: '60%', active: false },
    { height: '85%', active: true },
    { height: '75%', active: true },
    { height: '50%', active: false },
    { height: '95%', active: true }
  ];

  return (
    <div className="space-y-5">
      {/* ================= TOP BENTO ROW (3 CARDS) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* CARD 1: TODAY PUNCH CARD (Bento Column 1-4) */}
        <div className="md:col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Today
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {formattedToday}
              </span>
            </div>

            <div className="mb-4">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Status:{' '}
                {!isMarked ? (
                  <span className="text-rose-500 font-bold">Not Marked</span>
                ) : todayRecord.status === 'PRESENT' ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Present</span>
                ) : todayRecord.status === 'ABSENT' ? (
                  <span className="text-rose-600 dark:text-rose-400 font-bold">Absent</span>
                ) : todayRecord.status === 'HALF_DAY' ? (
                  <span className="text-amber-600 dark:text-amber-400 font-bold">Half Day</span>
                ) : (
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">Holiday</span>
                )}
              </div>

              {isMarked && (
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 dark:text-slate-300 mt-2">
                  {todayRecord.checkIn && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      {formatTime12h(todayRecord.checkIn)}
                    </span>
                  )}
                  {todayRecord.workingHours && todayRecord.workingHours > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold">
                      {todayRecord.workingHours}h
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {!isMarked ? (
            <div className="space-y-2.5">
              {/* 1-Tap Quick Action Row */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onQuickMarkToday('PRESENT')}
                  className="py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
                >
                  <Check className="w-3.5 h-3.5" />
                  Present
                </button>
                <button
                  onClick={() => onQuickMarkToday('ABSENT')}
                  className="py-2.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Absent
                </button>
                <button
                  onClick={() => onQuickMarkToday('HALF_DAY')}
                  className="py-2.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
                >
                  <SunMedium className="w-3.5 h-3.5" />
                  Half
                </button>
              </div>

              <button
                onClick={() => onOpenMarkModal(todayStr)}
                className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark Attendance
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenMarkModal(todayStr)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={onResetToday}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Reset today"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {hasWorkspaceAuth && !todayRecord.syncedToGoogleCalendar && onSyncGoogleCalendar && (
                <button
                  onClick={() => onSyncGoogleCalendar(todayRecord)}
                  className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Sync
                </button>
              )}
            </div>
          )}
        </div>

        {/* CARD 2: ATTENDANCE RING (Bento Column 5-8) */}
        <div className="md:col-span-6 lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-between transition-colors relative min-h-[220px]">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Attendance
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Goal: {targetPercentage}%
            </span>
          </div>

          {/* Circular Ring Graphic */}
          <div className="relative my-auto flex items-center justify-center">
            <svg className="w-28 h-28 -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-slate-100 dark:text-slate-800"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Progress Stroke */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={metrics.isTargetAchieved ? '#10b981' : safePercentage >= 50 ? '#f59e0b' : '#f43f5e'}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {metrics.attendancePercentage}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Current
              </span>
            </div>
          </div>

          <div className="mt-2 text-xs font-semibold">
            {metrics.isTargetAchieved ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Target Met ({metrics.attendancePercentage}%)
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold">
                <SunMedium className="w-3.5 h-3.5" />
                Need {metrics.neededDays} more days
              </span>
            )}
          </div>
        </div>

        {/* CARD 3: TARGET GOAL HIGHLIGHT (Bento Column 9-12) */}
        <div className="md:col-span-6 lg:col-span-4 bg-indigo-600 text-white rounded-3xl p-6 shadow-sm shadow-indigo-600/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-indigo-100">
              <span className="text-xs font-bold uppercase tracking-wider">
                Target Goal
              </span>
              <button
                onClick={onOpenTargetSimulator}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                title="Open Simulator"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>

            <div className="text-4xl sm:text-5xl font-black my-2 tracking-tight">
              {targetPercentage}%
            </div>
          </div>

          <div>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              {metrics.workingDays === 0 ? (
                'Start recording attendance to dynamically calculate your target requirements.'
              ) : metrics.isTargetAchieved ? (
                <>
                  You have a safe buffer of{' '}
                  <strong className="font-bold text-white underline">
                    {metrics.canMissDays} {metrics.canMissDays === 1 ? 'day' : 'days'}
                  </strong>{' '}
                  above your target!
                </>
              ) : (
                <>
                  Attend{' '}
                  <strong className="font-bold text-white underline">
                    {metrics.neededDays} more {metrics.neededDays === 1 ? 'day' : 'days'}
                  </strong>{' '}
                  consecutively to reach your goal.
                </>
              )}
            </p>

            <button
              onClick={onOpenTargetSimulator}
              className="mt-3 text-xs font-bold text-white/90 hover:text-white flex items-center gap-1 underline underline-offset-4"
            >
              Goal Simulator & Forecasting →
            </button>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM BENTO ROW (CALENDAR + STATS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CARD 4: CALENDAR BENTO CARD (Span 8) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {formatMonthYear(currentYear, currentMonth)}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={jumpToToday}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Today
              </button>
              <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                <button
                  onClick={prevMonth}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, idx) => (
              <div
                key={day}
                className={`text-[11px] font-bold tracking-wider py-1 ${
                  idx === 0 || idx === 6
                    ? 'text-rose-500/80 dark:text-rose-400/80'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Bento Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((day) => {
              const isSelected = selectedDateStr === day.dateStr;
              const isPresent = day.status === 'PRESENT';
              const isAbsent = day.status === 'ABSENT';
              const isHalf = day.status === 'HALF_DAY';
              const isHoliday = day.status === 'HOLIDAY';

              return (
                <button
                  key={day.dateStr}
                  onClick={() => onSelectDate(day.dateStr)}
                  className={`aspect-square min-h-[46px] sm:min-h-[56px] rounded-xl flex flex-col items-center justify-center font-semibold text-xs transition-all relative ${
                    !day.isCurrentMonth
                      ? 'opacity-25 text-slate-400 bg-transparent'
                      : isSelected
                      ? 'ring-2 ring-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 font-bold z-10'
                      : day.isToday
                      ? 'border-2 border-indigo-600 bg-slate-50 dark:bg-slate-850 font-bold'
                      : isPresent
                      ? 'bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200/80'
                      : isAbsent
                      ? 'bg-rose-100/80 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 hover:bg-rose-200/80'
                      : isHalf
                      ? 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 hover:bg-amber-200/80'
                      : isHoliday
                      ? 'bg-sky-100/80 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 hover:bg-sky-200/80'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span>{day.dayNumber}</span>

                  {/* Status Dot */}
                  {day.isCurrentMonth && (isPresent || isAbsent || isHalf || isHoliday) && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${
                        isPresent
                          ? 'bg-emerald-600 dark:bg-emerald-400'
                          : isAbsent
                          ? 'bg-rose-600 dark:bg-rose-400'
                          : isHalf
                          ? 'bg-amber-600 dark:bg-amber-400'
                          : 'bg-sky-600 dark:bg-sky-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center flex-wrap gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
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
              <span>Half Day</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Holiday</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-indigo-600" />
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* CARD 5: STATISTICS & TRENDS BENTO CARD (Span 4) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-3">
              Statistics
            </span>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Present</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {metrics.presentCount}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Absent</span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  {metrics.absentCount}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Half Day</span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {metrics.halfDayCount}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Working Days</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {metrics.workingDays}
                </span>
              </div>
            </div>
          </div>

          {/* Trends Section */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Trends & Streak
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>{metrics.streak}d streak</span>
              </div>
            </div>

            {/* Mini 6-bar spark graph */}
            <div className="flex items-end gap-2 h-14 my-3">
              {trendBars.map((bar, i) => (
                <div
                  key={i}
                  style={{ height: bar.height }}
                  className={`flex-1 rounded-md transition-all ${
                    bar.active
                      ? 'bg-indigo-600 dark:bg-indigo-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {metrics.attendancePercentage >= targetPercentage
                ? 'Your attendance is maintaining strong target consistency.'
                : `Attend ${metrics.neededDays} more days to reach your ${targetPercentage}% goal.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
