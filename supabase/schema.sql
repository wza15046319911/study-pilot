-- QuizMaster Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- CLEANUP (Drop existing objects if any)
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.bookmarks CASCADE;
DROP TABLE IF EXISTS public.mistakes CASCADE;
DROP TABLE IF EXISTS public.user_answers CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.topics CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_practice_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SUBJECTS TABLE
-- ============================================
CREATE TABLE public.subjects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT CHECK (category IN ('STEM', 'Humanities')),
  question_count INTEGER DEFAULT 0,
  is_hot BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (public read)
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subjects"
  ON public.subjects FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- TOPICS TABLE
-- ============================================
CREATE TABLE public.topics (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (public read)
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view topics"
  ON public.topics FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- QUESTIONS TABLE
-- ============================================
CREATE TABLE public.questions (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('single_choice', 'multiple_choice', 'fill_blank', 'code_output', 'handwrite')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  options JSONB, -- [{label: 'A', content: '...'}]
  answer TEXT NOT NULL,
  explanation TEXT,
  code_snippet TEXT,
  topic_id INTEGER REFERENCES public.topics(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (public read)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions"
  ON public.questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert questions"
  ON public.questions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- USER ANSWERS TABLE
-- ============================================
CREATE TABLE public.user_answers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES public.questions(id) ON DELETE CASCADE,
  user_answer TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  time_spent INTEGER, -- in milliseconds/seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and insert their own answers"
  ON public.user_answers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- MISTAKES TABLE
-- ============================================
CREATE TABLE public.mistakes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES public.questions(id) ON DELETE CASCADE,
  error_count INTEGER DEFAULT 1,
  error_type TEXT,
  last_wrong_answer TEXT,
  last_error_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mistakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update their own mistakes"
  ON public.mistakes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- USER PROGRESS TABLE
-- ============================================
CREATE TABLE public.user_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES public.subjects(id) ON DELETE CASCADE,
  completed_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update their own progress"
  ON public.user_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- BOOKMARKS TABLE
-- ============================================
CREATE TABLE public.bookmarks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES public.questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their own bookmarks"
  ON public.bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================
-- EXAMS TABLE
-- ============================================
CREATE TABLE public.exams (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('midterm', 'final')),
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  rules JSONB NOT NULL DEFAULT '{}', -- e.g., {"single_choice": 30, "fill_blank": 5}
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published exams"
  ON public.exams FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage exams"
  ON public.exams FOR ALL
  TO authenticated
  WITH CHECK (true); -- In production, add admin role check


-- ============================================
-- EXAM QUESTIONS TABLE
-- ============================================
CREATE TABLE public.exam_questions (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER REFERENCES public.exams(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES public.questions(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exam questions for published exams"
  ON public.exam_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.exams 
      WHERE id = exam_id AND is_published = true
    )
  );

CREATE POLICY "Admins can manage exam questions"
  ON public.exam_questions FOR ALL
  TO authenticated
  WITH CHECK (true);


-- ============================================
-- EXAM ATTEMPTS TABLE
-- ============================================
CREATE TABLE public.exam_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id INTEGER REFERENCES public.exams(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  score INTEGER,
  total_questions INTEGER,
  answers JSONB DEFAULT '{}', -- {questionId: userAnswer}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their own exam attempts"
  ON public.exam_attempts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================
-- SEED DATA
-- ============================================

-- Subjects
INSERT INTO public.subjects (id, name, description, icon, category, question_count, is_hot, is_new) VALUES
  (1, 'Mathematics', 'Algebra, Calculus, and Geometry', 'TiCalculator', 'STEM', 150, true, false),
  (2, 'Physics', 'Mechanics, Electromagnetism', 'Atom', 'STEM', 80, true, false),
  (3, 'Computer Science', 'Data Structures, Algorithms, Web Dev', 'Terminal', 'STEM', 200, true, true),
  (4, 'History', 'World History, Ancient Civilizations', 'BookOpen', 'Humanities', 120, false, false);

-- Topics
INSERT INTO public.topics (id, subject_id, name) VALUES
  (1, 3, 'Data Structures'),
  (2, 3, 'Algorithms'),
  (3, 3, 'Web Development'),
  (4, 3, 'Data Types'),
  (5, 3, 'Operations');

-- Questions
INSERT INTO public.questions (subject_id, title, content, type, difficulty, options, answer, explanation, code_snippet, topic_id) VALUES
  (3, 'Python List Slicing', 'What is the output of the following code?', 'single_choice', 'medium',
   '[{"label": "A", "content": "[1, 2, 3]"}, {"label": "B", "content": "[2, 3, 4]"}, {"label": "C", "content": "[2, 3, 4, 5]"}, {"label": "D", "content": "[1, 2, 3, 4]"}]',
   'B', 'Python list slicing [1:4] returns elements from index 1 to index 4 (exclusive).', 'my_list = [1, 2, 3, 4, 5]\nresult = my_list[1:4]\nprint(result)', 4),

  (3, 'Math Expression', 'Calculate the value: 8 - 3 / 2 = ?', 'single_choice', 'easy',
   '[{"label": "A", "content": "6.5"}, {"label": "B", "content": "6"}, {"label": "C", "content": "2.5"}, {"label": "D", "content": "2"}]',
   'A', 'Following operator precedence, division first: 3/2=1.5, then 8-1.5=6.5', NULL, 5),

  (3, 'CSS Flexbox', 'Which property is used to align items along the main axis in Flexbox?', 'single_choice', 'easy',
   '[{"label": "A", "content": "align-items"}, {"label": "B", "content": "justify-content"}, {"label": "C", "content": "flex-direction"}, {"label": "D", "content": "flex-wrap"}]',
   'B', 'justify-content aligns items along the main axis, align-items aligns along the cross axis', NULL, 3),

  (3, 'Python Boolean Logic', 'What is returned by calling logic(False, False, True)?', 'single_choice', 'easy',
   '[{"label": "A", "content": "True"}, {"label": "B", "content": "False"}, {"label": "C", "content": "1"}, {"label": "D", "content": "0"}]',
   'A', 'Python evaluates "and" before "or". False and False results in False, then False or True results in True.', 'def logic(x, y, z) :\n    return x and y or z', 4)
ON CONFLICT DO NOTHING;


ALTER TABLE subjects
ADD COLUMN uuid UUID UNIQUE,
ADD COLUMN slug VARCHAR(255) UNIQUE;

ALTER TABLE topics
ADD COLUMN uuid UUID UNIQUE,
ADD COLUMN slug VARCHAR(255) UNIQUE;

ALTER TABLE exams
ADD COLUMN uuid UUID UNIQUE,
ADD COLUMN slug VARCHAR(255) UNIQUE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE subjects
ALTER COLUMN uuid SET DEFAULT uuid_generate_v4();

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE topics
ALTER COLUMN uuid SET DEFAULT uuid_generate_v4();

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE exams
ALTER COLUMN uuid SET DEFAULT uuid_generate_v4();