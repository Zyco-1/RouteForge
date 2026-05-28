-- 1. Create Endpoints Table (Individual API routes)
CREATE TABLE IF NOT EXISTS public.endpoints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    method TEXT NOT NULL DEFAULT 'GET',
    workflow JSONB DEFAULT '{"nodes": [], "edges": []}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Database Tables Metadata (Visual Table Builder)
CREATE TABLE IF NOT EXISTS public.database_tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    columns JSONB NOT NULL DEFAULT '[]', -- [{name, type, primary, nullable, default}]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- deployment, git_push, table_create, etc.
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Move Supabase credentials to Projects Table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS supabase_url TEXT,
ADD COLUMN IF NOT EXISTS encrypted_supabase_service_role_key TEXT,
ADD COLUMN IF NOT EXISTS production_url TEXT;

-- 5. Security Policies
ALTER TABLE public.endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own endpoints" ON public.endpoints
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage their own endpoints" ON public.endpoints
    FOR ALL USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage their own tables" ON public.database_tables
    FOR ALL USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));

CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()));

-- Service Role policies
CREATE POLICY "Service Role can do everything on endpoints" ON public.endpoints FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role can do everything on tables" ON public.database_tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role can do everything on logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
