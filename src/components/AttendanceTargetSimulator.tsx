import React, { useState } from 'react';
import {
  Sliders,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AttendanceMetrics } from '../types';

interface AttendanceTargetSimulatorProps {
  metrics: AttendanceMetrics;
  targetPercentage: number;
  onUpdateTarget: (newTarget: number) => void;
}

export const AttendanceTargetSimulator: React.FC<AttendanceTargetSimulatorProps> = ({
  metrics,
  targetPercentage,
  onUpdateTarget
}) => {
  const [sliderVal, setSliderVal] = useState<number>(targetPercentage);

  // Compute what-if scenarios
  const effectiveP = metrics.effectivePresent;
  const workingD = metrics.workingDays;

  const calculateScenario = (futurePresents: number, futureAbsents: number) => {
    const newWorking = workingD + futurePresents + futureAbsents;
    if (newWorking === 0) return 0;
    const newP = effectiveP + futurePresents;
    return Number(((newP / newWorking) * 100).toFixed(1));
  };

  const scenarios = [
    { label: 'Attend next 3 days', present: 3, absent: 0, icon: '📈' },
    { label: 'Attend next 5 days', present: 5, absent: 0, icon: '🔥' },
    { label: 'Attend next 10 days', present: 10, absent: 0, icon: '🚀' },
    { label: 'Miss 1 upcoming day', present: 0, absent: 1, icon: '⚠️' },
    { label: 'Miss 2 upcoming days', present: 0, absent: 2, icon: '🛑' }
  ];

  // Target requirement calculation for sliderVal
  const targetFrac = sliderVal / 100;
  let neededDaysForSlider = 0;
  let canMissDaysForSlider = 0;

  if (workingD > 0) {
    const currentPct = (effectiveP / workingD) * 100;
    if (currentPct < sliderVal) {
      if (targetFrac < 1) {
        const x = (targetFrac * workingD - effectiveP) / (1 - targetFrac);
        neededDaysForSlider = Math.max(0, Math.ceil(x));
      } else {
        neededDaysForSlider = 999;
      }
    } else {
      if (targetFrac > 0) {
        const y = effectiveP / targetFrac - workingD;
        canMissDaysForSlider = Math.max(0, Math.floor(y));
      }
    }
  }

  const handleApplyTarget = () => {
    onUpdateTarget(sliderVal);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Target Attendance Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive goal modeling & future attendance forecasting
            </p>
          </div>
        </div>
      </div>

      {/* Target Percentage Range Slider */}
      <div className="bg-slate-50 dark:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Target Goal Threshold
          </span>
          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
            {sliderVal}%
          </span>
        </div>

        <input
          type="range"
          min="50"
          max="95"
          step="1"
          value={sliderVal}
          onChange={(e) => setSliderVal(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />

        <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-medium">
          <span>50% (Minimum)</span>
          <span>75% (Standard)</span>
          <span>85% (High)</span>
          <span>95% (Exemplary)</span>
        </div>

        {/* Dynamic calculation outcome */}
        <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-750 flex items-center justify-between flex-wrap gap-3">
          <div>
            {metrics.attendancePercentage >= sliderVal ? (
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <Award className="w-4 h-4" />
                <span>
                  At {sliderVal}%, you can safely miss up to <strong>{canMissDaysForSlider} {canMissDaysForSlider === 1 ? 'day' : 'days'}</strong>!
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                <AlertCircle className="w-4 h-4" />
                <span>
                  To reach {sliderVal}%, you must attend <strong>{neededDaysForSlider} consecutive {neededDaysForSlider === 1 ? 'day' : 'days'}</strong>.
                </span>
              </div>
            )}
          </div>

          {sliderVal !== targetPercentage && (
            <button
              onClick={handleApplyTarget}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
            >
              Set as Target ({sliderVal}%)
            </button>
          )}
        </div>
      </div>

      {/* What-If Scenarios Grid */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          What-If Forecasting
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {scenarios.map((sc, idx) => {
            const projectedPct = calculateScenario(sc.present, sc.absent);
            const diff = (projectedPct - metrics.attendancePercentage).toFixed(1);
            const isPositive = Number(diff) >= 0;

            return (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{sc.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {sc.label}
                    </p>
                    <span
                      className={`text-[11px] font-bold ${
                        isPositive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isPositive ? `+${diff}%` : `${diff}%`}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {projectedPct}%
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    Projected
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Formula Explanation Callout */}
      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-600 dark:text-slate-300 space-y-1">
        <p className="font-semibold text-indigo-950 dark:text-indigo-200">
          How is your attendance calculated?
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          <code className="bg-indigo-100/70 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded font-mono text-indigo-800 dark:text-indigo-200">
            Attendance % = (Full Days + 0.5 × Half Days) / Total Working Days × 100
          </code>
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Holidays and weekends are excluded from working day totals so your score stays completely fair.
        </p>
      </div>
    </div>
  );
};
