-- Add student_level to subject_exam_dates for undergraduate/postgraduate differentiation
alter table "public"."subject_exam_dates"
  add column if not exists "student_level" text not null default 'undergraduate'
  check (student_level in ('undergraduate', 'postgraduate'));

-- Drop old unique constraint
alter table "public"."subject_exam_dates"
  drop constraint if exists "subject_exam_dates_subject_id_exam_type_key";

-- Add new unique constraint including student_level
alter table "public"."subject_exam_dates"
  add constraint "subject_exam_dates_subject_id_exam_type_student_level_key"
  unique ("subject_id", "exam_type", "student_level");
