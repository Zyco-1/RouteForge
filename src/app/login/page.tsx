import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Triangle } from "lucide-react";
import Link from "next/link";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Link href="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
        <Triangle className="size-6 fill-current text-primary" />
        <span className="text-xl font-bold tracking-tight">RouteForge</span>
      </Link>

      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to continue building.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/auth/login" method="POST">
            <Button type="submit" className="w-full gap-2 h-11 text-base">
                <Github className="size-5" />
                Continue with GitHub
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-center text-sm text-muted-foreground px-6">
            By clicking continue, you agree to our <Link href="#" className="underline underline-offset-4 hover:text-primary">Terms of Service</Link> and <Link href="#" className="underline underline-offset-4 hover:text-primary">Privacy Policy</Link>.
          </p>
        </CardFooter>
      </Card>

      <p className="mt-8 text-sm text-muted-foreground">
        Don't have an account? <Link href="/login" className="text-primary hover:underline underline-offset-4 font-medium">Get started for free</Link>
      </p>
    </div>
  );
}
