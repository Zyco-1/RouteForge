import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Plus, Table, Columns, Key, Shield, ArrowRight, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateTableDialog } from "@/components/database/create-table-dialog";

export default async function ProjectDatabasePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  const { data: tables } = await supabase
    .from('database_tables')
    .select('*')
    .eq('project_id', id);

  const isSupabaseConnected = !!project.encrypted_supabase_service_role_key;

  return (
    <div className="p-8 space-y-8 text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Database Schema</h2>
          <p className="text-muted-foreground mt-1">Visually design and sync your Supabase tables.</p>
        </div>
        {isSupabaseConnected ? (
             <CreateTableDialog projectId={id} />
        ) : (
            <Badge variant="secondary" className="h-9 px-4 font-bold gap-2">
                <Shield size={14} /> Connect Supabase to build
            </Badge>
        )}
      </div>

      {!isSupabaseConnected && (
          <Card className="bg-amber-500/10 border-amber-500/20 text-amber-500">
            <CardContent className="p-4 flex items-center gap-3">
                <Database className="size-5 shrink-0" />
                <div className="text-sm font-medium">
                    You need to connect your Supabase project in settings before you can create tables.
                </div>
            </CardContent>
          </Card>
      )}

      {tables && tables.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
             <Card key={table.id} className="group hover:border-primary/50 transition-all bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3 border-b border-border/10 bg-muted/20">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Table size={16} className="text-primary" />
                        <CardTitle className="text-lg font-bold">{table.name}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase font-bold opacity-60">Synced</Badge>
                   </div>
                </CardHeader>
                <CardContent className="pt-4">
                   <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-widest opacity-50 mb-3">
                            <span>Columns</span>
                            <span>Type</span>
                        </div>
                        {table.columns.slice(0, 4).map((col: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    {col.primary ? <Key size={10} className="text-amber-500" /> : <Columns size={10} className="text-muted-foreground" />}
                                    <span className="font-mono">{col.name}</span>
                                </div>
                                <span className="font-mono opacity-50 uppercase text-[10px]">{col.type}</span>
                            </div>
                        ))}
                        {table.columns.length > 4 && (
                            <p className="text-[10px] text-muted-foreground text-center mt-4">
                                + {table.columns.length - 4} more columns
                            </p>
                        )}
                   </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border/10 flex gap-2">
                    <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold h-8 uppercase tracking-widest">
                        View Details
                    </Button>
                </CardFooter>
             </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed py-20 bg-muted/5 border-border/50">
            <CardHeader className="text-center">
            <div className="flex justify-center mb-6 text-foreground">
                <div className="size-20 rounded-3xl bg-card flex items-center justify-center border border-border/50 shadow-inner">
                    <Database className="size-10 text-primary opacity-20" />
                </div>
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">No tables defined</CardTitle>
            <CardDescription className="max-w-xs mx-auto mt-2">
                Use the visual builder to define your schema and generate SQL migrations.
            </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8 text-foreground">
                <Button size="lg" className="gap-2 font-bold h-12 px-8 shadow-lg shadow-primary/20" variant={isSupabaseConnected ? 'default' : 'secondary'} disabled={!isSupabaseConnected}>
                    <Plus size={18} /> Create Your First Table
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
