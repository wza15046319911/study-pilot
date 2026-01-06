"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Subject } from "@/types/database";
import { ArrowRight, Search, Sparkles } from "lucide-react";

// Gradient presets for cards
const gradients = [
  "from-slate-800 to-slate-900",
  "from-zinc-800 to-zinc-900",
  "from-neutral-800 to-neutral-900",
  "from-stone-800 to-stone-900",
  "from-slate-700 to-slate-800",
  "from-gray-800 to-gray-900",
];

interface SubjectsContentProps {
  subjects: Subject[];
}

export function SubjectsContent({ subjects }: SubjectsContentProps) {
  const [search, setSearch] = useState("");

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  // First subject becomes "featured"
  const featured = filteredSubjects[0];
  const rest = filteredSubjects.slice(1);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="size-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search subjects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg text-sm"
        />
      </div>

      {/* Featured Card */}
      {featured && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href={`/library/${featured.slug}/setup`}>
            <div
              className={`relative group overflow-hidden rounded-3xl bg-gradient-to-br ${gradients[0]} p-8 md:p-12 text-white shadow-2xl cursor-pointer transition-transform duration-300 hover:scale-[1.02]`}
            >
              {/* Decorative blobs */}
              <div className="absolute -top-20 -right-20 size-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 size-48 bg-black/10 rounded-full blur-3xl" />

              <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="size-5 text-yellow-300" />
                    <span className="text-sm font-medium text-white/80">
                      Featured Course
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black mb-4">
                    {featured.name}
                  </h2>
                  <p className="text-white/80 text-lg mb-6 max-w-md">
                    {featured.description ||
                      "Master this subject with our comprehensive question bank."}
                  </p>
                  <div className="flex items-center gap-6">
                    <span className="text-2xl font-bold">
                      {featured.question_count} Questions
                    </span>
                    <span className="flex items-center gap-2 text-white/90 font-medium group-hover:gap-3 transition-all">
                      Start Now <ArrowRight className="size-5" />
                    </span>
                  </div>
                </div>
                <div className="hidden md:flex justify-center items-center">
                  <div className="text-[120px] drop-shadow-2xl">
                    {featured.icon || "📚"}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="absolute top-6 right-6 flex gap-2">
                {featured.is_hot && (
                  <span className="px-3 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full shadow">
                    🔥 HOT
                  </span>
                )}
                {featured.is_new && (
                  <span className="px-3 py-1 bg-green-500/90 text-white text-xs font-bold rounded-full shadow">
                    ✨ NEW
                  </span>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Grid of remaining subjects */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rest.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
          >
            <Link
              href={`/library/${subject.slug}/setup`}
              className="block h-full"
            >
              <div
                className={`relative group h-full overflow-hidden rounded-2xl bg-gradient-to-br ${
                  gradients[(index + 1) % gradients.length]
                } p-6 text-white shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}
                style={{ perspective: "1000px" }}
              >
                {/* Subtle glow */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl drop-shadow-lg">
                      {subject.icon || "📖"}
                    </div>
                    <div className="flex gap-1">
                      {subject.is_hot && (
                        <span className="px-2 py-0.5 bg-white/20 backdrop-blur text-white text-[10px] font-bold rounded-full">
                          HOT
                        </span>
                      )}
                      {subject.is_new && (
                        <span className="px-2 py-0.5 bg-white/20 backdrop-blur text-white text-[10px] font-bold rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2">{subject.name}</h3>
                  <p className="text-white/70 text-sm mb-4 line-clamp-2 flex-grow">
                    {subject.description || "Practice and master this subject."}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <span className="text-sm font-medium">
                      {subject.question_count} Questions
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium opacity-80 group-hover:opacity-100 group-hover:gap-2 transition-all">
                      Practice <ArrowRight className="size-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSubjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            No subjects found
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Try adjusting your search terms
          </p>
        </motion.div>
      )}
    </div>
  );
}
