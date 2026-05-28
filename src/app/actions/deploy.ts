'use server'

import { createClient } from '@/utils/supabase/server'
import { VercelClient } from "@/lib/vercel/api"
import { decrypt } from '@/lib/encryption'
import { GitHubClient } from '@/lib/github/api'
import { validateWorkflow, generateProject } from '@/lib/generation/engine'
import { revalidatePath } from 'next/cache'

export async function deployProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Fetch project data
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (fetchError || !project) throw new Error('Project not found')

  // 2. Validate workflow
  const validation = validateWorkflow(project.content)
  if (!validation.isValid) {
    throw new Error(`Workflow is invalid: ${validation.errors.join(', ')}`)
  }

  // 3. Fetch user tokens
  const { data: profile } = await supabase
    .from('profiles')
    .select('encrypted_github_token, encrypted_vercel_token')
    .eq('id', user.id)
    .single()

  if (!profile?.encrypted_github_token) throw new Error('GitHub connection required for deployment')

  try {
    // 4. Generate code
    console.log('Generating backend code...')
    const generatedFiles = generateProject(project.content, project.name)

    // 5. Push to GitHub
    console.log('Pushing code to GitHub repository:', project.github_repo_name)
    const githubToken = decrypt(profile.encrypted_github_token)
    const gh = new GitHubClient(githubToken)

    await gh.pushFiles(project.github_repo_name, generatedFiles, 'Deploy from RouteForge')

    // 6. Update project status in DB
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        deployment_status: 'building',
        last_deployed_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (updateError) throw updateError

    revalidatePath(`/dashboard/projects/${projectId}`)
    return

  } catch (e: any) {
    console.error('Deployment pipeline failed:', e.message)
    throw new Error(`Deployment failed: ${e.message}`)
  }
}

export async function pollDeploymentStatus(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (!project || !project.vercel_project_id || project.deployment_status === 'ready') return

  const { data: profile } = await supabase
    .from('profiles')
    .select('encrypted_vercel_token, vercel_team_id')
    .eq('id', user.id)
    .single()

  if (!profile?.encrypted_vercel_token) return

  try {
    const token = decrypt(profile.encrypted_vercel_token)
    const vercel = new VercelClient(token, profile.vercel_team_id || undefined)

    const deployment = await vercel.getLatestDeployment(project.vercel_project_id)

    if (deployment) {
        let status: string = project.deployment_status;
        if (deployment.readyState === 'READY') status = 'ready';
        if (deployment.readyState === 'ERROR') status = 'failed';
        if (deployment.readyState === 'BUILDING') status = 'building';

        if (status !== project.deployment_status || deployment.url !== project.deployment_url) {
            await supabase
              .from('projects')
              .update({
                deployment_status: status,
                deployment_url: deployment.url ? `https://${deployment.url}` : project.deployment_url,
                latest_deployment_id: deployment.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', projectId)

            revalidatePath(`/dashboard/projects/${projectId}`)
        }
    }
  } catch (e) {
    console.error('Polling failed:', e)
  }
}
