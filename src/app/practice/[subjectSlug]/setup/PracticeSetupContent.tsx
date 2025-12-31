"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { Subject, Topic } from "@/types/database";
import { encodeId } from "@/lib/ids";
import {
  ChevronRight,
  Play,
  Sparkles,
  ListChecks,
  FileText,
  Layers,
  Timer,
} from "lucide-react";

// Extend Topic type to include question_count
interface TopicWithCount extends Topic {
  question_count?: number;
}

// Combined types for props
interface PracticeSetupContentProps {
  subject: Subject;
  // Allow passing raw profile data which might have nulls
  user: {
    username: string | null;
    avatar_url?: string | null;
  };
  topics?: TopicWithCount[];
}

const difficulties = [
  {
    value: "easy",
    label: "Easy",
    color: "bg-green-100 text-green-600 border-green-200",
  },
  {
    value: "medium",
    label: "Medium",
    color: "bg-yellow-100 text-yellow-600 border-yellow-200",
  },
  {
    value: "hard",
    label: "Hard",
    color: "bg-red-100 text-red-600 border-red-200",
  },
  {
    value: "all",
    label: "Any Difficulty",
    color: "bg-blue-100 text-blue-600 border-blue-200",
  },
];

export function PracticeSetupContent({
  subject,
  topics = [],
}: PracticeSetupContentProps) {
  const router = useRouter();
  const [mode, setMode] = useState<
    "standard" | "immersive" | "exam" | "flashcards"
  >("standard");
  const [difficulty, setDifficulty] = useState("all");
  const [topic, setTopic] = useState("all");
  const [enableTimer, setEnableTimer] = useState(true);

  const handleStart = () => {
    if (mode === "immersive") {
      router.push(`/practice/${subject.slug}/immersive`);
      return;
    }

    if (mode === "flashcards") {
      router.push(`/practice/${subject.slug}/flashcards`);
      return;
    }

    if (mode === "exam") {
      router.push(`/practice/${subject.slug}/exams`);
      return;
    }

    // ... standard mode logic
    const params = new URLSearchParams();
    if (difficulty !== "all") params.set("difficulty", difficulty);
    if (topic !== "all") params.set("topic", topic); // Topic is now slug
    params.set("count", "all");
    params.set("timer", enableTimer.toString());

    router.push(`/practice/${subject.slug}?${params.toString()}`);
  };

  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#4c669a] mb-6">
        <Link href="/subjects" className="hover:text-[#135bec]">
          Subjects
        </Link>
        <ChevronRight className="size-4" />
        <span>{subject.name}</span>
        <ChevronRight className="size-4" />
        <span className="text-[#0d121b] font-medium">Setup Practice</span>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Select Practice Mode</h1>
        <p className="text-[#4c669a]">
          Choose how you want to practice{" "}
          <span className="font-semibold text-[#135bec]">{subject.name}</span>
        </p>
      </div>
      <div className="space-y-8">
        {/* Mode Selection */}
        <GlassPanel className="p-6">
          <h2 className="text-lg font-bold mb-4">Practice Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standard */}
            <button
              onClick={() => setMode("standard")}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                mode === "standard"
                  ? "border-[#135bec] bg-blue-50/50 shadow-lg"
                  : "border-gray-200 hover:border-gray-300 bg-white/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    mode === "standard"
                      ? "bg-[#135bec] text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <ListChecks className="size-5" />
                </div>
                <span className="font-bold text-lg">Standard</span>
              </div>
              <p className="text-sm text-[#4c669a]">
                Select difficulty, topic, and number of questions. Progress is
                tracked.
              </p>
            </button>

            {/* Immersive */}
            <button
              onClick={() => setMode("immersive")}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                mode === "immersive"
                  ? "border-purple-500 bg-purple-50/50 shadow-lg"
                  : "border-gray-200 hover:border-gray-300 bg-white/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    mode === "immersive"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Sparkles className="size-5" />
                </div>
                <span className="font-bold text-lg">Immersive</span>
              </div>
              <p className="text-sm text-[#4c669a]">
                Endless random questions. Minimalist UI. No progress tracking.
                Exit anytime.
              </p>
            </button>

            {/* Flashcards - NEW */}
            <button
              onClick={() => setMode("flashcards")}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                mode === "flashcards"
                  ? "border-green-500 bg-green-50/50 shadow-lg"
                  : "border-gray-200 hover:border-gray-300 bg-white/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    mode === "flashcards"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Layers className="size-5" />
                </div>
                <span className="font-bold text-lg">Flashcards</span>
              </div>
              <p className="text-sm text-[#4c669a]">
                Flip cards to test your memory. Great for quick reviews and
                definition checks.
              </p>
            </button>

            {/* Mock Exam */}
            <button
              onClick={() => setMode("exam")}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                mode === "exam"
                  ? "border-orange-500 bg-orange-50/50 shadow-lg"
                  : "border-gray-200 hover:border-gray-300 bg-white/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    mode === "exam"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <FileText className="size-5" />
                </div>
                <span className="font-bold text-lg">Mock Exam</span>
              </div>
              <p className="text-sm text-[#4c669a]">
                Timed exams with predefined question sets. Simulates real test
                conditions.
              </p>
            </button>
          </div>
        </GlassPanel>

        {/* Standard Mode Options */}
        {mode === "standard" && (
          <>
            {/* Difficulty Selection */}
            <GlassPanel className="p-6">
              <h2 className="text-lg font-bold mb-4">Difficulty Level</h2>
              <div className="flex flex-wrap gap-3">
                {difficulties.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all border ${
                      difficulty === d.value
                        ? "bg-[#135bec] text-white border-[#135bec] shadow-lg shadow-blue-500/25"
                        : `${d.color} hover:opacity-80`
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </GlassPanel>

            {/* Topic Selection */}
            {topics.length > 0 && (
              <GlassPanel className="p-6">
                <h2 className="text-lg font-bold mb-4">Topic / Concept</h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setTopic("all")}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all border ${
                      topic === "all"
                        ? "bg-[#135bec] text-white border-[#135bec] shadow-lg shadow-blue-500/25"
                        : "bg-blue-50 text-blue-600 border-blue-200 hover:opacity-80"
                    }`}
                  >
                    All Topics
                  </button>
                  {topics.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTopic(t.slug)}
                      className={`px-5 py-2.5 rounded-xl font-medium transition-all border ${
                        topic === t.slug
                          ? "bg-[#135bec] text-white border-[#135bec] shadow-lg shadow-blue-500/25"
                          : "bg-white/50 hover:bg-white text-[#0d121b] border-gray-200"
                      }`}
                    >
                      {t.name}
                      {(t.question_count || 0) > 0 && (
                        <span
                          className={`ml-2 text-xs py-0.5 px-1.5 rounded-full ${
                            topic === t.id.toString()
                              ? "bg-white/20 text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {t.question_count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </GlassPanel>
            )}

            {/* Timer Selection */}
            <GlassPanel className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Timer className="size-5 text-[#4c669a]" />
                    Practice Timer
                  </h2>
                  <p className="text-sm text-[#4c669a]">
                    Track your time spent on each question
                  </p>
                </div>
                <Switch
                  checked={enableTimer}
                  onCheckedChange={setEnableTimer}
                />
              </div>
            </GlassPanel>
          </>
        )}

        {/* Summary & Start */}
        <GlassPanel className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Summary text dynamic update */}
            {mode === "standard" && (
              <div className="flex items-center gap-3">
                <ListChecks className="size-6 text-[#135bec]" />
                <div>
                  <p className="font-bold text-[#0d121b]">Standard Mode</p>
                  <p className="text-sm text-[#4c669a]">
                    Practice all matched questions
                  </p>
                </div>
              </div>
            )}
            {mode === "immersive" && (
              <div className="flex items-center gap-3">
                <Sparkles className="size-6 text-purple-500" />
                <div>
                  <p className="font-bold text-[#0d121b]">Immersive Mode</p>
                  <p className="text-sm text-[#4c669a]">
                    Random questions, no time limit
                  </p>
                </div>
              </div>
            )}
            {mode === "flashcards" && (
              <div className="flex items-center gap-3">
                <Layers className="size-6 text-green-500" />
                <div>
                  <p className="font-bold text-[#0d121b]">Flashcards Mode</p>
                  <p className="text-sm text-[#4c669a]">
                    Review key concepts card by card
                  </p>
                </div>
              </div>
            )}
            {mode === "exam" && (
              <div className="flex items-center gap-3">
                <FileText className="size-6 text-orange-500" />
                <div>
                  <p className="font-bold text-[#0d121b]">Exam Mode</p>
                  <p className="text-sm text-[#4c669a]">
                    Timed full-length mock exams
                  </p>
                </div>
              </div>
            )}

            <Button
              size="lg"
              onClick={handleStart}
              className={`w-full sm:w-auto ${
                mode === "immersive"
                  ? "bg-purple-500 hover:bg-purple-600"
                  : mode === "flashcards"
                  ? "bg-green-500 hover:bg-green-600"
                  : mode === "exam"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }`}
            >
              <Play className="mr-2 size-5" />
              {mode === "standard"
                ? "Start Practice"
                : mode === "immersive"
                ? "Enter Immersive Mode"
                : mode === "flashcards"
                ? "Start Flashcards"
                : "View Exams"}
            </Button>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
