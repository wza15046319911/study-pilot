import "server-only";

import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface HomepageSubjectSummary {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
}

export interface HomepageSnapshot {
  totalQuestions: number;
  totalBanks: number;
  subjectCount: number;
  topSubjects: HomepageSubjectSummary[];
  updatedAt: string;
}

const FALLBACK_HOME_SNAPSHOT: HomepageSnapshot = {
  totalQuestions: 10_000,
  totalBanks: 50,
  subjectCount: 3,
  topSubjects: [],
  updatedAt: new Date().toISOString(),
};

function createPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing Supabase public environment variables");
  }

  return createSupabaseClient<Database>(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

const getCachedHomepageSnapshot = unstable_cache(
  async (): Promise<HomepageSnapshot> => {
    try {
      const supabase = createPublicSupabaseClient();

      const subjectsForCountsPromise = supabase
        .from("subjects")
        .select("question_count");

      const topSubjectsPromise = supabase
        .from("subjects")
        .select("id, name, slug, icon, description")
        .order("question_count", { ascending: false })
        .limit(10);

      const totalBanksPromise = supabase
        .from("question_banks")
        .select("id", { count: "planned", head: true })
        .eq("is_published", true);

      const [subjectsForCountsResult, topSubjectsResult, totalBanksResult] =
        await Promise.all([
          subjectsForCountsPromise,
          topSubjectsPromise,
          totalBanksPromise,
        ]);

      if (
        subjectsForCountsResult.error ||
        topSubjectsResult.error ||
        totalBanksResult.error
      ) {
        throw new Error("Failed to fetch homepage snapshot");
      }

      const subjectRows = (subjectsForCountsResult.data ?? []) as Array<{
        question_count: number | null;
      }>;
      const totalQuestions = subjectRows.reduce(
        (sum, row) => sum + (row.question_count ?? 0),
        0
      );

      return {
        totalQuestions:
          totalQuestions > 0
            ? totalQuestions
            : FALLBACK_HOME_SNAPSHOT.totalQuestions,
        totalBanks:
          totalBanksResult.count && totalBanksResult.count > 0
            ? totalBanksResult.count
            : FALLBACK_HOME_SNAPSHOT.totalBanks,
        subjectCount:
          subjectRows.length > 0
            ? subjectRows.length
            : FALLBACK_HOME_SNAPSHOT.subjectCount,
        topSubjects: (topSubjectsResult.data ?? []) as HomepageSubjectSummary[],
        updatedAt: new Date().toISOString(),
      };
    } catch {
      return {
        ...FALLBACK_HOME_SNAPSHOT,
        updatedAt: new Date().toISOString(),
      };
    }
  },
  ["homepage-snapshot-v1"],
  {
    revalidate: 900,
    tags: ["homepage-snapshot"],
  }
);

export async function getHomepageSnapshot(): Promise<HomepageSnapshot> {
  return getCachedHomepageSnapshot();
}
