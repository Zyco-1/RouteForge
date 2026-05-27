import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Zap, Save, Play, Settings, Share2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { WorkflowEditor } from "@/components/builder/workflow-editor";

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
    <div className="flex flex-col h-[calc(100vh-64px)] -m-6 md:-m-10">
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
              <h1 className="text-sm font-bold tracking-tight">{project.name}</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">Draft</p>
           </div>
        </div>

        <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2 text-xs">
                <Settings className="size-3" /> Config
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-xs text-green-500 hover:text-green-600">
                <Play className="size-3 fill-current" /> Run
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Save className="size-3" /> Save
            </Button>
            <Button size="sm" className="gap-2 text-xs font-bold bg-primary text-primary-foreground">
                <Zap className="size-3 fill-current" /> Deploy to Vercel
            </Button>
        </div>
      </header>

      {/* Builder Canvas Area */}
      <div className="flex-1 relative bg-muted/10">
         <WorkflowEditor initialData={project.content} projectId={project.id} />
      </div>
    </div>
  );
}

function Separator({ className, orientation }: { className?: string, orientation?: string }) {
    return <div className={`bg-border/50 ${orientation === 'vertical' ? 'w-[1px] h-full' : 'h-[1px] w-full'} ${className}`} />
}
