import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Triangle, ExternalLink, CheckCircle2, XCircle } from "lucide-react";

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

  const vercelAuthUrl = `https://vercel.com/integrations/your-integration-slug/new?state=${user?.id}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.github_username || 'Developer'}</h2>
          <p className="text-muted-foreground">
            Manage your API backends and deployments.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant={profile?.plan === 'pro' ? 'default' : 'secondary'} className="capitalize">
                {profile?.plan || 'Free'} Plan
            </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
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
            <p className="text-xs text-muted-foreground mt-1">
              {profile?.github_username ? `Linked to @${profile.github_username}` : 'Connect your GitHub account to sync repos.'}
            </p>
          </CardContent>
        </Card>

        <Card>
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
            <div className="mt-3">
               {!isVercelConnected ? (
                  <Button size="sm" className="w-full" >
                    <a href={vercelAuthUrl}>
                        Connect Vercel <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
               ) : (
                  <p className="text-xs text-muted-foreground">
                    Connected to {profile.vercel_team_slug ? `team: ${profile.vercel_team_slug}` : 'Personal Account'}
                  </p>
               )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              API builder coming soon in Phase 2.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>
            You haven't created any API backends yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-md">
            <p className="text-muted-foreground">Projects coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}

const Zap = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 14.75V3.5h16v11.25" />
    <path d="M15 13.5l-3 3-3-3" />
    <path d="M12 16.5V21" />
  </svg>
);
