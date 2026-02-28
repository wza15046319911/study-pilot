-- Rename graduate to postgraduate in subject_exam_dates (for existing deployments)
-- Must drop constraint first, then update, then re-add (otherwise UPDATE violates check)
alter table "public"."subject_exam_dates"
  drop constraint if exists "subject_exam_dates_student_level_check";

update "public"."subject_exam_dates"
  set student_level = 'postgraduate'
  where student_level = 'graduate';

alter table "public"."subject_exam_dates"
  add constraint "subject_exam_dates_student_level_check"
  check (student_level in ('undergraduate', 'postgraduate'));
