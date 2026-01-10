"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, HelpCircle, BookOpen, Trophy } from "lucide-react";
import { Spotlight } from "@/components/aceternity/spotlight";
import { HoverEffect } from "@/components/aceternity/hover-effect";

interface StatItem {
  icon: React.ReactNode;
  value: number;
  suffix?: string;
  label: string;
}

const stats: StatItem[] = [
  {
    icon: <Users size={28} />,
    value: 5000,
    suffix: "+",
    label: "Active Users",
  },
  {
    icon: <HelpCircle size={28} />,
    value: 10000,
    suffix: "+",
    label: "Questions",
  },
  { icon: <BookOpen size={28} />, value: 50, suffix: "+", label: "Subjects" },
  { icon: <Trophy size={28} />, value: 98, suffix: "%", label: "Success Rate" },
];

function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="text-neutral-800 dark:text-neutral-100">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function ImpactStats() {
  const formattedStats = stats.map((stat) => ({
    icon: stat.icon,
    value: <AnimatedCounter value={stat.value} suffix={stat.suffix} />,
    label: stat.label,
  }));

  return (
    <section className="py-24 bg-neutral-50 dark:bg-black relative overflow-hidden">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold text-neutral-800 dark:text-white tracking-tight">
            Our Impact by the Numbers
          </h2>
          <p className="mt-4 text-neutral-600 dark:text-neutral-300 text-lg max-w-2xl mx-auto">
            Join thousands of students achieving their academic goals
          </p>
        </motion.div>

        <HoverEffect items={formattedStats} />
      </div>
    </section>
  );
}
