import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Globe, Layers, Cpu, Database } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
          <div className="container relative z-10 max-w-screen-2xl px-4 md:px-8 mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
                Phase 1 Beta is Live
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                Build Production Backends <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Without the Boilerplate.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-1000">
                RouteForge is the visual API builder for modern developers. Connect your Supabase database, design workflows, and deploy to Vercel in seconds.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <Link href="/login">
                  <Button size="lg" className="h-12 px-8 text-base cursor-pointer">
                    Start Building Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base cursor-pointer">
                    View Features
                  </Button>
                </Link>
              </div>

              {/* Hero Image/Mockup Placeholder */}
              <div className="mt-20 relative w-full max-w-5xl mx-auto border border-border/50 rounded-xl overflow-hidden bg-card/50 shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-300">
                 <div className="flex items-center gap-1.5 px-4 h-10 border-b border-border/50 bg-muted/30">
                    <div className="size-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="size-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                    <div className="size-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
                    <div className="ml-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">routeforge.site / dashboard</div>
                 </div>
                 <div className="aspect-video bg-background/50 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
                    <div className="z-10 flex flex-col items-center gap-4 p-8 opacity-40">
                        <Zap className="size-16 text-primary animate-pulse" />
                        <p className="font-mono text-sm uppercase tracking-widest">Visual Workflow Engine</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Background Decorations */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full h-full opacity-20 pointer-events-none">
             <div className="absolute top-[-10%] left-[-10%] size-[40%] rounded-full bg-primary/20 blur-[120px]" />
             <div className="absolute bottom-[-10%] right-[-10%] size-[40%] rounded-full bg-primary/10 blur-[120px]" />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 border-y border-border/40 bg-muted/10">
          <div className="container max-w-screen-2xl px-4 md:px-8 mx-auto">
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Everything you need to ship.</h2>
              <p className="text-muted-foreground max-w-2xl">
                We've combined the best of no-code speed with developer-grade control. No abstractions that get in your way.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Zap className="size-10 text-primary" />}
                title="Visual Workflows"
                description="Design complex API logic using our drag-and-drop workflow editor. Switch to code anytime."
              />
              <FeatureCard
                icon={<Database className="size-10 text-primary" />}
                title="Supabase Native"
                description="First-class integration with your Supabase database. Instant CRUD and real-time syncing."
              />
              <FeatureCard
                icon={<Globe className="size-10 text-primary" />}
                title="Vercel Deployment"
                description="Deploy your generated backend directly to Vercel with a single click. Edge-ready by default."
              />
              <FeatureCard
                icon={<Shield className="size-10 text-primary" />}
                title="Secure by Design"
                description="AES-256-GCM encryption for all your OAuth tokens. Your secrets never leave your infrastructure."
              />
              <FeatureCard
                icon={<Layers className="size-10 text-primary" />}
                title="Modular Logic"
                description="Re-use blocks across different APIs. Scale your backend without repeating yourself."
              />
              <FeatureCard
                icon={<Cpu className="size-10 text-primary" />}
                title="Type-Safe Output"
                description="Generated code is high-quality TypeScript. Download it, audit it, or host it anywhere."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32">
          <div className="container max-w-screen-2xl px-4 md:px-8 mx-auto">
             <div className="relative rounded-3xl overflow-hidden bg-primary px-8 py-16 text-center text-primary-foreground shadow-2xl">
                <div className="relative z-10">
                   <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Ready to Forge your Route?</h2>
                   <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
                     Join hundreds of developers building faster than ever. Get started with RouteForge today for free.
                   </p>
                   <Link href="/login">
                    <Button size="lg" variant="secondary" className="h-12 px-10 text-base font-semibold cursor-pointer">
                        Get Started for Free
                    </Button>
                   </Link>
                </div>
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 size-96 rounded-full bg-white/10 blur-[80px]" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 size-96 rounded-full bg-black/10 blur-[80px]" />
             </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group relative p-8 rounded-2xl border border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
      <div className="mb-4 p-3 inline-block rounded-xl bg-muted/50 group-hover:bg-primary/5 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
