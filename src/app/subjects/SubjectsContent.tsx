"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Input } from "@/components/ui/Input";
import type { Subject } from "@/types/database";
import { Search, GraduationCap, ArrowRight, SearchX } from "lucide-react";
import { encodeId } from "@/lib/ids";

// Color mapping based on category
const categoryColors: Record<string, string> = {
  STEM: "bg-blue-50 text-blue-600 group-hover:bg-blue-600",
  Humanities: "bg-green-50 text-green-600 group-hover:bg-green-600",
};

// Fallback colors for variety
const iconColors = [
  "bg-blue-50 text-blue-600 group-hover:bg-blue-600",
  "bg-green-50 text-green-600 group-hover:bg-green-600",
  "bg-purple-50 text-purple-600 group-hover:bg-purple-600",
  "bg-orange-50 text-orange-600 group-hover:bg-orange-600",
  "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600",
  "bg-red-50 text-red-600 group-hover:bg-red-600",
];

interface SubjectsContentProps {
  subjects: Subject[];
}

export function SubjectsContent({ subjects }: SubjectsContentProps) {
  const [filter, setFilter] = useState<"All" | "STEM" | "Humanities">("All");
  const [search, setSearch] = useState("");

  const filteredSubjects = subjects.filter((s) => {
    const matchesCategory = filter === "All" || s.category === filter;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex gap-2">
          {(["All", "STEM", "Humanities"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === cat
                  ? "bg-[#135bec] text-white shadow-lg shadow-blue-500/25"
                  : "bg-white/50 hover:bg-white text-[#4c669a] border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-xs">
          <Input
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="size-5" />}
          />
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject, index) => (
          <Link key={subject.id} href={`/practice/${subject.slug}/setup`}>
            <GlassPanel
              variant="card"
              className="p-6 flex flex-col gap-4 group cursor-pointer h-full"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`size-14 rounded-xl flex items-center justify-center transition-colors duration-300 group-hover:text-white ${
                    categoryColors[subject.category || ""] ||
                    iconColors[index % iconColors.length]
                  }`}
                >
                  <GraduationCap className="size-8" />
                </div>
                <div className="flex gap-2">
                  {subject.is_hot && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">
                      Hot
                    </span>
                  )}
                  {subject.is_new && (
                    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">
                      New
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">{subject.name}</h3>
                <p className="text-[#4c669a] text-sm">{subject.description}</p>
              </div>
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                <span className="text-sm text-[#4c669a]">
                  <span className="font-bold text-[#0d121b]">
                    {subject.question_count}
                  </span>{" "}
                  questions
                </span>
                <span className="text-[#135bec] text-sm font-medium flex items-center gap-1">
                  Start Practice
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </GlassPanel>
          </Link>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="text-center py-12 text-[#4c669a]">
          <SearchX className="size-12 mb-4 mx-auto opacity-50" />
          <p>No subjects found matching your criteria</p>
        </div>
      )}
    </>
  );
}
