"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
// import { SubjectGrid } from "./SubjectGrid";
import { Subject } from "@/types/database";
import { motion } from "framer-motion";

interface LibraryContentProps {
  subjects: Subject[];
}

export function LibraryContent({ subjects }: LibraryContentProps) {
  const router = useRouter();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const placeholders = [
    "Search for CSSE1001...",
    "Looking for INFS3202?",
    "Find mock exams for COMP3506...",
    "Browse question banks...",
    "Type a course code or name...",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Reset coming soon state when user types
    if (showComingSoon) {
      setShowComingSoon(false);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputElement = e.currentTarget.querySelector("input");
    if (!inputElement) return;
    const searchValue = inputElement.value.toLowerCase().trim();

    if (!searchValue) return;

    // Find matching subject
    const foundSubject = subjects.find(
      (sub) =>
        sub.name.toLowerCase().includes(searchValue) ||
        sub.slug.toLowerCase().includes(searchValue) ||
        (sub.uuid && sub.uuid.toLowerCase().includes(searchValue)),
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
            Academic Year 2026
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-medium text-slate-900 dark:text-white mb-8 tracking-tight">
          What do you want to learn today?
        </h1>

        <div className="max-w-xl mx-auto mb-12">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleChange}
            onSubmit={onSubmit}
          />
        </div>

        {showComingSoon && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="text-4xl mb-3">🚧</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Course Coming Soon
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              We couldn't find a matching course in our library right now. We
              are constantly adding new materials!
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
