-- Breaking change:
-- Allow multiple past exam papers under the same subject + year + semester.
alter table public.past_exams
  drop constraint if exists past_exams_subject_id_year_semester_key;

-- Keep lookup performance for subject/year/semester listings.
create index if not exists past_exams_subject_year_semester_created_at_idx
  on public.past_exams(subject_id, year, semester, created_at desc);
