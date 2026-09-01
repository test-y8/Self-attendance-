import {
  AttendanceRecord,
  AttendanceStatus,
  AppSettings,
  AttendanceMetrics,
  MonthlySummaryRow,
  StreakMilestone,
  StreakTierInfo
} from '../types';

export interface StatusOptionInfo {
  key: AttendanceStatus;
  canonicalKey: 'present' | 'half_day' | 'one_and_half_day' | 'double_shift' | 'absent' | 'leave';
  shortCode: 'P' | '1/2' | 'P1/2' | 'PP' | 'A' | 'L';
  label: string; // 'Present', 'Half Day', '1.5 Day', 'Double Hajri', 'Absent', 'Leave'
  fullLabel: string;
  value: number; // 1, 0.5, 1.5, 2, 0, 0
  description: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
}

export const ATTENDANCE_STATUS_OPTIONS: StatusOptionInfo[] = [
  {
    key: 'present',
    canonicalKey: 'present',
    shortCode: 'P',
    label: 'Present',
    fullLabel: 'Present (P)',
    value: 1,
    description: 'Full Day Work (Value: 1)',
    badgeBg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    borderColor: 'border-emerald-500/30 dark:border-emerald-500/40',
    dotColor: 'bg-emerald-500'
  },
  {
    key: 'half_day',
    canonicalKey: 'half_day',
    shortCode: '1/2',
    label: 'Half Day',
    fullLabel: 'Half Day (1/2)',
    value: 0.5,
    description: 'Half Day (Value: 0.5)',
    badgeBg: 'bg-cyan-500/15 dark:bg-cyan-500/20',
    textColor: 'text-cyan-700 dark:text-cyan-400',
    borderColor: 'border-cyan-500/30 dark:border-cyan-500/40',
    dotColor: 'bg-cyan-500'
  },
  {
    key: 'one_and_half_day',
    canonicalKey: 'one_and_half_day',
    shortCode: 'P1/2',
    label: '1.5 Day',
    fullLabel: '1.5 Day (P1/2)',
    value: 1.5,
    description: '1.5 Day (Value: 1.5)',
    badgeBg: 'bg-blue-500/15 dark:bg-blue-500/20',
    textColor: 'text-blue-700 dark:text-blue-400',
    borderColor: 'border-blue-500/30 dark:border-blue-500/40',
    dotColor: 'bg-blue-500'
  },
  {
    key: 'double_shift',
    canonicalKey: 'double_shift',
    shortCode: 'PP',
    label: 'Double Hajri',
    fullLabel: 'Double Hajri (PP)',
    value: 2,
    description: 'Double Hajri (Value: 2)',
    badgeBg: 'bg-purple-500/15 dark:bg-purple-500/20',
    textColor: 'text-purple-700 dark:text-purple-400',
    borderColor: 'border-purple-500/30 dark:border-purple-500/40',
    dotColor: 'bg-purple-500'
  },
  {
    key: 'absent',
    canonicalKey: 'absent',
    shortCode: 'A',
    label: 'Absent',
    fullLabel: 'Absent (A)',
    value: 0,
    description: 'Missed Day (Value: 0)',
    badgeBg: 'bg-rose-500/15 dark:bg-rose-500/20',
    textColor: 'text-rose-700 dark:text-rose-400',
    borderColor: 'border-rose-500/30 dark:border-rose-500/40',
    dotColor: 'bg-rose-500'
  },
  {
    key: 'leave',
    canonicalKey: 'leave',
    shortCode: 'L',
    label: 'Leave',
    fullLabel: 'Leave (L)',
    value: 0,
    description: 'Approved Leave (Value: 0)',
    badgeBg: 'bg-amber-500/15 dark:bg-amber-500/20',
    textColor: 'text-amber-700 dark:text-amber-400',
    borderColor: 'border-amber-500/30 dark:border-amber-500/40',
    dotColor: 'bg-amber-500'
  }
];

