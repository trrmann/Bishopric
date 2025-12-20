import { PublicKeyCrypto } from "./crypto.mjs";
// modules/gitHubData.mjs
// Class to manage data fetch from GitHub (public raw content or API)
export class GitHubData {
    static _filenameRegistry = new Set();
    static _secureFilenameRegistry = new Set();
    constructor(repoOwner, repoName, dataPath="data", branch = "main") {
        this.repoOwner = repoOwner;
        this.repoName = repoName;
        this.dataPath = dataPath;
        this.branch = branch;
    }

    // Register a filename
    static registerFilename(filename) {
        GitHubData._filenameRegistry.add(filename);
    }

    // Unregister a filename
    static unregisterFilename(filename) {
        GitHubData._filenameRegistry.delete(filename);
    }

    // Get all registered filenames
    static getAllFilenames() {
        return Array.from(GitHubData._filenameRegistry);
    }

    // Register a secure filename
    static registerSecureFilename(filename) {
        GitHubData._secureFilenameRegistry.add(filename);
    }

    // Unregister a secure filename
    static unregisterSecureFilename(filename) {
        GitHubData._secureFilenameRegistry.delete(filename);
    }

    // Get all registered secure filenames
    static getAllSecureFilenames() {
        return Array.from(GitHubData._secureFilenameRegistry);
    }
    GetHost() {
        return `https://${this.repoOwner}.github.io/`;
    }
    GetProject() {
        return `${this.repoName}/data/`;
    }
    GetDataPath() {
        return `${this.repoName}/data/`;
    }
    GetConfigurationURL(filename) {
        return `${this.GetHost()}${this.GetProject()}${this.GetDataPath()}${filename}`;
    }
    // Fetch a file's raw content from GitHub (public repo)
    async fetchRawFile(filename) {
        const response = await fetch(this.GetConfigurationURL(filename));
        if (!response.ok) throw new Error(`Failed to fetch file: ${filename}`);
        return await response.text();
    }

    // Fetch a secure (encrypted) raw file and decrypt it if registered as secure
    async fetchSecureRawFile(filename, privateKey) {
        const raw = await this.fetchRawFile(filename);
        if (GitHubData._secureFilenameRegistry.has(filename) && privateKey) {
            try {
                return await PublicKeyCrypto.decrypt(privateKey, raw);
            } catch (e) {
                // If decryption fails, return the raw value
                return raw;
            }
        }
        // If not registered as secure, return in the clear
        return raw;
    }
    // Fetch JSON file from GitHub (public repo)
    async fetchJsonFile(filename) {
        const text = await this.fetchRawFile(filename);
        return await JSON.parse(text);
    }

    // Fetch a secure (encrypted) JSON file and decrypt it if registered as secure
    async fetchSecureJsonFile(filename, privateKey) {
        const raw = await this.fetchRawFile(filename);
        if (GitHubData._secureFilenameRegistry.has(filename) && privateKey) {
            try {
                const decrypted = await PublicKeyCrypto.decrypt(privateKey, raw);
                return await JSON.parse(decrypted);
            } catch (e) {
                // If decryption fails, fall back to raw
            }
        }
        // If not registered as secure, or decryption fails, return parsed raw
        return await JSON.parse(raw);
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
