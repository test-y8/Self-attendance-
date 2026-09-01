import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  AttendanceRecord,
  AttendanceStatus,
  AppSettings,
  NavigationTab,
  ToastItem
} from './types';
import { storageService, APP_VERSION, generateSampleRecords } from './services/storage';
import {
  calculateAttendanceMetrics,
  getTodayDateStr,
  getAttendanceStatusMeta
} from './services/calculations';
import { triggerConfetti } from './utils/confetti';

// Components (Eager loaded shell)
import { Header } from './components/Header';
import { AppShell } from './components/AppShell';
import { ToastContainer } from './components/Toast';

// Primary Default Page (Eagerly loaded for instant first paint)
import { CalendarPage } from './pages/CalendarPage';

// Lazy-loaded Secondary Pages (Loaded on demand for ultra-fast startup)
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then(m => ({ default: m.HistoryPage })));
const StatisticsPage = lazy(() => import('./pages/StatisticsPage').then(m => ({ default: m.StatisticsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Lazy-loaded Modals
const AttendanceRecordModal = lazy(() =>
  import('./components/AttendanceRecordModal').then(m => ({ default: m.AttendanceRecordModal }))
);
const ConfirmationModal = lazy(() =>
  import('./components/ConfirmationModal').then(m => ({ default: m.ConfirmationModal }))
);
const KeyboardShortcutsModal = lazy(() =>
  import('./components/KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal }))
);
const FirstLaunchModal = lazy(() =>
  import('./components/FirstLaunchModal').then(m => ({ default: m.FirstLaunchModal }))
);

function TabFallback() {
  return (
    <div className="w-full min-h-[300px] flex items-center justify-center p-8">
      <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  // 1. App Settings State (Theme, Target, Working Days, Holidays, Profile)
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());

  // 2. Attendance Records State (Date -> Record map)
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>(() =>
    storageService.getRecords()
  );

  // 3. Navigation Tab (Default to Calendar with purple accent as requested)
  const [currentTab, setCurrentTab] = useState<NavigationTab>('calendar');

  // 4. Modals & Sheet State
  const [activeDateModal, setActiveDateModal] = useState<string | null>(null);
  const [initialModalStatus, setInitialModalStatus] = useState<AttendanceStatus>('present');
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(
    () => !settings.isFirstLaunchComplete
  );

  // 5. Toast Notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 6. Theme Management with document element class synchronization
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (settings.theme === 'dark') return true;
    if (settings.theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    let dark = false;
    if (settings.theme === 'dark') {
      dark = true;
    } else if (settings.theme === 'light') {
      dark = false;
    } else {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    setIsDarkMode(dark);

    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleToggleTheme = () => {
    const nextTheme = isDarkMode ? 'light' : 'dark';
    const updated = { ...settings, theme: nextTheme as 'light' | 'dark' };
    setSettings(updated);
    storageService.saveSettings(updated);
    showToast(`Switched to ${nextTheme} mode`, 'info');
  };

  // 7. Update Settings handler
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  };

  // 8. Update Records handler
  const handleUpdateRecords = (newRecords: Record<string, AttendanceRecord>) => {
    setRecords(newRecords);
    storageService.saveRecords(newRecords);
  };

  // 9. Metrics Calculation
  const todayStr = getTodayDateStr();
  const currentMonthYM = todayStr.substring(0, 7);
  const currentMonthMetrics = useMemo(() => {
    return calculateAttendanceMetrics(records, settings, 'month', currentMonthYM);
  }, [records, settings, currentMonthYM]);

  const todayRecord = records[todayStr];

  // Confetti celebration when target is achieved for month
  useEffect(() => {
    if (currentMonthMetrics.isTargetAchieved && currentMonthMetrics.totalWorkingDays >= 5) {
      const celebrateKey = `has_celebrated_${currentMonthYM}`;
      if (!sessionStorage.getItem(celebrateKey)) {
        triggerConfetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
        sessionStorage.setItem(celebrateKey, 'true');
      }
    }
  }, [currentMonthMetrics.isTargetAchieved, currentMonthMetrics.totalWorkingDays, currentMonthYM]);

  // Quick mark today
  const handleQuickMarkToday = (status: AttendanceStatus) => {
    const existing = records[todayStr];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const meta = getAttendanceStatusMeta(status);
    const isWork = meta.value > 0;
    const defaultHours =
      meta.value === 2 ? 16 : meta.value === 1.5 ? 12 : meta.value === 0.5 ? 4 : meta.value === 1 ? 8 : undefined;

    const newRecord: AttendanceRecord = {
      id: existing?.id || `rec-${todayStr}`,
      date: todayStr,
      status: meta.canonicalKey,
      checkIn: existing?.checkIn || (isWork ? '09:00' : undefined),
      checkOut: existing?.checkOut || (isWork ? '17:30' : undefined),
      workingHours: existing?.workingHours !== undefined ? existing.workingHours : defaultHours,
      note: existing?.note || `Quick-marked on ${timeStr}`,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = { ...records, [todayStr]: newRecord };
    handleUpdateRecords(updated);
    showToast(`Attendance marked as ${meta.label} (${meta.shortCode})`, 'success');
  };

  // Save Modal Record
  const handleSaveModalRecord = (record: AttendanceRecord) => {
    const updated = { ...records, [record.date]: record };
    handleUpdateRecords(updated);
    setActiveDateModal(null);
    showToast(`Saved attendance for ${record.date}`, 'success');
  };

  // Delete Record
  const handleDeleteDateRecord = (dateStr: string) => {
    setRecordToDelete(dateStr);
  };

  const confirmDeleteRecord = () => {
    if (!recordToDelete) return;
    const updated = { ...records };
    delete updated[recordToDelete];
    handleUpdateRecords(updated);
    setRecordToDelete(null);
    if (activeDateModal === recordToDelete) {
      setActiveDateModal(null);
    }
    showToast(`Attendance record cleared for ${recordToDelete}`, 'info');
  };

  // Import JSON Backup
  const handleImportBackup = (
    importedRecords: Record<string, AttendanceRecord>,
    importedSettings: AppSettings
  ) => {
    handleUpdateRecords(importedRecords);
    handleUpdateSettings(importedSettings);
  };

  // Reset to Sample Demonstration Data
  const handleResetSampleData = () => {
    const sample = generateSampleRecords();
    handleUpdateRecords(sample);
    showToast('Loaded sample attendance data', 'info');
  };

  // Clear All Data
  const handleClearAllData = () => {
    storageService.clearAllData();
    setRecords({});
    showToast('All attendance records have been cleared', 'info');
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'p' || e.key === 'P') {
        if (!activeDateModal && !recordToDelete) {
          handleQuickMarkToday('present');
        }
      } else if (e.key === 'a' || e.key === 'A') {
        if (!activeDateModal && !recordToDelete) {
          handleQuickMarkToday('absent');
        }
      } else if (e.key === 'l' || e.key === 'L') {
        if (!activeDateModal && !recordToDelete) {
          handleQuickMarkToday('leave');
        }
      } else if (e.key === 't' || e.key === 'T') {
        setActiveDateModal(todayStr);
      } else if (e.key === '1') {
        setCurrentTab('home');
      } else if (e.key === '2') {
        setCurrentTab('calendar');
      } else if (e.key === '3') {
        setCurrentTab('history');
      } else if (e.key === '4') {
        setCurrentTab('stats');
      } else if (e.key === '5') {
        setCurrentTab('settings');
      } else if (e.key === 'Escape') {
        setActiveDateModal(null);
        setRecordToDelete(null);
        setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDateModal, recordToDelete, todayStr, records]);

  // First launch completion
  const handleCompleteFirstLaunch = (partial: Partial<AppSettings>) => {
    const updated: AppSettings = {
      ...settings,
      ...partial,
      isFirstLaunchComplete: true
    };
    handleUpdateSettings(updated);
    setIsFirstLaunch(false);
    showToast(`Welcome, ${updated.userName}! Your preferences have been saved.`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        darkMode={isDarkMode}
        onToggleDarkMode={handleToggleTheme}
        settings={settings}
        todayRecord={todayRecord}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Responsive App Shell */}
      <AppShell currentTab={currentTab} onSelectTab={setCurrentTab}>
        {currentTab === 'calendar' && (
          <CalendarPage
            records={records}
            settings={settings}
            onOpenDateModal={(d, initialStatus = 'present') => {
              setInitialModalStatus(initialStatus);
              setActiveDateModal(d);
            }}
            onQuickMarkAttendance={(status, targetDate) => {
              const d = targetDate || todayStr;
              const existing = records[d];
              const updated: AttendanceRecord = {
                id: existing?.id || `rec-${d}`,
                date: d,
                status,
                note: existing?.note,
                checkIn: existing?.checkIn || (status === 'present' ? '09:00' : undefined),
                checkOut: existing?.checkOut || (status === 'present' ? '17:00' : undefined),
                workingHours: existing?.workingHours || (status === 'present' ? 8 : undefined),
                createdAt: existing?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              handleSaveModalRecord(updated);
            }}
            onToggleDarkMode={handleToggleTheme}
            isDarkMode={isDarkMode}
            onOpenProfile={() => setCurrentTab('settings')}
          />
        )}

        <Suspense fallback={<TabFallback />}>
          {currentTab === 'home' && (
            <Dashboard
              records={records}
              settings={settings}
              metrics={currentMonthMetrics}
              onMarkAttendance={handleQuickMarkToday}
              onOpenDateModal={(d) => setActiveDateModal(d)}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'history' && (
            <HistoryPage
              records={records}
              settings={settings}
              onOpenDateModal={(d) => {
                setInitialModalStatus('present');
                setActiveDateModal(d);
              }}
              onDeleteRecord={handleDeleteDateRecord}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'stats' && (
            <StatisticsPage records={records} settings={settings} />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              settings={settings}
              records={records}
              onUpdateSettings={handleUpdateSettings}
              onImportData={handleImportBackup}
              onResetSampleData={handleResetSampleData}
              onClearAllData={handleClearAllData}
              onShowToast={showToast}
            />
          )}
        </Suspense>
      </AppShell>

      {/* Modals wrapped in lightweight Suspense */}
      <Suspense fallback={null}>
        {/* Attendance Record Modal (Add/Edit) */}
        {activeDateModal && (
          <AttendanceRecordModal
            isOpen={!!activeDateModal}
            dateStr={activeDateModal || todayStr}
            record={activeDateModal ? records[activeDateModal] : undefined}
            initialStatus={initialModalStatus}
            settings={settings}
            onSave={handleSaveModalRecord}
            onDelete={(d) => {
              handleDeleteDateRecord(d);
              setActiveDateModal(null);
            }}
            onClose={() => setActiveDateModal(null)}
          />
        )}

        {/* Delete Confirmation Modal */}
        {recordToDelete && (
          <ConfirmationModal
            isOpen={!!recordToDelete}
            title="Clear Attendance Record"
            message={`Are you sure you want to clear the attendance record for ${recordToDelete}? This will remove it from calculations.`}
            confirmLabel="Clear Record"
            confirmVariant="danger"
            onConfirm={confirmDeleteRecord}
            onCancel={() => setRecordToDelete(null)}
          />
        )}

        {/* Keyboard Shortcuts Modal */}
        {isShortcutsOpen && (
          <KeyboardShortcutsModal
            isOpen={isShortcutsOpen}
            onClose={() => setIsShortcutsOpen(false)}
          />
        )}

        {/* First Launch Onboarding Modal */}
        {isFirstLaunch && (
          <FirstLaunchModal
            isOpen={isFirstLaunch}
            onComplete={handleCompleteFirstLaunch}
          />
        )}
      </Suspense>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
