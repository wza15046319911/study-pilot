"use client";

import { FocusCards } from "@/components/aceternity/focus-cards";
import { BookOpen } from "lucide-react";

interface Subject {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

interface SubjectGridProps {
  subjects: Subject[];
}

export function SubjectGrid({ subjects }: SubjectGridProps) {
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

  const cards = subjects.map((subject) => {
    return {
      title: subject.name,
      // FocusCards expects a src, but we might only have an icon.
      // We can use a placeholder image service or modify FocusCards to accept an icon.
      // For now, let's use a nice abstract gradient or pattern if no image is available.
      // Or we can construct a data URI or use a specific image based on the subject slug if available.
      // Assuming no subject images yet, let's try to use the icon in a clever way or modify FocusCards.
      // I modified FocusCards to accept an icon prop as a fallback.
      icon: <span className="text-6xl">{subject.icon || "📚"}</span>,
      href: `/library/${subject.slug}`,
      // We can also add stats to the title or description if we want, but FocusCards is simple.
    };
  });

  return (
    <div className="w-full px-4">
      <FocusCards cards={cards} />
    </div>
  );
}
