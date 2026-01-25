-- Migration: Add allowed_modes column to exams table
-- This allows admins to configure which practice modes are available for mock exams

ALTER TABLE "public"."exams" 
ADD COLUMN IF NOT EXISTS "allowed_modes" text[] DEFAULT ARRAY['exam']::text[] NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN "public"."exams"."allowed_modes" IS 'Array of allowed modes: exam, practice (standard), immersive';
