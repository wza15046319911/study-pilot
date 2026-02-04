"use client";

import { motion } from "framer-motion";

interface PenCircleProps {
  className?: string;
  color?: string;
  delay?: number;
}

export function PenCircle({
  className = "",
  color = "currentColor",
  delay = 0,
}: PenCircleProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <motion.svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ overflow: "visible" }}
      >
        <motion.path
          d="M 20 50 C 20 25 40 10 65 15 C 85 20 90 45 80 70 C 70 90 40 90 25 75 C 15 65 15 40 30 25"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
            delay: delay,
          }}
          // Randomize the path slightly for more natural look?
          // For now, a fixed imperfect circle path
        />
      </motion.svg>
    </div>
  );
}
