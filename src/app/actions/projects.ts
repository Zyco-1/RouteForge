'use server'

import { createClient, createServiceRoleClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { decrypt } from '@/lib/encryption'
import { VercelClient } from '@/lib/vercel/api'
import { GitHubClient } from '@/lib/github/api'

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.encrypted_vercel_token || !profile?.encrypted_github_token) {
    throw new Error('Both Vercel and GitHub connections are required to create a project.')
  }

  if (profile.plan === 'free') {
      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (count && count >= 3) {
          throw new Error('Free plan limit reached (3 projects).')
      }
  }

  const displayName = formData.get('name') as string
  const description = formData.get('description') as string

  // Sanitize for Repo & Vercel
  const vName = displayName.toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);

  let githubRepoName = vName;
  let vercelProjectId = null;

  try {
    const githubToken = decrypt(profile.encrypted_github_token)
    const gh = new GitHubClient(githubToken)

    // 1. Create GitHub Repo
    console.log('Creating GitHub repository:', githubRepoName)
    try {
        const repo = await gh.createRepository(githubRepoName, description)
        githubRepoName = repo.full_name
    } catch (e: any) {
        if (e.message.includes('already exists')) {
            throw new Error(`The repository name "${vName}" is already taken on your GitHub account.`)
        }
        throw e
    }

    // 2. Create Vercel Project and link to Repo
    const vercelToken = decrypt(profile.encrypted_vercel_token)
    const vercel = new VercelClient(vercelToken, profile.vercel_team_id || undefined)

    console.log('Creating Vercel project linked to:', githubRepoName)
    try {
        const vProject = await vercel.createProject(vName, githubRepoName)
        vercelProjectId = vProject.id
    } catch (e: any) {
        if (e.message.includes('already exists')) {
            throw new Error(`The project name "${vName}" is already taken on your Vercel account.`)
        }
        throw e
    }

  } catch (e: any) {
    console.error('Project creation sync failed:', e.message)
    throw e;
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: displayName,
      description,
      user_id: user.id,
      vercel_project_id: vercelProjectId,
      github_repo_name: githubRepoName,
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
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (project) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      // 1. Delete Vercel Project
      if (project.vercel_project_id && profile.encrypted_vercel_token) {
        try {
          const token = decrypt(profile.encrypted_vercel_token)
          const vercel = new VercelClient(token, profile.vercel_team_id || undefined)
          await vercel.deleteProject(project.vercel_project_id)
        } catch (e) { console.error('Vercel delete failed', e) }
      }

      // 2. Delete GitHub Repo
      if (project.github_repo_name && profile.encrypted_github_token) {
        try {
          const token = decrypt(profile.encrypted_github_token)
          const gh = new GitHubClient(token)
          const [owner, repo] = project.github_repo_name.split('/')
          await gh.deleteRepository(owner, repo)
        } catch (e) { console.error('GitHub delete failed', e) }
      }
    }
  }

  await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/dashboard/projects')
}

export async function updateProjectWorkflow(id: string, content: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('projects')
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
}
