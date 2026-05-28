import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Plus, Table, Columns, Key, Shield, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ProjectDatabasePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: tables } = await supabase
    .from('database_tables')
    .select('*')
    .eq('project_id', id);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground text-foreground">Database</h2>
          <p className="text-muted-foreground mt-1">Visually design your Supabase schema.</p>
        </div>
        <Button className="gap-2 font-bold shadow-lg shadow-primary/20">
            <Plus size={18} /> New Table
        </Button>
      </div>

      {tables && tables.length > 0 ? (
          <div className="grid gap-6">
              {/* Table list implementation here */}
          </div>
      ) : (
        <Card className="border-dashed py-20 bg-muted/5 border-border/50">
            <CardHeader className="text-center text-foreground">
            <div className="flex justify-center mb-6">
                <div className="size-20 rounded-3xl bg-card flex items-center justify-center border border-border/50 shadow-inner">
                    <Database className="size-10 text-primary opacity-20" />
                </div>
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">No tables defined</CardTitle>
            <CardDescription className="max-w-xs mx-auto mt-2">
                Connect your Supabase project in settings to start building your database visually.
            </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
                <Button size="lg" className="gap-2 font-bold h-12 px-8 shadow-lg shadow-primary/20" variant="secondary">
                    Connect Supabase First
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
