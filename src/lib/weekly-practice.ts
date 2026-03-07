import type { WeeklyPracticeSummaryItem } from "@/components/weekly-practice/shared";

const WEEKLY_PRACTICE_SUMMARY_SELECT = `
  id,
  title,
  slug,
  description,
  week_start,
  video_url,
  subject:subjects (
    name,
    slug
  ),
  items:weekly_practice_items(count)
`;

const WEEKLY_PRACTICE_SUMMARY_SELECT_FALLBACK = `
  id,
  title,
  slug,
  description,
  week_start,
  subject:subjects (
    name,
    slug
  ),
  items:weekly_practice_items(count)
`;

const isMissingVideoUrlColumnError = (error: { message?: string } | null) =>
  Boolean(error?.message?.includes("video_url"));

export async function fetchWeeklyPracticeSummaries(
  runQuery: (
    selectClause: string,
  ) => Promise<{ data: unknown[] | null; error: { message?: string } | null }>,
) {
  const result = await runQuery(WEEKLY_PRACTICE_SUMMARY_SELECT);

  if (!isMissingVideoUrlColumnError(result.error)) {
    return {
      data: (result.data as WeeklyPracticeSummaryItem[] | null) || [],
      error: result.error,
    };
  }

  const fallbackResult = await runQuery(WEEKLY_PRACTICE_SUMMARY_SELECT_FALLBACK);

  return {
    data: (((fallbackResult.data as WeeklyPracticeSummaryItem[] | null) || []).map(
      (practice) => ({
        ...practice,
        video_url: null,
      }),
    )),
    error: fallbackResult.error,
  };
}

export async function fetchWeeklyPracticeSummary(
  runQuery: (
    selectClause: string,
  ) => Promise<{ data: unknown | null; error: { message?: string } | null }>,
) {
  const result = await runQuery(WEEKLY_PRACTICE_SUMMARY_SELECT);

  if (!isMissingVideoUrlColumnError(result.error)) {
    return {
      data: (result.data as WeeklyPracticeSummaryItem | null) || null,
      error: result.error,
    };
  }

  const fallbackResult = await runQuery(WEEKLY_PRACTICE_SUMMARY_SELECT_FALLBACK);

  return {
    data: fallbackResult.data
      ? ({
          ...(fallbackResult.data as WeeklyPracticeSummaryItem),
          video_url: null,
        } satisfies WeeklyPracticeSummaryItem)
      : null,
    error: fallbackResult.error,
  };
}
