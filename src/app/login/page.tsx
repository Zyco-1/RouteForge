import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Triangle } from "lucide-react";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
             <div className="flex aspect-square size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Triangle className="size-6 fill-current" />
             </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">RouteForge</CardTitle>
          <CardDescription>
            Visual API Backend Builder for modern developers.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button variant="outline" className="w-full" >
             <form action="/api/auth/login" method="POST">
                <Button className="w-full gap-2">
                    <Github className="size-4" />
                    Continue with GitHub
                </Button>
             </form>
          </Button>
        </CardContent>
        <CardFooter>
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
