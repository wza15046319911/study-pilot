-- Add policy to allow anyone to view public profile fields (username, avatar_url)
-- This is needed for features like invite pages where we show referrer info

CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Note: This replaces the restrictive "Users can view their own profile" policy
-- If you want to keep both policies, Supabase will OR them together, so having
-- a permissive "USING (true)" policy effectively makes profiles publicly readable.
-- 
-- Consider: If you only want specific fields to be public, you could instead:
-- 1. Create a public_profiles view with only public fields
-- 2. Use database functions to fetch only public fields
-- 
-- For now, profiles table contains only non-sensitive data (username, avatar_url, level, etc.)
-- so making it fully readable is acceptable.
