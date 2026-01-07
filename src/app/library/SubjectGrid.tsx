import Link from "next/link";
import { BookOpen, ChevronRight, GraduationCap, FileText } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

interface Subject {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

interface SubjectGridProps {
  subjects: Subject[];
  bankCounts: Record<number, number>;
  examCounts: Record<number, number>;
}

export function SubjectGrid({
  subjects,
  bankCounts,
  examCounts,
}: SubjectGridProps) {
  if (subjects.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center size-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
          <BookOpen className="size-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-2">
          Library Empty
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          No subjects found at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {subjects.map((subject) => {
        const bankCount = bankCounts[subject.id] || 0;
        const examCount = examCounts[subject.id] || 0;

        // Extract course code if present (e.g. "CSSE1001" from start of string)
        const codeMatch = subject.name.match(/^([A-Z]{4}\d{4})/);
        const courseCode = codeMatch ? codeMatch[1] : null;
        const displayName = courseCode
          ? subject.name.substring(courseCode.length).replace(/^[\s-:]+/, "")
          : subject.name;

        return (
          <Link
            key={subject.id}
            href={`/library/${subject.slug}`}
            className="group block h-full focus:outline-none"
          >
            <GlassPanel
              variant="card"
              className="h-full p-0 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 relative border-slate-200 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-800"
            >
              {/* Decorative Spine/Accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="p-7 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="size-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center text-3xl shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform duration-300">
                    {subject.icon || "📚"}
                  </div>
                  <div className="size-8 rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
                    <ChevronRight className="size-5" />
                  </div>
                </div>

                {/* Title */}
                <div className="mb-4">
                  {courseCode && (
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
                      {courseCode}
                    </div>
                  )}
                  <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    {displayName || courseCode || subject.name}
                  </h3>
                </div>

                {/* Description */}
                {subject.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed flex-grow">
                    {subject.description}
                  </p>
                )}

                {!subject.description && <div className="flex-grow" />}

                {/* Stats Footer */}
                <div className="pt-5 border-t border-slate-100 dark:border-slate-800/50 flex items-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-slate-400" />
                    <span>
                      {bankCount} Bank{bankCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="size-4 text-slate-400" />
                    <span>
                      {examCount} Exam{examCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </Link>
        );
      })}
    </div>
  );
}
