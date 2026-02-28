"use server";

import { createClient } from "@/lib/supabase/server";
import type { Question, Topic } from "@/types/database";

export type QuestionPoolListItem = Pick<
  Question,
  | "id"
  | "subject_id"
  | "title"
  | "content"
  | "type"
  | "difficulty"
  | "topic_id"
  | "options"
  | "code_snippet"
>;

export async function getQuestionPoolBySubject(input: {
  subjectId: number;
  limit?: number;
}): Promise<{ questions: QuestionPoolListItem[]; topics: Topic[] }> {
  const supabase = await createClient();
  const safeLimit = Math.min(Math.max(input.limit ?? 500, 1), 2000);

  const [questionsRes, topicsRes] = await Promise.all([
    supabase
      .from("questions")
      .select(
        "id, subject_id, title, content, type, difficulty, topic_id, options, code_snippet",
      )
      .eq("subject_id", input.subjectId)
      .order("type")
      .limit(safeLimit),
    supabase
      .from("topics")
      .select("*")
      .eq("subject_id", input.subjectId)
      .order("name"),
  ]);

  if (questionsRes.error) {
    throw new Error(`Failed to load questions: ${questionsRes.error.message}`);
  }

  if (topicsRes.error) {
    throw new Error(`Failed to load topics: ${topicsRes.error.message}`);
  }

  return {
    questions: (questionsRes.data as QuestionPoolListItem[]) || [],
    topics: (topicsRes.data as Topic[]) || [],
  };
}

export async function getQuestionPreviewById(input: {
  questionId: number;
}): Promise<(Question & { subjects?: { name: string } | null }) | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, subject_id, title, content, type, difficulty, options, answer, explanation, code_snippet, topic_id, tags, test_cases, created_at, subjects(name)",
    )
    .eq("id", input.questionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load question preview: ${error.message}`);
  }

  return (data as (Question & { subjects?: { name: string } | null }) | null) ?? null;
}
