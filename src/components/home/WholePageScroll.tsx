"use client";

import { useRef, useMemo } from "react";
import { useScroll, useTransform, motion, useSpring } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  BadgeCheck,
  PlayCircle,
  CheckCircle2,
  Database,
  BookOpen,
  Activity,
  XCircle,
  BarChart3,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";

interface Subject {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  question_count?: number;
  is_new?: boolean;
  is_hot?: boolean;
}

interface WholePageScrollProps {
  user: any;
  isAdmin: boolean;
  subjects: Subject[];
  content: {
    hero: {
      title: string;
      subtitle: string;
      completed: string;
      tagList: string;
      tagFunction: string;
    };
    features: {
      title: string;
      subtitle: string;
      coreFeatures: string;
      bank: { title: string; description: string };
      mistakes: { title: string; description: string };
      flow: { title: string; description: string };
      flashcards: { title: string; description: string };
    };
    stats: {
      users: string;
      subjects: string;
      questions: string;
    };
    browse: {
      title: string;
      subtitle: string;
      viewAll: string;
    };
    results: {
      accuracy: string;
    };
    analytics: {
      title: string;
      subtitle: string;
      features: {
        radar: string;
        history: string;
      };
    };
    common: {
      questions: string;
    };
  };
}

export function WholePageScroll({
  user,
  isAdmin,
  subjects,
  content,
}: WholePageScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth out the scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // --- ANIMATION RANGES ---
  // 0.00 - 0.15: Hero Section
  // 0.15 - 0.25: Transition to Features
  // 0.25 - 0.65: Features (Scrollytelling)
  // 0.65 - 0.75: Stats
  // 0.75 - 0.90: Subjects
  // 0.90 - 1.00: Footer

  // Hero Animations
  const heroOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.1], [1, 0.8]);
  const heroY = useTransform(smoothProgress, [0, 0.1], ["0%", "-20%"]);

  // Features Container
  const featuresOpacity = useTransform(
    smoothProgress,
    [0.1, 0.2, 0.6, 0.7],
    [0, 1, 1, 0]
  );
  const featuresScale = useTransform(
    smoothProgress,
    [0.1, 0.2, 0.6, 0.7],
    [0.8, 1, 1, 0.8]
  );

  // Individual Features
  // Bank: 0.2 - 0.3
  const bankOpacity = useTransform(
    smoothProgress,
    [0.2, 0.25, 0.3, 0.35],
    [0, 1, 1, 0]
  );
  const bankY = useTransform(
    smoothProgress,
    [0.2, 0.25, 0.3, 0.35],
    [50, 0, 0, -50]
  );

  // Mistakes: 0.3 - 0.4
  const mistakesOpacity = useTransform(
    smoothProgress,
    [0.3, 0.35, 0.4, 0.45],
    [0, 1, 1, 0]
  );
  const mistakesY = useTransform(
    smoothProgress,
    [0.3, 0.35, 0.4, 0.45],
    [50, 0, 0, -50]
  );

  // Flow: 0.4 - 0.5
  const flowOpacity = useTransform(
    smoothProgress,
    [0.4, 0.45, 0.5, 0.55],
    [0, 1, 1, 0]
  );
  const flowY = useTransform(
    smoothProgress,
    [0.4, 0.45, 0.5, 0.55],
    [50, 0, 0, -50]
  );

  // Flashcards: 0.5 - 0.6
  const flashcardsOpacity = useTransform(
    smoothProgress,
    [0.5, 0.55, 0.6, 0.65],
    [0, 1, 1, 0]
  );
  const flashcardsY = useTransform(
    smoothProgress,
    [0.5, 0.55, 0.6, 0.65],
    [50, 0, 0, -50]
  );

  // Stats
  const statsOpacity = useTransform(
    smoothProgress,
    [0.65, 0.7, 0.75],
    [0, 1, 0]
  );
  const statsY = useTransform(smoothProgress, [0.65, 0.7, 0.75], [50, 0, -50]);

  // Analytics/Smart Dashboard
  const analyticsOpacity = useTransform(
    smoothProgress,
    [0.75, 0.8, 0.95],
    [0, 1, 1]
  );
  const analyticsRotateX = useTransform(smoothProgress, [0.75, 0.9], [45, 0]); // Tilt effect
  const analyticsScale = useTransform(smoothProgress, [0.75, 0.9], [0.8, 1]);
  const analyticsY = useTransform(smoothProgress, [0.75, 0.9], [100, 0]);

  // Footer
  const footerOpacity = useTransform(smoothProgress, [0.9, 0.95], [0, 1]);

  const analytics = content.analytics || {
    title: "Smart Analytics",
    subtitle: "Track your progress with advanced insights.",
    features: { radar: "Skills", history: "History" },
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[800vh] bg-white dark:bg-[#020817]"
    >
      <AmbientBackground />
      <div className="fixed top-0 left-0 w-full z-50">
        <Header showNav={false} user={user} isAdmin={isAdmin} />
      </div>

      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* --- HERO SECTION --- */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="absolute inset-0 flex items-center justify-center px-4"
        >
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center w-full">
            {/* Text Content */}
            <div className="flex flex-col gap-6 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 w-fit mx-auto lg:mx-0">
                <BadgeCheck className="text-[#135bec] dark:text-blue-400 size-5" />
                <span className="text-[#135bec] dark:text-blue-400 text-sm font-semibold">
                  2025 New Question Bank Updated
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6">
                {content.hero.title}
              </h1>
              <p className="text-[#4c669a] dark:text-gray-400 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                {content.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4 pointer-events-auto">
                <Link
                  href="/subjects"
                  className="flex h-12 px-8 items-center justify-center rounded-xl bg-[#135bec] hover:bg-[#0e45b8] text-white text-base font-bold shadow-xl shadow-blue-600/25 transition-all transform hover:-translate-y-1"
                >
                  Start Free Practice
                </Link>
                <button className="flex h-12 px-8 items-center justify-center rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-[#0d121b] dark:text-white border border-gray-200 dark:border-slate-700 text-base font-bold shadow-sm transition-all">
                  <PlayCircle className="mr-2 text-gray-500 dark:text-gray-400 size-5" />
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative lg:h-[500px] flex items-center justify-center">
              <GlassPanel
                variant="card"
                className="absolute top-10 right-10 w-64 h-80 z-20 p-5 flex flex-col gap-4 animate-bounce [animation-duration:4s]"
              >
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
                  <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {content.hero.completed}
                    </p>
                    <p className="text-lg font-bold dark:text-white">
                      128 {content.common.questions}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[80%]" />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{content.results.accuracy}</span>
                    <span className="font-bold text-[#0d121b] dark:text-white">
                      80%
                    </span>
                  </div>
                </div>
                <div className="mt-auto pt-4 flex gap-2">
                  <span className="inline-block px-2 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs rounded">
                    {content.hero.tagList}
                  </span>
                  <span className="inline-block px-2 py-1 bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-xs rounded">
                    {content.hero.tagFunction}
                  </span>
                </div>
              </GlassPanel>

              <div className="absolute inset-4 bg-gradient-to-tr from-blue-100 dark:from-blue-900/30 to-white dark:to-slate-900/30 rounded-[3rem] -z-10 opacity-60 border border-white/40 dark:border-slate-700" />
            </div>
          </div>
        </motion.div>

        {/* --- FEATURES SECTION --- */}
        <motion.div
          style={{ opacity: featuresOpacity, scale: featuresScale }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="max-w-7xl mx-auto px-4 w-full h-full flex flex-col justify-center">
            <div className="text-center mb-10">
              <h2 className="text-[#135bec] dark:text-blue-400 font-bold text-sm tracking-widest uppercase mb-3">
                {content.features.coreFeatures}
              </h2>
              <h3 className="text-3xl sm:text-4xl font-black mb-4 dark:text-white">
                {content.features.title}
              </h3>
            </div>

            <div className="relative w-full h-[500px]">
              {/* Feature 1: Bank */}
              <motion.div
                style={{ opacity: bankOpacity, y: bankY }}
                className="absolute inset-0 flex items-center justify-center p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-800"
              >
                <div className="grid lg:grid-cols-2 gap-8 items-center w-full max-w-5xl">
                  <div className="order-2 lg:order-1">
                    <div className="size-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                      <Database className="size-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 dark:text-white">
                      {content.features.bank.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {content.features.bank.description}
                    </p>
                  </div>
                  <div className="order-1 lg:order-2 flex justify-center">
                    {/* Visual from original feature block */}
                    <div className="relative w-[80%] max-w-[320px] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transform scale-90 sm:scale-100">
                      {/* ... visual content ... */}
                      <div className="bg-slate-900 p-4 pb-6">
                        <div className="flex justify-between items-center mb-4">
                          <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                            Easy
                          </span>
                          <span className="text-gray-500 text-[10px] font-mono">
                            00:00:01
                          </span>
                        </div>
                        <p className="text-white text-xs font-medium mb-3">
                          What is the value of x...
                        </p>
                        <div className="bg-slate-800 rounded-lg p-3 font-mono text-[10px] leading-relaxed text-gray-300 border border-slate-700">
                          <div className="text-purple-400">x = [3, 2, 1]</div>
                          <div className="text-white">y = x</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Feature 2: Mistakes */}
              <motion.div
                style={{ opacity: mistakesOpacity, y: mistakesY }}
                className="absolute inset-0 flex items-center justify-center p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-800"
              >
                <div className="grid lg:grid-cols-2 gap-8 items-center w-full max-w-5xl">
                  <div className="order-1 lg:order-1 flex justify-center">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-64 p-5 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500">
                          <CheckCircle2 className="size-6" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Completed
                          </p>
                          <p className="text-xl font-bold text-[#0d121b] dark:text-white">
                            128 Qs
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="order-2 lg:order-2">
                    <div className="size-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                      <BookOpen className="size-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 dark:text-white">
                      {content.features.mistakes.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {content.features.mistakes.description}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Feature 3: Flow */}
              <motion.div
                style={{ opacity: flowOpacity, y: flowY }}
                className="absolute inset-0 flex items-center justify-center p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-800"
              >
                <div className="grid lg:grid-cols-2 gap-8 items-center w-full max-w-5xl">
                  <div className="order-2 lg:order-1">
                    <div className="size-12 rounded-xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
                      <Activity className="size-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 dark:text-white">
                      {content.features.flow.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {content.features.flow.description}
                    </p>
                  </div>
                  <div className="order-1 lg:order-2 flex justify-center">
                    <div className="relative z-10 w-[90%] max-w-[360px] bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-purple-600 font-bold text-xs">
                          ✨ Immersive
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                        <div className="h-2 w-1/2 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Feature 4: Flashcards */}
              <motion.div
                style={{ opacity: flashcardsOpacity, y: flashcardsY }}
                className="absolute inset-0 flex items-center justify-center p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-800"
              >
                <div className="grid lg:grid-cols-2 gap-8 items-center w-full max-w-5xl">
                  <div className="order-1 lg:order-1 flex justify-center">
                    <div className="relative w-48 h-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center text-center">
                      <PlayCircle className="size-8 text-green-500 mb-4" />
                      <p className="font-bold">Space Repetition</p>
                    </div>
                  </div>
                  <div className="order-2 lg:order-2">
                    <div className="size-12 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                      <PlayCircle className="size-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 dark:text-white">
                      {content.features.flashcards.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {content.features.flashcards.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* --- STATS --- */}
        <motion.div
          style={{ opacity: statsOpacity, y: statsY }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col gap-2">
              <span className="text-6xl font-black text-[#135bec] dark:text-blue-400">
                500+
              </span>
              <span className="text-xl font-medium text-gray-500">
                {content.stats.users}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-6xl font-black text-[#135bec] dark:text-blue-400">
                3
              </span>
              <span className="text-xl font-medium text-gray-500">
                {content.stats.subjects}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-6xl font-black text-[#135bec] dark:text-blue-400">
                300+
              </span>
              <span className="text-xl font-medium text-gray-500">
                {content.stats.questions}
              </span>
            </div>
          </div>
        </motion.div>

        {/* --- ANALYTICS DASHBOARD --- */}
        <motion.div
          style={{
            opacity: analyticsOpacity,
            rotateX: analyticsRotateX,
            scale: analyticsScale,
            y: analyticsY,
            perspective: 1000,
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="max-w-7xl mx-auto px-4 w-full flex flex-col items-center">
            <div className="text-center mb-12 transform preserve-3d">
              <h2 className="text-[#135bec] dark:text-blue-400 font-bold text-sm tracking-widest uppercase mb-3">
                Data Driven
              </h2>
              <h3 className="text-4xl sm:text-5xl font-black mb-4 dark:text-white">
                {analytics.title}
              </h3>
              <p className="text-gray-500 max-w-xl mx-auto text-lg">
                {analytics.subtitle}
              </p>
            </div>

            {/* Dashboard Visual */}
            <div className="relative w-full max-w-4xl aspect-video bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-gray-700 shadow-2xl p-8 overflow-hidden">
              {/* Header of Dashboard */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-blue-500 overflow-hidden relative">
                    <Image
                      src={user?.avatar_url || "/default-avatar.png"}
                      alt="User"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold dark:text-white">
                      Welcome back, {user?.username}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Last practice: 2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold flex items-center gap-1">
                    <TrendingUp className="size-3" /> +12% Efficiency
                  </span>
                </div>
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-3 gap-6 h-full pb-8">
                {/* Main Chart Area */}
                <div className="col-span-2 bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 border border-white/10 dark:border-gray-700/50 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-bold text-sm dark:text-gray-300">
                      Knowledge Radar
                    </h5>
                    <BarChart3 className="size-4 text-gray-400" />
                  </div>
                  {/* Fake Radar Chart Construction */}
                  <div className="relative flex-1 flex items-center justify-center">
                    <div className="relative size-48">
                      {/* Pentagon Background */}
                      <svg
                        viewBox="0 0 100 100"
                        className="absolute inset-0 w-full h-full opacity-20 dark:opacity-40"
                      >
                        <polygon
                          points="50,5 95,40 80,95 20,95 5,40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          className="text-gray-400"
                        />
                        <polygon
                          points="50,25 75,45 65,75 35,75 25,45"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          className="text-gray-400"
                        />
                      </svg>
                      {/* Data Shape */}
                      <svg
                        viewBox="0 0 100 100"
                        className="absolute inset-0 w-full h-full drop-shadow-xl"
                      >
                        <polygon
                          points="50,15 85,45 70,85 30,80 15,50"
                          fill="rgba(59, 130, 246, 0.5)"
                          stroke="#3b82f6"
                          strokeWidth="2"
                        />
                      </svg>
                      {/* Labels */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-[10px] text-gray-400 font-bold">
                        Algorithms
                      </div>
                      <div className="absolute top-[40%] right-0 translate-x-4 text-[10px] text-gray-400 font-bold">
                        System
                      </div>
                      <div className="absolute bottom-0 right-1/4 translate-y-4 text-[10px] text-gray-400 font-bold">
                        Math
                      </div>
                      <div className="absolute bottom-0 left-1/4 translate-y-4 text-[10px] text-gray-400 font-bold">
                        Logic
                      </div>
                      <div className="absolute top-[40%] left-0 -translate-x-4 text-[10px] text-gray-400 font-bold">
                        Network
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Column */}
                <div className="col-span-1 flex flex-col gap-4">
                  <div className="flex-1 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 text-white flex flex-col justify-center items-center shadow-lg">
                    <Zap className="size-8 mb-2 opacity-80" />
                    <span className="text-3xl font-black">850</span>
                    <span className="text-xs opacity-70">XP Gained</span>
                  </div>
                  <div className="flex-1 bg-white/50 dark:bg-slate-800/50 rounded-2xl p-5 border border-white/10 dark:border-gray-700/50 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2 text-gray-500">
                      <Target className="size-4" />
                      <span className="text-xs font-bold">Daily Goal</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                      <div className="h-full w-[80%] bg-blue-500 rounded-full" />
                    </div>
                    <div className="text-right text-xs font-bold text-blue-500">
                      80%
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-20 -right-20 size-64 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 size-64 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* --- FOOTER --- */}
        <motion.div
          style={{ opacity: footerOpacity }}
          className="absolute inset-0 flex items-end justify-center pointer-events-auto pb-10"
        >
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="border-t border-gray-200/50 pt-8 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl">
              <div className="flex items-center gap-2">
                <Image
                  src="/study-pilot-icon.png"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="rounded"
                />
                <span className="font-bold">StudyPilot</span>
              </div>
              <div className="text-sm text-gray-500">
                © 2026 StudyPilot Inc.
              </div>
              <div className="flex gap-6 text-sm text-gray-500">
                <Link href="/terms" className="hover:text-blue-500">
                  Terms
                </Link>
                <Link href="/privacy" className="hover:text-blue-500">
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
