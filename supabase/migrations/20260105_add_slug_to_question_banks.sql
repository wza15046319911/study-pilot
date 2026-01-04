-- Add slug column to question_banks table
ALTER TABLE public.question_banks 
ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_question_banks_slug ON public.question_banks(slug);

-- Add comment
COMMENT ON COLUMN public.question_banks.slug IS 'URL-friendly identifier for the question bank';


