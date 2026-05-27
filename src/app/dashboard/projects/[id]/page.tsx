import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Zap, Save, Play, Settings, Share2, ChevronLeft, Globe, Github, Activity, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { WorkflowEditor } from "@/components/builder/workflow-editor";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
                <div className="flex items-center gap-1.5">
                    <Globe size={12} />
                    <span>Production</span>
                </div>
            </div>

            <Button variant="ghost" size="sm" className="gap-2 text-xs font-bold">
                <Settings className="size-3" /> Config
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold text-green-500 hover:text-green-600 border-green-500/20 bg-green-500/5">
                <Play className="size-3 fill-current" /> Run Test
            </Button>
            <Button size="sm" className="gap-2 text-xs font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Zap className="size-3 fill-current" /> Deploy to Vercel
            </Button>
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
                        <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 border-none text-[9px] h-4">Ready to Deploy</Badge>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-black flex items-center justify-center border border-border/50">
                                <Triangle size={16} className="fill-current text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">Not yet deployed</p>
                                <p className="text-[10px] text-muted-foreground">Click deploy to start</p>
                            </div>
                        </div>
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
                            <ExternalLink size={12} className="opacity-30" />
                        </div>
                        <p className="text-[10px] font-mono text-muted-foreground break-all bg-background/50 p-2 rounded">
                            {project.github_repo_name || "Syncing..."}
                        </p>
                    </div>
                </div>

                {/* Activity Feed Placeholder */}
                <div className="space-y-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Logs</span>
                    <div className="space-y-2">
                        {[
                            { msg: 'Project linked to Vercel', time: 'Just now', icon: <Activity size={10} /> },
                            { msg: 'GitHub repository created', time: '1m ago', icon: <Clock size={10} /> },
                        ].map((log, i) => (
                            <div key={i} className="flex gap-3 text-[10px]">
                                <div className="mt-0.5 opacity-30">{log.icon}</div>
                                <div className="flex-1">
                                    <p className="font-medium">{log.msg}</p>
                                    <p className="text-muted-foreground">{log.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-border/50 bg-muted/20">
                <Button variant="outline" className="w-full text-xs font-bold h-9">
                    View Build Logs
                </Button>
            </div>
        </aside>
      </div>
    </div>
  );
}

function Triangle({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3l10 18H2L12 3z"/></svg>
    )
}
