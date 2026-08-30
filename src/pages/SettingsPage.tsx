import React, { useState, useRef } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Calendar,
  Plus,
  Trash2,
  Download,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  ShieldCheck,
  Info,
  RefreshCw,
  Check
} from 'lucide-react';
import { AppSettings, AttendanceRecord, HolidayItem } from '../types';
import { storageService, APP_VERSION } from '../services/storage';

interface SettingsPageProps {
  settings: AppSettings;
  records: Record<string, AttendanceRecord>;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onImportData: (records: Record<string, AttendanceRecord>, settings: AppSettings) => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  records,
  onUpdateSettings,
  onImportData,
  onResetSampleData,
  onClearAllData,
  onShowToast
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // New holiday form state
  const [newHolDate, setNewHolDate] = useState('');
  const [newHolName, setNewHolName] = useState('');
  const [isAddingHol, setIsAddingHol] = useState(false);

  // Clear data confirm modal state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const weekdays = [
    { day: 1, label: 'Monday' },
    { day: 2, label: 'Tuesday' },
    { day: 3, label: 'Wednesday' },
    { day: 4, label: 'Thursday' },
    { day: 5, label: 'Friday' },
    { day: 6, label: 'Saturday' },
    { day: 0, label: 'Sunday' }
  ];

  const handleToggleDay = (day: number) => {
    let updatedDays: number[];
    if (settings.workingDays.includes(day)) {
      if (settings.workingDays.length <= 1) {
        onShowToast('You must have at least one working day selected.', 'warning');
        return;
      }
      updatedDays = settings.workingDays.filter((d) => d !== day);
    } else {
      updatedDays = [...settings.workingDays, day].sort();
    }
    onUpdateSettings({ ...settings, workingDays: updatedDays });
    onShowToast('Updated working schedule', 'info');
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolDate || !newHolName.trim()) {
      onShowToast('Please specify both date and holiday name.', 'error');
      return;
    }

    const newHol: HolidayItem = {
      id: `hol-${Date.now()}`,
      date: newHolDate,
      name: newHolName.trim()
    };

    const updated = [...settings.holidays, newHol].sort((a, b) => a.date.localeCompare(b.date));
    onUpdateSettings({ ...settings, holidays: updated });
    setNewHolDate('');
    setNewHolName('');
    setIsAddingHol(false);
    onShowToast(`Added holiday: ${newHol.name}`, 'success');
  };

  const handleDeleteHoliday = (id: string) => {
    const updated = settings.holidays.filter((h) => h.id !== id);
    onUpdateSettings({ ...settings, holidays: updated });
    onShowToast('Removed holiday', 'info');
  };

  const handleExportJSON = () => {
    const jsonStr = storageService.exportBackupJSON(records, settings);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `attendance-backup-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported backup JSON successfully', 'success');
  };

  const handleExportCSV = () => {
    const csvStr = storageService.exportHistoryCSV(records);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `attendance-history-${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported attendance CSV successfully', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = storageService.validateAndImportJSON(content);
      if (result.success && result.data) {
        onImportData(result.data.records, result.data.settings);
        onShowToast(`Successfully imported ${result.recordsCount} records & settings!`, 'success');
      } else {
        onShowToast(result.error || 'Failed to parse JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const recordsCount = Object.keys(records).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
          Preferences & Controls
        </span>
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
          Application Settings
        </h2>
      </div>

      {/* PRIVACY NOTICE CARD */}
      <div className="bg-gradient-to-r from-emerald-900/90 to-slate-900 text-white rounded-3xl p-5 border border-emerald-700/40 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-emerald-200">
            100% Local-First & Private
          </h3>
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            Your attendance data is stored locally on this device. No attendance data is sent to a server.
            The app works completely offline without requiring any API keys or network connection.
          </p>
        </div>
      </div>

      {/* APPEARANCE THEME */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sun className="w-4 h-4 text-indigo-500" />
          Appearance Theme
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Laptop }
          ].map((themeOpt) => {
            const Icon = themeOpt.icon;
            const isSelected = settings.theme === themeOpt.id;
            return (
              <button
                key={themeOpt.id}
                onClick={() => onUpdateSettings({ ...settings, theme: themeOpt.id as any })}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {themeOpt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PERSONAL INFO & TARGET GOAL */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Personal Profile & Goal
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={settings.userName}
              onChange={(e) => onUpdateSettings({ ...settings, userName: e.target.value })}
              placeholder="Your name"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Attendance Goal
              </label>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                {settings.targetPercentage}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={settings.targetPercentage}
              onChange={(e) => onUpdateSettings({ ...settings, targetPercentage: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg mt-2"
            />
          </div>
        </div>
      </div>

      {/* WORKING SCHEDULE SETTINGS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Working Schedule
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select which weekdays constitute your active working days.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            {settings.workingDays.length} days/week
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {weekdays.map((item) => {
            const isSelected = settings.workingDays.includes(item.day);
            return (
              <label
                key={item.day}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleDay(item.day)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold">{item.label}</span>
                </div>
                <span className="text-[11px] font-semibold opacity-70">
                  {isSelected ? 'Working day' : 'Weekend/Off'}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* HOLIDAYS MANAGEMENT */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Public & Company Holidays
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Holidays are exempt from working day calculations and do not count as absent.
            </p>
          </div>

          <button
            onClick={() => setIsAddingHol(!isAddingHol)}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Holiday
          </button>
        </div>

        {/* Add Holiday Form */}
        {isAddingHol && (
          <form onSubmit={handleAddHoliday} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in duration-150">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Add New Holiday
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Holiday Date</label>
                <input
                  type="date"
                  required
                  value={newHolDate}
                  onChange={(e) => setNewHolDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Holiday Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Labor Day"
                  value={newHolName}
                  onChange={(e) => setNewHolName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingHol(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                Save Holiday
              </button>
            </div>
          </form>
        )}

        {/* Holidays List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
          {settings.holidays.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No holidays configured.
            </div>
          ) : (
            settings.holidays.map((h) => (
              <div key={h.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-lg">
                    {h.date}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {h.name}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteHoliday(h.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Remove holiday"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DATA BACKUP & RESTORE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Data Management & Backup
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Export your complete attendance database as a JSON backup or spreadsheet CSV.
        </p>

        {/* Hidden File input for JSON import */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleExportJSON}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            Export JSON Backup
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4 text-indigo-500" />
            Import JSON Backup
          </button>

          <button
            onClick={handleExportCSV}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            Export CSV
          </button>
        </div>

        {/* Reset / Clear Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onResetSampleData}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Load Sample Demonstration Data
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All Data ({recordsCount} records)
          </button>
        </div>

        {/* Clear Confirmation Box */}
        {showClearConfirm && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4" />
              Delete all attendance data? This cannot be undone.
            </div>
            <p className="text-xs text-rose-700 dark:text-rose-400">
              We recommend exporting a JSON backup first. All recorded attendance entries and customized holidays will be permanently erased.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAllData();
                  setShowClearConfirm(false);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                Yes, Erase Everything
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ABOUT & APP INFO */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 dark:text-slate-300">Self Attendance Tracker</span>
          <span className="font-mono">v{APP_VERSION}</span>
        </div>
        <p>
          Designed for speed, simplicity, and complete offline autonomy.
        </p>
      </div>
    </div>
  );
};