export function getAttendanceStatusMeta(status: AttendanceStatus | string | undefined): StatusOptionInfo {
  if (!status) return ATTENDANCE_STATUS_OPTIONS[0]; // fallback Present

  const normalized = String(status).toLowerCase().trim();

  if (normalized === 'half_day' || normalized === '1/2' || normalized === '0.5') {
    return ATTENDANCE_STATUS_OPTIONS[1];
  }
  if (normalized === 'one_and_half_day' || normalized === 'p1/2' || normalized === '1.5') {
    return ATTENDANCE_STATUS_OPTIONS[2];
  }
  if (normalized === 'double_shift' || normalized === 'pp' || normalized === '2' || normalized === 'double' || normalized === 'double_hajri') {
    return ATTENDANCE_STATUS_OPTIONS[3];
  }
  if (normalized === 'absent' || normalized === 'a') {
    return ATTENDANCE_STATUS_OPTIONS[4];
  }
  if (normalized === 'leave' || normalized === 'l') {
    return ATTENDANCE_STATUS_OPTIONS[5];
  }
  // default 'present' or 'p'
  return ATTENDANCE_STATUS_OPTIONS[0];
}

export function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string, options?: { showDay?: boolean; shortMonth?: boolean }): string {
  const dt = parseDate(dateStr);
  const weekday = dt.toLocaleDateString('en-US', { weekday: options?.showDay ? 'short' : undefined });
  const month = dt.toLocaleDateString('en-US', { month: options?.shortMonth ? 'short' : 'long' });
  const day = dt.getDate();
  const year = dt.getFullYear();

  if (options?.showDay) {
    return `${weekday}, ${month} ${day}, ${year}`;
  }
  return `${month} ${day}, ${year}`;
}

