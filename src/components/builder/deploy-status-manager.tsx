"use client"

import { useEffect } from 'react'
import { pollDeploymentStatus } from '@/app/actions/deploy'
import { useRouter } from 'next/navigation'

export function DeployStatusManager({ projectId, status }: { projectId: string, status: string }) {
  const router = useRouter();

  useEffect(() => {
    if (status !== 'ready' && status !== 'failed') {
      const interval = setInterval(async () => {
        await pollDeploymentStatus(projectId);
        router.refresh();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [projectId, status, router]);

  return null;
}
