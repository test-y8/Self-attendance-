import React, { useState } from 'react';
import { Sparkles, Check, Sun, Moon, Laptop, Calendar, ArrowRight } from 'lucide-react';
import { AppSettings } from '../types';

interface FirstLaunchModalProps {
  isOpen: boolean;
  onComplete: (settings: Partial<AppSettings>) => void;
}

export const FirstLaunchModal: React.FC<FirstLaunchModalProps> = ({ isOpen, onComplete }) => {
  const [name, setName] = useState('');
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [target, setTarget] = useState(75);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  if (!isOpen) return null;

  const weekdays = [
    { day: 1, label: 'Mon' },
    { day: 2, label: 'Tue' },
    { day: 3, label: 'Wed' },
    { day: 4, label: 'Thu' },
    { day: 5, label: 'Fri' },
    { day: 6, label: 'Sat' },
    { day: 0, label: 'Sun' }
  ];

  const toggleDay = (day: number) => {
    if (workingDays.includes(day)) {
      if (workingDays.length > 1) {
        setWorkingDays(workingDays.filter((d) => d !== day));
      }
    } else {
      setWorkingDays([...workingDays, day].sort());
    }
  };

  const handleFinish = () => {
    onComplete({
      userName: name.trim() || 'User',
      workingDays,
      targetPercentage: target,
      theme,
      isFirstLaunchComplete: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Welcome to Self Attendance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Your private, offline-first personal attendance tracker. Let's customize your preferences.
          </p>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Your Name <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Working Days */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Working Days
              </label>
              <span className="text-[11px] text-slate-500">
                {workingDays.length} days/week
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {weekdays.map((item) => {
                const isSelected = workingDays.includes(item.day);
                return (
                  <button
                    key={item.day}
                    type="button"
                    onClick={() => toggleDay(item.day)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Goal */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Attendance Goal
              </label>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {target}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>

          {/* Theme */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Appearance Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  theme === 'system'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" /> System
              </button>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleFinish}
            className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
