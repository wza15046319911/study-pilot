export type WeeklyPracticeSubmission = {
  submitted_at: string;
  answered_count: number;
  correct_count: number;
  total_count: number;
};

export type WeeklyPracticeSummaryItem = {
  id: number;
  title: string;
  slug: string | null;
  description: string | null;
  week_start: string | null;
  video_url?: string | null;
  subject: {
    name: string;
    slug: string | null;
  } | null;
  items?: { count: number }[] | null;
  latestSubmission?: WeeklyPracticeSubmission | null;
};

export const getWeeklyPracticeTotalQuestions = (
  practice: WeeklyPracticeSummaryItem,
) => practice.latestSubmission?.total_count || practice.items?.[0]?.count || 0;

export const isWeeklyPracticeFullyCompleted = (
  submission:
    | {
        answered_count: number;
        total_count: number;
      }
    | null
    | undefined,
  totalQuestions: number,
) => {
  if (!submission) return false;
  const targetCount = submission.total_count || totalQuestions;
  if (targetCount <= 0) return false;
  return submission.answered_count >= targetCount;
};
