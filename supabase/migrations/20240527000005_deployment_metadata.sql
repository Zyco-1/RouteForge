-- Add deployment tracking columns to projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS deployment_status TEXT DEFAULT 'ready', -- ready, building, success, failed
ADD COLUMN IF NOT EXISTS deployment_url TEXT,
ADD COLUMN IF NOT EXISTS last_deployed_at TIMESTAMPTZ;

-- Ensure default value is 'ready' for existing projects
UPDATE public.projects SET deployment_status = 'ready' WHERE deployment_status IS NULL;
