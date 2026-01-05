"use server";

import { unstable_cache } from "next/cache";
import { getAIProvider } from "@/lib/ai";

import { createAdminClient } from "@/lib/supabase/server";

/**
 * Cache usage:
 * - Revalidates every 1 hour (3600 seconds)
 * - Keys based on question content, answer, and code snippet
 */
const getCachedCompletion = unstable_cache(
  async (content: string, answer: string, snippet?: string) => {
    const provider = getAIProvider();
    return provider.generateExplanation(content, answer, snippet);
  },
  ["ai-explanation"],
  {
    revalidate: 3600, // 1 hour cache
    tags: ["ai-explanation"],
  }
);

/**
 * Server action to get AI-generated explanation for a question
 */
export async function getExplanation(
  questionContent: string,
  correctAnswer: string,
  codeSnippet?: string | null, // Relaxed type to match DB
  questionId?: number
): Promise<{ success: boolean; explanation?: string; error?: string }> {
  try {
    const explanation = await getCachedCompletion(
      questionContent,
      correctAnswer,
      codeSnippet || undefined
    );

    if (explanation && questionId) {
      // Background update (fire and forget mostly, but we await to ensure it runs in lambda context)
      // Use admin client to bypass RLS if needed, or ensuring we have write access
      const supabase = createAdminClient();
      
      // Only update if explanation is currently null (don't overwrite manual explanations)
      await supabase
        .from("questions")
        .update({ explanation: explanation } as any) // Cast to any to avoid strict type checks on partial update depending on generated types
        .eq("id", questionId)
        .is("explanation", null);
    }

    return { success: true, explanation };
  } catch (error) {
    console.error("Failed to generate explanation:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate explanation",
    };
  }
}
