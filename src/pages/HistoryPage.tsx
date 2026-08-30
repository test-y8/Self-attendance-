import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, AppSettings } from '../types';
import { formatDisplayDate, parseDate } from '../services/calculations';
import { storageService } from '../services/storage';

interface HistoryPageProps {
  records: Record<string, AttendanceRecord>;
  settings: AppSettings;
  onOpenDateModal: (dateStr: string) => void;
  onDeleteRecord: (dateStr: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  records,
  settings,
  onOpenDateModal,
  onDeleteRecord,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const recordsList = useMemo(() => Object.values(records), [records]);

  // Extract distinct available months for dropdown filter
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    recordsList.forEach((r) => {
      const ym = r.date.substring(0, 7);
      monthsSet.add(ym);
    });
    return Array.from(monthsSet).sort().reverse();
  }, [recordsList]);

  // Filtered & Sorted list
  const filteredRecords = useMemo(() => {
    return recordsList
      .filter((rec) => {
        // Status filter
        if (statusFilter !== 'all' && rec.status !== statusFilter) {
          return false;
        }
        // Month filter
        if (monthFilter !== 'all' && !rec.date.startsWith(monthFilter)) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDate = rec.date.includes(q);
          const matchNote = rec.note?.toLowerCase().includes(q);
          if (!matchDate && !matchNote) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return b.date.localeCompare(a.date);
        }
        return a.date.localeCompare(b.date);
      });
  }, [recordsList, searchQuery, statusFilter, monthFilter, sortOrder]);

  const handleExportCSV = () => {
    const csvContent = storageService.exportHistoryCSV(records);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported attendance history to CSV', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header & CSV Action */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
            Attendance Log
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            History & Records ({filteredRecords.length})
          </h2>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 shrink-0 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Export CSV
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by date or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Month Selector */}
          <div>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Months</option>
              {availableMonths.map((ym) => {
                const [y, m] = ym.split('-').map(Number);
                const label = new Date(y, m - 1, 1).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric'
                });
                return (
                  <option key={ym} value={ym}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold mr-1">Status:</span>
          {['all', 'present', 'absent', 'leave'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl font-bold uppercase text-[10px] transition-all capitalize ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* History Records List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No attendance records found
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              No entries match your active search and filter criteria.
            </p>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const displayDate = formatDisplayDate(record.date, { showDay: true });
            const isPresent = record.status === 'present';
            const isAbsent = record.status === 'absent';
            const isLeave = record.status === 'leave';

            return (
              <div
                key={record.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors"
              >
                {/* Left: Date, Badge, Note */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {displayDate}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1 ${
                        isPresent
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : isAbsent
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {isPresent ? '✓ Present' : isAbsent ? '✕ Absent' : '🏖 Leave'}
                    </span>

                    {record.workingHours !== undefined && record.workingHours > 0 && (
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {record.workingHours}h ({record.checkIn} - {record.checkOut})
                      </span>
                    )}
                  </div>

                  {record.note && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      📝 {record.note}
                    </p>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => onOpenDateModal(record.date)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Edit record"
                    aria-label="Edit record"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteRecord(record.date)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete record"
                    aria-label="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
