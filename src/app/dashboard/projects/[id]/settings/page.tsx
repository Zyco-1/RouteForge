import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Database, Shield, Save } from "lucide-react";
import { updateProjectSupabaseConfig } from "@/app/actions/projects";

export default async function ProjectSettingsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  const isConnected = !!project.encrypted_supabase_service_role_key;

  return (
    <div className="p-8 space-y-10 text-foreground">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Project Settings</h2>
        <p className="text-muted-foreground mt-1 text-sm uppercase tracking-widest font-bold opacity-60">Configuration for {project.name}</p>
      </div>

      <div className="grid gap-8 max-w-4xl">
        <form action={updateProjectSupabaseConfig.bind(null, id)}>
            <Card className="bg-card/50 border-border/50 overflow-hidden relative border-l-4 border-l-primary">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold">
                            <Database className="size-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Project Database</CardTitle>
                            <CardDescription>Connect this project to a specific Supabase instance.</CardDescription>
                        </div>
                    </div>
                    {isConnected ? (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Connected</Badge>
                    ) : (
                        <Badge variant="secondary">Not Connected</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4 border-t border-border/10">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Supabase URL</label>
                    <Input name="supabase_url" defaultValue={project.supabase_url || ""} placeholder="https://project.supabase.co" />
                    </div>
                    <div className="grid gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        Service Role Key <Shield className="size-3 text-primary" />
                    </label>
                    <Input name="supabase_service_role_key" type="password" placeholder={isConnected ? "••••••••" : "ey... (Your secret key)"} />
                    <p className="text-[10px] text-muted-foreground italic">
                        {isConnected ? "Key is encrypted and stored. Leave blank to keep current key." : "This key will be stored using AES-256-GCM encryption."}
                    </p>
                    </div>
                </div>
            </CardContent>
            <div className="p-6 pt-0 flex justify-end">
                    <Button type="submit" className="font-bold gap-2 cursor-pointer shadow-lg shadow-primary/20">
                        <Save size={14} /> Save DB Configuration
                    </Button>
            </div>
            </Card>
        </form>

        {/* Danger Zone */}
        <Card className="bg-card/50 border-border/50 border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive font-bold">Danger Zone</CardTitle>
            <CardDescription>Permanently delete this project and all linked infrastructure.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-xs text-muted-foreground mb-6">
                Deleting this project will also attempt to delete the linked repository on GitHub
                and the project on Vercel. This action is irreversible.
             </p>
             <Button variant="destructive" className="font-bold h-9 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-white transition-all">
                Delete Project Infrastructure
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
