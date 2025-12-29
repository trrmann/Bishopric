// Google Drive data module, modeled after Callings class, using googleDrive.json as the data source
// Maintains Google Drive API methods for interaction

export class GoogleDrive {
    // ===== Instance Accessors =====
    get Data() { return this._data; }
    get GitHubDataObj() { return this._gitHubDataObj; }
    get IsLoaded() { return this._isLoaded; }
    get UnitManagementToolsKey() { return this._unitManagementToolsKey; }
    get ClientId() { return this.CLIENT_ID; }
    // Use SecretValue as the primary client secret, fallback to API_KEY
    get ApiKey() {
        return this._secretValue || this.API_KEY;
    }
    get DiscoveryDocs() { return this.DISCOVERY_DOCS; }
    get Scopes() { return this.SCOPES; }
    get IsInitialized() { return this.isInitialized; }

    // ===== Constructor =====
    constructor(gitHubDataObject) {
        this._data = [];
        this._gitHubDataObj = gitHubDataObject;
        this._isLoaded = false;
        this._unitManagementToolsKey = GoogleDrive.DefaultUnitManagementToolsKey;
        this.CLIENT_ID = null;
        this.API_KEY = null;
        this.DISCOVERY_DOCS = [GoogleDrive.DefaultDiscoveryDocEntry];
        this.SCOPES = GoogleDrive.DefaultScope;
        this.isInitialized = false;
        this._secretManagerName = null;
        this._secretValue = null;
    }

    // Property to get the secret value retrieved from Secret Manager
    get SecretValue() { return this._secretValue; }
    // Property to get the Google Secret Manager resource name
    get SecretManagerName() { return this._secretManagerName; }

