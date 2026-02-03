"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { QuestionBankItem } from "@/components/question-bank/QuestionBankItem";
import { PremiumModal } from "@/components/ui/PremiumModal";
import { CountdownTimer } from "@/components/ui/CountdownTimer";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import {
  Play,
  Settings2,
  Lock,
  Layers,
  GraduationCap,
  BookOpen,
  ChevronRight,
  Clock,
} from "lucide-react";
import { UserWeeklyPracticeClient } from "@/app/profile/weekly-practice/UserWeeklyPracticeClient";

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
}: SubjectContentProps) {
  const router = useRouter();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Find nearest upcoming exam
  const upcomingExam = examDates
    ?.map((d) => ({ ...d, dateObj: new Date(d.exam_date) }))
    .filter((d) => d.dateObj > new Date())
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())[0];

  const isWeeklyPracticeSubject =
    subject.slug === "introduction-to-software-programming";

  const practiceCards = [
    {
      title: "Quick Practice",
      icon: <Play className="size-16 text-blue-600 dark:text-blue-400" />,
      href: `/library/${subject.slug}/practice`,
    },
    {
      title: "Immersive Mode",
      icon: <Layers className="size-16 text-purple-600 dark:text-purple-400" />,
      href: `/library/${subject.slug}/immersive`,
    },
    // {
    //   title: isVip ? "Custom Setup" : "Custom Setup (Premium)",
    //   icon: isVip ? (
    //     <Settings2 className="size-16 text-emerald-600 dark:text-emerald-400" />
    //   ) : (
    //     <Lock className="size-16 text-slate-400" />
    //   ),
    //   onClick: handleSetupClick,
    //   // Only provide href if VIP, otherwise onClick handles modal
    //   href: isVip ? `/library/${subject.slug}/setup` : undefined,
    // },
  ];

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
          <div className="size-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-800 text-6xl">
            {subject.icon}
          </div>
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
      </section>

      {/* Tabs Section */}
      <section className="max-w-6xl mx-auto">
        <Tabs defaultValue="practice" className="w-full">
          <TabsList className="mb-8 h-auto flex-wrap justify-start bg-transparent p-0 gap-2 border-b border-slate-200 dark:border-slate-800 rounded-none">
            <TabsTrigger
              value="practice"
              className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:text-blue-400 dark:data-[state=active]:border-blue-400 bg-transparent text-slate-500 dark:text-slate-400 border-b-2 border-transparent px-4 py-3 rounded-none font-semibold text-base hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <Play className="size-5 mr-2" />
              Practice
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
          </TabsList>

          {/* Practice Tab Content */}
          <TabsContent value="practice" className="mt-8">
            {isWeeklyPracticeSubject ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Play className="size-6 text-blue-600 dark:text-blue-400" />
                    Weekly Practice
                  </h2>
                  <span className="hidden md:inline-block text-sm text-slate-500">
                    Stay on track with curated weekly sets.
                  </span>
                </div>

                <UserWeeklyPracticeClient
                  initialData={weeklyPractices || []}
                  showSummary={false}
                />
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Play className="size-6 text-blue-600 dark:text-blue-400" />
                    Practice Zone
                  </h2>
                  <span className="hidden md:inline-block text-sm text-slate-500">
                    Start solving problems to master your skills.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {practiceCards.map((card) => (
                    <Link key={card.href} href={card.href}>
                      <div className="group h-full cursor-pointer p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300">
                        <div className="flex flex-col h-full">
                          <div className="size-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            {card.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            {card.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow leading-relaxed">
                            {card.title === "Quick Practice"
                              ? "Jump straight into a session with 10 random questions. Best for daily consistency."
                              : "Distraction-free, infinite flow of questions. Focus purely on problem solving."}
                          </p>
                          <div className="flex items-center text-blue-600 dark:text-blue-400 font-bold text-sm group-hover:gap-2 transition-[gap]">
                            {card.title === "Quick Practice"
                              ? "Start Session"
                              : "Enter Flow"}{" "}
                            <ChevronRight className="size-4 ml-2" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
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
                        onClickOverride={() => {
                          router.push(
                            `/library/${subject.slug}/question-banks/${bank.slug}`,
                          );
                        }}
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
                        onClickOverride={() => {
                          router.push(
                            `/library/${subject.slug}/exams/${exam.slug}`,
                          );
                        }}
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
        </Tabs>
      </section>
    </div>
  );
}
