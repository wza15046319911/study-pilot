"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function syncUserProgress() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 1. Fetch all user answers with question details
    const { data: userAnswers, error: answersError } = (await supabase
      .from("user_answers")
      .select(
        `
        is_correct,
        question:questions (
          subject_id,
          topic_id
        )
      `,
      )
      .eq("user_id", user.id)) as {
      data: { is_correct: boolean; question: any }[] | null;
      error: any;
    };

    if (answersError) throw answersError;
    if (!userAnswers) return { success: true, count: 0 };

    // 2. Aggregate data by subject and topic
    const subjectProgress = new Map<
      number,
      { completed: number; correct: number }
    >();
    const topicProgress = new Map<
      number,
      { completed: number; correct: number }
    >();

    for (const answer of userAnswers) {
      // The type for question in the join result might be an array or object depending on schema,
      // but usually object for singular relation. Casting safely.
      const question = answer.question as unknown as {
        subject_id: number;
        topic_id: number | null;
      } | null;

      if (!question) continue;

      // Update subject stats
      const subStats = subjectProgress.get(question.subject_id) || {
        completed: 0,
        correct: 0,
      };
      subStats.completed++;
      if (answer.is_correct) subStats.correct++;
      subjectProgress.set(question.subject_id, subStats);

      // Update topic stats
      if (question.topic_id) {
        const topStats = topicProgress.get(question.topic_id) || {
          completed: 0,
          correct: 0,
        };
        topStats.completed++;
        if (answer.is_correct) topStats.correct++;
        topicProgress.set(question.topic_id, topStats);
      }
    }

    const updatedAt = new Date().toISOString();

    // 3. Update user_progress table
    const subjectRows = Array.from(subjectProgress.entries()).map(
      ([subjectId, stats]) => ({
        user_id: user.id,
        subject_id: subjectId,
        completed_count: stats.completed,
        correct_count: stats.correct,
        updated_at: updatedAt,
      }),
    );

    // 4. Update topic_progress table
    const topicRows = Array.from(topicProgress.entries()).map(
      ([topicId, stats]) => ({
        user_id: user.id,
        topic_id: topicId,
        completed_count: stats.completed,
        correct_count: stats.correct,
        updated_at: updatedAt,
      }),
    );

    const updates: Promise<any>[] = [];

    if (subjectRows.length > 0) {
      updates.push(
        Promise.resolve(
          supabase
            .from("user_progress")
            .upsert(subjectRows as any, { onConflict: "user_id,subject_id" }),
        ),
      );
    }

    if (topicRows.length > 0) {
      updates.push(
        Promise.resolve(
          supabase
            .from("topic_progress")
            .upsert(topicRows as any, { onConflict: "user_id,topic_id" }),
        ),
      );
    }

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error syncing progress:", error);
    return { success: false, error: "Failed to sync progress" };
  }
}
