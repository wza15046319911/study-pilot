"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({
  targetDate,
  className = "",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference <= 0) {
        setIsExpired(true);
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired || !timeLeft) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
        Offer ends in:
      </span>
      <div className="flex items-center gap-1">
        <TimeUnit value={timeLeft.days} label="d" />
        <span className="text-slate-400">:</span>
        <TimeUnit value={timeLeft.hours} label="h" />
        <span className="text-slate-400">:</span>
        <TimeUnit value={timeLeft.minutes} label="m" />
        <span className="text-slate-400">:</span>
        <TimeUnit value={timeLeft.seconds} label="s" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline">
      <span className="text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums min-w-[1.5rem] text-center">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {label}
      </span>
    </div>
  );
}

// Helper to check if promotion is still active
export function isPromotionActive(endDate: Date): boolean {
  return new Date() < endDate;
}
