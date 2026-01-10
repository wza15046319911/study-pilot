"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SVGLoader } from "./svg-loader";
import { Check } from "lucide-react";

interface StatefulButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void;
}

export const StatefulButton = ({
  children,
  className,
  onClick,
  disabled,
  ...props
}: StatefulButtonProps) => {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || status !== "idle") return;

    if (onClick) {
      try {
        setStatus("loading");
        await onClick(e);
        setStatus("success");
        // Reset to idle after success animation
        setTimeout(() => {
          setStatus("idle");
        }, 2000);
      } catch (error) {
        setStatus("idle");
        console.error("Error in StatefulButton onClick:", error);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || status !== "idle"}
      className={cn(
        "relative flex items-center justify-center transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-80",
        className
      )}
      {...props}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {status === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            {children}
          </motion.span>
        )}
        {status === "loading" && (
          <motion.span
            key="loading"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <SVGLoader className="h-5 w-5" />
          </motion.span>
        )}
        {status === "success" && (
          <motion.span
            key="success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center text-green-500"
          >
            <Check className="h-5 w-5" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};
