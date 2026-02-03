create table if not exists public.weekly_practices (
  id bigserial primary key,
  uuid uuid not null default gen_random_uuid(),
  title text not null,
  slug text unique,
  description text,
  subject_id bigint not null references public.subjects(id) on delete cascade,
  week_start date,
  is_published boolean not null default false,
  allowed_modes text[] not null default array['standard'],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists weekly_practices_subject_id_idx
  on public.weekly_practices(subject_id);
create index if not exists weekly_practices_week_start_idx
  on public.weekly_practices(week_start);

create table if not exists public.weekly_practice_items (
  id bigserial primary key,
  weekly_practice_id bigint not null references public.weekly_practices(id) on delete cascade,
  question_id bigint not null references public.questions(id) on delete cascade,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  unique(weekly_practice_id, question_id)
);

create index if not exists weekly_practice_items_weekly_practice_id_idx
  on public.weekly_practice_items(weekly_practice_id);

create table if not exists public.weekly_practice_submissions (
  id bigserial primary key,
  weekly_practice_id bigint not null references public.weekly_practices(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  answered_count integer not null default 0,
  correct_count integer not null default 0,
  total_count integer not null default 0,
  mode text not null default 'practice'
);

create index if not exists weekly_practice_submissions_weekly_practice_id_idx
  on public.weekly_practice_submissions(weekly_practice_id);
create index if not exists weekly_practice_submissions_user_id_idx
  on public.weekly_practice_submissions(user_id);
