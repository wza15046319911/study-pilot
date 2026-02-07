-- Add test_cases column for coding_challenge question type
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS test_cases jsonb;

COMMENT ON COLUMN public.questions.test_cases IS 
  'Test cases for coding_challenge type: {function_name: string, test_cases: [{input: any[], expected: any}]}';