    // Fetch secret value from Google Secret Manager using OAuth2 access token and secretManagerName
    async fetchSecretManagerValue() {
        if (!this._gisToken) throw new Error("Not signed in with Google");
        if (!this._secretManagerName) throw new Error("Secret Manager name not set");
        // Google Secret Manager REST API endpoint
        const url = `https://secretmanager.googleapis.com/v1/${this._secretManagerName}:access`;
        const res = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + this._gisToken }
        });
        if (!res.ok) throw new Error('Failed to access secret from Secret Manager');
        const data = await res.json();
        // Secret payload is base64 encoded
        if (data && data.payload && data.payload.data) {
            this._secretValue = atob(data.payload.data);
        } else {
            throw new Error('Secret Manager response missing payload');
        }
    }

    // ===== Static Methods =====
    static get DefaultUnitManagementToolsKey() { return "AIzaSyCNEotTLr9DV2nkqPixdmcRZArDwltryh0"; }
    static get DefaultDiscoveryDocEntry() { return "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"; }
    static get DefaultScope() { return "https://www.googleapis.com/auth/drive.file"; }

    static CopyFromJSON(dataJSON) {
        const drive = new GoogleDrive(dataJSON._gitHubDataObj);
        drive._data = dataJSON._data;
        drive._isLoaded = dataJSON._isLoaded;
        drive._unitManagementToolsKey = dataJSON._unitManagementToolsKey;
        drive.CLIENT_ID = dataJSON.CLIENT_ID;
        drive.API_KEY = dataJSON.API_KEY;
        drive.DISCOVERY_DOCS = dataJSON.DISCOVERY_DOCS;
        drive.SCOPES = dataJSON.SCOPES;
        drive.isInitialized = dataJSON.isInitialized;
        return drive;
    }
    static CopyToJSON(instance) {
        return {
            _data: instance._data,
            _gitHubDataObj: instance._gitHubDataObj,
            _isLoaded: instance._isLoaded,
            _unitManagementToolsKey: instance._unitManagementToolsKey,
            CLIENT_ID: instance.CLIENT_ID,
            API_KEY: instance.API_KEY,
            DISCOVERY_DOCS: instance.DISCOVERY_DOCS,
            SCOPES: instance.SCOPES,
            isInitialized: instance.isInitialized
        };
    }
    static CopyFromObject(destination, source) {
        destination._data = source._data;
        destination._gitHubDataObj = source._gitHubDataObj;
        destination._isLoaded = source._isLoaded;
        destination._unitManagementToolsKey = source._unitManagementToolsKey;
        destination.CLIENT_ID = source.CLIENT_ID;
        destination.API_KEY = source.API_KEY;
        destination.DISCOVERY_DOCS = source.DISCOVERY_DOCS;
        destination.SCOPES = source.SCOPES;
        destination.isInitialized = source.isInitialized;
    }
    static async Factory(gitHubDataObject, config) {
        const drive = new GoogleDrive(gitHubDataObject);
        if (config) {
            drive.CLIENT_ID = config.CLIENT_ID;
            drive.API_KEY = config.API_KEY;
            if (config.SCOPES) drive.SCOPES = config.SCOPES;
            if (config.name) drive._secretManagerName = config.name;
        } else {
            const googleConfig = await drive._gitHubDataObj.fetchJsonFile("googleDrive.json");
            let secrets = null;
            try {
                secrets = await drive._gitHubDataObj.fetchJsonFile("secrets.json");
            } catch(error) {
                try {
                    const response = await fetch("data/secrets.json");
                    if (!response.ok) throw new Error("Local secrets.json not found");
                    secrets = await response.json();
                } catch(localError) {
                    secrets = undefined;
                }
            }
            drive.CLIENT_ID = googleConfig.web.client_id;
            drive.DISCOVERY_DOCS = googleConfig.web.discovery_docs;
            drive.SCOPES = googleConfig.web.scopes;
            if (googleConfig.web && googleConfig.web.name) drive._secretManagerName = googleConfig.web.name;
            if(secrets) drive.API_KEY = secrets.googleDrive.client_secret;
        }
        await drive.loadGisScript();
        await drive.signIn();
        // Fetch secret from Secret Manager if name is set
        if (drive._secretManagerName) {
            await drive.fetchSecretManagerValue();
        }
        return drive;
    }
    /*
    const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();
async function accessSecret() {
  const [version] = await client.accessSecretVersion({
    name: 'projects/PROJECT_ID/secrets/SECRET_ID/versions/latest',
  });
  const payload = version.payload.data.toString();
    // console.log(`Secret: ${payload}`); // Removed for production cleanliness
}
accessSecret();
    /**/
    // (Removed loadGapiScript, not needed for GIS OAuth2)
    // Dynamically load Google Identity Services script
    async loadGisScript() {
        if (window.google && window.google.accounts && window.google.accounts.id) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject("Failed to load Google Identity Services script");
            document.body.appendChild(script);
        });
    }

    CopyFromJSON(json) {
        if (Array.isArray(json)) {
            this._data = json;
        } else if (json && Array.isArray(json.items)) {
            this._data = json.items;
        } else {
            this._data = [];
        }
        this._buildCache();
    }

    CopyFromObject(obj) {
        this.CopyFromJSON(obj);
    }

    // Accessors
    GetItemById(id) {
        return this._data.find(item => item.id === id) || null;
    }

    GetItemByName(name) {
        return this._data.find(item => item.name === name) || null;
    }

    HasItemById(id) {
        return this._data.some(item => item.id === id);
    }

    HasItemByName(name) {
        return this._data.some(item => item.name === name);
    }

    GetAll() {
        return this._data.slice();
    }

    // (Removed initClient, not needed for GIS OAuth2)

    isSignedIn() {
        return !!this._gisToken;
    }

    async signIn(silent = false) {
        return new Promise((resolve, reject) => {
            if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
                reject("Google Identity Services OAuth2 not loaded");
                return;
            }
            if (!this._tokenClient) {
                this._tokenClient = window.google.accounts.oauth2.initTokenClient({
                    client_id: this.CLIENT_ID,
                    scope: this.SCOPES,
                    callback: (response) => {
                        if (response && response.access_token) {
                            this._gisToken = response.access_token;
                            resolve(response);
                        } else {
                            reject("No access token returned");
                        }
                    }
                });
            }
            // Use prompt: '' for silent sign-in attempt
            if (silent) {
                this._tokenClient.requestAccessToken({ prompt: '' });
            } else {
                this._tokenClient.requestAccessToken();
            }
        });
    }

    async signOut() {
        this._gisToken = null;
        // There is no explicit sign-out for GIS OAuth2, but you can revoke the token if needed
        // Optionally, you can call Google's revoke endpoint:
        // if (this._gisToken) fetch(`https://oauth2.googleapis.com/revoke?token=${this._gisToken}`, { method: 'POST', headers: { 'Content-type': 'application/x-www-form-urlencoded' } });
    }

    // Fetch method: loads or refreshes data from Google Drive (stub for now)
    async Fetch() {
        // TODO: Implement actual Google Drive data fetch logic here
        // For now, just mark as loaded
        this._isLoaded = true;
        return true;
    }

    // Upload a raw text file
    async uploadRawFile(name, content, mimeType = 'text/plain') {
        const file = new Blob([content], { type: mimeType });
        const metadata = { name, mimeType };
        const accessToken = this._gisToken;
        if (!accessToken) throw new Error("Not signed in with Google");
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);
        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
            body: form,
        });
        return res.json();
    }

    // Download a raw text file
    async downloadRawFile(fileId) {
        const accessToken = this._gisToken;
        if (!accessToken) throw new Error("Not signed in with Google");
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });
        if (!res.ok) throw new Error('Failed to download file');
        return res.text();
    }

    // Upload a file (default: JSON)
    async uploadFile(name, content, mimeType = 'application/json') {
        return this.uploadRawFile(name, content, mimeType);
    }

    // Download a file (default: text)
    async downloadFile(fileId) {
        return this.downloadRawFile(fileId);
    }

    // Upload a JSON file (overrides mimetype)
    async uploadJsonFile(name, obj) {
        const content = JSON.stringify(obj);
        return this.uploadRawFile(name, content, 'application/json');
    }

    // Download a JSON file (parses result)
    async downloadJsonFile(fileId) {
        const text = await this.downloadRawFile(fileId);
        return JSON.parse(text);
    }

    async downloadFile(fileId) {
        // For GIS, use fetch with the access token
        const accessToken = this._gisToken;
        if (!accessToken) throw new Error("Not signed in with Google");
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });
        if (!res.ok) throw new Error('Failed to download file');
        return res.text();
    }

    async listFiles(query = '', pageSize = 10) {
        // Use Drive API v3 with REST and GIS token
        const accessToken = this._gisToken;
        if (!accessToken) throw new Error("Not signed in with Google");
        const params = new URLSearchParams({
            q: query,
            pageSize: pageSize.toString(),
            fields: 'nextPageToken, files(id, name)'
        });
        const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });
        if (!res.ok) throw new Error('Failed to list files');
        const data = await res.json();
        return data.files;
    }
    async deleteFile(fileId) {
        const accessToken = this._gisToken;
        if (!accessToken) throw new Error("Not signed in with Google");
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });
        if (!res.ok) throw new Error('Failed to delete file');
        return true;
    }
    // Securely upload a file: always register as secure and encrypt content with publicKey before upload
    async secureUpload(filename, content, googleId, publicKey) {
        GoogleDrive.registerSecureFile(filename, googleId);
        if (!publicKey) throw new Error('publicKey is required for secure upload');
        const encrypted = await PublicKeyCrypto.encrypt(publicKey, content);
        if (typeof this.uploadFile === 'function') {
            return await this.uploadFile(filename, encrypted, googleId);
        } else {
            throw new Error('uploadFile method not implemented');
        }
    }

    // Securely download a file: download and decrypt with privateKey if registered as secure
    async secureDownload(filename, googleId, privateKey) {
        const isSecure = GoogleDrive._secureFileRegistry.has(JSON.stringify({ filename, googleId }));
        if (typeof this.downloadFile === 'function') {
            const fileContent = await this.downloadFile(filename, googleId);
            if (isSecure && privateKey) {
                let decrypted = fileContent;
                try {
                    decrypted = await PublicKeyCrypto.decrypt(privateKey, fileContent);
                } catch (e) {
                    // If decryption fails, return the raw value
                }
                return decrypted;
            } else {
                // Not registered as secure, return in the clear
                return fileContent;
            }
        } else {
            throw new Error('downloadFile method not implemented');
        }
    }
}