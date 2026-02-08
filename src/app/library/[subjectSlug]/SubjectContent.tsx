"use client";

import { useState } from "react";
import { QuestionBankItem } from "@/components/question-bank/QuestionBankItem";
import { PremiumModal } from "@/components/ui/PremiumModal";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { GlassPanel } from "@/components/ui/GlassPanel";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import {
  CalendarCheck,
  GraduationCap,
  BookOpen,
  ChevronRight,
  Clock,
  Archive,
  ArrowUpRight,
} from "lucide-react";
import { UserWeeklyPracticeClient } from "@/app/profile/weekly-practice/UserWeeklyPracticeClient";
import { encodeId } from "@/lib/ids";

interface SubjectContentProps {
  subject: {
    id: number;
    name: string;
    slug: string;
    icon?: string;
  };
  exams: any[];
  banks: any[];
  isVip: boolean;
  unlockedBankIds: Set<number>;
  unlockedExamIds: Set<number>;
  questionCount: number;
  examDates: any[];
  weeklyPractices?: WeeklyPracticeItem[];
  pastExams?: PastExamListItem[];
}

type WeeklyPracticeItem = {
  id: number;
  title: string;
  slug: string | null;
  description: string | null;
  week_start: string | null;
  subject: {
    name: string;
    slug: string | null;
  } | null;
  items?: { count: number }[] | null;
  latestSubmission?: {
    submitted_at: string;
    answered_count: number;
    correct_count: number;
    total_count: number;
  } | null;
};

type PastExamListItem = {
  id: number;
  year: number;
  semester: number;
  createdAt?: string;
  title: string | null;
  questionCount: number;
};

const getSemesterLabel = (semester: number) =>
  semester === 1 ? "Semester 1" : "Semester 2";

const studyToolCards = [
  {
    key: "weekly",
    title: "Weekly Practice",
    body: "Scheduled sets for steady momentum across the semester.",
    accent:
      "border-sky-200/70 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.25),_transparent_55%),linear-gradient(135deg,rgba(240,249,255,0.85),rgba(255,255,255,0.95))] dark:border-sky-900/60 dark:bg-[radial-gradient(circle_at_top_right,_rgba(14,116,144,0.35),_transparent_55%),linear-gradient(135deg,rgba(2,6,23,0.75),rgba(15,23,42,0.9))]",
    pill: "text-sky-700 bg-sky-100/70 dark:text-sky-200 dark:bg-sky-900/35",
    iconClass: "text-sky-600 dark:text-sky-300",
    dotClass: "bg-sky-500",
  },
  {
    key: "bank",
    title: "Question Banks",
    body: "Topic-focused drills to target weak spots with flexible practice modes.",
    accent:
      "border-violet-200/70 bg-[radial-gradient(circle_at_top_right,_rgba(167,139,250,0.25),_transparent_55%),linear-gradient(135deg,rgba(245,243,255,0.88),rgba(255,255,255,0.95))] dark:border-violet-900/60 dark:bg-[radial-gradient(circle_at_top_right,_rgba(109,40,217,0.35),_transparent_55%),linear-gradient(135deg,rgba(15,23,42,0.85),rgba(30,27,75,0.75))]",
    pill: "text-violet-700 bg-violet-100/70 dark:text-violet-200 dark:bg-violet-900/35",
    iconClass: "text-violet-600 dark:text-violet-300",
    dotClass: "bg-violet-500",
  },
  {
    key: "mock",
    title: "Mock Exams",
    body: "Timed simulations that mirror real exam pressure and pacing.",
    accent:
      "border-amber-200/70 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.25),_transparent_55%),linear-gradient(135deg,rgba(255,251,235,0.88),rgba(255,255,255,0.95))] dark:border-amber-900/60 dark:bg-[radial-gradient(circle_at_top_right,_rgba(146,64,14,0.35),_transparent_55%),linear-gradient(135deg,rgba(23,23,23,0.75),rgba(30,41,59,0.85))]",
    pill: "text-amber-700 bg-amber-100/70 dark:text-amber-200 dark:bg-amber-900/35",
    iconClass: "text-amber-600 dark:text-amber-300",
    dotClass: "bg-amber-500",
  },
] as const;

