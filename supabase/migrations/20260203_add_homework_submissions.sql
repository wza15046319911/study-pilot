create table if not exists public.homework_submissions (
  id bigserial primary key,
  homework_id bigint not null references public.homeworks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  answered_count integer not null default 0,
  correct_count integer not null default 0,
  total_count integer not null default 0,
  mode text not null default 'practice'
);

create index if not exists homework_submissions_homework_id_idx
  on public.homework_submissions(homework_id);
create index if not exists homework_submissions_user_id_idx
  on public.homework_submissions(user_id);
