import React from 'react';

interface AttendanceRingProps {
  percentage: number;
  targetPercentage?: number;
  size?: number;
  strokeWidth?: number;
}

export const AttendanceRing: React.FC<AttendanceRingProps> = ({
  percentage,
  targetPercentage = 75,
  size = 140,
  strokeWidth = 12
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePercentage = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  const isAchieved = safePercentage >= targetPercentage;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800"
          fill="transparent"
        />
        {/* Progress stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-700 ease-out ${
            isAchieved
              ? 'text-emerald-500 dark:text-emerald-400'
              : safePercentage >= 50
              ? 'text-amber-500 dark:text-amber-400'
              : 'text-rose-500 dark:text-rose-400'
          }`}
          fill="transparent"
        />
      </svg>
      {/* Center percentage label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {safePercentage}%
        </span>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Target: {targetPercentage}%
        </span>
      </div>
    </div>
  );
};
