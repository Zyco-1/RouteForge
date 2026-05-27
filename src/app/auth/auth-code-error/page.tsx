import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
      <h1 className="mb-2 text-2xl font-bold">Authentication Error</h1>
      <p className="mb-8 text-muted-foreground">
        There was an issue verifying your authentication code. This can happen if the link has expired or has already been used.
      </p>
      <Link href="/login">
        <Button>Back to Login</Button>
      </Link>
    </div>
  );
}
