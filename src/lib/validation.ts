import { z } from "zod";

/**
 * Common validation schemas for server actions
 */

// Answer modes
export const AnswerModeSchema = z.enum([
  "practice",
  "flashcard",
  "immersive",
  "exam",
]);

// Record answer input
export const RecordAnswerSchema = z.object({
  questionId: z.number().int().positive(),
  userAnswer: z.string().max(10000),
  isCorrect: z.boolean(),
  mode: AnswerModeSchema,
  timeSpent: z.number().int().min(0).optional(),
});

// Referral code (6 alphanumeric characters)
export const ReferralCodeSchema = z
  .string()
  .length(6)
  .regex(/^[A-Z0-9]+$/, "Invalid referral code format");

// Bank ID
export const BankIdSchema = z.number().int().positive();

// Search query
export const SearchQuerySchema = z
  .string()
  .min(2, "Query too short")
  .max(100, "Query too long");

// Pagination
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// URL path validation (must start with /)
export const SafePathSchema = z
  .string()
  .regex(/^\/[a-zA-Z0-9\-_\/]*$/, "Invalid path")
  .max(200);

/**
 * Helper to validate and parse input with error handling
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Return first error message (Zod v4 uses issues array)
  const firstIssue = result.error.issues?.[0];
  return {
    success: false,
    error: firstIssue?.message || "Validation failed",
  };
}

/**
 * Throws if validation fails - use in server actions
 */
export function parseInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}
