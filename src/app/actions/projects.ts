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

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  // Fetch Vercel token from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('encrypted_vercel_token, vercel_team_id')
    .eq('id', user.id)
    .single()

  let vercelProjectId = null

  if (profile?.encrypted_vercel_token) {
    try {
      const token = decrypt(profile.encrypted_vercel_token)
      const vercel = new VercelClient(token, profile.vercel_team_id || undefined)

      // Create project on Vercel
      const vProject = await vercel.createProject(name)
      vercelProjectId = vProject.id
    } catch (e) {
      console.error('Failed to create Vercel project:', e)
      // We continue even if Vercel fails, but the user should be notified
    }
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name,
      description,
      user_id: user.id,
      vercel_project_id: vercelProjectId,
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

  // Fetch project to get Vercel project ID
  const { data: project } = await supabase
    .from('projects')
    .select('vercel_project_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (project?.vercel_project_id) {
    // Fetch Vercel token from profile
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
        console.error('Failed to delete Vercel project:', e)
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
  revalidatePath(`/dashboard/projects/${id}`)
}
