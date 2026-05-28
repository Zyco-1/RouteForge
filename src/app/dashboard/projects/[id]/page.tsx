import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Globe, Github, Activity, Clock, Database, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ProjectOverviewPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (!project) notFound();

  const { count: apiCount } = await supabase
    .from('endpoints')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', id);

  return (
    <div className="p-8 space-y-8 text-foreground">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Project Overview</h2>
        <p className="text-muted-foreground mt-1">Status and performance metrics for {project.name}.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deployment</CardTitle>
                <Globe className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2">
                    <div className={`size-2 rounded-full ${project.deployment_status === 'ready' ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span className="text-2xl font-bold capitalize">{project.deployment_status}</span>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Endpoints</CardTitle>
                <Zap className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{apiCount || 0}</div>
            </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database</CardTitle>
                <Database className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <Badge variant={project.encrypted_supabase_service_role_key ? 'default' : 'secondary'} className="font-bold">
                    {project.encrypted_supabase_service_role_key ? 'Connected' : 'Disconnected'}
                </Badge>
            </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Region</CardTitle>
                <Globe className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-sm font-bold opacity-60">US-East (Vercel)</div>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card/50 border-border/50">
             <CardHeader>
                <CardTitle>Infrastructure</CardTitle>
                <CardDescription>Linked external services.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-3">
                        <Github size={18} />
                        <span className="text-sm font-medium">GitHub Repository</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{project.github_repo_name || 'Not linked'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-3">
                        <Triangle size={18} />
                        <span className="text-sm font-medium">Vercel Project</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{project.vercel_project_id || 'Not linked'}</span>
                </div>
             </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
             <CardHeader>
                <CardTitle>Usage</CardTitle>
                <CardDescription>Request volume and performance.</CardDescription>
             </CardHeader>
             <CardContent className="h-[150px] flex items-center justify-center border-2 border-dashed border-border/10 rounded-xl">
                 <p className="text-xs text-muted-foreground font-medium italic">Analytics coming in Phase 4</p>
             </CardContent>
          </Card>
      </div>
    </div>
  );
}

function Triangle({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3l10 18H2L12 3z"/></svg>
    )
}
