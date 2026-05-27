-- Ensure projects table can store GitHub full repo name
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS github_repo_name TEXT;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_projects_github_repo ON public.projects(github_repo_name);
