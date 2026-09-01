import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Trash2, Clock, FileText, AlertTriangle } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, AppSettings } from '../types';
import {
  formatDisplayDate,
  isWorkingDay,
  isHoliday,
  ATTENDANCE_STATUS_OPTIONS,
  getAttendanceStatusMeta
} from '../services/calculations';

interface AttendanceRecordModalProps {
  isOpen: boolean;
  dateStr: string | null;
  record?: AttendanceRecord;
  initialStatus?: AttendanceStatus;
  settings: AppSettings;
  onClose: () => void;
  onSave: (record: AttendanceRecord) => void;
  onDelete: (dateStr: string) => void;
}

export const AttendanceRecordModal: React.FC<AttendanceRecordModalProps> = ({
  isOpen,
  dateStr,
  record,
  initialStatus = 'present',
  settings,
  onClose,
  onSave,
  onDelete
}) => {
  const [status, setStatus] = useState<AttendanceStatus>('present');
  const [note, setNote] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (record) {
      const meta = getAttendanceStatusMeta(record.status);
      setStatus(meta.canonicalKey);
      setNote(record.note || '');
      setCheckIn(record.checkIn || '');
      setCheckOut(record.checkOut || '');
    } else {
      const meta = getAttendanceStatusMeta(initialStatus);
      setStatus(meta.canonicalKey);
      setNote('');
      setCheckIn('');
      setCheckOut('');
    }
    setShowDeleteConfirm(false);
  }, [record, dateStr, isOpen, initialStatus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !dateStr) return null;

  const displayDate = formatDisplayDate(dateStr, { showDay: true });
  const isWork = isWorkingDay(dateStr, settings);
  const holInfo = isHoliday(dateStr, settings.holidays);

  const calculateHours = (inTime: string, outTime: string): number | undefined => {
    if (!inTime || !outTime) return undefined;
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) return undefined;

    let inMin = inH * 60 + inM;
    let outMin = outH * 60 + outM;
    if (outMin < inMin) outMin += 24 * 60; // overnight
    if (outMin === inMin) return 0;
    return Number(((outMin - inMin) / 60).toFixed(2));
  };

  const isWorkStatus = status === 'present' || status === 'half_day' || status === 'one_and_half_day' || status === 'double_shift' || status === 'P' || status === '1/2' || status === 'P1/2' || status === 'PP';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = calculateHours(checkIn, checkOut);
    const updatedRecord: AttendanceRecord = {
      id: record?.id || `rec-${dateStr}`,
      date: dateStr,
      status,
      note: note.trim() || undefined,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      workingHours: hours,
      createdAt: record?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSave(updatedRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {record ? 'Edit Attendance' : 'Record Attendance'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {displayDate}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Holiday or Non-working day badge info */}
        {holInfo.isHol && (
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-sky-800 dark:text-sky-300 text-xs flex items-center gap-2">
            <span className="font-semibold">Holiday:</span> {holInfo.name} (Non-working day)
          </div>
        )}
        {!isWork && !holInfo.isHol && (
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 text-xs">
            Configured weekend / non-working day
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 6 Attendance Status Buttons Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Attendance Option
              </label>
              <span className="text-[11px] text-slate-500">6 Status Options</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ATTENDANCE_STATUS_OPTIONS.map((opt) => {
                const currentMeta = getAttendanceStatusMeta(status);
                const isSelected = currentMeta.canonicalKey === opt.canonicalKey;

                return (
                  <button
                    key={opt.canonicalKey}
                    type="button"
                    onClick={() => setStatus(opt.canonicalKey)}
                    className={`py-3 px-2.5 rounded-2xl border text-left flex flex-col justify-between gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`font-mono text-xs font-black px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                      }`}>
                        {opt.shortCode}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      }`}>
                        Val: {opt.value}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">
                        {opt.label}
                      </div>
                      <div className={`text-[10px] leading-tight truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {opt.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Work Hours (For Working shifts) */}
          {isWorkStatus && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Optional Working Hours
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Check-in Time
                  </label>
                  <input
                    type="time"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Check-out Time
                  </label>
                  <input
                    type="time"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Optional Note */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Optional Note
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Full shift, Half day, Double hajri cover, Approved leave..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Delete Confirmation Box if triggered */}
          {showDeleteConfirm && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                Delete this record?
              </div>
              <p className="text-[11px] text-rose-600 dark:text-rose-300">
                Are you sure you want to delete the attendance entry for {dateStr}?
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(dateStr);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {record && !showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Save Record
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