export function SubjectContent({
  subject,
  exams,
  banks,
  isVip,
  unlockedBankIds,
  unlockedExamIds,
  questionCount,
  examDates,
  weeklyPractices,
  pastExams,
}: SubjectContentProps) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Find nearest upcoming exam
  const upcomingExam = examDates
    ?.map((d) => ({ ...d, dateObj: new Date(d.exam_date) }))
    .filter((d) => d.dateObj > new Date())
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())[0];

  const groupedPastExams = (pastExams || []).reduce(
    (acc, exam) => {
      if (!acc[exam.year]) acc[exam.year] = {};
      if (!acc[exam.year][exam.semester]) acc[exam.year][exam.semester] = [];
      acc[exam.year][exam.semester].push(exam);
      return acc;
    },
    {} as Record<number, Record<number, PastExamListItem[]>>,
  );

  const sortedYears = Object.keys(groupedPastExams)
    .map((year) => parseInt(year, 10))
    .sort((a, b) => b - a);

  return (
    <div className="py-12 space-y-12">
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title="Unlock Custom Practice"
        description="Configure your perfect practice session by choosing specific topics, difficulties, and question counts with StudyPilot Premium."
      />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              {subject.name}
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-light max-w-2xl">
              Explore practice materials, mock exams, and curated question
              banks.
            </p>

            {upcomingExam && (
              <div className="mt-6 inline-flex flex-wrap items-center gap-3 px-5 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold animate-pulse">
                  <Clock className="size-5" />
                  <span>
                    {upcomingExam.exam_type === "midterm" ? "Midterm" : "Final"}{" "}
                    Exam Countdown:
                  </span>
                </div>
                <CountdownTimer
                  targetDate={upcomingExam.dateObj}
                  label={null}
                  className="!gap-1 text-amber-900 dark:text-amber-100"
                />
              </div>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/90 bg-white/85 dark:bg-slate-900/80 p-5 md:p-7 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.6)]">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-900/25 pointer-events-none" />
          <div className="absolute -left-16 -bottom-20 h-40 w-40 rounded-full bg-violet-200/35 blur-3xl dark:bg-violet-900/20 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <InfoBadge />
                <p className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
                  Your Study Toolkit
                </p>
              </div>
              <Link
                href="/profile/homework"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 transition-colors"
              >
                Homework in Profile
                <ArrowUpRight className="size-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {studyToolCards.map((card) => (
                <article
                  key={card.key}
                  className={`rounded-2xl border p-4 md:p-5 ${card.accent} backdrop-blur-sm`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <span
                      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] ${card.pill}`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${card.dotClass}`}
                      />
                      Focus
                    </span>
                    <span className={`text-sm font-semibold ${card.iconClass}`}>
                      {card.key === "weekly"
                        ? "Weekly"
                        : card.key === "bank"
                          ? "Drill"
                          : "Timed"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {card.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="max-w-6xl mx-auto">
        <Tabs defaultValue="weekly-practice" className="w-full">
          <TabsList className="mb-8 h-auto flex-wrap justify-start bg-transparent p-0 gap-2 border-b border-slate-200 dark:border-slate-800 rounded-none">
            <TabsTrigger
              value="weekly-practice"
              className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:text-blue-400 dark:data-[state=active]:border-blue-400 bg-transparent text-slate-500 dark:text-slate-400 border-b-2 border-transparent px-4 py-3 rounded-none font-semibold text-base hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <CalendarCheck className="size-5 mr-2" />
              Weekly Practice
              {weeklyPractices && weeklyPractices.length > 0 && (
                <span className="ml-2 text-xs opacity-70 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                  {weeklyPractices.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="question-banks"
              className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:text-blue-400 dark:data-[state=active]:border-blue-400 bg-transparent text-slate-500 dark:text-slate-400 border-b-2 border-transparent px-4 py-3 rounded-none font-semibold text-base hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <BookOpen className="size-5 mr-2" />
              Question Banks
              {banks.length > 0 && (
                <span className="ml-2 text-xs opacity-70 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                  {banks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="mock-exams"
              className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:text-blue-400 dark:data-[state=active]:border-blue-400 bg-transparent text-slate-500 dark:text-slate-400 border-b-2 border-transparent px-4 py-3 rounded-none font-semibold text-base hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <GraduationCap className="size-5 mr-2" />
              Mock Exams
              {exams.length > 0 && (
                <span className="ml-2 text-xs opacity-70 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                  {exams.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="past-exams"
              className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:text-blue-400 dark:data-[state=active]:border-blue-400 bg-transparent text-slate-500 dark:text-slate-400 border-b-2 border-transparent px-4 py-3 rounded-none font-semibold text-base hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <Archive className="size-5 mr-2" />
              Past Exam Answers
              {pastExams && pastExams.length > 0 && (
                <span className="ml-2 text-xs opacity-70 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                  {pastExams.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Weekly Practice Tab Content */}
          <TabsContent value="weekly-practice" className="mt-8">
            {weeklyPractices && weeklyPractices.length > 0 ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <CalendarCheck className="size-6 text-blue-600 dark:text-blue-400" />
                    Weekly Practice
                  </h2>
                  <span className="hidden md:inline-block text-sm text-slate-500">
                    Stay on track with curated weekly sets.
                  </span>
                </div>

                <UserWeeklyPracticeClient
                  initialData={weeklyPractices}
                  showSummary={false}
                />
              </div>
            ) : (
              <div className="max-w-md mx-auto text-center py-20 px-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                <CalendarCheck className="size-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  No Weekly Practice Yet
                </h3>
                <p className="text-slate-500">
                  Weekly practice sets for this subject have not been published
                  yet.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Question Banks Tab Content */}
          <TabsContent value="question-banks" className="mt-8">
            <div className="space-y-8">
              {banks.length > 0 ? (
                <>
                  <div className="flex items-end justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <BookOpen className="size-6 text-amber-600 dark:text-amber-400" />
                      Curated Collections
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {banks.map((bank: any) => (
                      <QuestionBankItem
                        key={bank.id}
                        bank={bank}
                        isVip={isVip}
                        isUnlocked={unlockedBankIds.has(bank.id)}
                        questionCount={bank.items?.[0]?.count || 0}
                        href={`/library/${subject.slug}/question-banks/${bank.slug}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="max-w-md mx-auto text-center py-20 px-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                  <BookOpen className="size-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    No Question Banks Yet
                  </h3>
                  <p className="text-slate-500">
                    We're still adding question banks for this subject. Check
                    back soon!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Mock Exams Tab Content */}
          <TabsContent value="mock-exams" className="mt-8">
            <div className="space-y-8">
              {exams.length > 0 ? (
                <>
                  <div className="flex items-end justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <GraduationCap className="size-6 text-indigo-600 dark:text-indigo-400" />
                      Mock Exams
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {exams.map((exam: any) => (
                      <QuestionBankItem
                        key={exam.id}
                        bank={exam}
                        isVip={isVip}
                        questionCount={0}
                        variant="exam"
                        isUnlocked={unlockedExamIds.has(exam.id)}
                        href={`/library/${subject.slug}/exams/${exam.slug}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="max-w-md mx-auto text-center py-20 px-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                  <GraduationCap className="size-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    No Mock Exams Yet
                  </h3>
                  <p className="text-slate-500">
                    We're still adding mock exams for this subject. Check back
                    soon!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Past Exams Tab Content */}
          <TabsContent value="past-exams" className="mt-8">
            <div className="space-y-8">
              {pastExams && pastExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sortedYears.map((year) => {
                    const examsBySemester = groupedPastExams[year] || {};
                    const sortedSemesters = Object.keys(examsBySemester)
                      .map((semester) => parseInt(semester, 10))
                      .sort((a, b) => b - a);

                    return (
                      <GlassPanel
                        key={year}
                        className="p-6 bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800"
                      >
                        <div className="flex items-start justify-between gap-4 mb-6">
                          <div>
                            <div className="text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold">
                              Archive
                            </div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                              {year}
                            </div>
                          </div>
                          <div className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                            Answer Key
                          </div>
                        </div>

                        <div className="space-y-4">
                          {sortedSemesters.map((semester) => {
                            const examsInSemester = [
                              ...(examsBySemester[semester] || []),
                            ].sort((a, b) => {
                              const aTime = a.createdAt
                                ? new Date(a.createdAt).getTime()
                                : 0;
                              const bTime = b.createdAt
                                ? new Date(b.createdAt).getTime()
                                : 0;
                              return bTime - aTime;
                            });

                            return (
                              <div key={`${year}-${semester}`}>
                                <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700/80 dark:text-amber-300/80 mb-2">
                                  {getSemesterLabel(semester)}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {examsInSemester.map((exam, index) => (
                                    <Link
                                      key={exam.id}
                                      href={`/library/${subject.slug}/past-exams/${exam.year}/${exam.semester}/${encodeId(exam.id)}`}
                                      className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-200/70 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                                      title={exam.title || undefined}
                                    >
                                      {exam.title?.trim() ||
                                        `Paper ${index + 1}`}
                                      <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </GlassPanel>
                    );
                  })}
                </div>
              ) : (
                <div className="max-w-md mx-auto text-center py-20 px-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                  <Archive className="size-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    No Past Exams Yet
                  </h3>
                  <p className="text-slate-500">
                    Past exam answer keys will appear here once published.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function InfoBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50/80 dark:border-blue-800/80 dark:bg-blue-900/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
      Study Map
    </span>
  );
}
