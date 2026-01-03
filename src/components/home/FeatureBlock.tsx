"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";

interface FeatureBlockProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  visual: React.ReactNode;
  align?: "left" | "right";
  delay?: number;
}

export function FeatureBlock({
  title,
  description,
  icon,
  visual,
  align = "left",
  delay = 0,
}: FeatureBlockProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className={cn(
        "py-16 md:py-24 flex flex-col gap-12 items-center",
        align === "left" ? "lg:flex-row" : "lg:flex-row-reverse"
      )}
    >
      {/* Text Content */}
      <motion.div
        className="flex-1 flex flex-col gap-6 text-center lg:text-left"
        initial={{ opacity: 0, x: align === "left" ? -50 : 50 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
      >
        <div className="size-16 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center text-[#135bec] dark:text-blue-400 mx-auto lg:mx-0 shadow-sm border border-white/50 dark:border-white/10">
          {icon}
        </div>
        <div>
          <h3 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white leading-tight">
            {title}
          </h3>
          <p className="text-lg text-[#4c669a] dark:text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
            {description}
          </p>
        </div>
      </motion.div>

      {/* Visual Content */}
      <motion.div
        className="flex-1 w-full max-w-xl"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeOut" }}
      >
        <GlassPanel
          variant="card"
          className="w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-[4/3] relative overflow-hidden flex items-center justify-center p-8 group hover:shadow-2xl transition-all duration-500 border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl"
        >
          {/* Ambient background for the card */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 opacity-50 pointer-events-none" />

          <div className="relative z-10 w-full h-full flex items-center justify-center transform group-hover:scale-105 transition-transform duration-700 ease-out">
            {visual}
          </div>
        </GlassPanel>
      </motion.div>
    </section>
  );
}
