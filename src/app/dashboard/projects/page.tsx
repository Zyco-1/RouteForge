import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, MoreVertical, Edit } from "lucide-react";
import Link from "next/link";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-extrabold">Projects</h2>
          <p className="text-muted-foreground mt-1">Create and manage your visual API backends.</p>
        </div>
        <CreateProjectDialog />
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
             <Card key={project.id} className="group hover:border-primary/50 transition-all cursor-pointer bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader className="pb-3">
                   <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold">{project.name}</CardTitle>
                      <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 transition-opacity">
                         <MoreVertical className="size-4" />
                      </Button>
                   </div>
                   <CardDescription className="line-clamp-2 min-h-[40px] text-xs">
                      {project.description || "No description provided."}
                   </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                   <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
                      <Zap className="size-3" />
                      <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                   </div>
                </CardContent>
                <CardFooter className="pt-0 flex gap-2">
                   <Link href={`/dashboard/projects/${project.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full gap-2 font-bold text-xs h-9">
                         <Edit className="size-3.5" /> Open Builder
                      </Button>
                   </Link>
                </CardFooter>
             </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed py-16 bg-muted/5 border-border/50">
            <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
                <div className="size-20 rounded-3xl bg-card flex items-center justify-center border border-border/50 shadow-inner">
                    <Zap className="size-10 text-primary opacity-20" />
                </div>
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">No projects yet</CardTitle>
            <CardDescription className="max-w-xs mx-auto mt-2">
                Launch your first API backend. Connect nodes, define logic, and deploy to Vercel.
            </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
                <CreateProjectDialog>
                    <Button size="lg" className="gap-2 font-bold h-12 px-8 shadow-lg shadow-primary/20">
                        Create My First Project
                    </Button>
                </CreateProjectDialog>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
