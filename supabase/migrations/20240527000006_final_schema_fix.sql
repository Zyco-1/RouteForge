-- Ensure all columns exist
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{"nodes": [], "edges": []}',
ADD COLUMN IF NOT EXISTS vercel_project_id TEXT,
ADD COLUMN IF NOT EXISTS github_repo_name TEXT;

-- Ensure RLS is handled for Service Role
-- In Supabase, Service Role usually bypasses RLS anyway,
-- but let's make it explicit if it's causing issues.
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.projects FORCE ROW LEVEL SECURITY;

-- Re-apply Service Role policies
DROP POLICY IF EXISTS "Service Role can do everything on profiles" ON public.profiles;
CREATE POLICY "Service Role can do everything on profiles" ON public.profiles
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service Role can do everything on projects" ON public.projects;
CREATE POLICY "Service Role can do everything on projects" ON public.projects
    FOR ALL USING (true) WITH CHECK (true);
