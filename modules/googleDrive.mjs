import { PublicKeyCrypto } from "./crypto.mjs";
// Google Drive data module, modeled after Callings class, using googleDrive.json as the data source
// Maintains Google Drive API methods for interaction

export class GoogleDrive {
    static _fileRegistry = new Set(); // Set of { filename, googleId } objects
    static _secureFileRegistry = new Set(); // Set of { filename, googleId } objects
        // Register a secure file with filename and googleId
        static registerSecureFile(filename, googleId) {
            GoogleDrive._secureFileRegistry.add(JSON.stringify({ filename, googleId }));
        }

        // Unregister a secure file by filename and googleId
        static unregisterSecureFile(filename, googleId) {
            GoogleDrive._secureFileRegistry.delete(JSON.stringify({ filename, googleId }));
        }

        // Get all registered secure files as array of { filename, googleId }
        static getAllSecureFiles() {
            return Array.from(GoogleDrive._secureFileRegistry).map(str => JSON.parse(str));
        }
            // Register a file with filename and googleId
            static registerFile(filename, googleId) {
                GoogleDrive._fileRegistry.add(JSON.stringify({ filename, googleId }));
            }

            // Unregister a file by filename and googleId
            static unregisterFile(filename, googleId) {
                GoogleDrive._fileRegistry.delete(JSON.stringify({ filename, googleId }));
            }

            // Get all registered files as array of { filename, googleId }
            static getAllFiles() {
                return Array.from(GoogleDrive._fileRegistry).map(str => JSON.parse(str));
            }
    constructor() {
        this._data = [];
        this._cache = {};
        this._isLoaded = false;
        // Google Drive API config
        this.UnitManagementToolsKey = "AIzaSyCNEotTLr9DV2nkqPixdmcRZArDwltryh0";
        this.CLIENT_ID = null;
        this.API_KEY = null;
        this.DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
        this.SCOPES = "https://www.googleapis.com/auth/drive.file";
        this.isInitialized = false;
    }

    static async Factory(config) {
        const drive = new GoogleDrive();
        if (config) {
            drive.CLIENT_ID = config.CLIENT_ID;
            drive.API_KEY = config.API_KEY;
            if (config.SCOPES) drive.SCOPES = config.SCOPES;
        }
        await drive.Fetch();
        await drive.loadGisScript();
        return drive;
    }
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

    // Loads googleDrive.json data
    async Fetch() {
        if (this._isLoaded) return;
        try {
            const response = await fetch('data/googleDrive.json');
            if (!response.ok) throw new Error('Failed to load googleDrive.json');
            const json = await response.json();
            // If config is present in the JSON, seed API config
            if ((await json) && (await json.web)) {
                const cfg = json.web;
                if (cfg.client_id) this.CLIENT_ID = cfg.client_id;
                if (cfg.client_secret) this.API_KEY = cfg.client_secret;
                if (cfg.scopes) this.SCOPES = cfg.scopes;
                if (cfg.discovery_docs) this.DISCOVERY_DOCS = cfg.discovery_docs;
            }
            this.CopyFromJSON(json);
            this._isLoaded = true;
        } catch (e) {
            console.error('GoogleDrive.Fetch error:', e);
        }
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

    _buildCache() {
        this._cache = {};
        for (const item of this._data) {
            if (item.id) this._cache[item.id] = item;
            if (item.name) this._cache[item.name] = item;
        }
    }

    // Accessors
    GetItemById(id) {
        return this._cache[id] || null;
    }

    GetItemByName(name) {
        return this._cache[name] || null;
    }

    HasItemById(id) {
        return !!this._cache[id];
    }

    HasItemByName(name) {
        return !!this._cache[name];
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
