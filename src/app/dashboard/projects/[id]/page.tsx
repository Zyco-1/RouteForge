import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Zap, Save, Play, Settings, Share2, ChevronLeft, Globe, Github, Activity, Clock, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { WorkflowEditor } from "@/components/builder/workflow-editor";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { deployProject } from "@/app/actions/deploy";

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (!project) {
    notFound();
  }

  const isBuilding = project.deployment_status === 'building';

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-6 md:-m-10 overflow-hidden">
      {/* Builder Toolbar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-6 bg-card/50 backdrop-blur z-20">
        <div className="flex items-center gap-4">
           <Link href="/dashboard/projects">
              <Button variant="ghost" size="icon" className="size-8">
                 <ChevronLeft className="size-4" />
              </Button>
           </Link>
           <Separator orientation="vertical" className="h-4" />
           <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight">{project.name}</h1>
                <Badge variant="outline" className="text-[9px] h-4 px-1 uppercase opacity-50">Draft</Badge>
              </div>
              <p className="text-[9px] text-muted-foreground font-mono leading-none mt-1">{project.id}</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-4 mr-4 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                    <Github size={12} />
                    <span>{project.github_repo_name?.split('/')[1] || 'No Repo'}</span>
                </div>
                {project.deployment_url && (
                    <a href={project.deployment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <Globe size={12} />
                        <span>Live</span>
                    </a>
                )}
            </div>

            <Button variant="ghost" size="sm" className="gap-2 text-xs font-bold">
                <Settings className="size-3" /> Config
            </Button>

            <form action={deployProject.bind(null, project.id)}>
                <Button
                    type="submit"
                    disabled={isBuilding}
                    size="sm"
                    className={`gap-2 text-xs font-bold ${isBuilding ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all'}`}
                >
                    <Zap className={`size-3 fill-current ${isBuilding ? 'animate-pulse' : ''}`} />
                    {isBuilding ? 'Deploying...' : 'Deploy to Vercel'}
                </Button>
            </form>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Workflow Builder */}
        <div className="flex-1 relative bg-muted/5">
            <WorkflowEditor initialData={project.content} projectId={project.id} />
        </div>

        {/* Right: Deployment / Status Sidebar */}
        <aside className="w-80 border-l border-border/50 bg-card/30 backdrop-blur hidden xl:flex flex-col">
            <div className="p-4 border-b border-border/50">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Deployment Status</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Current Deployment */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Latest Build</span>
                        <DeploymentStatusBadge status={project.deployment_status} />
                    </div>

                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={`size-8 rounded-lg flex items-center justify-center border border-border/50 ${project.deployment_url ? 'bg-primary text-primary-foreground' : 'bg-black text-white'}`}>
                                <Triangle size={16} className="fill-current" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">{project.deployment_status === 'ready' ? 'Ready to Deploy' : (isBuilding ? 'Building Backend...' : 'Live Project')}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{project.deployment_url ? new URL(project.deployment_url).hostname : 'No active deployment'}</p>
                            </div>
                        </div>

                        {project.deployment_url && (
                             <a href={project.deployment_url} target="_blank" rel="noopener noreferrer" className="block">
                                <Button variant="secondary" size="sm" className="w-full gap-2 text-[10px] h-7 font-bold">
                                    Visit API <ExternalLink size={10} />
                                </Button>
                             </a>
                        )}
                    </div>
                </div>

                {/* GitHub Info */}
                <div className="space-y-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Source Control</span>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Github size={14} className="opacity-50" />
                                <span className="text-xs font-medium">Repository</span>
                            </div>
                            {project.github_repo_name && (
                                <a href={`https://github.com/${project.github_repo_name}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink size={12} className="opacity-30 hover:opacity-100 transition-opacity" />
                                </a>
                            )}
                        </div>
                        <p className="text-[10px] font-mono text-muted-foreground break-all bg-background/50 p-2 rounded border border-border/10">
                            {project.github_repo_name || "Linking..."}
                        </p>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="space-y-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Timeline</span>
                    <div className="space-y-4 relative before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border/30">
                        <TimelineItem
                            msg="Code pushed to GitHub"
                            time={project.last_deployed_at ? new Date(project.last_deployed_at).toLocaleTimeString() : 'N/A'}
                            active={isBuilding}
                            done={!!project.last_deployed_at && !isBuilding}
                        />
                        <TimelineItem
                            msg="Vercel build triggered"
                            time={isBuilding ? 'In progress' : (project.last_deployed_at ? 'Completed' : 'Pending')}
                            active={isBuilding}
                            done={!!project.deployment_url}
                        />
                        <TimelineItem
                            msg="API Deployment Live"
                            time={project.deployment_url ? 'Active' : 'Waiting'}
                            done={!!project.deployment_url}
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-border/50 bg-muted/20">
                <Button variant="outline" className="w-full text-xs font-bold h-9 gap-2">
                    <Activity size={12} /> View Build Logs
                </Button>
            </div>
        </aside>
      </div>
    </div>
  );
}

function DeploymentStatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'building':
            return <Badge className="bg-blue-500/10 text-blue-500 border-none text-[9px] h-4 animate-pulse">Building</Badge>;
        case 'success':
            return <Badge className="bg-green-500/10 text-green-500 border-none text-[9px] h-4 font-bold">Ready</Badge>;
        case 'failed':
            return <Badge className="bg-red-500/10 text-red-500 border-none text-[9px] h-4 font-bold">Failed</Badge>;
        default:
            return <Badge className="bg-amber-500/10 text-amber-500 border-none text-[9px] h-4">Draft</Badge>;
    }
}

function TimelineItem({ msg, time, active, done }: { msg: string, time: string, active?: boolean, done?: boolean }) {
    return (
        <div className="flex gap-4 relative z-10">
            <div className={`size-3 rounded-full border-2 mt-0.5 ${done ? 'bg-green-500 border-green-500' : (active ? 'bg-primary border-primary animate-pulse' : 'bg-background border-border')}`} />
            <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-bold ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{msg}</p>
                <p className="text-[9px] text-muted-foreground/60">{time}</p>
            </div>
        </div>
    );
}

function Triangle({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3l10 18H2L12 3z"/></svg>
    )
}
