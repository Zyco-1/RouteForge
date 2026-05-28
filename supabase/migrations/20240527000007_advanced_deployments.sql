ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS latest_deployment_id TEXT,
ADD COLUMN IF NOT EXISTS last_deployment_error TEXT;

-- Index for status polling performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(deployment_status);
