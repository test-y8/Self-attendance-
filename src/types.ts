export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'HALF_DAY'
  | 'HOLIDAY'
  | 'WEEKEND'
  | 'FUTURE'
  | 'NO_DATA';

export interface AttendanceRecord {
  date: string; // ISO format 'YYYY-MM-DD'
  status: AttendanceStatus;
  checkIn?: string; // '09:02' (24-hour format)
  checkOut?: string; // '17:41' (24-hour format)
  workingHours?: number; // decimal hours (e.g. 8.65)
  notes?: string;
  syncedToGoogleCalendar?: boolean;
  googleCalendarEventId?: string;
}

export interface AttendanceMetrics {
  presentCount: number;
  absentCount: number;
  halfDayCount: number;
  holidayCount: number;
  workingDays: number;
  effectivePresent: number;
  attendancePercentage: number;
  neededDays: number;
  canMissDays: number;
  totalWorkingHours: number;
  avgHoursPerDay: string;
  streak: number;
  isTargetAchieved: boolean;
}

export interface UserProfile {
  name: string;
  role: string;
  defaultCheckIn: string;
  defaultCheckOut: string;
  email: string;
  googleAccessToken?: string;
  googleTokenExpiry?: number;
}

export type NavigationTab = 'home' | 'calendar' | 'history' | 'reports' | 'workspace' | 'profile';

export interface ToastNotification {
  id: number;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export interface CalendarDayInfo {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isFuture: boolean;
  isWeekend: boolean;
  record?: AttendanceRecord;
  status: AttendanceStatus;
}

export interface GoogleFormConfig {
  formId?: string;
  formTitle: string;
  formUrl?: string;
  responsesCount?: number;
  lastSyncedAt?: string;
}
