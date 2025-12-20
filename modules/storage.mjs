import { LocalStorage } from "./localStorage.mjs";
import { SessionStorage } from "./sessionStorage.mjs";
import { GitHubData } from "./gitHubData.mjs";
import { GoogleDrive } from "./googleDrive.mjs";

export class Storage {
    constructor(googleDriveInstance = null, gitHubDataInstance = null) {
        this.local = LocalStorage;
        this.session = new SessionStorage();
        this.gitHub = gitHubDataInstance;
        this.googleDrive = googleDriveInstance;
    }

    // Local Storage
    async setLocal(key, value) { this.local.SetPreference(key, value); }
    async getLocal(key, privateKey = null) { return await this.local.GetPreference(key, privateKey); }
    async setLocalSecure(key, value, publicKey) { await this.local.SetSecurePreference(key, value, publicKey); }
    async getLocalSecure(key, privateKey) { return await this.local.GetPreference(key, privateKey); }

    // Session Storage
    setSession(key, value) { this.session.setItem(key, value); }
    getSession(key) { return this.session.getItem(key); }
    async setSessionSecure(key, value, publicKey) { await this.session.setSecureItem(key, value, publicKey); }
    async getSessionSecure(key, privateKey) { return await this.session.getSecureItem(key, privateKey); }

    // Google Drive (raw, JSON, secure)
    async uploadDriveRaw(name, content, mimeType = 'text/plain') { return await this.googleDrive.uploadRawFile(name, content, mimeType); }
    async downloadDriveRaw(fileId) { return await this.googleDrive.downloadRawFile(fileId); }
    async uploadDriveJson(name, obj) { return await this.googleDrive.uploadJsonFile(name, obj); }
    async downloadDriveJson(fileId) { return await this.googleDrive.downloadJsonFile(fileId); }
    async uploadDriveSecure(name, content, googleId, publicKey) { return await this.googleDrive.secureUpload(name, content, googleId, publicKey); }
    async downloadDriveSecure(name, googleId, privateKey) { return await this.googleDrive.secureDownload(name, googleId, privateKey); }

    // GitHub Data (raw, JSON, secure)
    async fetchGitHubRaw(filename) { return await this.gitHub.fetchRawFile(filename); }
    async fetchGitHubJson(filename) { return await this.gitHub.fetchJsonFile(filename); }
    async fetchGitHubSecureRaw(filename, privateKey) { return await this.gitHub.fetchSecureRawFile(filename, privateKey); }
    async fetchGitHubSecureJson(filename, privateKey) { return await this.gitHub.fetchSecureJsonFile(filename, privateKey); }
}
