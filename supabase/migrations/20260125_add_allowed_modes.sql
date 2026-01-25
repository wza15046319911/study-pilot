-- Migration: Add allowed_modes column to question_banks table
-- This allows admins to configure which practice modes are available per question bank

ALTER TABLE "public"."question_banks" 
ADD COLUMN IF NOT EXISTS "allowed_modes" text[] DEFAULT ARRAY['standard', 'immersive', 'flashcard']::text[] NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN "public"."question_banks"."allowed_modes" IS 'Array of allowed practice mode IDs: standard, immersive, flashcard';
