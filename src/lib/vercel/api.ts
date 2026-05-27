export interface VercelProject {
  id: string;
  name: string;
}

export class VercelClient {
  constructor(private token: string, private teamId?: string) {}

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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Vercel API error');
    }

    return response.json();
  }

  async createProject(name: string): Promise<VercelProject> {
    return this.fetchVercel('/v9/projects', {
      method: 'POST',
      body: JSON.stringify({
        name,
        framework: 'nextjs',
      }),
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.fetchVercel(`/v9/projects/${id}`, {
      method: 'DELETE',
    });
  }
}
