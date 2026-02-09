export type StudyWeekCode =
  | "W1"
  | "W2"
  | "W3"
  | "W4"
  | "W5"
  | "W6"
  | "BREAK"
  | "W7"
  | "W8"
  | "W9"
  | "W10"
  | "W11"
  | "W12"
  | "W13"
  | "OTHER";

export interface StudyWeekMeta {
  code: StudyWeekCode;
  label: string;
  start: string;
  end: string;
  order: number;
}

export interface ResolvedStudyWeek {
  code: StudyWeekCode;
  label: string;
  rangeLabel: string;
  order: number;
}

const S1_2026_STUDY_WEEKS: StudyWeekMeta[] = [
  { code: "W1", label: "Week 1", start: "2026-02-23", end: "2026-03-01", order: 1 },
  { code: "W2", label: "Week 2", start: "2026-03-02", end: "2026-03-08", order: 2 },
  { code: "W3", label: "Week 3", start: "2026-03-09", end: "2026-03-15", order: 3 },
  { code: "W4", label: "Week 4", start: "2026-03-16", end: "2026-03-22", order: 4 },
  { code: "W5", label: "Week 5", start: "2026-03-23", end: "2026-03-29", order: 5 },
  { code: "W6", label: "Week 6", start: "2026-03-30", end: "2026-04-05", order: 6 },
  {
    code: "BREAK",
    label: "Mid-semester Break",
    start: "2026-04-06",
    end: "2026-04-12",
    order: 7,
  },
  { code: "W7", label: "Week 7", start: "2026-04-13", end: "2026-04-19", order: 8 },
  { code: "W8", label: "Week 8", start: "2026-04-20", end: "2026-04-26", order: 9 },
  { code: "W9", label: "Week 9", start: "2026-04-27", end: "2026-05-03", order: 10 },
  { code: "W10", label: "Week 10", start: "2026-05-04", end: "2026-05-10", order: 11 },
  { code: "W11", label: "Week 11", start: "2026-05-11", end: "2026-05-17", order: 12 },
  { code: "W12", label: "Week 12", start: "2026-05-18", end: "2026-05-24", order: 13 },
  { code: "W13", label: "Week 13", start: "2026-05-25", end: "2026-05-31", order: 14 },
];

const OTHER_WEEK: ResolvedStudyWeek = {
  code: "OTHER",
  label: "Other Weeks",
  rangeLabel: "",
  order: 99,
};

const dateLabelFormatter = new Intl.DateTimeFormat("en-AU", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const toDateKey = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  return Number(`${year}${month}${day}`);
};

const formatDateLabel = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-").map((part) => parseInt(part, 10));
  const utcDate = new Date(Date.UTC(year, (month || 1) - 1, day || 1));
  return dateLabelFormatter.format(utcDate);
};

const toResolvedStudyWeek = (week: StudyWeekMeta): ResolvedStudyWeek => ({
  code: week.code,
  label: week.label,
  rangeLabel: `${formatDateLabel(week.start)} – ${formatDateLabel(week.end)}`,
  order: week.order,
});

const RESOLVED_WEEKS = S1_2026_STUDY_WEEKS.map(toResolvedStudyWeek);

export const getWeekStartDateKey = (
  weekStart: string | null | undefined,
): number | null => toDateKey(weekStart);

export function resolveStudyWeekByStartDate(
  weekStart: string | null,
): ResolvedStudyWeek {
  const targetKey = toDateKey(weekStart);
  if (targetKey === null) return OTHER_WEEK;

  const matchedWeek = S1_2026_STUDY_WEEKS.find((week) => {
    const startKey = toDateKey(week.start);
    const endKey = toDateKey(week.end);
    if (startKey === null || endKey === null) return false;
    return targetKey >= startKey && targetKey <= endKey;
  });

  return matchedWeek ? toResolvedStudyWeek(matchedWeek) : OTHER_WEEK;
}

export function getStudyWeekFilterOptions(): Array<{
  value: string;
  label: string;
}> {
  return [
    { value: "all-weeks", label: "All Weeks" },
    ...RESOLVED_WEEKS.map((week) => ({
      value: week.code,
      label: week.label,
    })),
    { value: "OTHER", label: OTHER_WEEK.label },
  ];
}

