import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Triangle, ExternalLink, CheckCircle2, XCircle, Zap } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  const isGithubConnected = !!profile?.encrypted_github_token;
  const isVercelConnected = !!profile?.encrypted_vercel_token;

  const vercelAuthUrl = `https://vercel.com/integrations/buildapi/new?state=${user?.id}`;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {profile?.github_username || 'Developer'}</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your API backends and deployments.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant={profile?.plan === 'pro' ? 'default' : 'secondary'} className="capitalize px-3 py-1">
                {profile?.plan || 'Free'} Plan
            </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GitHub Status</CardTitle>
            <Github className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isGithubConnected ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-semibold">Connected</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold">Not Connected</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {profile?.github_username ? `Linked to @${profile.github_username}` : 'Connect your GitHub account to sync repos.'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vercel Integration</CardTitle>
            <Triangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isVercelConnected ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-semibold">Connected</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold">Not Connected</span>
                </>
              )}
            </div>
            <div className="mt-4">
               {!isVercelConnected ? (
                  <a href={vercelAuthUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                    <Button size="sm" className="w-full gap-2 cursor-pointer">
                        Connect Vercel <ExternalLink className="size-3" />
                    </Button>
                  </a>
               ) : (
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border border-border/50">
                    Connected to {profile.vercel_team_slug ? `team: ${profile.vercel_team_slug}` : 'Personal Account'}
                  </p>
               )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-2">
              API builder coming soon in Phase 2.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>
            You haven't created any API backends yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center border-2 border-dashed border-border/50 rounded-lg m-6 mt-0">
            <div className="flex flex-col items-center gap-2 opacity-50">
                <Zap className="size-8 text-muted-foreground" />
                <p className="text-muted-foreground font-medium">Projects coming soon</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
