ALTER TABLE "public"."bookmarks"
  ADD COLUMN IF NOT EXISTS "note" text;

ALTER TABLE "public"."mistakes"
  ADD COLUMN IF NOT EXISTS "note" text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "pg_constraint"
    WHERE "conname" = 'bookmarks_note_length_check'
      AND "conrelid" = 'public.bookmarks'::regclass
  ) THEN
    ALTER TABLE "public"."bookmarks"
      ADD CONSTRAINT "bookmarks_note_length_check"
      CHECK ("note" IS NULL OR char_length("note") <= 500);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "pg_constraint"
    WHERE "conname" = 'mistakes_note_length_check'
      AND "conrelid" = 'public.mistakes'::regclass
  ) THEN
    ALTER TABLE "public"."mistakes"
      ADD CONSTRAINT "mistakes_note_length_check"
      CHECK ("note" IS NULL OR char_length("note") <= 500);
  END IF;
END $$;
