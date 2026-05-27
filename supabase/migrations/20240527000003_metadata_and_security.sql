-- Ensure all profile metadata columns exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS vercel_user_id TEXT,
ADD COLUMN IF NOT EXISTS vercel_team_id TEXT,
ADD COLUMN IF NOT EXISTS vercel_team_slug TEXT,
ADD COLUMN IF NOT EXISTS vercel_installation_id TEXT,
ADD COLUMN IF NOT EXISTS encrypted_vercel_token TEXT,
ADD COLUMN IF NOT EXISTS encrypted_github_token TEXT;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow Service Role to do everything
CREATE POLICY "Service Role can do everything on profiles" ON public.profiles
    FOR ALL USING (true) WITH CHECK (true);

-- Allow Service Role to do everything on projects
CREATE POLICY "Service Role can do everything on projects" ON public.projects
    FOR ALL USING (true) WITH CHECK (true);
