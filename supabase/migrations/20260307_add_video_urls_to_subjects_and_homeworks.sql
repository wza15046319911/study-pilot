alter table public.subjects
add column if not exists video_url text;

alter table public.homeworks
add column if not exists video_url text;
