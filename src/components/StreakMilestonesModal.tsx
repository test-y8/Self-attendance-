import React from 'react';
import {
  X,
  Flame,
  Zap,
  Star,
  Trophy,
  Award,
  Crown,
  Shield,
  Sparkles,
  CheckCircle2,
  Lock,
  PartyPopper
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StreakMilestone, StreakTierInfo } from '../types';
import { STREAK_MILESTONES } from '../services/calculations';

interface StreakMilestonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  bestStreak: number;
  tierInfo: StreakTierInfo;
}

export const StreakMilestonesModal: React.FC<StreakMilestonesModalProps> = ({
  isOpen,
  onClose,
  currentStreak,
  bestStreak,
  tierInfo
}) => {
  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ef4444', '#6366f1', '#10b981', '#ec4899']
    });
  };

  const getIcon = (iconName: StreakMilestone['iconName'], isUnlocked: boolean) => {
    const className = `w-5 h-5 ${isUnlocked ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`;
    switch (iconName) {
      case 'flame':
        return <Flame className={className} />;
      case 'zap':
        return <Zap className={className} />;
      case 'star':
        return <Star className={className} />;
      case 'trophy':
        return <Trophy className={className} />;
      case 'award':
        return <Award className={className} />;
      case 'crown':
        return <Crown className={className} />;
      case 'shield':
        return <Shield className={className} />;
      case 'sparkles':
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <div
      id="streak-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="streak-milestones-modal"
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Flame className="w-32 h-32" />
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  Attendance Streak Journey
                </h2>
                <p className="text-xs text-amber-100 font-medium">
                  Unlock milestone badges through unbroken attendance
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Stats Ribbon */}
          <div className="mt-4 grid grid-cols-2 gap-3 bg-black/15 backdrop-blur-md rounded-2xl p-3 border border-white/10 relative z-10">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200 block">
                Current Active Streak
              </span>
              <div className="text-2xl font-black font-mono flex items-baseline gap-1">
                {currentStreak}
                <span className="text-xs font-normal text-amber-200">days</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200 block">
                All-Time Best Streak
              </span>
              <div className="text-2xl font-black font-mono flex items-baseline gap-1">
                {bestStreak}
                <span className="text-xs font-normal text-amber-200">days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Milestone List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold px-1">
            <span>MILESTONE TIERS</span>
            <span>{currentStreak > 0 ? `${currentStreak} Days Recorded` : '0 Days'}</span>
          </div>

          <div className="space-y-2.5">
            {STREAK_MILESTONES.map((milestone) => {
              const isUnlocked = currentStreak >= milestone.minStreak && milestone.minStreak > 0;
              const isCurrent = tierInfo.currentTier.id === milestone.id;
              const isNext = tierInfo.nextTier?.id === milestone.id;

              return (
                <div
                  key={milestone.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/40 ring-2 ring-amber-500/20'
                      : isUnlocked
                      ? 'bg-slate-50/70 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800'
                      : 'bg-slate-50/30 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        isUnlocked || isCurrent
                          ? `bg-gradient-to-br ${
                              milestone.badgeColor === 'amber'
                                ? 'from-amber-500 to-orange-500'
                                : milestone.badgeColor === 'orange'
                                ? 'from-orange-500 to-red-500'
                                : milestone.badgeColor === 'emerald'
                                ? 'from-emerald-500 to-teal-600'
                                : milestone.badgeColor === 'indigo'
                                ? 'from-indigo-600 to-purple-600'
                                : milestone.badgeColor === 'rose'
                                ? 'from-rose-600 to-pink-600'
                                : milestone.badgeColor === 'violet'
                                ? 'from-violet-600 to-fuchsia-600'
                                : 'from-slate-600 to-slate-800'
                            } text-white`
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {getIcon(milestone.iconName, isUnlocked || isCurrent)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {milestone.name}
                        </h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
                            Active
                          </span>
                        )}
                        {isNext && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                            Next Target
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-xs font-mono font-black text-slate-900 dark:text-slate-100 block">
                      {milestone.minStreak === 0 ? 'Start' : `${milestone.minStreak} Days`}
                    </span>
                    {isUnlocked ? (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Unlocked
                      </span>
                    ) : isNext ? (
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        {tierInfo.daysToNext} more day{tierInfo.daysToNext > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 flex items-center justify-end gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Immunity Notice */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300">
            <span className="font-bold block mb-0.5">🛡️ Streak Immunity Rule</span>
            Scheduled rest days (e.g. Saturdays, Sundays) and configured public holidays never break your active attendance streak. Only unrecorded or absent working days reset it.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={triggerConfetti}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5"
          >
            <PartyPopper className="w-4 h-4 text-amber-500" />
            Celebrate Streak
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
