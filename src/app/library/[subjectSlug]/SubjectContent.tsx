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
import { useTranslations } from "next-intl";

interface SubjectContentProps {
  subject: {
    id: number;
    name: string;
    slug: string;
    icon?: string;
  };
  exams: AccessItem[];
  banks: AccessItem[];
  isVip: boolean;
  unlockedBankIds: Set<number>;
  unlockedExamIds: Set<number>;
  questionCount: number;
  examDates: {
    id: number;
    exam_type: "midterm" | "final" | string;
    exam_date: string;
  }[];
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

type AccessTier = "invite" | "public" | "premium" | "paid" | "private";
type AccessItem = {
  id: number;
  slug: string | null;
  unlock_type: "free" | "premium" | "referral" | "paid" | null;
  is_premium: boolean | null;
  visibility?: "public" | "assigned_only";
  items?: { count: number }[] | null;
};

const ACCESS_TIER_ORDER: AccessTier[] = [
  "private",
  "invite",
  "public",
  "premium",
  "paid",
];

const getAccessTier = (item: AccessItem): AccessTier => {
  if (item.visibility === "assigned_only") return "private";
  if (item.unlock_type === "referral") return "invite";
  if (item.unlock_type === "paid") return "paid";
  if (item.is_premium) return "premium";
  return "public";
};

const groupByAccessTier = (items: AccessItem[]) =>
  ACCESS_TIER_ORDER.map((tier) => ({
    tier,
    items: items.filter((item) => getAccessTier(item) === tier),
  })).filter((group) => group.items.length > 0);

const studyToolCards = [
  {
    key: "weekly",
    accent:
      "border-sky-200/70 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.25),_transparent_55%),linear-gradient(135deg,rgba(240,249,255,0.85),rgba(255,255,255,0.95))] dark:border-sky-900/60 dark:bg-[radial-gradient(circle_at_top_right,_rgba(14,116,144,0.35),_transparent_55%),linear-gradient(135deg,rgba(2,6,23,0.75),rgba(15,23,42,0.9))]",
    pill: "text-sky-700 bg-sky-100/70 dark:text-sky-200 dark:bg-sky-900/35",
    iconClass: "text-sky-600 dark:text-sky-300",
    dotClass: "bg-sky-500",
  },
  {
    key: "bank",
    accent:
      "border-violet-200/70 bg-[radial-gradient(circle_at_top_right,_rgba(167,139,250,0.25),_transparent_55%),linear-gradient(135deg,rgba(245,243,255,0.88),rgba(255,255,255,0.95))] dark:border-violet-900/60 dark:bg-[radial-gradient(circle_at_top_right,_rgba(109,40,217,0.35),_transparent_55%),linear-gradient(135deg,rgba(15,23,42,0.85),rgba(30,27,75,0.75))]",
    pill: "text-violet-700 bg-violet-100/70 dark:text-violet-200 dark:bg-violet-900/35",
    iconClass: "text-violet-600 dark:text-violet-300",
    dotClass: "bg-violet-500",
  },
  {
    key: "mock",
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
  examDates,
  weeklyPractices,
  pastExams,
}: SubjectContentProps) {
  const t = useTranslations("subjectContent");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const accessTierLabels: Record<AccessTier, string> = {
    invite: t("access.invite"),
    public: t("access.public"),
    premium: t("access.premium"),
    paid: t("access.paid"),
    private: "Private Assigned", // Fallback or add to translation
  };
  const getSemesterLabel = (semester: number) =>
    semester === 1 ? t("semester.one") : t("semester.two");

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

  const groupedBanksByAccessTier = groupByAccessTier(banks);
  const groupedExamsByAccessTier = groupByAccessTier(exams);

  return (
    <div className="py-12 space-y-12">
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title={t("premiumModal.title")}
        description={t("premiumModal.description")}
      />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              {subject.name}
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-light max-w-2xl">
              {t("hero.description")}
            </p>

            {upcomingExam && (
              <div className="mt-6 inline-flex flex-wrap items-center gap-3 px-5 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold animate-pulse">
                  <Clock className="size-5" />
                  <span>
                    {upcomingExam.exam_type === "midterm"
                      ? t("hero.midterm")
                      : t("hero.final")}{" "}
                    {t("hero.examCountdown")}
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
                <p className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
                  {t("toolkit.title")}
                </p>
              </div>
              <Link
                href="/profile/homework"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 transition-colors"
              >
                {t("toolkit.homeworkInProfile")}
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
                    <span className={`text-sm font-semibold ${card.iconClass}`}>
                      {card.key === "weekly"
                        ? t("toolkit.cards.weekly.pill")
                        : card.key === "bank"
                          ? t("toolkit.cards.bank.pill")
                          : t("toolkit.cards.mock.pill")}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                    {t(`toolkit.cards.${card.key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {t(`toolkit.cards.${card.key}.body`)}
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
              {t("tabs.weeklyPractice")}
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
              {t("tabs.questionBanks")}
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
              {t("tabs.mockExams")}
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
              {t("tabs.pastExamAnswers")}
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
                    {t("weeklyPractice.title")}
                  </h2>
                  <span className="hidden md:inline-block text-sm text-slate-500">
                    {t("weeklyPractice.subtitle")}
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
                  {t("empty.weekly.title")}
                </h3>
                <p className="text-slate-500">
                  {t("empty.weekly.description")}
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
                      {t("questionBanks.curatedCollections")}
                    </h2>
                  </div>
                  <div className="space-y-10">
                    {groupedBanksByAccessTier.map((group) => (
                      <section key={`bank-${group.tier}`} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm md:text-base font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                            {accessTierLabels[group.tier]}
                          </h3>
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                            {group.items.length}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                          {group.items.map((bank) => (
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
                      </section>
                    ))}
                  </div>
                </>
              ) : (
                <div className="max-w-md mx-auto text-center py-20 px-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                  <BookOpen className="size-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {t("empty.banks.title")}
                  </h3>
                  <p className="text-slate-500">
                    {t("empty.banks.description")}
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
                      {t("mockExams.title")}
                    </h2>
                  </div>
                  <div className="space-y-10">
                    {groupedExamsByAccessTier.map((group) => (
                      <section key={`exam-${group.tier}`} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm md:text-base font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                            {accessTierLabels[group.tier]}
                          </h3>
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                            {group.items.length}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                          {group.items.map((exam) => (
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
                      </section>
                    ))}
                  </div>
                </>
              ) : (
                <div className="max-w-md mx-auto text-center py-20 px-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                  <GraduationCap className="size-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {t("empty.mockExams.title")}
                  </h3>
                  <p className="text-slate-500">
                    {t("empty.mockExams.description")}
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
                              {t("pastExams.archive")}
                            </div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                              {year}
                            </div>
                          </div>
                          <div className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                            {t("pastExams.answerKey")}
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
                                        t("pastExams.paper", {
                                          number: index + 1,
                                        })}
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
                    {t("empty.pastExams.title")}
                  </h3>
                  <p className="text-slate-500">
                    {t("empty.pastExams.description")}
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
