// Class to manage data fetch from GitHub (public raw content or API)

export class GitHubData {
    // ===== Instance Accessors =====
    get RepoOwner() { return this.repoOwner; }
    get RepoName() { return this.repoName; }
    get DataPath() { return this.dataPath; }
    get Branch() { return this.branch; }

    // ===== Constructor =====
    constructor(repoOwner, repoName, dataPath="data", branch = "main") {
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        this.dataPath = dataPath;
        this.branch = branch;
    }

    // ===== Static Methods =====
    static CopyFromJSON(dataJSON) {
        return new GitHubData(dataJSON.repoOwner, dataJSON.repoName, dataJSON.dataPath, dataJSON.branch);
    }
    static CopyToJSON(instance) {
        return {
            repoOwner: instance.repoOwner,
            repoName: instance.repoName,
            dataPath: instance.dataPath,
            branch: instance.branch
        };
    }
    static CopyFromObject(destination, source) {
        destination.repoOwner = source.repoOwner;
        destination.repoName = source.repoName;
        destination.dataPath = source.dataPath;
        destination.branch = source.branch;
    }
    static async Factory(repoOwner, repoName, dataPath="data", branch = "main") {
        return new GitHubData(repoOwner, repoName, dataPath, branch);
    }

    // ===== Core Methods =====
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
    async Has(filename) {
        return (this.Get(filename) != null);
    }
    async Get(filename, type="raw") {
        if(type==="raw") {
            return await this.fetchRawFile(filename);
        } else {
            return await this.fetchJsonFile(filename);
        }
    };
    async fetchRawFile(filename) {
        const response = await fetch(this.GetConfigurationURL(filename));
        if (!response.ok) throw new Error(`Failed to fetch file: ${filename}`);
        return await response.text();
    }
    async fetchJsonFile(filename) {
        const text = await this.fetchRawFile(filename);
        return await JSON.parse(text);
    }
    async fetchFileMetadata(filename, token = null) {
        const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${filename}?ref=${this.branch}`;
        const headers = token ? { Authorization: `token ${token}` } : {};
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`Failed to fetch metadata for: ${filename}`);
        return await response.json();
    }
    async listDirectory(dirPath = "", token = null) {
        const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${dirPath}?ref=${this.branch}`;
        const headers = token ? { Authorization: `token ${token}` } : {};
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`Failed to list directory: ${dirPath}`);
        return await response.json();
    }
}
