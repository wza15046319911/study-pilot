/**
 * Spaced Repetition System (SRS) Utility based on SM-2 Algorithm
 */

export interface SRSItem {
  nextReviewAt: Date;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}

// Quality: 0-5
// 5 - perfect response
// 4 - correct response after a hesitation
// 3 - correct response recalled with serious difficulty
// 2 - incorrect response; where the correct one seemed easy to recall
// 1 - incorrect response; the correct one remembered
// 0 - complete blackout.
export type SRSQuality = 0 | 1 | 2 | 3 | 4 | 5;

export function calculateSM2(
  quality: SRSQuality,
  prevInterval: number,
  prevEase: number,
  prevRepetitions: number
): SRSItem {
  let interval: number;
  let ease: number;
  let repetitions: number;

  if (quality >= 3) {
    // Correct response
    if (prevRepetitions === 0) {
      interval = 1;
    } else if (prevRepetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(prevInterval * prevEase);
    }
    repetitions = prevRepetitions + 1;

    // Update ease factor
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    ease = prevEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else {
    // Incorrect response
    repetitions = 0;
    interval = 1;
    ease = prevEase; // Ease factor doesn't change on failure in standard SM-2, sometimes it decreases
  }

  // Minimum ease factor is 1.3
  if (ease < 1.3) ease = 1.3;

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return {
    nextReviewAt,
    intervalDays: interval,
    easeFactor: ease,
    repetitions,
  };
}

export const getNextReviewIntervals = (item: {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}) => {
  // Preview what the intervals would be for each button
  return {
    again: calculateSM2(
      0,
      item.intervalDays,
      item.easeFactor,
      item.repetitions
    ),
    hard: calculateSM2(3, item.intervalDays, item.easeFactor, item.repetitions),
    good: calculateSM2(4, item.intervalDays, item.easeFactor, item.repetitions),
    easy: calculateSM2(5, item.intervalDays, item.easeFactor, item.repetitions),
  };
};
