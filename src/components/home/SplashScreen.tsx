"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  Brain,
  Target,
  Sparkles,
  Award,
} from "lucide-react";

interface SplashScreenProps {
  user: any; // Add user prop to check auth status
}

const floatingIcons = [
  { Icon: GraduationCap, color: "#6C3FF5", delay: 0, x: -280, y: -160 },
  { Icon: BookOpen, color: "#FF9B6B", delay: 0.1, x: 260, y: -140 },
  { Icon: Brain, color: "#E8D754", delay: 0.2, x: -240, y: 80 },
  { Icon: Target, color: "#2D60FF", delay: 0.3, x: 280, y: 120 },
  { Icon: Sparkles, color: "#22C55E", delay: 0.4, x: -300, y: -20 },
  { Icon: Award, color: "#EC4899", delay: 0.5, x: 320, y: -40 },
];

export function SplashScreen({ user }: SplashScreenProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (progress >= 100) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Redirect logic based on auth
      if (user) {
        router.push("/library");
      } else {
        router.push("/login"); // Consider adding return URL if needed
      }
    }
  }, [progress, user, router]);

  const handleStart = () => {
    setIsHolding(true);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 100;
        }
        return prev + 2;
      });
    }, 20);
  };

  const handleEnd = () => {
    setIsHolding(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Only reset if not complete to avoid jarring reset before redirect
    if (progress < 100) {
      setProgress(0);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center bg-background overflow-hidden">
      {/* Floating Icons */}
      {floatingIcons.map(({ Icon, color, delay, x, y }, index) => (
        <motion.div
          key={index}
          className="absolute rounded-2xl bg-card p-4 shadow-lg pointer-events-none"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: x,
            y: y,
          }}
          transition={{
            delay: delay,
            duration: 0.5,
            y: {
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            },
          }}
          style={{
            animationDelay: `${delay}s`,
          }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 2 + index * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon size={32} color={color} />
          </motion.div>
        </motion.div>
      ))}

      {/* Center Hold Button */}
      <div className="relative flex flex-col items-center gap-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight mb-2">
            StudyPilot
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
            Your all-in-one platform to master any subject without the chaos.
          </p>
        </motion.div>

        <motion.button
          className="relative size-32 rounded-full bg-card text-foreground shadow-xl flex items-center justify-center cursor-pointer select-none ring-4 ring-border ring-offset-4 ring-offset-background"
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            // Scale smoothly from 1.0 to 1.1 as progress increases from 0 to 100
            scale: 1 + (progress / 100) * 0.1,
          }}
          transition={{
            opacity: { delay: 0.5, duration: 0.3 },
            scale: { type: "spring", stiffness: 100, damping: 15 },
            boxShadow: { duration: 0.1 },
          }}
        >
          {/* Progress Ring */}
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r="62"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progress * 3.89} 389`}
              className="transition-all duration-100"
              style={{ filter: "drop-shadow(0 0 4px var(--primary))" }}
            />
          </svg>
          <span className="text-sm font-bold z-10 tracking-widest uppercase">
            {isHolding ? `${Math.round(progress)}%` : "HOLD TO START"}
          </span>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1 }}
          className="text-xs font-mono uppercase tracking-widest mt-4 opacity-0"
        >
          &nbsp;
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-8 bg-border"></div>
      </motion.div>
    </div>
  );
}
