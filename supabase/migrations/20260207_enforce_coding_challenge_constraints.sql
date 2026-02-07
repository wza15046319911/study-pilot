-- Enforce coding challenge integrity at the database layer.
-- 1) Non-coding questions should not carry coding test cases.
-- 2) Coding questions must include function_name + non-empty test case array.
-- 3) Coding questions must use canonical answer marker.

UPDATE public.questions
SET test_cases = NULL
WHERE type <> 'coding_challenge';

UPDATE public.questions
SET answer = 'all_tests_passed'
WHERE type = 'coding_challenge'
  AND answer IS DISTINCT FROM 'all_tests_passed';

ALTER TABLE public.questions
ADD CONSTRAINT questions_coding_challenge_requirements CHECK (
  type <> 'coding_challenge'
  OR (
    answer = 'all_tests_passed'
    AND test_cases IS NOT NULL
    AND jsonb_typeof(test_cases) = 'object'
    AND NULLIF(btrim(test_cases->>'function_name'), '') IS NOT NULL
    AND jsonb_typeof(test_cases->'test_cases') = 'array'
    AND jsonb_array_length(test_cases->'test_cases') > 0
  )
);
