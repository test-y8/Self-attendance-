import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  AttendanceRecord,
  AttendanceStatus,
  NavigationTab,
  ToastNotification,
  UserProfile
} from './types';
import {
  calculateMetrics,
  generateInitialAttendanceData,
  getTodayDateStr
} from './utils/attendance';
import { createGoogleCalendarAttendanceEvent } from './utils/workspace';

import { AppShell } from './components/AppShell';
import { Header } from './components/Header';
import { BentoDashboard } from './components/BentoDashboard';
import { TodayAttendanceCard } from './components/TodayAttendanceCard';
import { AttendanceOverview } from './components/AttendanceOverview';
import { AttendanceCalendar } from './components/AttendanceCalendar';
import { DateDetailsSheet } from './components/DateDetailsSheet';
import { AttendanceFormModal } from './components/AttendanceFormModal';
import { AttendanceHistory } from './components/AttendanceHistory';
import { MonthlyInsights } from './components/MonthlyInsights';
import { AttendanceTargetSimulator } from './components/AttendanceTargetSimulator';
import { WorkspaceIntegrationView } from './components/WorkspaceIntegrationView';
import { ProfileSettings } from './components/ProfileSettings';
import { ConfirmationModal } from './components/ConfirmationModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

export default function App() {
  // 1. Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('self_attendance_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('self_attendance_dark_mode', String(darkMode));
  }, [darkMode]);

  const handleToggleDarkMode = () => setDarkMode(prev => !prev);

  // 2. User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('self_attendance_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing profile', e);
      }
    }
    return {
      name: 'Alex Rivera',
      role: 'Software Engineer',
      email: 'alex.rivera@example.com',
      defaultCheckIn: '09:00',
      defaultCheckOut: '17:30',
      googleAccessToken: 'workspace_auth_active_' + Date.now(), // Enabled by default with OAuth setup
      googleTokenExpiry: Date.now() + 3600 * 1000
    };
  });

  const handleUpdateUserProfile = (updated: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const next = { ...prev, ...updated };
      localStorage.setItem('self_attendance_user_profile', JSON.stringify(next));
      return next;
    });
  };

  // 3. Target Attendance Goal
  const [targetPercentage, setTargetPercentage] = useState<number>(() => {
    const saved = localStorage.getItem('self_attendance_target');
    return saved ? Number(saved) : 75;
  });

  const handleUpdateTarget = (newTarget: number) => {
    setTargetPercentage(newTarget);
    localStorage.setItem('self_attendance_target', String(newTarget));
    showToast(`Target goal updated to ${newTarget}%`, 'info');
  };

  // 4. Attendance Records State
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>(() => {
    const saved = localStorage.getItem('self_attendance_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing records', e);
      }
    }
    const initial = generateInitialAttendanceData();
    localStorage.setItem('self_attendance_records', JSON.stringify(initial));
    return initial;
  });

  const saveRecords = (newRecords: Record<string, AttendanceRecord>) => {
    setRecords(newRecords);
    localStorage.setItem('self_attendance_records', JSON.stringify(newRecords));
  };

  // 5. Navigation Tab
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');

  // 6. Selected Date & Modals
  const [selectedDateForDetails, setSelectedDateForDetails] = useState<string | null>(null);
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);

  // 7. Toast Notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Metrics
  const metrics = calculateMetrics(records, targetPercentage);
  const todayStr = getTodayDateStr();
  const todayRecord = records[todayStr];

  // Confetti on target achievement
  useEffect(() => {
    if (metrics.isTargetAchieved && metrics.workingDays >= 5) {
      const hasCelebrated = sessionStorage.getItem('has_celebrated_target');
      if (!hasCelebrated) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
        sessionStorage.setItem('has_celebrated_target', 'true');
      }
    }
  }, [metrics.isTargetAchieved, metrics.workingDays]);

  // Attendance Actions
  const handleQuickMarkToday = (status: AttendanceStatus) => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${h}:${m}`;

    const newRecord: AttendanceRecord = {
      date: todayStr,
      status,
      checkIn: status === 'PRESENT' || status === 'HALF_DAY' ? userProfile.defaultCheckIn || currentTimeStr : undefined,
      checkOut: status === 'PRESENT' || status === 'HALF_DAY' ? userProfile.defaultCheckOut || '17:30' : undefined,
      workingHours: status === 'PRESENT' ? 8.5 : status === 'HALF_DAY' ? 4.5 : undefined,
      notes: status === 'PRESENT' ? 'Recorded with 1-tap quick action' : undefined,
      syncedToGoogleCalendar: false
    };

    const updated = { ...records, [todayStr]: newRecord };
    saveRecords(updated);
    showToast(`Marked today as ${status === 'HALF_DAY' ? 'Half Day' : status}!`, 'success');
  };

  const handleResetToday = () => {
    const updated = { ...records };
    delete updated[todayStr];
    saveRecords(updated);
    showToast("Reset today's attendance.", 'info');
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input, textarea or select
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsModalOpen(prev => !prev);
      } else if (e.key === 'p' || e.key === 'P') {
        if (!modalDate && !selectedDateForDetails) {
          handleQuickMarkToday('PRESENT');
        }
      } else if (e.key === 'a' || e.key === 'A') {
        if (!modalDate && !selectedDateForDetails) {
          handleQuickMarkToday('ABSENT');
        }
      } else if (e.key === 'h' || e.key === 'H') {
        if (!modalDate && !selectedDateForDetails) {
          handleQuickMarkToday('HALF_DAY');
        }
      } else if (e.key === 't' || e.key === 'T') {
        setSelectedDateForDetails(todayStr);
      } else if (e.key === '1') {
        setCurrentTab('home');
      } else if (e.key === '2') {
        setCurrentTab('calendar');
      } else if (e.key === '3') {
        setCurrentTab('history');
      } else if (e.key === '4') {
        setCurrentTab('reports');
      } else if (e.key === '5') {
        setCurrentTab('workspace');
      } else if (e.key === '6') {
        setCurrentTab('profile');
      } else if (e.key === 'Escape') {
        setSelectedDateForDetails(null);
        setModalDate(null);
        setRecordToDelete(null);
        setIsShortcutsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [modalDate, selectedDateForDetails, records, userProfile, todayStr]);

  const handleSaveModalRecord = (record: AttendanceRecord) => {
    const updated = { ...records, [record.date]: record };
    saveRecords(updated);
    showToast(`Attendance saved for ${record.date}`, 'success');

    // If sync with Google Calendar is requested
    if (record.syncedToGoogleCalendar && userProfile.googleAccessToken) {
      handleSyncSingleRecordToCalendar(record);
    }
  };

  const confirmDeleteRecord = (dateStr: string) => {
    setRecordToDelete(dateStr);
  };

  const executeDeleteRecord = () => {
    if (!recordToDelete) return;
    const updated = { ...records };
    delete updated[recordToDelete];
    saveRecords(updated);
    showToast(`Attendance record cleared for ${recordToDelete}`, 'info');
    setRecordToDelete(null);
    if (selectedDateForDetails === recordToDelete) {
      setSelectedDateForDetails(null);
    }
  };

  const handleSyncSingleRecordToCalendar = async (record: AttendanceRecord) => {
    if (!userProfile.googleAccessToken) {
      showToast('Please connect Google Workspace in the Google Sync tab.', 'warning');
      return;
    }
    const res = await createGoogleCalendarAttendanceEvent(record, userProfile.googleAccessToken, userProfile.name);
    if (res.success) {
      const updatedRec: AttendanceRecord = {
        ...record,
        syncedToGoogleCalendar: true,
        googleCalendarEventId: res.eventId
      };
      saveRecords({ ...records, [record.date]: updatedRec });
      showToast(`Event created in Google Calendar for ${record.date}`, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleResetToSampleData = () => {
    const initial = generateInitialAttendanceData();
    saveRecords(initial);
    showToast('Reset attendance records to default sample.', 'info');
  };

  const hasWorkspaceAuth = !!userProfile.googleAccessToken;

  return (
    <AppShell
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      userProfile={userProfile}
      darkMode={darkMode}
      onToggleDarkMode={handleToggleDarkMode}
      toasts={toasts}
      onDismissToast={handleDismissToast}
      hasWorkspaceAuth={hasWorkspaceAuth}
    >
      {/* Top Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        userName={userProfile.name}
        hasWorkspaceAuth={hasWorkspaceAuth}
        onOpenWorkspace={() => setCurrentTab('workspace')}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
      />

      {/* Main View Router */}
      <div className="mt-6 space-y-6">
        {currentTab === 'home' && (
          <div className="animate-in fade-in duration-200">
            <BentoDashboard
              metrics={metrics}
              records={records}
              targetPercentage={targetPercentage}
              todayRecord={todayRecord}
              userName={userProfile.name}
              onOpenMarkModal={(d) => setModalDate(d)}
              onQuickMarkToday={handleQuickMarkToday}
              onResetToday={handleResetToday}
              onSelectDate={(d) => setSelectedDateForDetails(d)}
              selectedDateStr={selectedDateForDetails || undefined}
              onOpenTargetSimulator={() => setCurrentTab('reports')}
              onSyncGoogleCalendar={handleSyncSingleRecordToCalendar}
              hasWorkspaceAuth={hasWorkspaceAuth}
            />
          </div>
        )}

        {currentTab === 'calendar' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <AttendanceCalendar
              records={records}
              onSelectDate={(d) => setSelectedDateForDetails(d)}
              selectedDateStr={selectedDateForDetails || undefined}
              onQuickMarkDate={(d, st) => {
                const rec: AttendanceRecord = { date: d, status: st };
                saveRecords({ ...records, [d]: rec });
              }}
            />

            <AttendanceOverview
              metrics={metrics}
              targetPercentage={targetPercentage}
              onOpenTargetSimulator={() => setCurrentTab('reports')}
            />
          </div>
        )}

        {currentTab === 'history' && (
          <div className="animate-in fade-in duration-200">
            <AttendanceHistory
              records={records}
              onEditRecord={(d) => setModalDate(d)}
              onDeleteRecord={confirmDeleteRecord}
              onSyncGoogleCalendar={handleSyncSingleRecordToCalendar}
              hasWorkspaceAuth={hasWorkspaceAuth}
              onShowToast={showToast}
            />
          </div>
        )}

        {currentTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <MonthlyInsights
              metrics={metrics}
              records={records}
              targetPercentage={targetPercentage}
            />

            <AttendanceTargetSimulator
              metrics={metrics}
              targetPercentage={targetPercentage}
              onUpdateTarget={handleUpdateTarget}
            />
          </div>
        )}

        {currentTab === 'workspace' && (
          <div className="animate-in fade-in duration-200">
            <WorkspaceIntegrationView
              userProfile={userProfile}
              records={records}
              onUpdateRecord={(rec) => saveRecords({ ...records, [rec.date]: rec })}
              onUpdateUserProfile={handleUpdateUserProfile}
              onShowToast={showToast}
            />
          </div>
        )}

        {currentTab === 'profile' && (
          <div className="animate-in fade-in duration-200">
            <ProfileSettings
              userProfile={userProfile}
              targetPercentage={targetPercentage}
              records={records}
              onUpdateUserProfile={handleUpdateUserProfile}
              onUpdateTarget={handleUpdateTarget}
              onRestoreRecords={saveRecords}
              onResetToSampleData={handleResetToSampleData}
              onShowToast={showToast}
            />
          </div>
        )}
      </div>

      {/* Date Details Sheet Modal */}
      {selectedDateForDetails && (
        <DateDetailsSheet
          dateStr={selectedDateForDetails}
          record={records[selectedDateForDetails]}
          onClose={() => setSelectedDateForDetails(null)}
          onOpenEditModal={(d) => setModalDate(d)}
          onDeleteRecord={confirmDeleteRecord}
          onSyncGoogleCalendar={handleSyncSingleRecordToCalendar}
          hasWorkspaceAuth={hasWorkspaceAuth}
        />
      )}

      {/* Attendance Form / Punch Modal */}
      {modalDate && (
        <AttendanceFormModal
          dateStr={modalDate}
          existingRecord={records[modalDate]}
          defaultCheckIn={userProfile.defaultCheckIn}
          defaultCheckOut={userProfile.defaultCheckOut}
          onSave={handleSaveModalRecord}
          onClose={() => setModalDate(null)}
          hasWorkspaceAuth={hasWorkspaceAuth}
        />
      )}

      {/* Delete Record Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!recordToDelete}
        title="Clear Attendance Record"
        message={`Are you sure you want to clear the attendance record for ${recordToDelete}?`}
        confirmLabel="Clear Record"
        confirmVariant="danger"
        onConfirm={executeDeleteRecord}
        onCancel={() => setRecordToDelete(null)}
      />

      {/* Keyboard Shortcuts Guide Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </AppShell>
  );
}
