import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Triangle, ExternalLink, CheckCircle2, XCircle, Zap, Check, ArrowRight, Database, Code, Globe } from "lucide-react";
import Link from "next/link";

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
  const isSupabaseConnected = !!profile?.encrypted_default_supabase_service_role_key;

  const vercelAuthUrl = `https://vercel.com/integrations/routeforge/new?state=${user?.id}`;

  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Overview</h2>
          <p className="text-muted-foreground mt-1 text-sm font-medium uppercase tracking-widest opacity-70">
            Welcome back, {profile?.github_username || 'Developer'}
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant={profile?.plan === 'pro' ? 'default' : 'secondary'} className="capitalize px-4 py-1.5 font-bold">
                {profile?.plan || 'Free'} Plan
            </Badge>
        </div>
      </div>

      {/* Onboarding Section if no projects */}
      {projectCount === 0 && (
          <div className="grid md:grid-cols-3 gap-4">
            <OnboardingCard
                title="Connect Supabase"
                description="Link your project's database to start building visual APIs."
                status={isSupabaseConnected ? 'completed' : 'pending'}
                icon={<Database className="size-5" />}
                href="/dashboard/settings"
            />
            <OnboardingCard
                title="Connect Vercel"
                description="Enable one-click deployments for your generated backends."
                status={isVercelConnected ? 'completed' : 'pending'}
                icon={<Triangle className="size-5" />}
                href={vercelAuthUrl}
                isExternal
            />
            <OnboardingCard
                title="Create Project"
                description="Launch your first API backend with our visual flow builder."
                status="pending"
                icon={<Plus className="size-5" />}
                href="/dashboard/projects"
            />
          </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatusCard
            title="GitHub Integration"
            status={isGithubConnected ? 'Connected' : 'Not Connected'}
            subtext={profile?.github_username ? `Linked to @${profile.github_username}` : 'Required for code sync.'}
            icon={<Github className="h-4 w-4" />}
            isConnected={isGithubConnected}
        />

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Vercel Platform</CardTitle>
            <Triangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex items-center gap-2">
              {isVercelConnected ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-bold">Connected</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-bold opacity-70">Not Connected</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
                {isVercelConnected
                    ? (profile.vercel_team_slug ? `Team: ${profile.vercel_team_slug}` : 'Personal Account')
                    : 'Manage deployments directly.'
                }
            </p>
          </CardContent>
          <div className="p-4 pt-0 mt-auto">
               {!isVercelConnected && (
                  <a href={vercelAuthUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                    <Button size="sm" className="w-full gap-2 font-bold" variant="secondary">
                        Connect <ArrowRight className="size-3" />
                    </Button>
                  </a>
               )}
          </div>
        </Card>

        <StatusCard
            title="Active Projects"
            status={projectCount?.toString() || "0"}
            subtext="Visual APIs in your account."
            icon={<Zap className="h-4 w-4" />}
            isConnected={projectCount! > 0}
        />
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Monitor your latest deployments and project edits.
            </CardDescription>
          </div>
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="sm" className="text-xs font-bold gap-1">
                View All <ArrowRight className="size-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed border-border/20 rounded-xl m-6 mt-0">
            <div className="flex flex-col items-center gap-3 opacity-30">
                <Code className="size-10" />
                <p className="text-lg font-bold tracking-tight">Nothing here yet</p>
                <p className="text-sm">Start building to see activity.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusCard({ title, status, subtext, icon, isConnected }: any) {
    return (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            <div className="text-muted-foreground">{icon}</div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-bold">{status}</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-bold opacity-70">{status}</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {subtext}
            </p>
          </CardContent>
        </Card>
    )
}

function OnboardingCard({ title, description, status, icon, href, isExternal }: any) {
    const isCompleted = status === 'completed';
    return (
        <Link href={href} {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            <Card className={`h-full transition-all hover:ring-2 hover:ring-primary/20 cursor-pointer ${isCompleted ? 'opacity-60 grayscale' : ''}`}>
                <CardContent className="p-5 flex gap-4">
                    <div className={`size-10 shrink-0 rounded-xl flex items-center justify-center border ${isCompleted ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                        {isCompleted ? <Check className="size-5" /> : icon}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm leading-tight flex items-center gap-2">
                            {title}
                            {isCompleted && <Badge variant="secondary" className="text-[10px] h-4 px-1">Done</Badge>}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

function Plus({ className }: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
    )
}
