import type { Question } from "@/types/database";
import type { QuestionPoolListItem } from "@/lib/actions/questionPool";

type QuestionType = Question["type"];

export function dedupeQuestionsById(
  questions: QuestionPoolListItem[],
): QuestionPoolListItem[] {
  const seen = new Set<number>();
  const deduped: QuestionPoolListItem[] = [];

  for (const question of questions) {
    if (seen.has(question.id)) continue;
    seen.add(question.id);
    deduped.push(question);
  }

  return deduped;
}

export function filterQuestionPool(
  questions: QuestionPoolListItem[],
  filters: {
    searchQuery: string;
    typeFilter: string;
    topicFilter: string;
  },
): QuestionPoolListItem[] {
  const normalizedQuery = filters.searchQuery.trim().toLowerCase();

  return questions.filter((question) => {
    const title = (question.title || "").toLowerCase();
    const content = (question.content || "").toLowerCase();
    const matchesSearch =
      normalizedQuery.length === 0 ||
      title.includes(normalizedQuery) ||
      content.includes(normalizedQuery);
    const matchesType =
      filters.typeFilter === "all" || question.type === filters.typeFilter;
    const matchesTopic =
      filters.topicFilter === "all" ||
      question.topic_id?.toString() === filters.topicFilter;

    return matchesSearch && matchesType && matchesTopic;
  });
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function applyRandomRules(input: {
  pool: QuestionPoolListItem[];
  rules: Partial<Record<QuestionType, number>>;
  generationTopicId: string;
}): QuestionPoolListItem[] {
  const filteredPool =
    input.generationTopicId === "all"
      ? input.pool
      : input.pool.filter(
          (question) => question.topic_id?.toString() === input.generationTopicId,
        );

  const result: QuestionPoolListItem[] = [];

  for (const [type, rawCount] of Object.entries(input.rules)) {
    const count = Math.max(0, Number(rawCount) || 0);
    if (count === 0) continue;

    const candidates = filteredPool.filter((question) => question.type === type);
    result.push(...shuffle(candidates).slice(0, count));
  }

  return dedupeQuestionsById(result);
}
