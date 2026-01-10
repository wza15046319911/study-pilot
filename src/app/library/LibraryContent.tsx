"use client";

import { SubjectGrid } from "./SubjectGrid";
import { ContainerScroll } from "@/components/aceternity/container-scroll-animation";

interface LibraryContentProps {
  subjects: any[];
}

export function LibraryContent({
  subjects,
}: LibraryContentProps) {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <div className="max-w-4xl mx-auto mb-10 text-center">
            <div className="inline-block mb-4">
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-widest rounded-full border border-blue-100 dark:border-blue-800">
                Academic Year 2026
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-medium text-slate-900 dark:text-white mb-6 tracking-tight">
              Library
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-light max-w-2xl mx-auto mb-10">
              Access your complete catalog of course materials, including curated
              question banks, mock exams, and intelligent study tools.
            </p>

            {/* Quick Stats Bar */}
            <div className="inline-flex flex-wrap items-center justify-center gap-4 md:gap-12 bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl px-8 py-4 shadow-sm">
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
          </div>
        }
      >
        <SubjectGrid subjects={subjects} />
      </ContainerScroll>
    </div>
  );
}
