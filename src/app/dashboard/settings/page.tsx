import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Database, Shield, Github, Triangle, ExternalLink } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground font-extrabold">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your account and integration preferences.</p>
      </div>

      <div className="grid gap-8">
        {/* User Profile */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center border border-border/50">
                    <Github className="size-6 opacity-40" />
                </div>
                <div>
                    <CardTitle className="text-xl font-bold">GitHub Profile</CardTitle>
                    <CardDescription>
                      Authenticated via GitHub OAuth.
                    </CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Username</label>
                  <Input value={profile?.github_username || ""} readOnly className="bg-muted/30" />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Primary Email</label>
                  <Input value={profile?.email || ""} readOnly className="bg-muted/30" />
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Supabase Connection */}
        <Card className="bg-card/50 border-border/50 overflow-hidden">
          <div className="h-1 bg-primary" />
          <CardHeader>
            <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold">
                    <Database className="size-5" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xl font-bold font-bold">Connect Your Supabase</CardTitle>
                        {profile?.encrypted_default_supabase_service_role_key ? (
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Connected</Badge>
                        ) : (
                            <Badge variant="secondary">Pending</Badge>
                        )}
                    </div>
                    <CardDescription>
                      Required to manage your application's database and authentication.
                    </CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-2 border-t border-border/20">
            <div className="grid gap-6">
                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    Supabase Project URL
                  </label>
                  <Input placeholder="https://your-project.supabase.co" />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    Service Role Key <Shield className="size-3 text-primary" />
                  </label>
                  <Input type="password" placeholder="ey... (Your secret service_role key)" />
                  <p className="text-[10px] text-muted-foreground">
                    This key is used to generate migrations and manage your DB. It will be stored with AES-256-GCM encryption.
                  </p>
                </div>
            </div>
          </CardContent>
          <div className="p-6 pt-0 flex justify-end">
                <Button className="font-bold gap-2">
                    Save Configuration
                </Button>
          </div>
        </Card>

        {/* Integrations Status */}
        <div className="grid md:grid-cols-2 gap-6">
             <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Triangle className="size-5 text-muted-foreground" />
                            <CardTitle className="text-lg">Vercel Integration</CardTitle>
                        </div>
                        {profile?.encrypted_vercel_token ? <Badge className="bg-green-500/10 text-green-500">Active</Badge> : <Badge variant="outline">Missing</Badge>}
                    </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Connect your Vercel account to enable automated backend deployments.
                </CardContent>
                <div className="p-6 pt-0">
                    <Button variant="outline" className="w-full font-bold h-9">
                        Configure Integration
                    </Button>
                </div>
             </Card>

             <Card className="bg-card/50 border-border/50 border-destructive/10">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-destructive font-bold">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Permanently delete your RouteForge account and all project data.
                </CardContent>
                <div className="p-6 pt-0">
                    <Button variant="destructive" className="w-full font-bold h-9 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-white transition-all">
                        Delete Account
                    </Button>
                </div>
             </Card>
        </div>
      </div>
    </div>
  );
}
