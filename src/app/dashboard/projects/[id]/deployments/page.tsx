import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink, Activity, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ProjectDeploymentsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  return (
    <div className="p-8 space-y-8 text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Deployments</h2>
          <p className="text-muted-foreground mt-1 text-sm uppercase tracking-widest font-bold opacity-60">Production History</p>
        </div>
        <Button className="font-bold shadow-lg shadow-primary/20 gap-2">
            <Activity size={16} /> Redeploy Latest
        </Button>
      </div>

      <Card className="bg-card/50 border-border/50 overflow-hidden">
        <CardHeader className="border-b border-border/10 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-500">
                    <Globe size={20} />
                </div>
                <div>
                    <CardTitle className="text-lg">Production Deployment</CardTitle>
                    <CardDescription className="text-xs">Current active version</CardDescription>
                </div>
            </div>
            <Badge className="bg-green-500 text-white border-none font-bold px-3">Live</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Deployment URL</p>
                    {project.deployment_url ? (
                        <a href={project.deployment_url} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-primary hover:underline flex items-center gap-2">
                            {project.deployment_url} <ExternalLink size={12} />
                        </a>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">No active deployment</p>
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Last Deployed</p>
                    <p className="text-sm flex items-center gap-2">
                        <Clock size={14} className="text-muted-foreground" />
                        {project.last_deployed_at ? new Date(project.last_deployed_at).toLocaleString() : 'Never'}
                    </p>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Build History</h3>
        <div className="rounded-xl border border-border/50 border-dashed py-12 text-center bg-muted/5">
            <p className="text-sm text-muted-foreground italic">Historical deployments will appear here after your first production build.</p>
        </div>
      </div>
    </div>
  );
}
