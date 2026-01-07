-- Remove duplicate entries keeping the most recent one (based on id or updated_at)
DELETE FROM public.mistakes a USING public.mistakes b
WHERE a.id < b.id AND a.user_id = b.user_id AND a.question_id = b.question_id;

-- Add unique constraint to enable UPSERT
ALTER TABLE public.mistakes
ADD CONSTRAINT mistakes_user_id_question_id_key UNIQUE (user_id, question_id);
