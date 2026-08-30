import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  SunMedium,
  Check
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { exportAttendanceToCSV, formatDisplayDate, formatTime12h } from '../utils/attendance';

interface AttendanceHistoryProps {
  records: Record<string, AttendanceRecord>;
  onEditRecord: (dateStr: string) => void;
  onDeleteRecord: (dateStr: string) => void;
  onSyncGoogleCalendar?: (record: AttendanceRecord) => void;
  hasWorkspaceAuth: boolean;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({
  records,
  onEditRecord,
  onDeleteRecord,
  onSyncGoogleCalendar,
  hasWorkspaceAuth,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const allRecords = Object.values(records) as AttendanceRecord[];

  const filteredRecords = allRecords
    .filter((r) => {
      // Status filter
      if (statusFilter !== 'ALL' && r.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const dateMatch = r.date.toLowerCase().includes(query);
        const notesMatch = (r.notes || '').toLowerCase().includes(query);
        const statusMatch = r.status.toLowerCase().includes(query);
        return dateMatch || notesMatch || statusMatch;
      }
      return true;
    })
    .sort((a, b) => {
      return sortOrder === 'desc'
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date);
    });

  const handleExportCSV = () => {
    const csvData = exportAttendanceToCSV(records);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `self-attendance-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Attendance CSV exported successfully!', 'success');
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <Check className="w-3 h-3 stroke-[3]" /> Present
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
            <XCircle className="w-3 h-3" /> Absent
          </span>
        );
      case 'HALF_DAY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            <SunMedium className="w-3 h-3" /> Half Day
          </span>
        );
      case 'HOLIDAY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
            <Sparkles className="w-3 h-3" /> Holiday
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-5">
      {/* Header & Export Tool */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Attendance Logs & History</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {filteredRecords.length} records
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search, filter, and inspect past check-ins
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by date (YYYY-MM-DD), notes, or status..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Sort Order Selector */}
          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Sort:</span>
            <strong>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</strong>
          </button>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold pr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {['ALL', 'PRESENT', 'ABSENT', 'HALF_DAY', 'HOLIDAY'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL'
                ? 'All Statuses'
                : st === 'HALF_DAY'
                ? 'Half Day'
                : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-0.5">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No matching attendance records found
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Try adjusting your search terms or status filters.
            </p>
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.date}
              className="p-4 rounded-xl bg-slate-50/70 hover:bg-slate-50 dark:bg-slate-850/60 dark:hover:bg-slate-850 border border-slate-200/70 dark:border-slate-800/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Date and details */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatDisplayDate(rec.date)}
                  </span>
                  {getStatusBadge(rec.status)}
                  {rec.syncedToGoogleCalendar && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      <Sparkles className="w-2.5 h-2.5" /> G-Calendar
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                  {rec.checkIn && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      In: <strong>{formatTime12h(rec.checkIn)}</strong>
                    </span>
                  )}
                  {rec.checkOut && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      Out: <strong>{formatTime12h(rec.checkOut)}</strong>
                    </span>
                  )}
                  {rec.workingHours !== undefined && rec.workingHours > 0 && (
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      ({rec.workingHours} hrs)
                    </span>
                  )}
                </div>

                {rec.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-1 pt-0.5">
                    <FileText className="w-3 h-3 shrink-0" />
                    <span>{rec.notes}</span>
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                {hasWorkspaceAuth && onSyncGoogleCalendar && !rec.syncedToGoogleCalendar && (
                  <button
                    onClick={() => onSyncGoogleCalendar(rec)}
                    className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 transition-colors"
                    title="Sync to Google Calendar"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => onEditRecord(rec.date)}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 transition-colors"
                  title="Edit Record"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onDeleteRecord(rec.date)}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors"
                  title="Delete Record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
