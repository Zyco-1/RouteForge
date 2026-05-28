'use server'

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient, createServiceRoleClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { decrypt } from '@/lib/encryption'
import { encrypt } from "@/lib/encryption"
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
  let vercelProjectId = null;

  try {
    const githubToken = decrypt(profile.encrypted_github_token)
    const gh = new GitHubClient(githubToken)

    console.log('Creating GitHub repository:', vName)
    try {
        const repo = await gh.createRepository(vName, description)
        githubRepoName = repo.full_name
    } catch (e: any) {
        if (e.message.includes('already exists')) {
            throw new Error(`The repository name "${vName}" is already taken on GitHub.`)
        }
        throw e
    }

    // Delay for GitHub repo to be indexed
    await new Promise(resolve => setTimeout(resolve, 3000));

    const vercelToken = decrypt(profile.encrypted_vercel_token)
    const vercel = new VercelClient(vercelToken, profile.vercel_team_id || undefined)

    console.log('Creating Vercel project with link to:', githubRepoName)
    try {
        const vProject = await vercel.createProject(vName, githubRepoName!)
        vercelProjectId = vProject.id
    } catch (e: any) {
        console.error('Vercel Link Error:', e.message);

        if (e.message.includes('GitHub integration')) {
             throw new Error('Action Required: Please install the Vercel GitHub App on your Vercel account to enable automatic deployments.');
        }

        // Fallback: Create without link so the project isn't lost, but notify user
        console.warn('Falling back to creation without link.');
        const vProject = await vercel.createProject(vName)
        vercelProjectId = vProject.id
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

export async function updateProjectSupabaseConfig(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const url = formData.get('supabase_url') as string
  const key = formData.get('supabase_service_role_key') as string

  const updateData: any = {
    supabase_url: url,
    updated_at: new Date().toISOString()
  }

  if (key && key !== '••••••••') {
      updateData.encrypted_supabase_service_role_key = encrypt(key)
  }

  const { error } = await (await createServiceRoleClient())
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath(`/dashboard/projects/${id}/settings`)
}

export async function createTableInSupabase(projectId: string, tableName: string, columns: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (!project?.supabase_url || !project?.encrypted_supabase_service_role_key) {
    throw new Error('Supabase project not connected.')
  }

  const key = decrypt(project.encrypted_supabase_service_role_key)

  // Generate SQL
  let sql = `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;
  const columnDefs = columns.map(col => {
      let def = `  ${col.name} ${col.type}`;
      if (col.primary) def += ' PRIMARY KEY';
      if (col.unique && !col.primary) def += ' UNIQUE';
      if (!col.nullable) def += ' NOT NULL';
      if (col.default) def += ` DEFAULT ${col.default}`;
      return def;
  });
  sql += columnDefs.join(',\n');
  sql += `\n);\n\n-- Enable Row Level Security\nALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;\n\n-- Add default access policies\nCREATE POLICY "Enable read access for all users" ON public.${tableName} FOR SELECT USING (true);\n`;

  // Attempt to execute on user's Supabase
  const userSupabase = createSupabaseClient(project.supabase_url, key)

  // Try executing via exec_sql RPC
  const { error: execError } = await userSupabase.rpc('exec_sql', { sql_query: sql })

  if (execError) {
      console.warn('Automatic execution failed:', execError.message)
      // We still store metadata if it failed, but we pass the error back
      // so the user knows they need to run it manually or fix their RPC.
  }

  await (await createServiceRoleClient())
    .from('database_tables')
    .insert({
        project_id: projectId,
        name: tableName,
        columns: columns
    })

  revalidatePath(`/dashboard/projects/${projectId}/database`)

  if (execError) {
      throw new Error(`Table metadata saved, but automatic deployment failed: ${execError.message}. Please run the SQL manually.`)
  }

  return { sql }
}

export async function renameProject(id: string, newName: string) {
    const supabase = await createServiceRoleClient()
    await supabase.from('projects').update({ name: newName }).eq('id', id)
    revalidatePath(`/dashboard/projects/${id}`)
}

export async function getProjectSchema(projectId: string) {
  const supabase = await createServiceRoleClient()
  const { data: project, error } = await supabase
    .from('projects')
    .select('supabase_url, encrypted_supabase_service_role_key')
    .eq('id', projectId)
    .single()

  if (error || !project?.supabase_url || !project?.encrypted_supabase_service_role_key) {
    return { tables: [] }
  }

  try {
    const key = decrypt(project.encrypted_supabase_service_role_key)
    const userSupabase = createSupabaseClient(project.supabase_url, key)

    // Query information_schema to get tables and columns
    // We filter for public schema and exclude common system tables
    const { data, error: schemaError } = await userSupabase.rpc('get_schema_metadata')

    if (schemaError) {
      // Fallback to raw SQL if RPC doesn't exist (users might not have it yet)
      const { data: rawData, error: rawError } = await userSupabase
        .from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')

      if (rawError) throw rawError

      const tables = await Promise.all(rawData.map(async (t: any) => {
        const { data: cols } = await userSupabase
          .from('information_schema.columns')
          .select('column_name, data_type')
          .eq('table_name', t.tablename)
          .eq('table_schema', 'public')

        return {
          name: t.tablename,
          columns: cols?.map((c: any) => ({ name: c.column_name, type: c.data_type })) || []
        }
      }))

      return { tables }
    }

    return { tables: data }
  } catch (e) {
    console.error('Failed to fetch schema:', e)
    return { tables: [] }
  }
}

export async function refreshProjectSchema(projectId: string) {
  // Force a re-validation of the schema cache
  revalidatePath(`/dashboard/projects/${projectId}/database`)
  return getProjectSchema(projectId)
}
