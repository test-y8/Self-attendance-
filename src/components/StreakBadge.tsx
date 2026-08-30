import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Zap,
  Star,
  Trophy,
  Award,
  Crown,
  Shield,
  Sparkles,
  ChevronRight,
  PartyPopper
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StreakMilestone } from '../types';
import { getStreakTierInfo } from '../services/calculations';
import { StreakMilestonesModal } from './StreakMilestonesModal';

interface StreakBadgeProps {
  currentStreak: number;
  bestStreak: number;
  compact?: boolean;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  currentStreak,
  bestStreak,
  compact = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tierInfo = getStreakTierInfo(currentStreak, bestStreak);
  const prevStreakRef = useRef(currentStreak);

  // Trigger celebration effect automatically when streak increments to a multi-day streak or reaches new milestone
  useEffect(() => {
    if (currentStreak > prevStreakRef.current && currentStreak >= 2) {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#ef4444', '#6366f1', '#10b981']
      });
    }
    prevStreakRef.current = currentStreak;
  }, [currentStreak]);

  const handleCelebrateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    confetti({
      particleCount: 60,
      spread: 55,
      origin: { y: 0.65 },
      colors: ['#f59e0b', '#ef4444', '#ec4899', '#6366f1']
    });
  };

  const getMilestoneIcon = (iconName: StreakMilestone['iconName']) => {
    switch (iconName) {
      case 'flame':
        return <Flame className="w-5 h-5 animate-pulse" />;
      case 'zap':
        return <Zap className="w-5 h-5" />;
      case 'star':
        return <Star className="w-5 h-5" />;
      case 'trophy':
        return <Trophy className="w-5 h-5" />;
      case 'award':
        return <Award className="w-5 h-5" />;
      case 'crown':
        return <Crown className="w-5 h-5" />;
      case 'shield':
        return <Shield className="w-5 h-5" />;
      case 'sparkles':
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  // Compact Badge for Hero/Headers
  if (compact) {
    return (
      <>
        <button
          id="compact-streak-badge-btn"
          onClick={() => setIsModalOpen(true)}
          className={`group px-3.5 py-1.5 rounded-2xl border transition-all flex items-center gap-2 cursor-pointer text-left ${
            tierInfo.isMultiDayStreak
              ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-rose-500/20 border-amber-400/50 hover:border-amber-400 text-amber-900 dark:text-amber-200 shadow-sm'
              : currentStreak === 1
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}
          title="Click to view Streak Roadmap & Milestones"
        >
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
              tierInfo.isMultiDayStreak
                ? 'bg-amber-500 text-white shadow-xs'
                : currentStreak === 1
                ? 'bg-amber-400 text-white'
                : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {tierInfo.isMultiDayStreak ? '🔥' : currentStreak === 1 ? '⚡' : '✨'}
          </div>

          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-black font-mono">
                {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
              </span>
              {tierInfo.isNewRecord && currentStreak >= 2 && (
                <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-white text-[9px] font-black uppercase">
                  Record
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {tierInfo.currentTier.name}
            </span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ml-0.5" />
        </button>

        <StreakMilestonesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentStreak={currentStreak}
          bestStreak={bestStreak}
          tierInfo={tierInfo}
        />
      </>
    );
  }

  // Full Prominent Streak Showcase Card
  return (
    <>
      <div
        id="prominent-streak-badge-card"
        onClick={() => setIsModalOpen(true)}
        className={`group relative rounded-3xl p-5 sm:p-6 border transition-all cursor-pointer overflow-hidden select-none ${
          tierInfo.isMultiDayStreak
            ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-rose-950/40 border-amber-400/60 dark:border-amber-600/50 shadow-md shadow-amber-500/5 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10'
            : currentStreak === 1
            ? 'bg-gradient-to-br from-amber-500/5 to-transparent border-amber-300 dark:border-amber-800 hover:border-amber-400'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        {/* Background Accent Glow & Fire Watermark */}
        {tierInfo.isMultiDayStreak && (
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
        )}

        <div className="relative z-10 space-y-4">
          {/* Top Row: Badge Emblem, Title, Record Chip, and Roadmap Button */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              {/* Dynamic 3D-styled Badge Icon */}
              <div
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105 ${
                  tierInfo.isMultiDayStreak
                    ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-amber-500/25 ring-4 ring-amber-500/20'
                    : currentStreak === 1
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white ring-4 ring-amber-400/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 ring-4 ring-slate-200/50 dark:ring-slate-800/50'
                }`}
              >
                {getMilestoneIcon(tierInfo.currentTier.iconName)}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      tierInfo.isMultiDayStreak
                        ? 'bg-amber-500 text-white shadow-xs'
                        : currentStreak === 1
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tierInfo.isMultiDayStreak ? '🔥 Multi-Day Streak' : tierInfo.currentTier.multiplierText}
                  </span>

                  {tierInfo.isNewRecord && currentStreak >= 2 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold flex items-center gap-1">
                      <Trophy className="w-2.5 h-2.5" /> Best Record
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                  {tierInfo.currentTier.name}
                </h3>
              </div>
            </div>

            {/* Celebrate & Info Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {tierInfo.isMultiDayStreak && (
                <button
                  type="button"
                  onClick={handleCelebrateClick}
                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors text-xs font-bold flex items-center gap-1"
                  title="Celebrate this streak!"
                >
                  <PartyPopper className="w-4 h-4 text-amber-500" />
                </button>
              )}

              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all">
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Middle Row: Streak Counter and Personal Best Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                Active Streak
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                <span className={tierInfo.isMultiDayStreak ? 'text-amber-600 dark:text-amber-400' : ''}>
                  {currentStreak}
                </span>
                <span className="text-xs font-semibold text-slate-400 font-sans">
                  {currentStreak === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                Personal Best
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                <span>{bestStreak}</span>
                <span className="text-xs font-semibold text-slate-400 font-sans">
                  {bestStreak === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-3 flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                Next Rank
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {tierInfo.nextTier ? tierInfo.nextTier.name : 'Max Supreme'}
              </span>
            </div>
          </div>

          {/* Bottom Progress to Next Milestone Tier */}
          {tierInfo.nextTier ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="text-[11px] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Target: {tierInfo.nextTier.name} ({tierInfo.nextTier.minStreak} Days)
                </span>
                <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {tierInfo.daysToNext} day{tierInfo.daysToNext > 1 ? 's' : ''} left
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all duration-700"
                  style={{ width: `${Math.max(8, tierInfo.progressToNext)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
              <Crown className="w-4 h-4" /> You've achieved the highest echelon milestone!
            </div>
          )}

          {/* Subtle helper note */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
            <span>Click card to inspect all milestone badges</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline flex items-center gap-0.5">
              Roadmap <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      <StreakMilestonesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentStreak={currentStreak}
        bestStreak={bestStreak}
        tierInfo={tierInfo}
      />
    </>
  );
};
