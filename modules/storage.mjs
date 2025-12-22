import { CacheStore } from "./cacheStore.mjs";
import { SessionStorage } from "./sessionStorage.mjs";
import { LocalStorage } from "./localStorage.mjs";
import { GoogleDrive } from "./googleDrive.mjs";
import { GitHubData } from "./gitHubData.mjs";
import { PublicKeyCrypto } from "./crypto.mjs";
export class Storage {
    static DefaultStoragePruneIntervalMS = 900000;//default storage prune interval is 2 minutes
    constructor(storageRegistryPruneIntervalMs = Storage.DefaultStoragePruneIntervalMS) {
        // registry of files
        this._keyRegistry = new Map();
        // secure registry of files
        this._secureKeyRegistry = new Map();
        this._registryPruneTimer = null;
        this._registryPruneIntervalMs = null;
        if (storageRegistryPruneIntervalMs > 0) {
            this.StartRegistryPruneTimer(storageRegistryPruneIntervalMs);
        }
        this._cache_purge_intervalMS = CacheStore.DefaultCachePruneIntervalMS;
        this._cache_default_value_expireMS = CacheStore.DefaultCacheValueExpireMS;
        this._cache = new CacheStore(this._cache_purge_intervalMS);
        this._sessionStorage_purge_intervalMS = SessionStorage.DefaultSessionStoragePruneIntervalMS;
        this._sessionStorage_default_value_expireMS = SessionStorage.DefaultSessionStorageValueExpireMS;
        this._sessionStorage = new SessionStorage(this._sessionStorage_purge_intervalMS);
        this._localStorage_purge_intervalMS = LocalStorage.DefaultLocalStoragePruneIntervalMS;
        this._localStorage_default_value_expireMS = LocalStorage.DefaultLocalStorageValueExpireMS;
        this._localStorage = new LocalStorage(this._localStorage_purge_intervalMS);
        this._crypto = new PublicKeyCrypto();
        this._googleDrive = null;
        this._gitHub = null;
    }
    static async Factory(storageRegistryPruneIntervalMs = Storage.DefaultStoragePruneIntervalMS) {
        const storage = new Storage(storageRegistryPruneIntervalMs);
        storage._gitHub = new GitHubData("trrmann","UnitManagementTools");
        //storage._googleDrive = await GoogleDrive.Factory(storage._gitHub);
        await Storage.testGoogleDrive(storage);
        return storage
    }
    static async testGoogleDrive(storage) {
        let fileList = null;
        try {
            fileList = await storage._googleDrive.listFiles();
        } catch(error) {
            console.log(error);
        }
        const myData = { foo: "bar", baz: 123 };
        let uploadResult = null;
        try {
            uploadResult = await storage._googleDrive.uploadFile("mydata.json", JSON.stringify(myData), "application/json");
        } catch(error) {
            console.log(error);
        }
        try {
            fileList = await storage._googleDrive.listFiles();
        } catch(error) {
            console.log(error);
        }
        try {
            // Use uploadResult.id for downloadFile
            const fileDownload = await storage._googleDrive.downloadFile(uploadResult.id);
            console.log(fileDownload);
        } catch(error) {
            console.log(error);
        }
        try {
            for (const file of fileList) {
                if (file.name === "") {
                    file.deleteResult = await storage._googleDrive.deleteFile(file.id);
                }
            }
            console.log(await fileList);
        } catch(error) {
            console.log(error);
        }
        try {
            fileList = await storage._googleDrive.listFiles();
            console.log(fileList);
        } catch(error) {
            console.log(error);
        }
    }
    RegisterKey(key, expire) {
        this._keyRegistry.set(key, expire);
    }
    UnregisterKey(key) {
        if(this.SecureKeyRegistered(key)) {
            this.UnregisterSecureKey(key);
        } else {
            this._keyRegistry.delete(key);
        }
    }
    KeyRegistered(key) {
        return this.GetAllKeys().includes(key);
    }
    GetAllKeys() {
        return this._keyRegistry.Keys;
    }
    RegisterSecureKey(key, expire) {
        this.RegisterKey(key, expire);
        this._secureKeyRegistry.set(key, expire);
    }
    UnregisterSecureKey(key) {
        this._secureKeyRegistry.delete(key);
        this.UnregisterKey(key);
    }
    SecureKeyRegistered(key) {
        return this.GetAllSecureKeys().includes(key);
    }
    GetAllSecureKeys() {
        return this._secureKeyRegistry.Keys;
    }
    RegistryPrune() {
        const now = Date.now();
        for (const [key, entry] of this._secureKeyRegistry()) {
            if (entry && now > entry) {
                this.UnregisterSecureKey(key);
            }
        }
        for (const [key, entry] of this._keyRegistry()) {
            if (entry && now > entry) {
                this.UnregisterKey(key);
            }
        }
    }
    StartRegistryPruneTimer(intervalMs = null) {
        this._registryPruneIntervalMs = intervalMs || 60000;
        if (this._registryPruneTimer) {
            clearInterval(this._registryPruneTimer);
        }
        this._registryPruneIntervalMs = this._registryPruneIntervalMs;
        this._registryPruneTimer = setInterval(() => this.RegistryPrune(), this._registryPruneIntervalMs);
    }
    PauseRegistryPruneTimer() {
        if(this._registryPruneTimer) {
            clearInterval(this._registryPruneTimer);
            this._registryPruneTimer = null;
        }
    }
    ResumeRegistryPruneTimer() {
        if(this._registryPruneIntervalMs) {
            if (this._registryPruneTimer) {
                clearInterval(this._registryPruneTimer);
            }
            this._registryPruneTimer = setInterval(() => this.RegistryPrune(), this._registryPruneIntervalMs);
        }
    }
    StopRegistryPruneTimer() {
        if (this._registryPruneTimer) {
            clearInterval(this._registryPruneTimer);
            this._registryPruneTimer = null;
            this._registryPruneIntervalMs = null;
        }
    }

