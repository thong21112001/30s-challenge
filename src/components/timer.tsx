'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  expiresAt: string | Date;
  onExpire?: () => void;
}

export function Timer({ expiresAt, onExpire }: TimerProps) {
  const targetTime = typeof expiresAt === 'string' ? new Date(expiresAt).getTime() : expiresAt.getTime();

  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const diff = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
    return diff;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) {
          onExpire();
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [targetTime, onExpire]);

  const percentage = Math.max(0, Math.min(100, (secondsLeft / 30) * 100));

  // Determine timer ring color based on urgency
  let strokeColor = '#10b981'; // Emerald
  let glowColor = 'rgba(16, 185, 129, 0.4)';
  if (secondsLeft <= 10 && secondsLeft > 5) {
    strokeColor = '#f59e0b'; // Amber
    glowColor = 'rgba(245, 158, 11, 0.5)';
  } else if (secondsLeft <= 5) {
    strokeColor = '#ef4444'; // Red
    glowColor = 'rgba(239, 68, 68, 0.7)';
  }

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center my-4">
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Outer Glow Ring */}
        <div
          className="absolute inset-0 rounded-full blur-xl transition-all duration-300 opacity-60"
          style={{ backgroundColor: strokeColor }}
        />

        {/* SVG Circular Progress */}
        <svg className="w-full h-full transform -rotate-90 relative z-10">
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="#1e293b"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-linear"
            style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
          />
        </svg>

        {/* Center Countdown Display */}
        <div className="absolute flex flex-col items-center justify-center z-20">
          <span
            className={`font-black text-4xl tracking-tighter transition-all duration-300 ${
              secondsLeft <= 5 ? 'text-rose-500 scale-110 animate-ping' : 'text-white'
            }`}
          >
            00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
          </span>
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold mt-0.5">
            REMAINING
          </span>
        </div>
      </div>
    </div>
  );
}
