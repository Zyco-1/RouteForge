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

    // Pre-populate with the correct API Trigger node
    const initialWorkflow = {
        nodes: [
            {
                id: 'trigger_1',
                type: `api-${method.toLowerCase()}`,
                position: { x: 50, y: 50 },
                data: { label: `${method} Request`, path, auth: false }
            }
        ],
        edges: []
    };

    const { data, error } = await supabase
        .from('endpoints')
        .insert({
            project_id: projectId,
            name,
            path,
            method,
            workflow: initialWorkflow
        })
        .select()
        .single()

    if (error) throw error
    revalidatePath(`/dashboard/projects/${projectId}/apis`)
    return data
}

export async function deleteEndpoint(id: string, projectId: string) {
    const supabase = await createServiceRoleClient()
    const { error } = await supabase.from('endpoints').delete().eq('id', id).eq('project_id', projectId)
    if (error) throw error
    revalidatePath(`/dashboard/projects/${projectId}/apis`)
}
