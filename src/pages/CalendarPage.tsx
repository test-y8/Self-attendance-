import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Moon,
  Sun,
  Coffee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  User,
  ShieldCheck,
  Check,
  Clock,
  ArrowRight
} from 'lucide-react';
import { AttendanceRecord, AppSettings, CalendarDayInfo, AttendanceStatus } from '../types';
import {
  getTodayDateStr,
  formatDisplayDate,
  parseDate,
  isWorkingDay,
  isHoliday,
  calculateAttendanceMetrics,
  getAttendanceStatusMeta,
  ATTENDANCE_STATUS_OPTIONS
} from '../services/calculations';
import { DayDetailsBottomSheet } from '../components/DayDetailsBottomSheet';

interface CalendarPageProps {
  records: Record<string, AttendanceRecord>;
  settings: AppSettings;
  onOpenDateModal: (dateStr: string, initialStatus?: AttendanceStatus) => void;
  onQuickMarkAttendance?: (status: AttendanceStatus, dateStr?: string) => void;
  onToggleDarkMode?: () => void;
  isDarkMode?: boolean;
  onOpenProfile?: () => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  records,
  settings,
  onOpenDateModal,
  onQuickMarkAttendance,
  onToggleDarkMode,
  isDarkMode = true,
  onOpenProfile
}) => {
  const todayStr = getTodayDateStr();
  const todayDate = parseDate(todayStr);

  const [currentYear, setCurrentYear] = useState<number>(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(todayDate.getMonth()); // 0-11
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);

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
    setSelectedDayStr(todayStr);
    setIsBottomSheetOpen(true);
  };

  const monthYearStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthTitle = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Calculate metrics for this viewed month (memoized)
  const monthMetrics = useMemo(() => {
    return calculateAttendanceMetrics(records, settings, 'month', monthYearStr);
  }, [records, settings, monthYearStr]);

  // Generate calendar grid days (memoized)
  const calendarDays = useMemo<CalendarDayInfo[]>(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const firstWeekday = firstDayOfMonth.getDay(); // 0 = Sun
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Days from previous month to fill first row
    const prevMonthDaysCount = new Date(currentYear, currentMonth, 0).getDate();
    const days: CalendarDayInfo[] = [];

    for (let i = firstWeekday - 1; i >= 0; i--) {
      const dNum = prevMonthDaysCount - i;
      const pYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const pMonth = currentMonth === 0 ? 12 : currentMonth;
      const dStr = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
      const dt = parseDate(dStr);
      const hol = isHoliday(dStr, settings.holidays);

      days.push({
        dateStr: dStr,
        dayNumber: dNum,
        dayOfWeek: dt.getDay(),
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDayStr,
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

      days.push({
        dateStr: dStr,
        dayNumber: d,
        dayOfWeek: dt.getDay(),
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDayStr,
        isFuture: dStr > todayStr,
        isWorkingDay: isWk,
        isHoliday: hol.isHol,
        holidayName: hol.name,
        record: rec,
        status: rec?.status || (hol.isHol ? 'holiday' : !isWk ? 'weekend' : dStr > todayStr ? 'future' : 'no_data')
      });
    }

    // Days from next month to fill remaining grid cells (multiple of 7)
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remainingCells; d++) {
      const nYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const nMonth = currentMonth === 11 ? 1 : currentMonth + 2;
      const dStr = `${nYear}-${String(nMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dt = parseDate(dStr);
      const hol = isHoliday(dStr, settings.holidays);

      days.push({
        dateStr: dStr,
        dayNumber: d,
        dayOfWeek: dt.getDay(),
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDayStr,
        isFuture: true,
        isWorkingDay: isWorkingDay(dStr, settings),
        isHoliday: hol.isHol,
        holidayName: hol.name,
        record: records[dStr],
        status: 'future'
      });
    }

    return days;
  }, [currentYear, currentMonth, records, settings, todayStr, selectedDayStr]);

  const weekHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const fullWeekHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDayClick = (dateStr: string) => {
    setSelectedDayStr(dateStr);
    setIsBottomSheetOpen(true);
  };

  const handleQuickUpdateFromSheet = (dateStr: string, status: AttendanceStatus) => {
    if (onQuickMarkAttendance) {
      onQuickMarkAttendance(status, dateStr);
    } else {
      onOpenDateModal(dateStr, status);
    }
  };

  // User initials for avatar
  const initials = settings.userName
    ? settings.userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SA';

  return (
    <div className="space-y-4 sm:space-y-5 pb-24 md:pb-12 text-slate-100 font-sans">
      {/* 1. TOP HEADER */}
      <div className="bg-[#161F37] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Self Attendance
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Monthly Calendar
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            {monthTitle}
          </p>
        </div>

        {/* Right Header Actions: Theme Toggle & Profile Avatar */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="w-10 h-10 rounded-2xl bg-[#0F172A] hover:bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-purple-400" />
              )}
            </button>
          )}

          <button
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-purple-600/20 border border-purple-400/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title={`Logged in as ${settings.userName || 'User'}`}
            aria-label="User Profile"
          >
            {initials}
          </button>
        </div>
      </div>

      {/* 2. ATTENDANCE SUMMARY (All 6 Statuses + Percentage Card) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
          <span className="uppercase tracking-wider">Monthly Attendance Summary</span>
          <span className="font-mono text-purple-300">
            Total Value: {monthMetrics.totalAttendanceValue} / {monthMetrics.totalWorkingDays} days
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5">
          {/* Present Card */}
          <div className="bg-[#161F37] border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between transition-all hover:border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Present (P)
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                {monthMetrics.presentCount}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">days</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">val: 1</span>
          </div>

          {/* Half Day (1/2) Card */}
          <div className="bg-[#161F37] border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between transition-all hover:border-teal-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Half Day (1/2)
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-teal-400">
                {monthMetrics.halfDayCount || 0}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">days</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">val: 0.5</span>
          </div>

          {/* 1.5 Day (P1/2) Card */}
          <div className="bg-[#161F37] border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between transition-all hover:border-cyan-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                1.5 Day (P1/2)
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-cyan-400">
                {monthMetrics.oneAndHalfDayCount || 0}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">days</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">val: 1.5</span>
          </div>

          {/* Double Hajri (PP) Card */}
          <div className="bg-[#161F37] border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between transition-all hover:border-purple-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Double (PP)
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-purple-400">
                {monthMetrics.doubleShiftCount || 0}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">days</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">val: 2.0</span>
          </div>

          {/* Absent Card */}
          <div className="bg-[#161F37] border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between transition-all hover:border-rose-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Absent (A)
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-rose-400">
                {monthMetrics.absentCount}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">days</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">val: 0</span>
          </div>

          {/* Leave Card */}
          <div className="bg-[#161F37] border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between transition-all hover:border-amber-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Leave (L)
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                {monthMetrics.leaveCount}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">days</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">val: 0</span>
          </div>

          {/* Attendance Percentage Card with Thin Progress Bar */}
          <div className="bg-[#161F37] border border-purple-500/30 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden col-span-2 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                Attendance
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            </div>
            
            <div className="mt-1">
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black font-mono text-white">
                  {monthMetrics.attendancePercentage}%
                </span>
                <span className="text-[9px] text-slate-400">
                  / {settings.targetPercentage}%
                </span>
              </div>

              {/* Thin Attendance Progress Bar */}
              <div className="w-full bg-[#0F172A] h-1.5 rounded-full overflow-hidden mt-1.5 p-0.2 border border-slate-700/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    monthMetrics.isTargetAchieved
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(4, monthMetrics.attendancePercentage))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MONTH NAVIGATION BAR */}
      <div className="bg-[#161F37] border border-slate-800/80 rounded-2xl px-4 py-3 sm:px-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {monthTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Today Button */}
          <button
            onClick={handleJumpToToday}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition-colors"
          >
            Today
          </button>

          {/* Left & Right Arrow Navigation */}
          <div className="flex items-center bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. CALENDAR 7-COLUMN MATRIX */}
      <div className="bg-[#161F37] border border-slate-800/80 rounded-3xl p-3.5 sm:p-5 shadow-sm space-y-2.5">
        {/* Weekday Column Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center pb-2 border-b border-slate-800/80">
          {fullWeekHeaders.map((header, idx) => {
            const isUserWorkingDay = settings.workingDays.includes(idx);
            return (
              <div
                key={header}
                className={`text-[11px] sm:text-xs font-bold py-0.5 ${
                  isUserWorkingDay
                    ? 'text-slate-300'
                    : 'text-slate-500'
                }`}
              >
                <span className="hidden sm:inline">{header}</span>
                <span className="sm:hidden">{weekHeaders[idx]}</span>
              </div>
            );
          })}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {calendarDays.map((day, idx) => {
            const isCurrentMonth = day.isCurrentMonth;
            const record = day.record;
            const status = record?.status;
            const meta = status ? getAttendanceStatusMeta(status) : null;

            // Base styling for modern dark navy cards (16px rounded)
            let cardBg = 'bg-[#0F172A] hover:bg-slate-800/90 text-slate-200 border-slate-800/70';
            let badgeShortCode = '';
            let badgeBg = '';

            if (meta) {
              cardBg = `bg-[#0F172A] hover:bg-slate-800 ${meta.borderColor} text-white`;
              badgeShortCode = meta.shortCode;
              badgeBg = meta.badgeBg + ' ' + meta.textColor;
            } else if (day.isHoliday) {
              cardBg = 'bg-[#0F172A] hover:bg-slate-800 border-sky-500/30 text-slate-300';
              badgeShortCode = 'H';
              badgeBg = 'bg-sky-500/20 text-sky-300';
            } else if (!day.isWorkingDay) {
              cardBg = 'bg-[#0B1120]/60 border-transparent text-slate-500';
            }

            // Future dates subtle muted appearance
            if (day.isFuture && isCurrentMonth) {
              cardBg = 'bg-[#0F172A]/50 border-slate-800/40 text-slate-400 hover:bg-slate-800/60';
            }

            // Non-current month days (faded)
            if (!isCurrentMonth) {
              cardBg = 'bg-[#0B1120]/30 border-transparent text-slate-600 opacity-35';
            }

            // Today Outline: Elegant Purple Ring/Border
            const todayRing = day.isToday
              ? 'ring-2 ring-purple-500 border-purple-500 shadow-md shadow-purple-500/15'
              : 'border';

            return (
              <button
                key={`${day.dateStr}-${idx}`}
                onClick={() => handleDayClick(day.dateStr)}
                className={`min-h-[62px] sm:min-h-[80px] p-2 rounded-2xl ${todayRing} ${cardBg} transition-all flex flex-col items-center justify-between text-center group relative cursor-pointer active:scale-95`}
              >
                {/* Large Clean Day Number */}
                <div className="w-full flex items-center justify-between pt-0.5">
                  <span
                    className={`text-sm sm:text-base font-bold font-mono leading-none ${
                      day.isToday
                        ? 'text-purple-400 font-black'
                        : isCurrentMonth
                        ? 'text-slate-100'
                        : 'text-slate-600'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {/* Tiny shortcode chip if marked */}
                  {badgeShortCode && (
                    <span className={`text-[9px] font-mono font-black px-1 py-0.2 rounded ${badgeBg}`}>
                      {badgeShortCode}
                    </span>
                  )}
                </div>

                {/* Status Dot / Indicator Below Date */}
                <div className="h-3 sm:h-4 flex items-center justify-center gap-1 mt-auto w-full">
                  {meta && (
                    <span className={`w-2 h-2 rounded-full ${meta.dotColor}`} />
                  )}
                  {day.isHoliday && !meta && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  )}
                  {!day.isWorkingDay && isCurrentMonth && !meta && (
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Clean Status Legend */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/30" />
            <span className="text-slate-300">P (1)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-sm shadow-teal-500/30" />
            <span className="text-slate-300">1/2 (0.5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-500/30" />
            <span className="text-slate-300">P1/2 (1.5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-500/30" />
            <span className="text-slate-300">PP (2)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-500/30" />
            <span className="text-slate-300">A (0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-500/30" />
            <span className="text-slate-300">L (0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className="text-slate-300">Holiday</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-purple-500 bg-purple-500/20" />
            <span className="text-purple-300 font-semibold">Today</span>
          </div>
        </div>
      </div>

      {/* 5. QUICK ACTIONS WITH ALL 6 OPTIONS */}
      <div className="bg-[#161F37] border border-slate-800/80 rounded-3xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-white block">
              Quick Action — Today ({formatDisplayDate(todayStr, { showDay: false })})
            </span>
            <p className="text-[11px] text-slate-400">
              Tap any status to mark attendance instantly
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Modal Trigger Buttons */}
            <button
              type="button"
              onClick={() => onOpenDateModal(todayStr, 'leave')}
              className="px-3 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Coffee className="w-3.5 h-3.5" />
              Request Leave
            </button>

            <button
              type="button"
              onClick={() => onOpenDateModal(todayStr, 'present')}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/30 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              + Details Modal
            </button>
          </div>
        </div>

        {/* 6 Quick Action Status Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
          {ATTENDANCE_STATUS_OPTIONS.map((opt) => {
            const todayRecord = records[todayStr];
            const todayMeta = todayRecord ? getAttendanceStatusMeta(todayRecord.status) : null;
            const isSelected = todayMeta?.canonicalKey === opt.canonicalKey;

            return (
              <button
                key={opt.canonicalKey}
                type="button"
                onClick={() => {
                  if (onQuickMarkAttendance) {
                    onQuickMarkAttendance(opt.canonicalKey, todayStr);
                  } else {
                    onOpenDateModal(todayStr, opt.canonicalKey);
                  }
                }}
                className={`py-2 px-1.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                  isSelected
                    ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/25 ring-2 ring-purple-500'
                    : 'bg-[#0F172A] hover:bg-slate-800/90 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="font-mono text-xs font-black px-1.5 py-0.5 rounded bg-slate-800/80">
                  {opt.shortCode}
                </span>
                <span className="text-[10px] font-semibold truncate w-full text-center">
                  {opt.label}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  val: {opt.value}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. DAY TAP BOTTOM SHEET */}
      <DayDetailsBottomSheet
        isOpen={isBottomSheetOpen}
        dateStr={selectedDayStr}
        record={selectedDayStr ? records[selectedDayStr] : undefined}
        settings={settings}
        onClose={() => setIsBottomSheetOpen(false)}
        onEdit={(d) => onOpenDateModal(d)}
        onQuickUpdateStatus={handleQuickUpdateFromSheet}
      />
    </div>
  );
};