export function getMonthName(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const dt = new Date(y, m - 1, 1);
  return dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function isHoliday(dateStr: string, holidays: AppSettings['holidays']): { isHol: boolean; name?: string } {
  const found = holidays.find((h) => h.date === dateStr);
  return { isHol: !!found, name: found?.name };
}

export function isWorkingDay(dateStr: string, settings: AppSettings): boolean {
  const dt = parseDate(dateStr);
  const dayOfWeek = dt.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  if (!settings.workingDays.includes(dayOfWeek)) return false;
  if (isHoliday(dateStr, settings.holidays).isHol) return false;
  return true;
}

// Helper to tally a record into counters
function tallyAttendanceRecord(
  rec: AttendanceRecord | undefined,
  counters: {
    presentCount: number;
    halfDayCount: number;
    oneAndHalfDayCount: number;
    doubleShiftCount: number;
    absentCount: number;
    leaveCount: number;
    totalAttendanceValue: number;
    totalWorkingHours: number;
  }
) {
  if (!rec) return;
  const meta = getAttendanceStatusMeta(rec.status);

  switch (meta.canonicalKey) {
    case 'present':
      counters.presentCount++;
      counters.totalAttendanceValue += 1;
      if (rec.workingHours) counters.totalWorkingHours += rec.workingHours;
      break;
    case 'half_day':
      counters.halfDayCount++;
      counters.totalAttendanceValue += 0.5;
      if (rec.workingHours) counters.totalWorkingHours += rec.workingHours;
      break;
    case 'one_and_half_day':
      counters.oneAndHalfDayCount++;
      counters.totalAttendanceValue += 1.5;
      if (rec.workingHours) counters.totalWorkingHours += rec.workingHours;
      break;
    case 'double_shift':
      counters.doubleShiftCount++;
      counters.totalAttendanceValue += 2;
      if (rec.workingHours) counters.totalWorkingHours += rec.workingHours;
      break;
    case 'absent':
      counters.absentCount++;
      break;
    case 'leave':
      counters.leaveCount++;
      break;
  }
}

// Calculate metrics for current month or specified period
export function calculateAttendanceMetrics(
  records: Record<string, AttendanceRecord>,
  settings: AppSettings,
  scope: 'month' | 'overall' | 'year' = 'month',
  selectedYearMonth?: string
): AttendanceMetrics {
  const todayStr = getTodayDateStr();
  const todayDate = parseDate(todayStr);
  const currentYearMonth = todayStr.substring(0, 7); // '2026-08'
  const targetYearMonth = selectedYearMonth || currentYearMonth;
  const [targetYear, targetMonth] = targetYearMonth.split('-').map(Number);

  const counters = {
    presentCount: 0,
    halfDayCount: 0,
    oneAndHalfDayCount: 0,
    doubleShiftCount: 0,
    absentCount: 0,
    leaveCount: 0,
    totalAttendanceValue: 0,
    totalWorkingHours: 0
  };

  let totalWorkingDays = 0;
  let totalDaysInMonth = 0;

  if (scope === 'month') {
    totalDaysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const isCurrentMonth = targetYearMonth === currentYearMonth;
    const maxDay = isCurrentMonth ? todayDate.getDate() : totalDaysInMonth;

    for (let day = 1; day <= maxDay; day++) {
      const dayStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isWork = isWorkingDay(dayStr, settings);

      if (isWork) {
        totalWorkingDays++;
      }

      const rec = records[dayStr];
      tallyAttendanceRecord(rec, counters);
    }
  } else if (scope === 'year') {
    const year = targetYear;
    const isCurrentYear = year === todayDate.getFullYear();
    const endMonth = isCurrentYear ? todayDate.getMonth() + 1 : 12;

    for (let m = 1; m <= endMonth; m++) {
      const daysInM = new Date(year, m, 0).getDate();
      const maxD = isCurrentYear && m === endMonth ? todayDate.getDate() : daysInM;

      for (let d = 1; d <= maxD; d++) {
        const dayStr = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isWork = isWorkingDay(dayStr, settings);
        if (isWork) totalWorkingDays++;

        const rec = records[dayStr];
        tallyAttendanceRecord(rec, counters);
      }
    }
    totalDaysInMonth = 365;
  } else {
    // Overall / All-time
    const allRecords = Object.values(records);
    allRecords.forEach((rec) => {
      tallyAttendanceRecord(rec, counters);
    });

    const allDates = allRecords.map((r) => r.date).sort();
    if (allDates.length > 0) {
      const startDt = parseDate(allDates[0]);
      const endDt = todayDate;
      let curr = new Date(startDt);
      while (curr <= endDt) {
        const dStr = formatDateStr(curr);
        if (isWorkingDay(dStr, settings)) {
          totalWorkingDays++;
        }
        curr.setDate(curr.getDate() + 1);
      }
    } else {
      totalWorkingDays = 0;
    }
    totalDaysInMonth = totalWorkingDays;
  }

  // Attendance Percentage based on totalAttendanceValue vs totalWorkingDays
  let attendancePercentage = 0;
  if (totalWorkingDays > 0) {
    attendancePercentage = Number(((counters.totalAttendanceValue / totalWorkingDays) * 100).toFixed(1));
  } else if (counters.totalAttendanceValue > 0) {
    attendancePercentage = 100;
  }

  // Streaks
  const { currentStreak, bestStreak } = calculateStreaks(records, settings);

  // Target Forecast Calculations
  const targetGoal = settings.targetPercentage || 75;
  const isTargetAchieved = attendancePercentage >= targetGoal;

  let neededDays = 0;
  let canMissDays = 0;

  if (targetGoal < 100) {
    const numerator = (targetGoal * totalWorkingDays) - (100 * counters.totalAttendanceValue);
    if (numerator > 0) {
      neededDays = Math.ceil(numerator / (100 - targetGoal));
    }

    const missNumerator = (100 * counters.totalAttendanceValue) - (targetGoal * totalWorkingDays);
    if (missNumerator > 0) {
      canMissDays = Math.floor(missNumerator / targetGoal);
    }
  }

  const effectivePresentCount = counters.presentCount + counters.halfDayCount + counters.oneAndHalfDayCount + counters.doubleShiftCount;
  const avgHoursPerDay = effectivePresentCount > 0 ? (counters.totalWorkingHours / effectivePresentCount).toFixed(1) + 'h' : '0.0h';

  return {
    totalWorkingDays,
    totalDaysInMonth,
    presentCount: counters.presentCount,
    halfDayCount: counters.halfDayCount,
    oneAndHalfDayCount: counters.oneAndHalfDayCount,
    doubleShiftCount: counters.doubleShiftCount,
    absentCount: counters.absentCount,
    leaveCount: counters.leaveCount,
    totalAttendanceValue: Number(counters.totalAttendanceValue.toFixed(1)),
    attendancePercentage,
    currentStreak,
    bestStreak,
    neededDays,
    canMissDays,
    isTargetAchieved,
    totalWorkingHours: Number(counters.totalWorkingHours.toFixed(1)),
    avgHoursPerDay
  };
}

// Calculate Current Streak and Best Streak
export function calculateStreaks(
  records: Record<string, AttendanceRecord>,
  settings: AppSettings
): { currentStreak: number; bestStreak: number } {
  const todayStr = getTodayDateStr();
  const today = parseDate(todayStr);

  const recordDates = Object.keys(records).sort();
  if (recordDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const startDate = parseDate(recordDates[0]);
  let currentRunningStreak = 0;
  let maxStreak = 0;
  let activeStreak = 0;

  let curr = new Date(startDate);
  const chronologicalWorkingDays: { dateStr: string; status: 'present' | 'absent' | 'leave' | 'unrecorded' }[] = [];

  while (curr <= today) {
    const dStr = formatDateStr(curr);
    const isWork = isWorkingDay(dStr, settings);

    if (isWork) {
      const rec = records[dStr];
      if (rec) {
        const meta = getAttendanceStatusMeta(rec.status);
        if (meta.canonicalKey === 'present' || meta.canonicalKey === 'half_day' || meta.canonicalKey === 'one_and_half_day' || meta.canonicalKey === 'double_shift') {
          chronologicalWorkingDays.push({ dateStr: dStr, status: 'present' });
        } else if (meta.canonicalKey === 'leave') {
          chronologicalWorkingDays.push({ dateStr: dStr, status: 'leave' });
        } else {
          chronologicalWorkingDays.push({ dateStr: dStr, status: 'absent' });
        }
      } else if (dStr < todayStr) {
        chronologicalWorkingDays.push({ dateStr: dStr, status: 'unrecorded' });
      }
    }
    curr.setDate(curr.getDate() + 1);
  }

  // Iterate chronologically to compute best streak
  for (const item of chronologicalWorkingDays) {
    if (item.status === 'present') {
      currentRunningStreak++;
      if (currentRunningStreak > maxStreak) {
        maxStreak = currentRunningStreak;
      }
    } else if (item.status === 'leave') {
      // Leave does not break streak
    } else if (item.status === 'absent' || item.status === 'unrecorded') {
      currentRunningStreak = 0;
    }
  }

  // Calculate current streak working backwards from today
  for (let i = chronologicalWorkingDays.length - 1; i >= 0; i--) {
    const item = chronologicalWorkingDays[i];
    if (item.status === 'present') {
      activeStreak++;
    } else if (item.status === 'leave') {
      // Skip leave without breaking active streak
    } else {
      break;
    }
  }

  return {
    currentStreak: activeStreak,
    bestStreak: Math.max(maxStreak, activeStreak)
  };
}

// Generate Monthly Summary Rows for statistics table
export function getMonthlySummaryList(
  records: Record<string, AttendanceRecord>,
  settings: AppSettings,
  limitMonths: number = 12
): MonthlySummaryRow[] {
  const todayStr = getTodayDateStr();
  const today = parseDate(todayStr);
  const list: MonthlySummaryRow[] = [];

  for (let i = 0; i < limitMonths; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const metrics = calculateAttendanceMetrics(records, settings, 'month', ym);
    const totalDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

    list.push({
      yearMonth: ym,
      monthLabel: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      totalDays,
      workingDays: metrics.totalWorkingDays,
      presentCount: metrics.presentCount,
      halfDayCount: metrics.halfDayCount,
      oneAndHalfDayCount: metrics.oneAndHalfDayCount,
      doubleShiftCount: metrics.doubleShiftCount,
      absentCount: metrics.absentCount,
      leaveCount: metrics.leaveCount,
      totalAttendanceValue: metrics.totalAttendanceValue,
      attendancePercentage: metrics.attendancePercentage
    });
  }

  return list;
}

// Predefined Progressive Streak Milestones
export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    id: 'starter',
    name: 'Unlit Spark',
    minStreak: 0,
    iconName: 'sparkles',
    badgeColor: 'slate',
    bgGradient: 'from-slate-500/15 via-slate-600/10 to-slate-700/15',
    borderColor: 'border-slate-300 dark:border-slate-700',
    textColor: 'text-slate-700 dark:text-slate-300',
    glowColor: 'shadow-slate-500/10',
    title: 'Start Your Streak',
    description: 'Log consecutive working days to unlock multi-day badges.',
    multiplierText: 'Tier 0'
  },
  {
    id: 'spark',
    name: 'First Spark',
    minStreak: 1,
    iconName: 'zap',
    badgeColor: 'amber',
    bgGradient: 'from-amber-500/20 via-orange-500/15 to-yellow-500/20',
    borderColor: 'border-amber-400 dark:border-amber-600',
    textColor: 'text-amber-700 dark:text-amber-300',
    glowColor: 'shadow-amber-500/20',
    title: '1 Day Strong',
    description: 'First day logged! Keep the momentum going tomorrow.',
    multiplierText: '1x Momentum'
  },
  {
    id: 'flame',
    name: 'Rising Flame',
    minStreak: 2,
    iconName: 'flame',
    badgeColor: 'orange',
    bgGradient: 'from-orange-500/25 via-amber-500/20 to-red-500/25',
    borderColor: 'border-orange-400 dark:border-orange-500',
    textColor: 'text-orange-700 dark:text-orange-300',
    glowColor: 'shadow-orange-500/30',
    title: 'Multi-Day Streak Active',
    description: 'Consecutive attendance unlocked! You are building real discipline.',
    multiplierText: '2x Streak'
  },
  {
    id: 'warrior',
    name: 'Workweek Champion',
    minStreak: 5,
    iconName: 'star',
    badgeColor: 'emerald',
    bgGradient: 'from-emerald-500/25 via-teal-500/20 to-green-500/25',
    borderColor: 'border-emerald-400 dark:border-emerald-500',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    glowColor: 'shadow-emerald-500/30',
    title: 'Full Workweek Master',
    description: 'A full 5-day cycle of consecutive attendance logged!',
    multiplierText: '5x Flawless'
  },
  {
    id: 'blaze',
    name: 'Blazing Week',
    minStreak: 7,
    iconName: 'trophy',
    badgeColor: 'indigo',
    bgGradient: 'from-indigo-600/30 via-purple-600/20 to-sky-600/30',
    borderColor: 'border-indigo-400 dark:border-indigo-500',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    glowColor: 'shadow-indigo-500/35',
    title: '7-Day Blaze',
    description: 'Over a week of perfect attendance without a missed day.',
    multiplierText: '7x Power'
  },
  {
    id: 'inferno',
    name: 'Fortnight Inferno',
    minStreak: 14,
    iconName: 'award',
    badgeColor: 'rose',
    bgGradient: 'from-rose-600/30 via-pink-600/25 to-red-600/30',
    borderColor: 'border-rose-400 dark:border-rose-500',
    textColor: 'text-rose-700 dark:text-rose-300',
    glowColor: 'shadow-rose-500/40',
    title: '14-Day Inferno',
    description: 'Two unbroken weeks of exemplary dedication and attendance.',
    multiplierText: '14x Dominance'
  },
  {
    id: 'habit',
    name: 'Habit Pioneer',
    minStreak: 21,
    iconName: 'shield',
    badgeColor: 'violet',
    bgGradient: 'from-violet-600/30 via-purple-600/25 to-fuchsia-600/30',
    borderColor: 'border-violet-400 dark:border-violet-500',
    textColor: 'text-violet-700 dark:text-violet-300',
    glowColor: 'shadow-violet-500/40',
    title: '21-Day Habit Master',
    description: 'Psychologically proven habit formation achieved.',
    multiplierText: '21x Habit'
  },
  {
    id: 'legend',
    name: 'Immortal Titan',
    minStreak: 30,
    iconName: 'crown',
    badgeColor: 'amber',
    bgGradient: 'from-amber-500/35 via-yellow-400/30 to-amber-600/35',
    borderColor: 'border-amber-400 dark:border-amber-300',
    textColor: 'text-amber-800 dark:text-amber-200',
    glowColor: 'shadow-amber-500/50',
    title: '30+ Days Supreme',
    description: 'Maximum echelon! Flawless dedication of an undisputed legend.',
    multiplierText: '30x Supreme'
  }
];

export function getStreakTierInfo(currentStreak: number, bestStreak: number): StreakTierInfo {
  let currentTier = STREAK_MILESTONES[0];
  let nextTier: StreakMilestone | undefined = STREAK_MILESTONES[1];

  for (let i = STREAK_MILESTONES.length - 1; i >= 0; i--) {
    if (currentStreak >= STREAK_MILESTONES[i].minStreak) {
      currentTier = STREAK_MILESTONES[i];
      nextTier = STREAK_MILESTONES[i + 1];
      break;
    }
  }

  let progressToNext = 100;
  let daysToNext = 0;

  if (nextTier) {
    const range = nextTier.minStreak - currentTier.minStreak;
    const progress = currentStreak - currentTier.minStreak;
    progressToNext = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
    daysToNext = Math.max(0, nextTier.minStreak - currentStreak);
  }

  const isMultiDayStreak = currentStreak >= 2;
  const isNewRecord = currentStreak > 0 && currentStreak >= bestStreak;

  return {
    currentTier,
    nextTier,
    progressToNext,
    daysToNext,
    isMultiDayStreak,
    isNewRecord
  };
}
