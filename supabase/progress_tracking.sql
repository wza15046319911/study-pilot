-- Add mode column to user_answers to track source of answer
ALTER TABLE public.user_answers
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'practice'
  CHECK (mode IN ('practice', 'flashcard', 'immersive', 'exam'));

-- ============================================
-- TOPIC PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.topic_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id INTEGER REFERENCES public.topics(id) ON DELETE CASCADE,
  completed_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- Enable RLS
ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update their own topic progress"
  ON public.topic_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RPC FUNCTIONS FOR PROGRESS INCREMENT
-- ============================================

-- Function to increment subject progress
CREATE OR REPLACE FUNCTION increment_subject_progress(
  p_user_id UUID,
  p_subject_id INTEGER,
  p_is_correct BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_progress (user_id, subject_id, completed_count, correct_count, updated_at)
  VALUES (p_user_id, p_subject_id, 1, CASE WHEN p_is_correct THEN 1 ELSE 0 END, NOW())
  ON CONFLICT (user_id, subject_id) DO UPDATE SET
    completed_count = user_progress.completed_count + 1,
    correct_count = user_progress.correct_count + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment topic progress
CREATE OR REPLACE FUNCTION increment_topic_progress(
  p_user_id UUID,
  p_topic_id INTEGER,
  p_is_correct BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.topic_progress (user_id, topic_id, completed_count, correct_count, updated_at)
  VALUES (p_user_id, p_topic_id, 1, CASE WHEN p_is_correct THEN 1 ELSE 0 END, NOW())
  ON CONFLICT (user_id, topic_id) DO UPDATE SET
    completed_count = topic_progress.completed_count + 1,
    correct_count = topic_progress.correct_count + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint to user_progress if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_progress_user_subject_unique'
  ) THEN
    ALTER TABLE public.user_progress ADD CONSTRAINT user_progress_user_subject_unique UNIQUE (user_id, subject_id);
  END IF;
END $$;
