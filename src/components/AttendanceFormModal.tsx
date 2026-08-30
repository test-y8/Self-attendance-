import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  SunMedium,
  Sparkles,
  Clock,
  FileText,
  Save
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { calculateWorkingHours, formatDisplayDate } from '../utils/attendance';

interface AttendanceFormModalProps {
  dateStr: string;
  existingRecord?: AttendanceRecord;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  onSave: (record: AttendanceRecord) => void;
  onClose: () => void;
  hasWorkspaceAuth: boolean;
}

export const AttendanceFormModal: React.FC<AttendanceFormModalProps> = ({
  dateStr,
  existingRecord,
  defaultCheckIn = '09:00',
  defaultCheckOut = '17:30',
  onSave,
  onClose,
  hasWorkspaceAuth
}) => {
  const [status, setStatus] = useState<AttendanceStatus>(existingRecord?.status || 'PRESENT');
  const [checkIn, setCheckIn] = useState<string>(existingRecord?.checkIn || defaultCheckIn);
  const [checkOut, setCheckOut] = useState<string>(existingRecord?.checkOut || defaultCheckOut);
  const [notes, setNotes] = useState<string>(existingRecord?.notes || '');
  const [syncCalendar, setSyncCalendar] = useState<boolean>(existingRecord?.syncedToGoogleCalendar || false);

  // Auto recalculate working hours
  const calculatedHours = (status === 'PRESENT' || status === 'HALF_DAY')
    ? calculateWorkingHours(checkIn, checkOut)
    : undefined;

  useEffect(() => {
    if (existingRecord) {
      setStatus(existingRecord.status);
      setCheckIn(existingRecord.checkIn || defaultCheckIn);
      setCheckOut(existingRecord.checkOut || defaultCheckOut);
      setNotes(existingRecord.notes || '');
      setSyncCalendar(existingRecord.syncedToGoogleCalendar || false);
    }
  }, [existingRecord, defaultCheckIn, defaultCheckOut]);

  const handleSetCurrentTimeCheckIn = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    setCheckIn(`${h}:${m}`);
  };

  const handleSetCurrentTimeCheckOut = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    setCheckOut(`${h}:${m}`);
  };

  const handlePresetHalfDay = () => {
    setStatus('HALF_DAY');
    setCheckIn('09:00');
    setCheckOut('13:30');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const record: AttendanceRecord = {
      date: dateStr,
      status,
      checkIn: (status === 'PRESENT' || status === 'HALF_DAY') ? checkIn : undefined,
      checkOut: (status === 'PRESENT' || status === 'HALF_DAY') ? checkOut : undefined,
      workingHours: (status === 'PRESENT' || status === 'HALF_DAY') ? calculatedHours : undefined,
      notes: notes.trim() || undefined,
      syncedToGoogleCalendar: syncCalendar
    };

    onSave(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {existingRecord ? 'Edit Attendance' : 'Mark Attendance'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatDisplayDate(dateStr)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Status Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Attendance Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setStatus('PRESENT')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                  status === 'PRESENT'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Present</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('ABSENT')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                  status === 'ABSENT'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Absent</span>
              </button>

              <button
                type="button"
                onClick={handlePresetHalfDay}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                  status === 'HALF_DAY'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <SunMedium className="w-4 h-4" />
                <span>Half Day</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('HOLIDAY')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                  status === 'HOLIDAY'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Holiday</span>
              </button>
            </div>
          </div>

          {/* Time punch inputs if Present or Half Day */}
          {(status === 'PRESENT' || status === 'HALF_DAY') && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Check In */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Check-in
                    </label>
                    <button
                      type="button"
                      onClick={handleSetCurrentTimeCheckIn}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      Now
                    </button>
                  </div>
                  <input
                    type="time"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Check Out */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Check-out
                    </label>
                    <button
                      type="button"
                      onClick={handleSetCurrentTimeCheckOut}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      Now
                    </button>
                  </div>
                  <input
                    type="time"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {calculatedHours !== undefined && calculatedHours > 0 && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    Calculated duration:
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {calculatedHours} hrs
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Notes input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Notes / Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., On-site client meeting, remote workday, sprint review..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Sync to Google Calendar option */}
          {hasWorkspaceAuth && (
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 cursor-pointer">
              <input
                type="checkbox"
                checked={syncCalendar}
                onChange={(e) => setSyncCalendar(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-xs font-medium text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Sync directly to Google Calendar
              </span>
            </label>
          )}

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
