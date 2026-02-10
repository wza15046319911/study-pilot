"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
// import { SubjectGrid } from "./SubjectGrid";
import { Subject } from "@/types/database";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface LibraryContentProps {
  subjects: Subject[];
  subjectStatsById: Record<
    number,
    {
      weeklyPracticeCount: number;
      questionBankCount: number;
      mockExamCount: number;
    }
  >;
}

const toSearchToken = (value: string) =>
  value.toLowerCase().replace(/[\s_-]+/g, "");

const getSearchableVariants = (subject: Subject): string[] => {
  const baseValues = [subject.name, subject.slug, subject.uuid ?? ""].filter(
    Boolean,
  ) as string[];

  const variants = new Set<string>();

  for (const value of baseValues) {
    const lowerValue = value.toLowerCase();
    variants.add(lowerValue);
    variants.add(toSearchToken(lowerValue));

    // Expand patterns like "csse1001/7030" so "csse7030" can match too.
    const slashCodePattern = /([a-z]{2,})(\d{4})\s*\/\s*(\d{4})/gi;
    for (const match of lowerValue.matchAll(slashCodePattern)) {
      const [, prefix, firstCode, secondCode] = match;
      variants.add(`${prefix}${firstCode}`);
      variants.add(`${prefix}${secondCode}`);
    }
  }

  return Array.from(variants);
};

export function LibraryContent({
  subjects,
  subjectStatsById,
}: LibraryContentProps) {
  const t = useTranslations("library");
  const router = useRouter();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const placeholders = [
    t("search.placeholder1"),
    t("search.placeholder2"),
    t("search.placeholder3"),
    t("search.placeholder4"),
    t("search.placeholder5"),
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void e;
    // Reset coming soon state when user types
    if (showComingSoon) {
      setShowComingSoon(false);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputElement = e.currentTarget.querySelector("input");
    if (!inputElement) return;
    const rawSearchValue = inputElement.value.toLowerCase().trim();
    const normalizedSearchValue = toSearchToken(rawSearchValue);

    if (!rawSearchValue) return;

    // Find matching subject
    const foundSubject = subjects.find((sub) =>
      getSearchableVariants(sub).some(
        (variant) =>
          variant.includes(rawSearchValue) ||
          variant.includes(normalizedSearchValue),
      ),
    );

    if (foundSubject) {
      // Navigate to the subject library page
      // Assuming the route is /library/[slug] based on file structure mentioned in logs
      // The user log shows /library/[subjectSlug]/...
      router.push(`/library/${foundSubject.slug}`);
    } else {
      setShowComingSoon(true);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-[60vh] items-center justify-center">
      <div className="max-w-4xl mx-auto w-full text-center px-4">
        <div className="inline-block mb-6">
          <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-widest rounded-full border border-blue-100 dark:border-blue-800">
            {t("badge")}
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-medium text-slate-900 dark:text-white mb-8 tracking-tight">
          {t("title")}
        </h1>

        <div className="max-w-xl mx-auto mb-12">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleChange}
            onSubmit={onSubmit}
          />
        </div>

        <section className="max-w-4xl mx-auto mb-10 text-left">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm p-6 md:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {t("availableSubjects")}
                </p>
                <h2 className="text-xl md:text-2xl font-serif font-semibold text-slate-900 dark:text-white mt-1">
                  {t("pickSubject")}
                </h2>
              </div>
              <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t("subjectCount", { count: subjects.length })}
              </span>
            </div>

            {subjects.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {subjects.map((subject, index) => {
                  const stats = subjectStatsById[subject.id] || {
                    weeklyPracticeCount: 0,
                    questionBankCount: 0,
                    mockExamCount: 0,
                  };

                  return (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.25,
                        delay: Math.min(index * 0.03, 0.18),
                      }}
                    >
                      <Link
                        href={`/library/${subject.slug}`}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-white dark:hover:bg-slate-900"
                      >
                        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-lg">
                          {subject.icon || "📚"}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {subject.name}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-slate-500 dark:text-slate-400">
                            <span>
                              {t("stats.weekly", {
                                count: stats.weeklyPracticeCount,
                              })}
                            </span>
                            <span
                              aria-hidden
                              className="text-slate-300 dark:text-slate-600"
                            >
                              •
                            </span>
                            <span>
                              {t("stats.banks", {
                                count: stats.questionBankCount,
                              })}
                            </span>
                            <span
                              aria-hidden
                              className="text-slate-300 dark:text-slate-600"
                            >
                              •
                            </span>
                            <span>
                              {t("stats.exams", {
                                count: stats.mockExamCount,
                              })}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                {t("noSubjects")}
              </p>
            )}
          </div>
        </section>

        {showComingSoon && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="text-4xl mb-3">🚧</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("comingSoon.title")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t("comingSoon.description")}
            </p>
          </motion.div>
        )}

        {/* 
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-light max-w-2xl mx-auto mb-12">
          Access your complete catalog of course materials, including curated
          question banks, mock exams, and intelligent study tools.
        </p>

        <div className="inline-flex flex-wrap items-center justify-center gap-4 md:gap-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-8 py-4 shadow-sm mx-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
              {subjects.length}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Subjects
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden md:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
              25k+
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Questions
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden md:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
              Active
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Status
            </div>
          </div>
        </div>
        */}
      </div>

      {/* <SubjectGrid subjects={subjects} /> */}
    </div>
  );
}
