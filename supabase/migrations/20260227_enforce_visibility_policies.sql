-- Enforce visibility-based access for question banks / exams and their item tables.
-- This migration removes overly broad select policies and recreates least-privilege variants.

-- ---------------------------
-- Question Banks
-- ---------------------------
DROP POLICY IF EXISTS "Authenticated users can select all banks" ON "public"."question_banks";
DROP POLICY IF EXISTS "Published banks are viewable by everyone" ON "public"."question_banks";
DROP POLICY IF EXISTS "Banks viewable by eligible users" ON "public"."question_banks";

CREATE POLICY "Banks viewable by eligible users" ON "public"."question_banks"
FOR SELECT
TO "authenticated"
USING (
  (
    "is_published" = true
    AND ("visibility" IS NULL OR "visibility" = 'public')
  )
  OR (
    "is_published" = true
    AND "visibility" = 'assigned_only'
    AND EXISTS (
      SELECT 1
      FROM "public"."distributions" d
      JOIN "public"."distribution_users" du ON du."distribution_id" = d."id"
      WHERE d."target_type" = 'question_bank'
        AND d."target_id" = "question_banks"."id"
        AND du."user_id" = auth.uid()
    )
  )
);

-- ---------------------------
-- Exams
-- ---------------------------
DROP POLICY IF EXISTS "Anyone can view published exams" ON "public"."exams";
DROP POLICY IF EXISTS "Published exams are viewable by everyone" ON "public"."exams";
DROP POLICY IF EXISTS "Exams viewable by eligible users" ON "public"."exams";

CREATE POLICY "Exams viewable by eligible users" ON "public"."exams"
FOR SELECT
TO "authenticated"
USING (
  (
    "is_published" = true
    AND ("visibility" IS NULL OR "visibility" = 'public')
  )
  OR (
    "is_published" = true
    AND "visibility" = 'assigned_only'
    AND EXISTS (
      SELECT 1
      FROM "public"."distributions" d
      JOIN "public"."distribution_users" du ON du."distribution_id" = d."id"
      WHERE d."target_type" = 'exam'
        AND d."target_id" = "exams"."id"
        AND du."user_id" = auth.uid()
    )
  )
);

-- ---------------------------
-- Question Bank Items
-- ---------------------------
DROP POLICY IF EXISTS "Items are viewable if bank is published" ON "public"."question_bank_items";

CREATE POLICY "Items viewable by eligible users" ON "public"."question_bank_items"
FOR SELECT
TO "authenticated"
USING (
  EXISTS (
    SELECT 1
    FROM "public"."question_banks" qb
    WHERE qb."id" = "question_bank_items"."bank_id"
      AND (
        (
          qb."is_published" = true
          AND (qb."visibility" IS NULL OR qb."visibility" = 'public')
        )
        OR (
          qb."is_published" = true
          AND qb."visibility" = 'assigned_only'
          AND EXISTS (
            SELECT 1
            FROM "public"."distributions" d
            JOIN "public"."distribution_users" du ON du."distribution_id" = d."id"
            WHERE d."target_type" = 'question_bank'
              AND d."target_id" = qb."id"
              AND du."user_id" = auth.uid()
          )
        )
      )
  )
);

-- ---------------------------
-- Exam Questions
-- ---------------------------
DROP POLICY IF EXISTS "Anyone can view exam questions for published exams" ON "public"."exam_questions";

CREATE POLICY "Exam questions viewable by eligible users" ON "public"."exam_questions"
FOR SELECT
TO "authenticated"
USING (
  EXISTS (
    SELECT 1
    FROM "public"."exams" e
    WHERE e."id" = "exam_questions"."exam_id"
      AND (
        (
          e."is_published" = true
          AND (e."visibility" IS NULL OR e."visibility" = 'public')
        )
        OR (
          e."is_published" = true
          AND e."visibility" = 'assigned_only'
          AND EXISTS (
            SELECT 1
            FROM "public"."distributions" d
            JOIN "public"."distribution_users" du ON du."distribution_id" = d."id"
            WHERE d."target_type" = 'exam'
              AND d."target_id" = e."id"
              AND du."user_id" = auth.uid()
          )
        )
      )
  )
);
