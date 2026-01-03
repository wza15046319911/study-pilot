"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "./GlassPanel";
import { Button } from "./Button";
import {
  Trophy,
  Target,
  Clock,
  ArrowRight,
  RotateCcw,
  Home,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ResultsModalProps {
  isOpen: boolean;
  score: number;
  total: number;
  timeSpent: number;
  subjectId: number;
  onReviewMistakes?: () => void;
  onPracticeAgain?: () => void;
}

export function ResultsModal({
  isOpen,
  score,
  total,
  timeSpent,
  subjectId,
  onReviewMistakes,
  onPracticeAgain,
}: ResultsModalProps) {
  const router = useRouter();
  const percentage = Math.round((score / total) * 100);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && percentage >= 80) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, percentage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getScoreColor = () => {
    if (percentage >= 80)
      return {
        color: "text-green-500",
        bg: "bg-green-100 dark:bg-green-900/30",
      };
    if (percentage >= 60)
      return {
        color: "text-yellow-500",
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
      };
    return { color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" };
  };

  const colors = getScoreColor();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: -20,
                    rotate: 0,
                    scale: Math.random() * 0.5 + 0.5,
                  }}
                  animate={{
                    y: window.innerHeight + 20,
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: Math.random() * 2 + 2,
                    delay: Math.random() * 0.5,
                    ease: "linear",
                  }}
                  className={`absolute w-3 h-3 rounded-sm ${
                    [
                      "bg-yellow-400",
                      "bg-pink-400",
                      "bg-blue-400",
                      "bg-green-400",
                      "bg-purple-400",
                    ][Math.floor(Math.random() * 5)]
                  }`}
                />
              ))}
            </div>
          )}

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md"
          >
            <GlassPanel className="p-8 text-center relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/10 to-transparent" />

              {/* Trophy Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative z-10 mb-6"
              >
                <div
                  className={`mx-auto size-20 rounded-full ${colors.bg} flex items-center justify-center`}
                >
                  {percentage >= 60 ? (
                    <Trophy className={`size-10 ${colors.color}`} />
                  ) : (
                    <Target className="size-10 text-red-500" />
                  )}
                </div>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative z-10"
              >
                <h2 className="text-2xl font-bold mb-2 dark:text-white">
                  {percentage >= 80
                    ? "Excellent!"
                    : percentage >= 60
                    ? "Good Job!"
                    : "Keep Practicing!"}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  You have completed the practice session
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-4 mt-8 mb-8"
              >
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                    <CheckCircle2 className="size-5" />
                    <span className="text-xl font-bold">{score}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Correct
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                    <XCircle className="size-5" />
                    <span className="text-xl font-bold">{total - score}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Wrong
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                    <Clock className="size-5" />
                    <span className="text-xl font-bold">
                      {formatTime(timeSpent)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Time
                  </p>
                </div>
              </motion.div>

              {/* Accuracy Bar */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-8"
              >
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 dark:text-gray-400">
                    Accuracy
                  </span>
                  <span className="font-bold dark:text-white">
                    {percentage}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      percentage >= 80
                        ? "bg-gradient-to-r from-green-400 to-green-500"
                        : percentage >= 60
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                        : "bg-gradient-to-r from-red-400 to-red-500"
                    }`}
                  />
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-3"
              >
                {total - score > 0 && (
                  <Button
                    onClick={onReviewMistakes}
                    variant="secondary"
                    className="w-full"
                  >
                    <Sparkles className="size-4 mr-2" />
                    Review Mistakes ({total - score})
                  </Button>
                )}
                <div className="flex gap-3">
                  <Button
                    onClick={onPracticeAgain}
                    variant="secondary"
                    className="flex-1"
                  >
                    <RotateCcw className="size-4 mr-2" />
                    Again
                  </Button>
                  <Button
                    onClick={() => router.push("/subjects")}
                    className="flex-1"
                  >
                    <Home className="size-4 mr-2" />
                    Home
                  </Button>
                </div>
              </motion.div>
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
