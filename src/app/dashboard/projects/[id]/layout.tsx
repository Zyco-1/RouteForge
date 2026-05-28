import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
    Zap, Database, Settings,
    ArrowLeft, Globe, Github, Activity
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function ProjectWorkspaceLayout(props: {
    children: React.ReactNode,
    params: Promise<{ id: string }>
}) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (!project) notFound();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Refined Project Side Navigation */}
      <aside className="w-64 border-r border-border/50 bg-card/30 backdrop-blur flex flex-col z-40">
        <div className="h-16 flex items-center px-4 border-b border-border/50">
            <Link href="/dashboard/projects" className="flex items-center justify-center size-10 rounded-xl hover:bg-muted transition-colors" title="Back to Dashboard">
                <ArrowLeft size={20} className="text-foreground" />
            </Link>
            <div className="ml-3 min-w-0">
                <p className="text-xs font-bold truncate">{project.name}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Workspace</p>
            </div>
        </div>

        <div className="flex-1 py-6 px-4 space-y-8">
            <nav className="space-y-1">
                <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 opacity-50">Build</p>
                <ProjectNavLink href={`/dashboard/projects/${id}/apis`} icon={<Zap size={18} />} label="API Endpoints" />
                <ProjectNavLink href={`/dashboard/projects/${id}/database`} icon={<Database size={18} />} label="Database" />
            </nav>

            <nav className="space-y-1">
                <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 opacity-50">Monitor</p>
                <ProjectNavLink href={`/dashboard/projects/${id}/deployments`} icon={<Globe size={18} />} label="Deployments" />
                <ProjectNavLink href={`/dashboard/projects/${id}/activity`} icon={<Activity size={18} />} label="Activity" />
            </nav>

            <nav className="space-y-1">
                <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 opacity-50">Configure</p>
                <ProjectNavLink href={`/dashboard/projects/${id}/settings`} icon={<Settings size={18} />} label="Project Settings" />
            </nav>
        </div>

        <div className="p-6 border-t border-border/50 bg-muted/10">
             <div className="flex items-center gap-3">
                <div className={`size-2 rounded-full ${project.deployment_status === 'ready' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-amber-500 animate-pulse'}`} />
                <p className="text-[10px] font-bold tracking-tight uppercase">{project.deployment_status === 'ready' ? 'Live on Vercel' : project.deployment_status}</p>
             </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Project Header */}
        <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur px-8 flex items-center justify-between z-30">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-foreground">
                        <h2 className="text-sm font-bold tracking-tight uppercase tracking-widest opacity-80">Infrastructure</h2>
                        <Badge variant="secondary" className="text-[9px] h-4 px-1 font-extrabold">v1.0</Badge>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                 <div className="flex items-center gap-4 mr-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-r border-border/50 pr-4">
                    <div className="flex items-center gap-1.5">
                        <Github size={12} className="opacity-50" />
                        <span className="truncate max-w-[120px]">{project.github_repo_name?.split('/')[1] || 'Not Linked'}</span>
                    </div>
                </div>
                <Button size="sm" className="h-9 gap-2 font-bold px-6 shadow-xl shadow-primary/20 cursor-pointer">
                    <Zap size={14} className="fill-current" /> Push & Deploy
                </Button>
            </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto relative">
            {props.children}
        </main>
      </div>
    </div>
  );
}

function ProjectNavLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
    return (
        <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-accent hover:text-foreground hover:shadow-sm transition-all group">
            <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {icon}
            </div>
            <span>{label}</span>
        </Link>
    )
}
