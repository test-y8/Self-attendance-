export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'leave'
  | 'half_day'
  | 'one_and_half_day'
  | 'double_shift'
  | 'P'
  | 'A'
  | 'L'
  | '1/2'
  | 'P1/2'
  | 'PP';

export interface AttendanceRecord {
  id: string;
  date: string; // ISO format 'YYYY-MM-DD'
  status: AttendanceStatus;
  note?: string;
  checkIn?: string; // e.g. '09:00'
  checkOut?: string; // e.g. '17:30'
  workingHours?: number; // decimal hours, e.g. 8.5
  createdAt?: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
}

export interface HolidayItem {
  id: string;
  date: string; // ISO format 'YYYY-MM-DD'
  name: string;
}

export interface AppSettings {
  userName: string;
  workingDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday (Default: [1, 2, 3, 4, 5])
  holidays: HolidayItem[];
  targetPercentage: number; // e.g. 75
  theme: 'light' | 'dark' | 'system';
  isFirstLaunchComplete: boolean;
  storageVersion: number;
}

export interface AttendanceMetrics {
  totalWorkingDays: number;
  totalDaysInMonth: number;
  presentCount: number;
  halfDayCount: number;
  oneAndHalfDayCount: number;
  doubleShiftCount: number;
  absentCount: number;
  leaveCount: number;
  totalAttendanceValue: number;
  attendancePercentage: number;
  currentStreak: number;
  bestStreak: number;
  neededDays: number;
  canMissDays: number;
  isTargetAchieved: boolean;
  totalWorkingHours: number;
  avgHoursPerDay: string;
}

export type NavigationTab = 'home' | 'calendar' | 'history' | 'stats' | 'settings';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export interface ToastNotification {
  id: number;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export interface CalendarDayInfo {
  dateStr: string;
  dayNumber: number;
  dayOfWeek: number; // 0-6
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isFuture: boolean;
  isWorkingDay: boolean;
  isHoliday: boolean;
  holidayName?: string;
  record?: AttendanceRecord;
  status: AttendanceStatus | 'holiday' | 'weekend' | 'future' | 'no_data';
}

export interface MonthlySummaryRow {
  yearMonth: string; // '2026-08'
  monthLabel: string; // 'August 2026'
  totalDays: number;
  workingDays: number;
  presentCount: number;
  halfDayCount: number;
  oneAndHalfDayCount: number;
  doubleShiftCount: number;
  absentCount: number;
  leaveCount: number;
  totalAttendanceValue: number;
  attendancePercentage: number;
}

export interface StreakMilestone {
  id: string;
  name: string;
  minStreak: number;
  iconName: 'sparkles' | 'flame' | 'zap' | 'star' | 'trophy' | 'award' | 'crown' | 'shield';
  badgeColor: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  glowColor: string;
  title: string;
  description: string;
  multiplierText: string;
}

export interface StreakTierInfo {
  currentTier: StreakMilestone;
  nextTier?: StreakMilestone;
  progressToNext: number; // 0 to 100
  daysToNext: number;
  isMultiDayStreak: boolean;
  isNewRecord: boolean;
}
