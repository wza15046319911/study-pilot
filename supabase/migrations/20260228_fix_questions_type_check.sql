-- Fix questions_type_check to include true_false and coding_challenge
-- The create-question form allows these types but the constraint was missing them

ALTER TABLE public.questions
DROP CONSTRAINT IF EXISTS questions_type_check;

ALTER TABLE public.questions
ADD CONSTRAINT questions_type_check CHECK (
  type = ANY (ARRAY[
    'single_choice'::text,
    'multiple_choice'::text,
    'fill_blank'::text,
    'code_output'::text,
    'handwrite'::text,
    'true_false'::text,
    'coding_challenge'::text
  ])
);
