import React from 'react';
import {
  X,
  Calendar,
  Clock,
  FileText,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Sun,
  Coffee,
  Check
} from 'lucide-react';
import { AttendanceRecord, AppSettings, AttendanceStatus } from '../types';
import { formatDisplayDate, isWorkingDay, isHoliday } from '../services/calculations';

interface DayDetailsBottomSheetProps {
  isOpen: boolean;
  dateStr: string | null;
  record?: AttendanceRecord;
  settings: AppSettings;
  onClose: () => void;
  onEdit: (dateStr: string) => void;
  onQuickUpdateStatus?: (dateStr: string, status: AttendanceStatus) => void;
}

export const DayDetailsBottomSheet: React.FC<DayDetailsBottomSheetProps> = ({
  isOpen,
  dateStr,
  record,
  settings,
  onClose,
  onEdit,
  onQuickUpdateStatus
}) => {
  if (!isOpen || !dateStr) return null;

  const displayDate = formatDisplayDate(dateStr, { showDay: true });
  const isWork = isWorkingDay(dateStr, settings);
  const holInfo = isHoliday(dateStr, settings.holidays);

  const status = record?.status;

  const getStatusBadge = () => {
    if (status === 'present') {
      return {
        label: 'Present',
        icon: CheckCircle2,
        bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-500',
        description: 'Recorded as present for scheduled shift'
      };
    }
    if (status === 'absent') {
      return {
        label: 'Absent',
        icon: XCircle,
        bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        dot: 'bg-rose-500',
        description: 'Recorded as absent'
      };
    }
    if (status === 'leave') {
      return {
        label: 'On Leave',
        icon: AlertCircle,
        bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-500',
        description: 'Approved or requested day off'
      };
    }
    if (holInfo.isHol) {
      return {
        label: holInfo.name || 'Public Holiday',
        icon: Sparkles,
        bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        dot: 'bg-sky-400',
        description: 'Official scheduled holiday'
      };
    }
    if (!isWork) {
      return {
        label: 'Scheduled Weekend / Rest Day',
        icon: Coffee,
        bg: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
        dot: 'bg-slate-400',
        description: 'Non-working day'
      };
    }
    return {
      label: 'Unrecorded',
      icon: Clock,
      bg: 'bg-slate-800 text-slate-400 border-slate-700',
      dot: 'bg-slate-500',
      description: 'No attendance logged for this date'
    };
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  return (
    <div
      id="day-details-sheet-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="day-details-sheet"
        className="w-full max-w-lg bg-[#0F172A] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 text-slate-100 max-h-[85vh] overflow-y-auto"
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto -mt-2 mb-1 sm:hidden opacity-60" />

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Attendance Details
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {displayDate}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors border border-slate-700/50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Pill Card */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${statusBadge.bg}`}>
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full shrink-0 ${statusBadge.dot}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">
                  {statusBadge.label}
                </span>
              </div>
              <span className="text-xs opacity-80 block">
                {statusBadge.description}
              </span>
            </div>
          </div>
          <StatusIcon className="w-5 h-5 opacity-70 shrink-0" />
        </div>

        {/* Timing & Hours Details Card */}
        <div className="bg-[#161F37] border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold border-b border-slate-800/80 pb-2.5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-4 h-4 text-purple-400" /> Working Shift & Timing
            </span>
            <span className="font-mono text-purple-400 font-bold">
              {record?.workingHours ? `${record.workingHours} hrs total` : isWork ? 'Standard Shift' : 'Off Day'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Check In
              </span>
              <span className="text-sm font-black font-mono text-slate-100 mt-0.5 block">
                {record?.checkIn || '—'}
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Check Out
              </span>
              <span className="text-sm font-black font-mono text-slate-100 mt-0.5 block">
                {record?.checkOut || '—'}
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Hours
              </span>
              <span className="text-sm font-black font-mono text-purple-300 mt-0.5 block">
                {record?.workingHours !== undefined ? `${record.workingHours}h` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Optional Notes Section */}
        {record?.note ? (
          <div className="bg-[#161F37] border border-slate-800 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Remarks & Notes</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pl-5.5">
              {record.note}
            </p>
          </div>
        ) : (
          <div className="bg-[#161F37]/50 border border-slate-800/60 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>No notes attached to this date.</span>
          </div>
        )}

        {/* 1-Tap Quick Status Buttons (if handler provided) */}
        {onQuickUpdateStatus && (
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Change Status
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onQuickUpdateStatus(dateStr, 'present')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  status === 'present'
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-emerald-400 hover:border-emerald-500/40'
                }`}
              >
                <Check className="w-3.5 h-3.5" /> Present
              </button>

              <button
                type="button"
                onClick={() => onQuickUpdateStatus(dateStr, 'absent')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  status === 'absent'
                    ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-rose-400 hover:border-rose-500/40'
                }`}
              >
                <X className="w-3.5 h-3.5" /> Absent
              </button>

              <button
                type="button"
                onClick={() => onQuickUpdateStatus(dateStr, 'leave')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  status === 'leave'
                    ? 'bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-400 hover:border-amber-500/40'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" /> Leave
              </button>
            </div>
          </div>
        )}

        {/* Action Button: Edit Attendance */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(dateStr);
            }}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Edit3 className="w-4 h-4" />
            {record ? 'Edit Full Attendance' : 'Record Full Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
};
