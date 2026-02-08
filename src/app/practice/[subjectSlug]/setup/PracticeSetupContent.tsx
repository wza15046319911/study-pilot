"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/Switch";
import { Subject, Topic } from "@/types/database";
import {
  ChevronRight,
  Sparkles,
  ListChecks,
  FileText,
  Layers,
  Timer,
  Zap,
} from "lucide-react";

interface TopicWithCount extends Topic {
  question_count?: number;
}

interface PracticeSetupContentProps {
  subject: Subject;
  user: {
    username: string | null;
    avatar_url?: string | null;
  };
  topics?: TopicWithCount[];
}

const modes = [
  {
    id: "standard",
    name: "Standard",
    description: "Practice with custom filters. Track progress.",
    icon: ListChecks,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    ringColor: "ring-blue-500",
    btnColor:
      "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600",
  },
  {
    id: "immersive",
    name: "Immersive",
    description: "Endless stream. Minimalist. Pure focus.",
    icon: Sparkles,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    ringColor: "ring-purple-500",
    btnColor: "bg-purple-600 hover:bg-purple-700 text-white",
  },
  {
    id: "exam",
    name: "Mock Exam",
    description: "Timed simulation under exam conditions.",
    icon: FileText,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    ringColor: "ring-orange-500",
    btnColor: "bg-orange-600 hover:bg-orange-700 text-white",
  },
];

const difficulties = [
  {
    value: "easy",
    label: "Easy",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    value: "medium",
    label: "Medium",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    value: "hard",
    label: "Hard",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  {
    value: "all",
    label: "Any",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
];

export function PracticeSetupContent({
  subject,
  topics = [],
}: PracticeSetupContentProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"standard" | "immersive" | "exam">(
    "standard",
  );
  const [difficulty, setDifficulty] = useState("all");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["all"]);
  const [enableTimer, setEnableTimer] = useState(true);

  const toggleTopic = (slug: string) => {
    if (slug === "all") {
      setSelectedTopics(["all"]);
      return;
    }

    setSelectedTopics((prev) => {
      // If currently "all", wipe it and start with new selection
      let newSelection = prev.includes("all") ? [] : [...prev];

      if (newSelection.includes(slug)) {
        newSelection = newSelection.filter((s) => s !== slug);
      } else {
        newSelection.push(slug);
      }

      // If empty, revert to "all"
      return newSelection.length === 0 ? ["all"] : newSelection;
    });
  };

  const handleStart = () => {
    if (mode === "immersive") {
      router.push(`/practice/${subject.slug}/immersive`);
      return;
    }
    if (mode === "exam") {
      router.push(`/practice/${subject.slug}/exams`);
      return;
    }

    const params = new URLSearchParams();
    if (difficulty !== "all") params.set("difficulty", difficulty);

    // Join topics with comma if not "all"
    if (!selectedTopics.includes("all")) {
      params.set("topic", selectedTopics.join(","));
    }

    params.set("count", "all");
    params.set("timer", enableTimer.toString());
    router.push(`/practice/${subject.slug}?${params.toString()}`);
  };

  const selectedMode = modes.find((m) => m.id === mode)!;

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-12">
        <Link
          href="/library"
          className="hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Library
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-gray-900 dark:text-white font-medium">
          {subject.name}
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 mb-4"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              Setup Session
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight"
          >
            Practice Setup
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 mt-2 text-lg"
          >
            Customize your learning experience for{" "}
            <span className="text-gray-900 dark:text-white font-semibold">
              {subject.name}
            </span>
          </motion.p>
        </div>

        <div className="hidden md:block text-right">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {subject.question_count || 0}
          </div>
          <div className="text-sm text-gray-500">Total Questions</div>
        </div>
      </div>

      {/* Mode Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {modes.map((m, index) => {
          const Icon = m.icon;
          const isSelected = mode === m.id;
          return (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              onClick={() => setMode(m.id as any)}
              className={`group relative p-5 text-left rounded-2xl transition-[background-color,border-color,box-shadow,transform] duration-300 border-2 ${
                isSelected
                  ? `bg-white dark:bg-slate-800 ${m.borderColor} ${m.ringColor} ring-1 shadow-xl translate-y-[-2px]`
                  : "bg-white/50 dark:bg-slate-900/50 border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-slate-800"
              }`}
            >
              <div
                className={`size-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  isSelected
                    ? m.bgColor
                    : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                }`}
              >
                <Icon
                  className={`size-5 transition-colors ${
                    isSelected ? m.color : "text-gray-500"
                  }`}
                />
              </div>
              <h3
                className={`font-bold mb-1 ${
                  isSelected
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {m.name}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed dark:text-gray-400">
                {m.description}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Standard Mode Options */}
      <AnimatePresence>
        {mode === "standard" && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 mb-10 shadow-sm relative">
              {/* Option: Difficulty */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Select Difficulty
                </h3>
                <div className="flex flex-wrap gap-3">
                  {difficulties.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-[background-color,border-color,color,transform,box-shadow] border ${
                        difficulty === d.value
                          ? `${d.color} shadow-sm scale-105`
                          : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option: Topics */}
              {topics.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Focus Topic{" "}
                    <span className="text-xs text-gray-400 font-normal ml-1">
                      (Multi-select enabled)
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleTopic("all")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-[background-color,border-color,color] border ${
                        selectedTopics.includes("all")
                          ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500"
                          : "bg-white dark:bg-slate-800 text-gray-600 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      All Topics
                    </button>
                    {topics.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => toggleTopic(t.slug)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-[background-color,border-color,color] border ${
                          selectedTopics.includes(t.slug)
                            ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500"
                            : "bg-white dark:bg-slate-800 text-gray-600 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {t.name}
                        {(t.question_count || 0) > 0 && (
                          <span
                            className={`ml-2 text-[14px] px-1.5 py-0.5 rounded-full ${
                              selectedTopics.includes(t.slug)
                                ? "bg-white/20 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                            }`}
                          >
                            {t.question_count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                    <Timer className="size-5" />
                  </div>
                  <div className="text-sm">
                    <span className="block font-bold text-gray-900 dark:text-white">
                      Timer
                    </span>
                    <span className="text-gray-500">
                      Track per-question time
                    </span>
                  </div>
                </div>
                <Switch
                  checked={enableTimer}
                  onCheckedChange={setEnableTimer}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end"
      >
        <button
          onClick={handleStart}
          className={`group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold shadow-lg transition-[background-color,box-shadow,transform,color] duration-200 hover:scale-[1.02] hover:shadow-xl ${selectedMode.btnColor}`}
        >
          <span>Start Session</span>
          <ChevronRight className="size-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-[transform,opacity]" />
        </button>
      </motion.div>
    </div>
  );
}
