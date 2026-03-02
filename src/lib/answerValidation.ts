import type { Question } from "@/types/database";

/**
 * 规范化答案用于比较：trim 前后空格和换行符
 * （判定对错时首尾空白不计入差异）
 */
function normalizeForComparison(s: string): string {
  return s.trim();
}

/**
 * 判定用户答案是否正确
 * - 比较时 trim 掉前后空格（不把换行符算作差异）
 * - 当正确答案为 N/A 时，任何答案都算正确
 */
export function isQuestionCorrect(
  question: Question,
  userAnswer?: string
): boolean {
  if (!userAnswer) return false;

  if (question.type === "coding_challenge") {
    return userAnswer.trim().length > 0;
  }

  const correctAnswer = question.answer ?? "";
  if (normalizeForComparison(correctAnswer).toUpperCase() === "N/A") {
    return true;
  }

  return (
    normalizeForComparison(userAnswer) === normalizeForComparison(correctAnswer)
  );
}
