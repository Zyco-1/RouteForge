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

    console.log(`Vercel API Request: ${options.method || 'GET'} ${endpoint}`);

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
      console.error('Vercel API Error Response:', data);
      throw new Error(data.error?.message || data.message || 'Vercel API error');
    }

    return data;
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
