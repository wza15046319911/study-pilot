import { unstable_cache } from "next/cache";
import { getAIProvider } from "@/lib/ai";

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
  codeSnippet?: string
): Promise<{ success: boolean; explanation?: string; error?: string }> {
  try {
    const explanation = await getCachedCompletion(
      questionContent,
      correctAnswer,
      codeSnippet
    );

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
