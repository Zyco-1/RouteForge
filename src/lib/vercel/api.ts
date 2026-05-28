export interface VercelProject {
  id: string;
  name: string;
}

export interface VercelDeployment {
  id: string;
  url: string;
  readyState: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';
  createdAt: number;
}

export class VercelClient {
  constructor(private token: string, private teamId?: string) {
    if (!token) throw new Error('VercelClient: token is required');
  }

  private async fetchVercel(endpoint: string, options: RequestInit = {}) {
    const url = new URL(`https://api.vercel.com${endpoint}`);
    if (this.teamId) {
      url.searchParams.append('teamId', this.teamId);
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Vercel API Error:', JSON.stringify(data, null, 2));
      throw new Error(data.error?.message || data.message || 'Vercel API error');
    }

    return data;
  }

  async createProject(name: string, gitRepo?: string): Promise<VercelProject> {
    const body: any = { name, framework: 'nextjs' };
    if (gitRepo) {
      body.gitRepository = { type: 'github', repo: gitRepo };
    }
    return this.fetchVercel('/v9/projects', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getLatestDeployment(projectId: string): Promise<VercelDeployment> {
    const data = await this.fetchVercel(`/v6/deployments?projectId=${projectId}&limit=1`);
    return data.deployments[0];
  }

  async getDeployment(deploymentId: string): Promise<VercelDeployment> {
    return this.fetchVercel(`/v13/deployments/${deploymentId}`);
  }

  async deleteProject(id: string): Promise<void> {
    await this.fetchVercel(`/v9/projects/${id}`, { method: 'DELETE' });
  }
}
