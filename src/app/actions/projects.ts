'use server'

import { createClient, createServiceRoleClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { decrypt } from '@/lib/encryption'
import { VercelClient } from '@/lib/vercel/api'

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Gating: Require Vercel connection
  if (!profile?.encrypted_vercel_token) {
    throw new Error('Vercel connection required to create a project.')
  }

  // Plan Gating: Free plan limit (3 projects)
  if (profile.plan === 'free') {
      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (count && count >= 3) {
          throw new Error('Free plan limit reached (3 projects). Upgrade to Pro for unlimited backends.')
      }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  let vercelProjectId = null
  try {
    const token = decrypt(profile.encrypted_vercel_token)
    const vercel = new VercelClient(token, profile.vercel_team_id || undefined)
    const vProject = await vercel.createProject(name)
    vercelProjectId = vProject.id
  } catch (e: any) {
    console.error('Vercel project creation failed:', e.message)
    throw new Error(`Failed to create Vercel project: ${e.message}`)
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name,
      description,
      user_id: user.id,
      vercel_project_id: vercelProjectId,
      content: { nodes: [], edges: [] }
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/projects')
  redirect(`/dashboard/projects/${data.id}`)
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: project } = await supabase
    .from('projects')
    .select('vercel_project_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (project?.vercel_project_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('encrypted_vercel_token, vercel_team_id')
      .eq('id', user.id)
      .single()

    if (profile?.encrypted_vercel_token) {
      try {
        const token = decrypt(profile.encrypted_vercel_token)
        const vercel = new VercelClient(token, profile.vercel_team_id || undefined)
        await vercel.deleteProject(project.vercel_project_id)
      } catch (e) {
        console.error('Vercel project deletion cleanup failed:', e)
      }
    }
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/projects')
}

export async function updateProjectWorkflow(id: string, content: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('projects')
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
}
