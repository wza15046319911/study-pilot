-- Add is_admin column to profiles table
ALTER TABLE public.profiles
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN public.profiles.is_admin IS 'Indicates if the user has admin privileges';

-- Create index for faster admin checks (optional but recommended)
CREATE INDEX idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = TRUE;
