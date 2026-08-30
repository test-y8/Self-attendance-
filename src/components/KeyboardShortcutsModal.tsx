import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'P', description: 'Quick-mark Today as Present' },
    { key: 'A', description: 'Quick-mark Today as Absent' },
    { key: 'H', description: 'Quick-mark Today as Half Day' },
    { key: 'T', description: 'Jump / select Today on Calendar' },
    { key: '1 - 6', description: 'Navigate between application tabs' },
    { key: '?', description: 'Open Keyboard Shortcuts guide' },
    { key: 'Esc', description: 'Close any active modal or sheet' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Keyboard Shortcuts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speed up your daily attendance logging
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {sc.description}
              </span>
              <kbd className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono font-bold text-[11px] shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
