import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Plus, MoreVertical, Edit, ArrowRight, Code } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CreateEndpointDialog } from "@/components/endpoints/create-endpoint-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteEndpointButton } from "@/components/endpoints/delete-endpoint-button";

export default async function ProjectApisPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: endpoints } = await supabase
    .from('endpoints')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-8 space-y-8 text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">API Endpoints</h2>
          <p className="text-muted-foreground mt-1">Design and manage your serverless routes.</p>
        </div>
        <CreateEndpointDialog projectId={id} />
      </div>

      {endpoints && endpoints.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {endpoints.map((api) => (
             <Card key={api.id} className="group hover:border-primary/50 transition-all bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3">
                   <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border-none">
                        {api.method}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                             <MoreVertical size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-card border-border/50">
                          <Link href={`/dashboard/projects/${id}/apis/${api.id}`}>
                            <DropdownMenuItem className="cursor-pointer font-bold">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit in Builder
                            </DropdownMenuItem>
                          </Link>
                          <DeleteEndpointButton id={api.id} projectId={id} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                   </div>
                   <CardTitle className="text-lg font-bold">{api.name}</CardTitle>
                   <CardDescription className="font-mono text-[11px] bg-muted/50 p-1.5 rounded border border-border/50 mt-2 truncate">
                      {api.path}
                   </CardDescription>
                </CardHeader>
                <CardFooter className="pt-3 border-t border-border/10 flex gap-2">
                   <Link href={`/dashboard/projects/${id}/apis/${api.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full gap-2 font-bold text-xs cursor-pointer">
                         <Code size={14} /> Open Builder
                      </Button>
                   </Link>
                </CardFooter>
             </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed py-20 bg-muted/5 border-border/50">
            <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
                <div className="size-20 rounded-3xl bg-card flex items-center justify-center border border-border/50 shadow-inner">
                    <Zap className="size-10 text-primary opacity-20" />
                </div>
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">No endpoints created</CardTitle>
            <CardDescription className="max-w-xs mx-auto mt-2 text-muted-foreground">
                Define your first API route. Connect logic, fetch data, and return JSON responses.
            </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
                <CreateEndpointDialog projectId={id} />
            </CardContent>
        </Card>
      )}
    </div>
  );
}
