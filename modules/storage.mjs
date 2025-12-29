import { CacheStore } from "./cacheStore.mjs";
import { SessionStorage } from "./sessionStorage.mjs";
import { LocalStorage } from "./localStorage.mjs";
import { GoogleDrive } from "./googleDrive.mjs";
import { GitHubData } from "./gitHubData.mjs";
import { PublicKeyCrypto } from "./crypto.mjs";
import { TimerUtils } from "./objectUtils.mjs";
export class Storage {
    // ===== Instance Accessors =====
    get KeyRegistry() { return this._keyRegistry; }
    get SecureKeyRegistry() { return this._secureKeyRegistry; }
    get RegistryPruneTimer() { return this._registryPruneTimer; }
    get RegistryPruneIntervalMs() { return this._registryPruneIntervalMs; }
    get Cache() { return this._cache; }
    get SessionStorage() { return this._sessionStorage; }
    get LocalStorage() { return this._localStorage; }
    get Crypto() { return this._crypto; }
    get GoogleDrive() { return this._googleDrive; }
    get GitHub() { return this._gitHub; }

    // ===== Constructor =====
    constructor(storageRegistryPruneIntervalMs = Storage.DefaultStoragePruneIntervalMS) {
        this._keyRegistry = new Map();
        this._secureKeyRegistry = new Map();
        this._registryPruneTimer = null;
        this._registryPruneIntervalMs = null;
        if (storageRegistryPruneIntervalMs > 0) {
            this.StartRegistryPruneTimer(storageRegistryPruneIntervalMs);
        }
        this._cache_purge_intervalMS = CacheStore.DefaultCachePruneIntervalMS;
        this._cache_default_value_expireMS = CacheStore.DefaultCacheValueExpireMS;
        // Use static Factory methods for instantiation
        // These are async, so we must initialize them in the async Factory method below
        this._cache = null;
        this._sessionStorage = null;
        this._localStorage = null;
        this._crypto = null;
        this._localStorage_purge_intervalMS = LocalStorage.DefaultLocalStoragePruneIntervalMS;
        this._localStorage_default_value_expireMS = LocalStorage.DefaultLocalStorageValueExpireMS;
        this._sessionStorage_purge_intervalMS = SessionStorage.DefaultSessionStoragePruneIntervalMS;
        this._sessionStorage_default_value_expireMS = SessionStorage.DefaultSessionStorageValueExpireMS;
        this._googleDrive = null;
        this._gitHub = null;
    }

    // ===== Static Methods =====
    static get DefaultStoragePruneIntervalMS() { return 900000; }

    static async CopyFromJSON(dataJSON) {
        const storage = new Storage();
        storage._keyRegistry = new Map(dataJSON._keyRegistry);
        storage._secureKeyRegistry = new Map(dataJSON._secureKeyRegistry);
        // Timers and sub-objects are not restored from JSON
        storage._cache = await CacheStore.Factory();
        storage._sessionStorage = await SessionStorage.Factory();
        storage._localStorage = await LocalStorage.Factory();
        storage._crypto = await PublicKeyCrypto.Factory();
        return storage;
    }
    static CopyToJSON(instance) {
        return {
            _keyRegistry: Array.from(instance._keyRegistry.entries()),
            _secureKeyRegistry: Array.from(instance._secureKeyRegistry.entries())
        };
    }
    static CopyFromObject(destination, source) {
        destination._keyRegistry = new Map(source._keyRegistry);
        destination._secureKeyRegistry = new Map(source._secureKeyRegistry);
    }
    static async Factory(storageRegistryPruneIntervalMs = Storage.DefaultStoragePruneIntervalMS) {
        const storage = new Storage(storageRegistryPruneIntervalMs);
        // Use static Factory methods for all utility/service classes
        storage._cache = await CacheStore.Factory(storage._cache_purge_intervalMS);
        storage._sessionStorage = await SessionStorage.Factory(storage._sessionStorage_purge_intervalMS);
        storage._localStorage = await LocalStorage.Factory(storage._localStorage_purge_intervalMS);
        storage._crypto = await PublicKeyCrypto.Factory();
        storage._gitHub = await GitHubData.Factory("trrmann","UnitManagementTools");
        //storage._googleDrive = await GoogleDrive.Factory(storage._gitHub);
        await Storage.testGoogleDrive(storage);
        return storage;
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
        TimerUtils.start(this, '_registryPruneTimer', '_registryPruneIntervalMs', () => this.RegistryPrune(), intervalMs || 60000);
    }
    PauseRegistryPruneTimer() {
        TimerUtils.pause(this, '_registryPruneTimer');
    }
    ResumeRegistryPruneTimer() {
        TimerUtils.resume(this, '_registryPruneTimer', '_registryPruneIntervalMs', () => this.RegistryPrune());
    }
    StopRegistryPruneTimer() {
        TimerUtils.stop(this, '_registryPruneTimer', '_registryPruneIntervalMs');
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

    // Central Set: cache, session, local, google, github
    async Set(key, value, options = {}) {
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