    // Central get: cache → session → local → google → github
    async Get(key, options = {}) {
        const { cacheTtlMs = null, sessionTtlMs = null, localTtlMs = null, googleId = null, githubFilename = null, privateKey = null, publicKey = null, secure = false } = options;
        let found = undefined;
        // 1. Cache
        if(this._cache.Has(key)) found = this._cache.Get(key);
        // 2. Session Storage
        if(!found && this._sessionStorage.HasKey(key)) found = this._sessionStorage.Get(key);
        // 3. Local Storage
        if(!found && this._localStorage.HasKey(key)) found = this._localStorage.Get(key);
        // 4. Google Drive (if available)
        if(!found && this._googleDrive && this._googleDrive.HasKey(key)) found = await this._googleDrive.Get(key);
        // 5. GitHub
        if(!found && this._gitHub.Has(key)) found = await this._gitHub.Get(key,"json");
        if(secure && privateKey) {
            return this._crypto.decrypt(privateKey, found);
        }
        return found;
    }

    // Central set: cache, session, local, google, github
    async set(key, value, options = {}) {
        const { cacheTtlMs = null, sessionTtlMs = null, localTtlMs = null, googleId = null, githubFilename = null, publicKey = null, secure = false } = options;
        if (secure) {
            await this._cache.setSecure(key, value, publicKey, cacheTtlMs);
            await this._session.setSecureItem(key, value, publicKey, sessionTtlMs);
            await this._localStorage.SetSecurePreference(key, value, publicKey, localTtlMs);
        } else {
            this._cache.Set(key, value, cacheTtlMs);
            this._session.setItem(key, value, sessionTtlMs);
            this._localStorage.Set(key, value, localTtlMs);
        }
        if (this._googleDrive && googleId) {
            try {
                await this._googleDrive.uploadRawFile(googleId, value);
            } catch (err) {
                console.warn('Google Drive unavailable or error:', err);
            }
        }
        if (this._gitHub && githubFilename) {
            try {
                await this._gitHub.uploadRawFile(githubFilename, value);
            } catch (err) {
                console.warn('GitHub unavailable or error:', err);
            }
        }
    }

    clearCache() { this._cache.Clear(); }
    deleteCacheKey(key) { this._cache.Delete(key); }
}
