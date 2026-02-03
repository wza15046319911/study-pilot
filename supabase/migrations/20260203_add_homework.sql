-- Homework content tables
create table if not exists public.homeworks (
  id bigserial primary key,
  uuid uuid not null default gen_random_uuid(),
  title text not null,
  slug text unique,
  description text,
  subject_id bigint not null references public.subjects(id) on delete cascade,
  is_premium boolean not null default true,
  is_published boolean not null default false,
  due_at timestamptz,
  allowed_modes text[] not null default array['standard','immersive','flashcard'],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists homeworks_subject_id_idx on public.homeworks(subject_id);
create index if not exists homeworks_due_at_idx on public.homeworks(due_at);

create table if not exists public.homework_items (
  id bigserial primary key,
  homework_id bigint not null references public.homeworks(id) on delete cascade,
  question_id bigint not null references public.questions(id) on delete cascade,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  unique(homework_id, question_id)
);

create index if not exists homework_items_homework_id_idx on public.homework_items(homework_id);

create table if not exists public.homework_assignments (
  id bigserial primary key,
  homework_id bigint not null references public.homeworks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(homework_id, user_id)
);

create index if not exists homework_assignments_user_id_idx on public.homework_assignments(user_id);
create index if not exists homework_assignments_homework_id_idx on public.homework_assignments(homework_id);
