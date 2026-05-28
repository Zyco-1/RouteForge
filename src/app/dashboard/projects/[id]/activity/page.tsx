import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, GitBranch, Zap, Shield, Database } from "lucide-react";

export default async function ProjectActivityPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-8 space-y-8 text-foreground">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Activity Feed</h2>
        <p className="text-muted-foreground mt-1">Audit log of all infrastructure events.</p>
      </div>

      <div className="max-w-4xl space-y-4">
        {logs && logs.length > 0 ? (
          logs.map((log) => (
             <div key={log.id} className="flex gap-4 p-4 rounded-xl bg-card/50 border border-border/50">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Activity size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold">{log.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                </div>
             </div>
          ))
        ) : (
          <div className="py-20 text-center bg-muted/5 rounded-2xl border border-dashed border-border/50">
             <Activity className="size-10 text-muted-foreground mx-auto mb-4 opacity-20" />
             <p className="text-sm font-bold text-muted-foreground">No activity recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
