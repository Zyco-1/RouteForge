-- Add content column for JSON workflow and Supabase credentials to projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{"nodes": [], "edges": []}',
ADD COLUMN IF NOT EXISTS supabase_url TEXT,
ADD COLUMN IF NOT EXISTS encrypted_supabase_service_role_key TEXT;

-- Profiles: add fields for user-provided Supabase credentials (optional, can be project-specific)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS default_supabase_url TEXT,
ADD COLUMN IF NOT EXISTS encrypted_default_supabase_service_role_key TEXT;
