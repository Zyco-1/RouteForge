export interface VercelProject {
  id: string;
  name: string;
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
      // Log the full error for internal debugging
      console.error('Vercel API Error Detail:', JSON.stringify(data, null, 2));
      throw new Error(data.error?.message || data.message || 'Vercel API error');
    }

    return data;
  }

  async createProject(name: string, gitRepo?: string): Promise<VercelProject> {
    const body: any = {
      name,
      framework: 'nextjs',
    };

    if (gitRepo) {
      // Using the most standard way to link a repo during project creation
      body.gitRepository = {
        type: 'github',
        repo: gitRepo,
      };
    }

    return this.fetchVercel('/v9/projects', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.fetchVercel(`/v9/projects/${id}`, {
      method: 'DELETE',
    });
  }
}
