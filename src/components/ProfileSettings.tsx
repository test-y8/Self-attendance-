import React, { useState, useRef } from 'react';
import {
  User,
  Clock,
  Sliders,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Check,
  Save,
  FileSpreadsheet,
  Printer,
  Copy
} from 'lucide-react';
import { AttendanceRecord, UserProfile } from '../types';
import { exportAttendanceToCSV, parseCSVToAttendance, calculateMetrics, generateAttendanceSummaryText } from '../utils/attendance';
import { ConfirmationModal } from './ConfirmationModal';

interface ProfileSettingsProps {
  userProfile: UserProfile;
  targetPercentage: number;
  records: Record<string, AttendanceRecord>;
  onUpdateUserProfile: (profile: Partial<UserProfile>) => void;
  onUpdateTarget: (target: number) => void;
  onRestoreRecords: (records: Record<string, AttendanceRecord>) => void;
  onResetToSampleData: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  userProfile,
  targetPercentage,
  records,
  onUpdateUserProfile,
  onUpdateTarget,
  onRestoreRecords,
  onResetToSampleData,
  onShowToast
}) => {
  const [name, setName] = useState(userProfile.name);
  const [role, setRole] = useState(userProfile.role);
  const [email, setEmail] = useState(userProfile.email);
  const [defaultCheckIn, setDefaultCheckIn] = useState(userProfile.defaultCheckIn);
  const [defaultCheckOut, setDefaultCheckOut] = useState(userProfile.defaultCheckOut);
  const [target, setTarget] = useState(targetPercentage);
  const [saved, setSaved] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const jsonInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUserProfile({
      name: name.trim() || 'User',
      role: role.trim() || 'Professional',
      email: email.trim() || 'user@example.com',
      defaultCheckIn,
      defaultCheckOut
    });
    onUpdateTarget(target);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onShowToast('Profile preferences saved!', 'success');
  };

  const handleCopySummary = () => {
    const metrics = calculateMetrics(records, targetPercentage);
    const summary = generateAttendanceSummaryText(metrics, userProfile.name, targetPercentage);
    navigator.clipboard.writeText(summary);
    onShowToast('Summary report copied to clipboard!', 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const data = {
      userProfile,
      targetPercentage,
      records,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `self-attendance-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast('JSON backup exported successfully!', 'success');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.records) {
          onRestoreRecords(parsed.records);
          if (parsed.targetPercentage) onUpdateTarget(parsed.targetPercentage);
          if (parsed.userProfile) onUpdateUserProfile(parsed.userProfile);
          onShowToast('Data restored from JSON backup!', 'success');
        } else {
          onShowToast('Invalid backup file format.', 'error');
        }
      } catch {
        onShowToast('Failed to parse JSON backup file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = parseCSVToAttendance(event.target?.result as string);
        if (Object.keys(parsed).length > 0) {
          onRestoreRecords({ ...records, ...parsed });
          onShowToast(`Imported ${Object.keys(parsed).length} records from CSV!`, 'success');
        } else {
          onShowToast('No valid attendance records found in CSV.', 'error');
        }
      } catch {
        onShowToast('Failed to parse CSV file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile & Shift Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Personal & Shift Settings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize your profile, shift timings, and default targets
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Attendance Goal (%)
              </label>
              <input
                type="number"
                min="50"
                max="99"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                Default Check-in Time
              </label>
              <input
                type="time"
                value={defaultCheckIn}
                onChange={(e) => setDefaultCheckIn(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Default Check-out Time
              </label>
              <input
                type="time"
                value={defaultCheckOut}
                onChange={(e) => setDefaultCheckOut(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {saved ? 'Saved!' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>

      {/* Data Management & Backup */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Data Management & Backup
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export and import your attendance history securely
            </p>
          </div>
        </div>

        <input
          type="file"
          ref={jsonInputRef}
          onChange={handleImportJSON}
          accept=".json"
          className="hidden"
        />
        <input
          type="file"
          ref={csvInputRef}
          onChange={handleImportCSV}
          accept=".csv"
          className="hidden"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            Backup JSON
          </button>

          <button
            onClick={() => jsonInputRef.current?.click()}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-500" />
            Restore JSON
          </button>

          <button
            onClick={() => csvInputRef.current?.click()}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
            Import CSV
          </button>

          <button
            onClick={handleCopySummary}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Copy className="w-4 h-4 text-indigo-500" />
            Copy Summary
          </button>
        </div>

        {/* Print report action */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Timesheet & Report Print
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Print a clean formatted attendance report or save as PDF
            </span>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-500" />
            Print / PDF Timesheet
          </button>
        </div>

        {/* Reset to sample data */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Sample Initial Data
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Reset app to a fresh set of realistic demo entries
            </span>
          </div>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Sample Data
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        title="Reset to Sample Data"
        message="Are you sure you want to reset all attendance records to default sample data? Any unbacked-up custom entries will be replaced."
        confirmLabel="Reset All Records"
        confirmVariant="danger"
        onConfirm={() => {
          onResetToSampleData();
          onShowToast('Reset to sample attendance records.', 'info');
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
