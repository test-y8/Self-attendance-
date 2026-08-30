import React from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  SunMedium,
  Sparkles,
  Clock,
  FileText,
  Edit3,
  Trash2,
  Calendar
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { formatDisplayDate, formatTime12h } from '../utils/attendance';

interface DateDetailsSheetProps {
  dateStr: string;
  record?: AttendanceRecord;
  onClose: () => void;
  onOpenEditModal: (dateStr: string) => void;
  onDeleteRecord: (dateStr: string) => void;
  onSyncGoogleCalendar?: (record: AttendanceRecord) => void;
  hasWorkspaceAuth: boolean;
}

export const DateDetailsSheet: React.FC<DateDetailsSheetProps> = ({
  dateStr,
  record,
  onClose,
  onOpenEditModal,
  onDeleteRecord,
  onSyncGoogleCalendar,
  hasWorkspaceAuth
}) => {
  const formattedDate = formatDisplayDate(dateStr);

  const getStatusBadge = (status?: AttendanceStatus) => {
    if (!status || status === 'NO_DATA') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          Not Recorded
        </span>
      );
    }

    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" /> Present
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
            <XCircle className="w-3.5 h-3.5" /> Absent
          </span>
        );
      case 'HALF_DAY':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            <SunMedium className="w-3.5 h-3.5" /> Half Day
          </span>
        );
      case 'HOLIDAY':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
            <Sparkles className="w-3.5 h-3.5" /> Holiday
          </span>
        );
      case 'WEEKEND':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            Weekend
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {formattedDate}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Attendance details & time punch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Status badge */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Current Status
            </span>
            <div>{getStatusBadge(record?.status)}</div>
          </div>

          {/* Time punch cards */}
          {record && record.status !== 'ABSENT' && record.status !== 'HOLIDAY' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Check-in
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  {record.checkIn ? formatTime12h(record.checkIn) : 'Not set'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Check-out
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  {record.checkOut ? formatTime12h(record.checkOut) : 'Not set'}
                </span>
              </div>

              {record.workingHours !== undefined && record.workingHours > 0 && (
                <div className="col-span-2 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">
                    Total Hours Worked
                  </span>
                  <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                    {record.workingHours} hrs
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {record?.notes && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                <FileText className="w-3.5 h-3.5" /> Notes / Remarks
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {record.notes}
              </p>
            </div>
          )}

          {/* Google Workspace status */}
          {record && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Google Calendar</span>
              {record.syncedToGoogleCalendar ? (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Synced
                </span>
              ) : (
                <span className="text-slate-400">Not synced</span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850/80 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {record && (
              <button
                onClick={() => {
                  onDeleteRecord(dateStr);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}

            {record && hasWorkspaceAuth && onSyncGoogleCalendar && !record.syncedToGoogleCalendar && (
              <button
                onClick={() => onSyncGoogleCalendar(record)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Sync Calendar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                onClose();
                onOpenEditModal(dateStr);
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {record ? 'Edit Attendance' : 'Mark Attendance'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
