import { AttendanceRecord, AppSettings, HolidayItem } from '../types';

export const STORAGE_RECORDS_KEY = 'self_attendance_records_v2';
export const STORAGE_SETTINGS_KEY = 'self_attendance_settings_v2';
export const APP_VERSION = '2.0.0';

export const DEFAULT_SETTINGS: AppSettings = {
  userName: 'User',
  workingDays: [1, 2, 3, 4, 5], // Mon-Fri
  holidays: [
    { id: 'hol-1', date: '2026-01-01', name: "New Year's Day" },
    { id: 'hol-2', date: '2026-07-04', name: 'Independence Day' },
    { id: 'hol-3', date: '2026-12-25', name: 'Christmas Day' }
  ],
  targetPercentage: 75,
  theme: 'system',
  isFirstLaunchComplete: false,
  storageVersion: 2
};

// Generates initial realistic seed sample data around current month
export function generateSampleRecords(): Record<string, AttendanceRecord> {
  const records: Record<string, AttendanceRecord> = {};
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Create sample records for current month up to today or up to 20 days ago
  const daysToGenerate = Math.min(today.getDate(), 25);

  for (let d = 1; d <= daysToGenerate; d++) {
    const dt = new Date(year, month, d);
    const dayOfWeek = dt.getDay();
    // Default working days: Mon (1) to Fri (5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const padMonth = String(month + 1).padStart(2, '0');
      const padDay = String(d).padStart(2, '0');
      const dateStr = `${year}-${padMonth}-${padDay}`;

      // Simulate mostly present, occasional leave, rarely absent
      let status: 'present' | 'absent' | 'leave' = 'present';
      let note: string | undefined = undefined;
      let checkIn: string | undefined = '09:00';
      let checkOut: string | undefined = '17:30';
      let workingHours = 8.5;

      if (d === 6 || d === 14) {
        status = 'leave';
        note = d === 6 ? 'Personal appointment' : 'Medical checkup';
        checkIn = undefined;
        checkOut = undefined;
        workingHours = 0;
      } else if (d === 19) {
        status = 'absent';
        note = 'Sick day';
        checkIn = undefined;
        checkOut = undefined;
        workingHours = 0;
      }

      records[dateStr] = {
        id: `rec-${dateStr}`,
        date: dateStr,
        status,
        note,
        checkIn,
        checkOut,
        workingHours,
        createdAt: dt.toISOString(),
        updatedAt: dt.toISOString()
      };
    }
  }

  return records;
}

// In-memory fallback if localStorage is blocked
let memoryRecordsCache: Record<string, AttendanceRecord> | null = null;
let memorySettingsCache: AppSettings | null = null;

