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

  // Push multiple files using the Git Data API
  async pushFiles(repoFullName: string, files: { path: string, content: string }[], message: string) {
    const [owner, repo] = repoFullName.split('/');

    // 1. Get latest commit SHA on main
    const refRes = await this.fetchGitHub(`/repos/${owner}/${repo}/git/refs/heads/main`);
    const latestCommitSha = refRes.object.sha;

    // 2. Create blobs for each file
    const blobs = await Promise.all(files.map(async (file) => {
        const blobRes = await this.fetchGitHub(`/repos/${owner}/${repo}/git/blobs`, {
            method: 'POST',
            body: JSON.stringify({ content: file.content, encoding: 'utf-8' })
        });
        return { path: file.path, sha: blobRes.sha };
    }));

    // 3. Create a new tree
    const treeRes = await this.fetchGitHub(`/repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        body: JSON.stringify({
            base_tree: latestCommitSha,
            tree: blobs.map(b => ({
                path: b.path,
                mode: '100644',
                type: 'blob',
                sha: b.sha
            }))
        })
    });

    // 4. Create a new commit
    const commitRes = await this.fetchGitHub(`/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        body: JSON.stringify({
            message,
            tree: treeRes.sha,
            parents: [latestCommitSha]
        })
    });

    // 5. Update the reference
    await this.fetchGitHub(`/repos/${owner}/${repo}/git/refs/heads/main`, {
        method: 'PATCH',
        body: JSON.stringify({ sha: commitRes.sha })
    });

    return commitRes.sha;
  }
}
