import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Globe, Github, Activity, Clock, Database, Code, Trash2, Edit2, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                <Zap size={24} className="fill-current" />
            </div>
            <div>
                <h2 className="text-3xl font-extrabold tracking-tight">{project.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] font-mono h-5 opacity-60">{id}</Badge>
                    <Badge className="bg-green-500/10 text-green-500 border-none font-bold text-[10px]">Active</Badge>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2 text-foreground">
            <Button variant="outline" size="sm" className="gap-2 font-bold h-9">
                <Edit2 size={14} /> Rename
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Settings size={18} />
            </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <OverviewMetric title="Deployment" value={project.deployment_status} status={project.deployment_status === 'ready' ? 'success' : 'pending'} icon={<Globe size={16} />} />
        <OverviewMetric title="API Endpoints" value={apiCount || 0} icon={<Code size={16} />} />
        <OverviewMetric title="Database" value={project.encrypted_supabase_service_role_key ? 'Connected' : 'Missing'} status={project.encrypted_supabase_service_role_key ? 'success' : 'error'} icon={<Database size={16} />} />
        <OverviewMetric title="Region" value="US-East" icon={<Globe size={16} />} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
          <Card className="col-span-2 bg-card/50 border-border/50 shadow-sm overflow-hidden">
             <CardHeader className="bg-muted/20 border-b border-border/10">
                <CardTitle className="text-lg">Infrastructure Links</CardTitle>
                <CardDescription>Automated source control and hosting.</CardDescription>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
                <InfrastructureItem icon={<Github size={18} />} label="GitHub Repository" value={project.github_repo_name || 'Not linked'} />
                <InfrastructureItem icon={<Triangle size={18} />} label="Vercel Project" value={project.vercel_project_id || 'Not linked'} />
                <InfrastructureItem icon={<Database size={18} />} label="Supabase Target" value={project.supabase_url ? new URL(project.supabase_url).hostname : 'Not connected'} />
             </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 shadow-sm">
             <CardHeader>
                <CardTitle className="text-lg">Recent Logs</CardTitle>
             </CardHeader>
             <CardContent className="h-[200px] flex items-center justify-center border-2 border-dashed border-border/10 rounded-xl m-4 mt-0">
                 <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-40">No activity yet</p>
             </CardContent>
          </Card>
      </div>
    </div>
  );
}

function OverviewMetric({ title, value, status, icon }: any) {
    return (
        <Card className="bg-card/50 border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">{title}</CardTitle>
                <div className="opacity-40">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2">
                    {status && <div className={`size-2 rounded-full ${status === 'success' ? 'bg-green-500' : (status === 'error' ? 'bg-red-500' : 'bg-amber-500')}`} />}
                    <span className="text-2xl font-extrabold tracking-tight capitalize">{value}</span>
                </div>
            </CardContent>
        </Card>
    )
}

function InfrastructureItem({ icon, label, value }: any) {
    return (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
                <div className="opacity-60">{icon}</div>
                <span className="text-sm font-bold opacity-80">{label}</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground bg-background/50 px-2 py-1 rounded border border-border/10">{value}</span>
        </div>
    )
}

function Triangle({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3l10 18H2L12 3z"/></svg>
    )
}
