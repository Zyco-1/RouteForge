import Link from "next/link";
import { Triangle } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container max-w-screen-2xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Triangle className="size-5 fill-current text-primary" />
              <span className="text-lg font-bold tracking-tight">RouteForge</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              The visual backend builder for developers. Create, deploy, and scale APIs in record time.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Integrations</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Social</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Twitter</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">GitHub</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Discord</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} RouteForge Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
             <Link href="#" className="hover:text-foreground transition-colors">Status</Link>
             <Link href="#" className="hover:text-foreground transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
