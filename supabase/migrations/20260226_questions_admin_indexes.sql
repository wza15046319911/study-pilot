-- Speed up admin questions list and search
-- 1) Composite index for filtered list (subject + sort by created_at)
create index if not exists questions_subject_created_idx
  on public.questions (subject_id, created_at desc);

-- 2) Index for type/difficulty filters
create index if not exists questions_type_idx on public.questions (type);
create index if not exists questions_difficulty_idx on public.questions (difficulty);
create index if not exists questions_topic_id_idx on public.questions (topic_id);

-- 3) Enable pg_trgm for fast ILIKE on title (search)
create extension if not exists pg_trgm;
create index if not exists questions_title_trgm_idx
  on public.questions using gin (title gin_trgm_ops);
