import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
        <p className="text-muted-foreground">Manage your visual API backends.</p>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Zap className="size-12 text-muted-foreground opacity-20" />
          </div>
          <CardTitle>No projects yet</CardTitle>
          <CardDescription>
            The RouteForge workflow builder will be available in Phase 2.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
           <div className="text-sm font-mono text-muted-foreground bg-muted/50 px-4 py-2 rounded">
              Coming Soon: Visual API Builder
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