export const storageService = {
  getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          workingDays: Array.isArray(parsed.workingDays) ? parsed.workingDays : DEFAULT_SETTINGS.workingDays,
          holidays: Array.isArray(parsed.holidays) ? parsed.holidays : DEFAULT_SETTINGS.holidays
        };
      }
    } catch (e) {
      console.warn('Could not read settings from localStorage, using memory cache/defaults', e);
      if (memorySettingsCache) return memorySettingsCache;
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    memorySettingsCache = settings;
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to write settings to localStorage', e);
    }
  },

  getRecords(): Record<string, AttendanceRecord> {
    try {
      const stored = localStorage.getItem(STORAGE_RECORDS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          // Normalize legacy keys if any
          const normalized: Record<string, AttendanceRecord> = {};
          Object.entries(parsed).forEach(([dateStr, val]: [string, any]) => {
            if (val && typeof val === 'object') {
              let status: 'present' | 'absent' | 'leave' = 'present';
              const rawStatus = String(val.status).toLowerCase();
              if (rawStatus.includes('absent')) status = 'absent';
              else if (rawStatus.includes('leave') || rawStatus.includes('half')) status = 'leave';
              else status = 'present';

              normalized[dateStr] = {
                id: val.id || `rec-${dateStr}`,
                date: val.date || dateStr,
                status,
                note: val.note || val.notes || '',
                checkIn: val.checkIn,
                checkOut: val.checkOut,
                workingHours: val.workingHours,
                createdAt: val.createdAt || new Date().toISOString(),
                updatedAt: val.updatedAt || new Date().toISOString()
              };
            }
          });
          return normalized;
        }
      }

      // Check legacy key v1 migration
      const legacy = localStorage.getItem('self_attendance_records');
      if (legacy) {
        const legacyParsed = JSON.parse(legacy);
        const migrated: Record<string, AttendanceRecord> = {};
        Object.entries(legacyParsed).forEach(([dateStr, val]: [string, any]) => {
          let status: 'present' | 'absent' | 'leave' = 'present';
          const raw = String(val?.status || '').toUpperCase();
          if (raw === 'ABSENT') status = 'absent';
          else if (raw === 'HALF_DAY' || raw === 'LEAVE') status = 'leave';
          else status = 'present';

          migrated[dateStr] = {
            id: `migrated-${dateStr}`,
            date: dateStr,
            status,
            note: val?.notes || '',
            checkIn: val?.checkIn,
            checkOut: val?.checkOut,
            workingHours: val?.workingHours,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        });
        this.saveRecords(migrated);
        return migrated;
      }
    } catch (e) {
      console.warn('Could not read records from localStorage, using fallback', e);
      if (memoryRecordsCache) return memoryRecordsCache;
    }

    // Default to sample records on clean start
    const initial = generateSampleRecords();
    this.saveRecords(initial);
    return initial;
  },

  saveRecords(records: Record<string, AttendanceRecord>): void {
    memoryRecordsCache = records;
    try {
      localStorage.setItem(STORAGE_RECORDS_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to write records to localStorage', e);
    }
  },

  exportBackupJSON(records: Record<string, AttendanceRecord>, settings: AppSettings): string {
    const backupData = {
      app: 'Self Attendance Tracker',
      version: APP_VERSION,
      exportDate: new Date().toISOString(),
      settings,
      records
    };
    return JSON.stringify(backupData, null, 2);
  },

  validateAndImportJSON(jsonText: string): {
    success: boolean;
    recordsCount?: number;
    error?: string;
    data?: { records: Record<string, AttendanceRecord>; settings: AppSettings };
  } {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Invalid JSON file structure.' };
      }

      let importedRecords: Record<string, AttendanceRecord> = {};
      const rawRecords = parsed.records || parsed;

      if (rawRecords && typeof rawRecords === 'object') {
        Object.entries(rawRecords).forEach(([dateKey, val]: [string, any]) => {
          if (val && typeof val === 'object' && val.date) {
            let status: 'present' | 'absent' | 'leave' = 'present';
            const rawStatus = String(val.status || '').toLowerCase();
            if (rawStatus.includes('absent')) status = 'absent';
            else if (rawStatus.includes('leave') || rawStatus.includes('half')) status = 'leave';
            else status = 'present';

            importedRecords[val.date] = {
              id: val.id || `rec-${val.date}`,
              date: val.date,
              status,
              note: val.note || val.notes || '',
              checkIn: val.checkIn,
              checkOut: val.checkOut,
              workingHours: typeof val.workingHours === 'number' ? val.workingHours : undefined,
              createdAt: val.createdAt || new Date().toISOString(),
              updatedAt: val.updatedAt || new Date().toISOString()
            };
          }
        });
      }

      const importedSettings: AppSettings = {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {}),
        workingDays: Array.isArray(parsed.settings?.workingDays) ? parsed.settings.workingDays : DEFAULT_SETTINGS.workingDays,
        holidays: Array.isArray(parsed.settings?.holidays) ? parsed.settings.holidays : DEFAULT_SETTINGS.holidays
      };

      const count = Object.keys(importedRecords).length;
      if (count === 0 && !parsed.settings) {
        return { success: false, error: 'No valid attendance records or settings found in file.' };
      }

      return {
        success: true,
        recordsCount: count,
        data: {
          records: importedRecords,
          settings: importedSettings
        }
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Could not parse JSON file.' };
    }
  },

  exportHistoryCSV(records: Record<string, AttendanceRecord>): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const sorted = Object.values(records).sort((a, b) => b.date.localeCompare(a.date));

    const headers = ['Date', 'Day', 'Status', 'Working Hours', 'Note'];
    const rows = sorted.map((rec) => {
      const [year, month, day] = rec.date.split('-').map(Number);
      const dt = new Date(year, month - 1, day);
      const dayName = days[dt.getDay()] || '';
      const displayStatus = rec.status.toUpperCase();
      const hours = rec.workingHours ? rec.workingHours.toString() : '';
      const safeNote = `"${(rec.note || '').replace(/"/g, '""')}"`;
      return [rec.date, dayName, displayStatus, hours, safeNote].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  },

  clearAllData(): void {
    memoryRecordsCache = {};
    memorySettingsCache = { ...DEFAULT_SETTINGS };
    try {
      localStorage.removeItem(STORAGE_RECORDS_KEY);
      localStorage.removeItem(STORAGE_SETTINGS_KEY);
      localStorage.removeItem('self_attendance_records');
    } catch (e) {
      console.error('Failed to clear localStorage', e);
    }
  }
};
