"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "./GlassPanel";
import { Button } from "./Button";
import { Crown, Star, Sparkles, X } from "lucide-react";
import Link from "next/link";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function PremiumModal({
  isOpen,
  onClose,
  title = "Unlock Unlimited Practice",
  description = "Get access to all question banks, unlimited practice sessions, and advanced analytics.",
}: PremiumModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-auto"
          style={{ minHeight: "100vh", minWidth: "100vw" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            >
              <X className="size-5" />
            </button>

            <GlassPanel className="p-0 overflow-hidden relative">
              {/* Header Image / Gradient */}
              <div className="relative h-48 bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Floating Icons Animation */}
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative z-10"
                >
                  <div className="size-24 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl">
                    <Crown className="size-12 text-white drop-shadow-md" />
                  </div>
                </motion.div>

                <div className="absolute top-10 left-10 opacity-50">
                  <Star className="size-6 text-white" />
                </div>
                <div className="absolute bottom-10 right-10 opacity-50">
                  <Sparkles className="size-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                  {title}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                  {description}
                </p>

                <div className="space-y-4">
                  <Link href="/pricing" className="block w-full">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 border-none text-lg font-bold py-6"
                    >
                      <Crown className="size-5 mr-2 fill-current" />
                      Upgrade to Premium
                    </Button>
                  </Link>

                  <button
                    onClick={onClose}
                    className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
