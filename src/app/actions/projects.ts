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

  const displayName = formData.get('name') as string
  const description = formData.get('description') as string

  const vName = displayName.toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);

  let githubRepoName = null;
  let githubRepoId = null;
  let vercelProjectId = null;

  try {
    const githubToken = decrypt(profile.encrypted_github_token)
    const gh = new GitHubClient(githubToken)

    console.log('Creating GitHub repository:', vName)
    try {
        const repo = await gh.createRepository(vName, description)
        githubRepoName = repo.full_name
        githubRepoId = repo.id
    } catch (e: any) {
        if (e.message.includes('already exists')) {
            throw new Error(`The repository name "${vName}" is already taken on GitHub.`)
        }
        throw e
    }

    // Give GitHub a moment to propagate the new repo
    await new Promise(resolve => setTimeout(resolve, 2000));

    const vercelToken = decrypt(profile.encrypted_vercel_token)
    const vercel = new VercelClient(vercelToken, profile.vercel_team_id || undefined)

    console.log('Creating Vercel project linked to GitHub ID:', githubRepoId)
    try {
        const vProject = await vercel.createProject(vName, githubRepoName!, githubRepoId)
        vercelProjectId = vProject.id
    } catch (e: any) {
        console.warn('Vercel link failed, trying without link:', e.message);
        // If it fails, it's usually because the GitHub Integration is not installed on Vercel
        const vProject = await vercel.createProject(vName)
        vercelProjectId = vProject.id
        // We will need to prompt the user to link it manually if they want auto-deploys
    }

  } catch (e: any) {
    throw e;
  }

  const supabaseAdmin = await createServiceRoleClient();
  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert({
      name: displayName,
      description,
      user_id: user.id,
      vercel_project_id: vercelProjectId,
      github_repo_name: githubRepoName,
    })
    .select()
    .single()

  if (error) {
    console.error('Supabase insert failed:', error)
    throw new Error(`Database Error: ${error.message}`)
  }

  revalidatePath('/dashboard/projects')
  redirect(`/dashboard/projects/${data.id}`)
}

export async function deleteProject(id: string) {
  const supabaseAdmin = await createServiceRoleClient();
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (project) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      if (project.vercel_project_id && profile.encrypted_vercel_token) {
        try {
          const token = decrypt(profile.encrypted_vercel_token)
          const vercel = new VercelClient(token, profile.vercel_team_id || undefined)
          await vercel.deleteProject(project.vercel_project_id)
        } catch (e) {}
      }

      if (project.github_repo_name && profile.encrypted_github_token) {
        try {
          const token = decrypt(profile.encrypted_github_token)
          const gh = new GitHubClient(token)
          const [owner, repo] = project.github_repo_name.split('/')
          await gh.deleteRepository(owner, repo)
        } catch (e) {}
      }
    }
  }

  await supabaseAdmin.from('projects').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/dashboard/projects')
}

export async function updateProjectWorkflow(id: string, content: any) {
  const supabase = await createServiceRoleClient()
  await supabase
    .from('projects')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', id)
}
