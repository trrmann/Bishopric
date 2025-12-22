// Class to manage data fetch from GitHub (public raw content or API)
export class GitHubData {
    constructor(repoOwner, repoName, dataPath="data", branch = "main") {
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        this.dataPath = dataPath;
        this.branch = branch;
    }
    // All filename registry and cache logic removed
    GetHost() {
        return `https://${this.repoOwner}.github.io/`;
    }
    GetProject() {
        return `${this.repoName}/`;
    }
    GetDataPath() {
        return `${this.dataPath}/`;
    }
    GetConfigurationURL(filename) {
        const host = this.GetHost();
        const project = this.GetProject();
        const dataPath = this.GetDataPath();
        const url = `${host}${project}${dataPath}${filename}`;
        return url;
    }
    async fetchRawFile(filename) {
        const response = await fetch(this.GetConfigurationURL(filename));
        if (!response.ok) throw new Error(`Failed to fetch file: ${filename}`);
        return await response.text();
    }
    async fetchJsonFile(filename) {
        const text = await this.fetchRawFile(filename);
        return await JSON.parse(text);
    }
    // Fetch file metadata using GitHub API (requires token for private repos)
    async fetchFileMetadata(filename, token = null) {
        const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${filename}?ref=${this.branch}`;
        const headers = token ? { Authorization: `token ${token}` } : {};
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`Failed to fetch metadata for: ${filePath}`);
        return await response.json();
    }
    // List files in a directory using GitHub API
    async listDirectory(dirPath = "", token = null) {
        const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${dirPath}?ref=${this.branch}`;
        const headers = token ? { Authorization: `token ${token}` } : {};
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`Failed to list directory: ${dirPath}`);
        return await response.json();
    }
}
