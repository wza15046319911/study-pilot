"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, HelpCircle, BookOpen, Trophy } from "lucide-react";

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
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function ImpactStats() {
  return (
    <section className="py-24 bg-card">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-foreground tracking-tight">
            Our Impact by the Numbers
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of students achieving their academic goals
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center p-6"
            >
              <div className="size-14 rounded-2xl bg-muted flex items-center justify-center text-primary mb-4">
                {stat.icon}
              </div>
              <span className="text-4xl md:text-5xl font-bold text-foreground">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="mt-2 text-muted-foreground font-medium">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
