-- Ensure bookmark writes are idempotent and race-safe.
-- 1) Deduplicate existing rows by (user_id, question_id), keeping the earliest id.
-- 2) Enforce uniqueness going forward.

DELETE FROM "public"."bookmarks" b
USING "public"."bookmarks" dup
WHERE b."user_id" = dup."user_id"
  AND b."question_id" = dup."question_id"
  AND b."id" > dup."id";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "pg_constraint"
    WHERE "conname" = 'bookmarks_user_id_question_id_key'
      AND "conrelid" = 'public.bookmarks'::regclass
  ) THEN
    ALTER TABLE "public"."bookmarks"
      ADD CONSTRAINT "bookmarks_user_id_question_id_key"
      UNIQUE ("user_id", "question_id");
  END IF;
END $$;
