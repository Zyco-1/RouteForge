export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
}

export class GitHubClient {
  constructor(private token: string) {
    if (!token) throw new Error('GitHubClient: token is required');
  }

  private async fetchGitHub(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      ...options,
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'GitHub API error');
    }

    return response.json();
  }

  async createRepository(name: string, description: string = ''): Promise<GitHubRepo> {
    return this.fetchGitHub('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        private: true,
        auto_init: true,
      }),
    });
  }

  async deleteRepository(owner: string, repo: string): Promise<void> {
    await this.fetchGitHub(`/repos/${owner}/${repo}`, {
      method: 'DELETE',
    });
  }
}
