"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

interface SlideInPanelProps {
  children: ReactNode;
  isOpen: boolean;
  direction?: "left" | "right" | "top" | "bottom";
  onClose?: () => void;
}

export function SlideInPanel({
  children,
  isOpen,
  direction = "right",
  onClose,
}: SlideInPanelProps) {
  const variants = {
    left: { initial: { x: "-100%" }, animate: { x: 0 } },
    right: { initial: { x: "100%" }, animate: { x: 0 } },
    top: { initial: { y: "-100%" }, animate: { y: 0 } },
    bottom: { initial: { y: "100%" }, animate: { y: 0 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={variants[direction].initial}
            animate={variants[direction].animate}
            exit={variants[direction].initial}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed z-50"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface CountUpProps {
  end: number;
  duration?: number;
  className?: string;
}

export function CountUp({ end, duration = 1, className }: CountUpProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {end}
      </motion.span>
    </motion.span>
  );
}

interface FloatingElementProps {
  children: ReactNode;
  amplitude?: number;
  duration?: number;
  className?: string;
}

export function FloatingElement({
  children,
  amplitude = 10,
  duration = 3,
  className,
}: FloatingElementProps) {
  return (
    <motion.div
      animate={{
        y: [-amplitude / 2, amplitude / 2, -amplitude / 2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
