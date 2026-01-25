"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FeatureQuestionBank } from "./features/FeatureQuestionBank";
import { FeatureMockExam } from "./features/FeatureMockExam";
import { FeatureMistakes } from "./features/FeatureMistakes";
import { FeatureAnalysis } from "./features/FeatureAnalysis";
import { ChevronRight, ChevronLeft } from "lucide-react";

const features = [
  {
    id: "bank",
    title: "Question Bank",
    description: "Access thousands of curated questions across subjects. Practice by topic with detailed explanations to master every concept.",
    component: <FeatureQuestionBank />,
    color: "bg-blue-500",
  },
  {
    id: "mock",
    title: "Mock Exams",
    description: "Simulate real exam conditions with strict timing and varied question types. Identify gaps and build confidence before the big day.",
    component: <FeatureMockExam />,
    color: "bg-purple-500",
  },
  {
    id: "mistakes",
    title: "Smart Mistake Book",
    description: "Automatically tracks your mistakes and identifies weak points. Review and retry until you turn every weakness into a strength.",
    component: <FeatureMistakes />,
    color: "bg-red-500",
  },
  {
    id: "analysis",
    title: "Performance Analytics",
    description: "Visualize your progress and accuracy. Use multi-dimensional charts to analyze strengths and weaknesses for a scientific study path.",
    component: <FeatureAnalysis />,
    color: "bg-green-500",
  },
];

export function FeatureCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 5000); // Switch every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleManualChange = (index: number) => {
    setActiveIndex(index);
    setIsAutoPlaying(false); // Stop auto-play on interaction
    // Restart auto-play after 10 seconds of inactivity if needed, or just leave it off
  };

  return (
    <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase">
            Core Features
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Study Smarter, Not Harder
          </p>
          <p className="mt-4 text-xl text-slate-500 dark:text-slate-400">
            A complete ecosystem for your exam preparation. From practice to analysis, every step is designed for your success.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Navigation & Text */}
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                onClick={() => handleManualChange(index)}
                className={`group p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${
                  index === activeIndex
                    ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg scale-[1.02]"
                    : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-1 w-1.5 h-12 rounded-full transition-colors duration-300 ${
                      index === activeIndex ? feature.color : "bg-slate-200 dark:bg-slate-800 group-hover:bg-slate-300"
                    }`}
                  />
                  <div>
                    <h3
                      className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                        index === activeIndex
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`text-slate-500 dark:text-slate-400 leading-relaxed transition-all duration-300 ${
                         index === activeIndex ? "opacity-100 max-h-40" : "opacity-70 max-h-20 lg:max-h-0 overflow-hidden"
                      }`}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side: Visual Carousel */}
          <div className="order-1 lg:order-2 relative h-[500px] lg:h-[600px] w-full flex items-center justify-center">
            <div className="relative w-full h-full perspective-1000">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 50, rotateY: 10 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={{ opacity: 0, x: -50, rotateY: -10 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-0 w-full h-full"
                >
                  {features[activeIndex].component}
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Mobile Controls */}
            <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-4 lg:hidden">
              <button 
                 onClick={() => handleManualChange((activeIndex - 1 + features.length) % features.length)}
                 className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700"
              >
                 <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              <button 
                 onClick={() => handleManualChange((activeIndex + 1) % features.length)}
                 className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700"
              >
                 <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
