-- Add per-device session tracking to enforce single active logins
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS active_session_id UUID;

UPDATE public.profiles
SET active_session_id = uuid_generate_v4()
WHERE active_session_id IS NULL;

ALTER TABLE public.profiles
ALTER COLUMN active_session_id SET DEFAULT uuid_generate_v4();

-- Ensure Realtime is enabled for profile updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_rel rel
    JOIN pg_publication pub ON pub.oid = rel.prpubid
    JOIN pg_class tbl ON tbl.oid = rel.prrelid
    WHERE pub.pubname = 'supabase_realtime'
      AND tbl.relname = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
END;
$$;
