import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard, Zap, Database, Settings,
    ChevronLeft, Globe, Github, Activity, Terminal
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
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
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Project Side Navigation */}
      <aside className="w-64 border-r border-border/50 bg-card/30 backdrop-blur flex flex-col z-40">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
            <Link href="/dashboard/projects" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <ChevronLeft size={16} className="text-muted-foreground" />
                <span className="font-bold text-sm truncate">{project.name}</span>
            </Link>
        </div>

        <div className="flex-1 py-6 px-4 space-y-8">
            <nav className="space-y-1">
                <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Build</p>
                <ProjectNavLink href={`/dashboard/projects/${id}/apis`} icon={<Zap size={16} />} label="API Endpoints" />
                <ProjectNavLink href={`/dashboard/projects/${id}/database`} icon={<Database size={16} />} label="Database" />
            </nav>

            <nav className="space-y-1">
                <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Monitor</p>
                <ProjectNavLink href={`/dashboard/projects/${id}/deployments`} icon={<Globe size={16} />} label="Deployments" />
                <ProjectNavLink href={`/dashboard/projects/${id}/activity`} icon={<Activity size={16} />} label="Activity" />
            </nav>

            <nav className="space-y-1">
                <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Configure</p>
                <ProjectNavLink href={`/dashboard/projects/${id}/settings`} icon={<Settings size={16} />} label="Project Settings" />
            </nav>
        </div>

        <div className="p-4 border-t border-border/50 bg-muted/20">
             <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-black flex items-center justify-center border border-border/50">
                    <Triangle size={16} className="fill-current text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold truncate">Production</p>
                    <p className="text-[9px] text-muted-foreground truncate">{project.deployment_status === 'ready' ? 'Online' : 'Pending'}</p>
                </div>
             </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Project Header */}
        <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur px-8 flex items-center justify-between z-30">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold tracking-tight">Workspace</h2>
                        <Badge variant="outline" className="text-[9px] h-4 px-1 uppercase opacity-50">PROD</Badge>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                 <div className="flex items-center gap-4 mr-4 text-[10px] font-medium text-muted-foreground uppercase tracking-widest border-r border-border/50 pr-4">
                    <div className="flex items-center gap-1.5">
                        <Github size={12} />
                        <span className="truncate max-w-[100px]">{project.github_repo_name?.split('/')[1] || 'Linking...'}</span>
                    </div>
                </div>
                <Button size="sm" className="h-8 gap-2 font-bold px-4 shadow-lg shadow-primary/20">
                    <Zap size={14} className="fill-current" /> Deploy
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
        <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
            {icon}
            <span>{label}</span>
        </Link>
    )
}

function Triangle({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3l10 18H2L12 3z"/></svg>
    )
}
