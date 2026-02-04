create table if not exists public.past_exams (
  id bigserial primary key,
  uuid uuid not null default gen_random_uuid(),
  subject_id bigint not null references public.subjects(id) on delete cascade,
  year integer not null,
  semester smallint not null,
  title text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(subject_id, year, semester)
);

create index if not exists past_exams_subject_id_idx
  on public.past_exams(subject_id);
create index if not exists past_exams_year_idx
  on public.past_exams(year);
create index if not exists past_exams_subject_year_semester_idx
  on public.past_exams(subject_id, year, semester);

create table if not exists public.past_exam_questions (
  id bigserial primary key,
  past_exam_id bigint not null references public.past_exams(id) on delete cascade,
  order_index integer not null default 0,
  question_type text not null,
  content text,
  answer text not null,
  explanation text,
  created_at timestamptz not null default now()
);

create index if not exists past_exam_questions_past_exam_id_idx
  on public.past_exam_questions(past_exam_id);
create index if not exists past_exam_questions_order_idx
  on public.past_exam_questions(past_exam_id, order_index);

alter table public.past_exams enable row level security;
alter table public.past_exam_questions enable row level security;

create policy "Admins can manage past exams" on public.past_exams
  to authenticated
  using (true)
  with check (true);

create policy "Anyone can view published past exams" on public.past_exams
  for select
  to authenticated
  using (is_published = true);

create policy "Admins can manage past exam questions" on public.past_exam_questions
  to authenticated
  using (true)
  with check (true);

create policy "Anyone can view past exam questions for published past exams" on public.past_exam_questions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.past_exams
      where past_exams.id = past_exam_questions.past_exam_id
        and past_exams.is_published = true
    )
  );

grant all on table public.past_exams to anon;
grant all on table public.past_exams to authenticated;
grant all on table public.past_exams to service_role;

grant all on table public.past_exam_questions to anon;
grant all on table public.past_exam_questions to authenticated;
grant all on table public.past_exam_questions to service_role;

grant all on sequence public.past_exams_id_seq to anon;
grant all on sequence public.past_exams_id_seq to authenticated;
grant all on sequence public.past_exams_id_seq to service_role;

grant all on sequence public.past_exam_questions_id_seq to anon;
grant all on sequence public.past_exam_questions_id_seq to authenticated;
grant all on sequence public.past_exam_questions_id_seq to service_role;
