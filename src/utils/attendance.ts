import { AttendanceRecord, AttendanceMetrics, AttendanceStatus } from '../types';

export function getTodayDateStr(): string {
  const now = new Date();
  return formatDateToISO(now);
}

export function formatDateToISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatMonthYear(year: number, monthZeroIndexed: number): string {
  const date = new Date(year, monthZeroIndexed, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function formatTime12h(time24?: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return '';
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${m} ${period}`;
}

export function calculateWorkingHours(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 0;
  const [inH, inM] = checkIn.split(':').map(Number);
  const [outH, outM] = checkOut.split(':').map(Number);
  if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) return 0;

  const inMinutes = inH * 60 + inM;
  let outMinutes = outH * 60 + outM;

  if (outMinutes === inMinutes) {
    return 0;
  }

  // If checkout is numerically smaller than checkin, assume overnight shift (past midnight)
  if (outMinutes < inMinutes) {
    outMinutes += 24 * 60;
  }

  const diffMinutes = outMinutes - inMinutes;
  return Number((diffMinutes / 60).toFixed(2));
}

export function generateAttendanceSummaryText(
  metrics: AttendanceMetrics,
  userName: string,
  targetPercentage: number
): string {
  const statusLine = metrics.isTargetAchieved
    ? `Target Achieved (${metrics.attendancePercentage}% vs ${targetPercentage}% goal) with ${metrics.canMissDays} buffer days.`
    : `Target In-Progress (${metrics.attendancePercentage}% vs ${targetPercentage}% goal). Need ${metrics.neededDays} consecutive days.`;

  return `📊 Self Attendance Summary for ${userName}
-----------------------------------------
• Total Working Days: ${metrics.workingDays}
• Present Days: ${metrics.presentCount}
• Half Days: ${metrics.halfDayCount}
• Absent Days: ${metrics.absentCount}
• Current Attendance: ${metrics.attendancePercentage}%
• Goal: ${targetPercentage}%
• Current Streak: ${metrics.streak} days
• Total Hours Logged: ${metrics.totalWorkingHours} hrs (Avg: ${metrics.avgHoursPerDay})
• Status: ${statusLine}
Generated on ${formatDisplayDate(getTodayDateStr())}`;
}

export function formatHoursAndMinutes(decimalHours: number): string {
  if (!decimalHours || decimalHours <= 0) return '0h 0m';
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
}

export function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

export function calculateMetrics(
  records: Record<string, AttendanceRecord>,
  targetPercentage: number = 75,
  year?: number,
  monthZeroIndexed?: number
): AttendanceMetrics {
  let presentCount = 0;
  let absentCount = 0;
  let halfDayCount = 0;
  let holidayCount = 0;
  let totalWorkingHours = 0;

  const entries = Object.values(records);
  const filteredEntries = (year !== undefined && monthZeroIndexed !== undefined)
    ? entries.filter(r => {
        const [rY, rM] = r.date.split('-').map(Number);
        return rY === year && rM === monthZeroIndexed + 1;
      })
    : entries;

  filteredEntries.forEach(r => {
    if (r.status === 'PRESENT') {
      presentCount += 1;
      totalWorkingHours += r.workingHours || 8;
    } else if (r.status === 'ABSENT') {
      absentCount += 1;
    } else if (r.status === 'HALF_DAY') {
      halfDayCount += 1;
      totalWorkingHours += r.workingHours || 4;
    } else if (r.status === 'HOLIDAY') {
      holidayCount += 1;
    }
  });

  const workingDays = presentCount + absentCount + halfDayCount;
  const effectivePresent = presentCount + 0.5 * halfDayCount;
  const attendancePercentage = workingDays > 0
    ? Number(((effectivePresent / workingDays) * 100).toFixed(1))
    : 0;

  const targetFrac = targetPercentage / 100;
  let neededDays = 0;
  let canMissDays = 0;

  if (workingDays === 0) {
    neededDays = 0;
    canMissDays = 0;
  } else if (attendancePercentage < targetPercentage) {
    // Need x consecutive present days: (P + x) / (W + x) >= targetFrac
    // x * (1 - targetFrac) >= targetFrac * W - P
    if (targetFrac >= 1) {
      neededDays = 999;
    } else {
      const x = (targetFrac * workingDays - effectivePresent) / (1 - targetFrac);
      neededDays = Math.max(0, Math.ceil(x));
    }
  } else {
    // Target achieved! Can miss y days: P / (W + y) >= targetFrac
    // P / targetFrac >= W + y => y = Math.floor(P / targetFrac - W)
    if (targetFrac > 0) {
      const y = effectivePresent / targetFrac - workingDays;
      canMissDays = Math.max(0, Math.floor(y));
    }
  }

  // Calculate streak (consecutive present or half-days sorted descending by date)
  const sortedDates = Object.keys(records).sort().reverse();
  let streak = 0;
  for (const dateStr of sortedDates) {
    const rec = records[dateStr];
    if (rec.status === 'PRESENT' || rec.status === 'HALF_DAY') {
      streak += 1;
    } else if (rec.status === 'ABSENT') {
      break;
    }
    // skip holiday or weekends without breaking streak if not absent
  }

  const avgHours = (presentCount + halfDayCount) > 0
    ? (totalWorkingHours / (presentCount + halfDayCount)).toFixed(1) + 'h'
    : '0h';

  return {
    presentCount,
    absentCount,
    halfDayCount,
    holidayCount,
    workingDays,
    effectivePresent,
    attendancePercentage,
    neededDays,
    canMissDays,
    totalWorkingHours: Number(totalWorkingHours.toFixed(1)),
    avgHoursPerDay: avgHours,
    streak,
    isTargetAchieved: workingDays > 0 && attendancePercentage >= targetPercentage
  };
}

export function generateInitialAttendanceData(): Record<string, AttendanceRecord> {
  const records: Record<string, AttendanceRecord> = {};
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed

  // Generate for current month up to today
  for (let day = 1; day <= today.getDate(); day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = formatDateToISO(date);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend: skip or mark if desired, but we can leave unrecorded or status WEEKEND
      continue;
    }

    // Assign realistic sample status
    if (day === today.getDate()) {
      // Today: marked as Present with ongoing check-in
      records[dateStr] = {
        date: dateStr,
        status: 'PRESENT',
        checkIn: '09:02',
        checkOut: '17:41',
        workingHours: 8.65,
        notes: "Today's attendance recorded. On track!",
        syncedToGoogleCalendar: true
      };
    } else if (day % 7 === 3) {
      // Occasional half day
      records[dateStr] = {
        date: dateStr,
        status: 'HALF_DAY',
        checkIn: '09:15',
        checkOut: '13:30',
        workingHours: 4.25,
        notes: 'Doctor appointment in the afternoon.',
        syncedToGoogleCalendar: false
      };
    } else if (day === 5 || day === 19) {
      // Occasional absent
      records[dateStr] = {
        date: dateStr,
        status: 'ABSENT',
        notes: 'Personal leave / unwell.',
        syncedToGoogleCalendar: false
      };
    } else if (day === 15) {
      records[dateStr] = {
        date: dateStr,
        status: 'HOLIDAY',
        notes: 'Public holiday observation',
        syncedToGoogleCalendar: true
      };
    } else {
      // Normal present day
      const inMin = Math.floor(Math.random() * 20); // 00 to 20
      const inStr = `08:${String(45 + inMin).slice(-2)}`;
      const outMin = Math.floor(Math.random() * 30);
      const outStr = `17:${String(30 + outMin).slice(-2)}`;
      const hrs = calculateWorkingHours(inStr, outStr) || 8.5;

      records[dateStr] = {
        date: dateStr,
        status: 'PRESENT',
        checkIn: inStr,
        checkOut: outStr,
        workingHours: hrs,
        notes: 'Regular on-time attendance.',
        syncedToGoogleCalendar: true
      };
    }
  }

  return records;
}

export function exportAttendanceToCSV(records: Record<string, AttendanceRecord>): string {
  const headers = ['Date', 'Status', 'Check In', 'Check Out', 'Working Hours', 'Notes', 'Google Calendar Synced'];
  const rows = Object.values(records)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(r => [
      r.date,
      r.status,
      r.checkIn || '',
      r.checkOut || '',
      r.workingHours ? r.workingHours.toString() : '',
      `"${(r.notes || '').replace(/"/g, '""')}"`,
      r.syncedToGoogleCalendar ? 'Yes' : 'No'
    ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

export function parseCSVToAttendance(csvText: string): Record<string, AttendanceRecord> {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return {};

  const records: Record<string, AttendanceRecord> = {};
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Simple CSV row parser handling quoted strings
    const parts: string[] = [];
    let inQuotes = false;
    let current = '';

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim());

    if (parts.length >= 2 && parts[0]) {
      const date = parts[0];
      const status = (parts[1].toUpperCase() as AttendanceStatus) || 'PRESENT';
      const checkIn = parts[2] || undefined;
      const checkOut = parts[3] || undefined;
      const workingHours = parts[4] ? parseFloat(parts[4]) : undefined;
      const notes = parts[5] ? parts[5].replace(/^"|"$/g, '') : undefined;
      const syncedToGoogleCalendar = parts[6]?.toLowerCase() === 'yes';

      records[date] = {
        date,
        status,
        checkIn,
        checkOut,
        workingHours,
        notes,
        syncedToGoogleCalendar
      };
    }
  }

  return records;
}
