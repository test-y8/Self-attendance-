import {
  AttendanceRecord,
  AppSettings,
  AttendanceMetrics,
  MonthlySummaryRow,
  StreakMilestone,
  StreakTierInfo
} from '../types';

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

  let presentCount = 0;
  let absentCount = 0;
  let leaveCount = 0;
  let totalWorkingDays = 0;
  let totalWorkingHours = 0;

  if (scope === 'month') {
    // Days in target month
    const totalDaysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const isCurrentMonth = targetYearMonth === currentYearMonth;
    const maxDay = isCurrentMonth ? todayDate.getDate() : totalDaysInMonth;

    for (let day = 1; day <= maxDay; day++) {
      const dayStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isWork = isWorkingDay(dayStr, settings);

      if (isWork) {
        totalWorkingDays++;
      }

      const rec = records[dayStr];
      if (rec) {
        if (rec.status === 'present') {
          presentCount++;
          if (rec.workingHours) totalWorkingHours += rec.workingHours;
        } else if (rec.status === 'absent') {
          absentCount++;
        } else if (rec.status === 'leave') {
          leaveCount++;
        }
      } else if (isWork && dayStr < todayStr) {
        // Past working day with no record is considered unrecorded or absent
        // We do not inflate absentCount unless user marked it, but workingDays includes it
      }
    }
  } else if (scope === 'year') {
    const year = targetYear;
    // Iterate from Jan 1 through today (if current year) or Dec 31
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
        if (rec) {
          if (rec.status === 'present') {
            presentCount++;
            if (rec.workingHours) totalWorkingHours += rec.workingHours;
          } else if (rec.status === 'absent') {
            absentCount++;
          } else if (rec.status === 'leave') {
            leaveCount++;
          }
        }
      }
    }
  } else {
    // Overall / All-time
    const allRecords = Object.values(records);
    allRecords.forEach((rec) => {
      if (rec.status === 'present') {
        presentCount++;
        if (rec.workingHours) totalWorkingHours += rec.workingHours;
      } else if (rec.status === 'absent') {
        absentCount++;
      } else if (rec.status === 'leave') {
        leaveCount++;
      }
    });

    // Total working days for recorded timeline
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
  }

  // Attendance Percentage
  let attendancePercentage = 0;
  if (totalWorkingDays > 0) {
    attendancePercentage = Number(((presentCount / totalWorkingDays) * 100).toFixed(1));
  } else if (presentCount > 0) {
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
    // Required consecutive present days X: (present + X) / (working + X) >= T / 100
    // => 100*present + 100*X >= T*working + T*X
    // => X*(100 - T) >= T*working - 100*present
    const numerator = (targetGoal * totalWorkingDays) - (100 * presentCount);
    if (numerator > 0) {
      neededDays = Math.ceil(numerator / (100 - targetGoal));
    }

    // Buffer absent days Y: present / (working + Y) >= T / 100
    // => 100*present >= T*working + T*Y
    // => T*Y <= 100*present - T*working
    // => Y = floor((100*present - T*working) / T)
    const missNumerator = (100 * presentCount) - (targetGoal * totalWorkingDays);
    if (missNumerator > 0) {
      canMissDays = Math.floor(missNumerator / targetGoal);
    }
  }

  const avgHoursPerDay = presentCount > 0 ? (totalWorkingHours / presentCount).toFixed(1) + 'h' : '0.0h';

  return {
    totalWorkingDays,
    presentCount,
    absentCount,
    leaveCount,
    attendancePercentage,
    currentStreak,
    bestStreak,
    neededDays,
    canMissDays,
    isTargetAchieved,
    totalWorkingHours: Number(totalWorkingHours.toFixed(1)),
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

  // Find the earliest record date or 90 days ago
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
        chronologicalWorkingDays.push({ dateStr: dStr, status: rec.status });
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
      // Absent or unrecorded breaks active streak
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

    list.push({
      yearMonth: ym,
      monthLabel: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      workingDays: metrics.totalWorkingDays,
      presentCount: metrics.presentCount,
      absentCount: metrics.absentCount,
      leaveCount: metrics.leaveCount,
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
