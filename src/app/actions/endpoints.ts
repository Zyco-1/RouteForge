'use server'

import { createServiceRoleClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateEndpointWorkflow(id: string, workflow: any) {
  const supabase = await createServiceRoleClient()
  await supabase
    .from('endpoints')
    .update({ workflow, updated_at: new Date().toISOString() })
    .eq('id', id)
}

export async function createEndpoint(projectId: string, name: string, path: string, method: string) {
    const supabase = await createServiceRoleClient()
    const { data, error } = await supabase
        .from('endpoints')
        .insert({ project_id: projectId, name, path, method })
        .select()
        .single()

    if (error) throw error
    revalidatePath(`/dashboard/projects/${projectId}/apis`)
    return data
}
