import { CacheStore } from "./cacheStore.mjs";
import { SessionStorage } from "./sessionStorage.mjs";
import { LocalStorage } from "./localStorage.mjs";
import { GoogleDrive } from "./googleDrive.mjs";
import { GitHubData } from "./gitHubData.mjs";
import { PublicKeyCrypto } from "./crypto.mjs";
import { TimerUtils } from "./objectUtils.mjs";
export class Storage {
        // Compatibility getter for modules expecting _gitHubDataObj
        get _gitHubDataObj() {
            return this._gitHub;
        }
    // ===== Private Fields =====
    #initTimeoutMS = 5000; // default max wait time in ms
    #storage;
    #foundIn = new Set();
    #keyRegistry = new Map();
    #secureKeyRegistry = new Map();
    // ===== Instance Accessors =====
    get KeyRegistry() { return this.#keyRegistry; }
    set _KeyRegistry(registry) { this.#keyRegistry = registry; }
    get SecureKeyRegistry() { return this.#secureKeyRegistry; }
    set _SecureKeyRegistry(registry) { this.#secureKeyRegistry = registry; }
    get RegistryPruneTimer() { return this._registryPruneTimer; }
    get RegistryPruneIntervalMs() { return this._registryPruneIntervalMs; }
    get Cache() { return this._cache; }
    get SessionStorage() { return this._sessionStorage; }
    get LocalStorage() { return this._localStorage; }
    get Crypto() { return this._crypto; }
    get GoogleDrive() { return this._googleDrive; }
    get GitHub() { return this._gitHub; }
    // Synchronous accessor for the storage object (if needed)
    get Storage() {
        return this.#storage;
    }
    // Synchronous setter for the storage object (if needed)
    set _Storage(val) {
        if (!val || typeof val.Get !== 'function' || typeof val.Set !== 'function') {
            throw new Error('Storage: storageObject must be provided and implement async Get/Set methods.');
        }
        this.#storage = val;
    }

    // ===== Constructor =====
    constructor(storageRegistryPruneIntervalMs = Storage.DefaultStoragePruneIntervalMS) {
        // keyRegistry and secureKeyRegistry are now private fields initialized at declaration
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
        // No async initialization pattern; all async setup is handled in the Factory method
    }

    // ===== Static Methods =====
    static get DefaultStoragePruneIntervalMS() { return 900000; }

    static async CopyFromJSON(dataJSON) {
        const storage = new Storage();
        storage._restoreKeyRegistries(dataJSON._keyRegistry, dataJSON._secureKeyRegistry);
        // Timers and sub-objects are not restored from JSON
        storage._cache = await CacheStore.Factory();
        storage._sessionStorage = await SessionStorage.Factory();
        storage._localStorage = await LocalStorage.Factory();
        storage._crypto = await PublicKeyCrypto.Factory();
        return storage;
    }

    // Protected: encapsulate registry restoration for maintainability
    _restoreKeyRegistries(keyRegistryArr, secureKeyRegistryArr) {
        this._KeyRegistry = new Map(keyRegistryArr);
        this._SecureKeyRegistry = new Map(secureKeyRegistryArr);
    }
    static CopyToJSON(instance) {
        return {
            _keyRegistry: Array.from(instance.#keyRegistry.entries()),
            _secureKeyRegistry: Array.from(instance.#secureKeyRegistry.entries())
        };
    }
    static CopyFromObject(destination, source) {
        destination._restoreKeyRegistries(
            Array.from(source.KeyRegistry.entries()),
            Array.from(source.SecureKeyRegistry.entries())
        );
    }
    static async Factory(storageRegistryPruneIntervalMs = Storage.DefaultStoragePruneIntervalMS) {
        const storage = new Storage(storageRegistryPruneIntervalMs);
        // Use static Factory methods for all utility/service classes
        storage._cache = await CacheStore.Factory(storage._cache_purge_intervalMS);
        storage._sessionStorage = await SessionStorage.Factory(storage._sessionStorage_purge_intervalMS);
        storage._localStorage = await LocalStorage.Factory(storage._localStorage_purge_intervalMS);
        storage._crypto = await PublicKeyCrypto.Factory();
        storage._gitHub = GitHubData.Factory("trrmann","UnitManagementTools");
        //storage._googleDrive = await GoogleDrive.Factory(storage._gitHub);
        await Storage.testGoogleDrive(storage);
        return storage;
    }
    static async testGoogleDrive(storage) {
        let fileList = null;
        try {
            fileList = await storage._googleDrive.listFiles();
        } catch(error) {
            console.warn('Google Drive listFiles error:', error);
        }
        const myData = { foo: "bar", baz: 123 };
        let uploadResult = null;
        try {
            uploadResult = await storage._googleDrive.uploadFile("mydata.json", JSON.stringify(myData), "application/json");
        } catch(error) {
            console.warn('Google Drive uploadFile error:', error);
        }
        try {
            fileList = await storage._googleDrive.listFiles();
        } catch(error) {
            console.warn('Google Drive listFiles error:', error);
        }
        try {
            // Use uploadResult.id for downloadFile
            const fileDownload = await storage._googleDrive.downloadFile(uploadResult.id);
            // Optionally handle fileDownload result here if needed
        } catch(error) {
            console.warn('Google Drive downloadFile error:', error);
        }
        try {
            for (const file of fileList) {
                if (file.name === "") {
                    file.deleteResult = await storage._googleDrive.deleteFile(file.id);
                }
            }
            // Optionally handle fileList result here if needed
        } catch(error) {
            console.warn('Google Drive deleteFile error:', error);
        }
        try {
            fileList = await storage._googleDrive.listFiles();
            // Optionally handle fileList result here if needed
        } catch(error) {
            console.warn('Google Drive listFiles error:', error);
        }
    }
    RegisterKey(key, expire) {
        this.#keyRegistry.set(key, expire);
    }
    UnregisterKey(key) {
        if(this.SecureKeyRegistered(key)) {
            this.UnregisterSecureKey(key);
        } else {
            this.#keyRegistry.delete(key);
        }
    }
    KeyRegistered(key) {
        return this.#keyRegistry.has(key);
    }
    GetAllKeys() {
        return Array.from(this.#keyRegistry.keys());
    }
    RegisterSecureKey(key, expire) {
        this.RegisterKey(key, expire);
        this.#secureKeyRegistry.set(key, expire);
    }
    UnregisterSecureKey(key) {
        this.#secureKeyRegistry.delete(key);
        this.UnregisterKey(key);
    }
    SecureKeyRegistered(key) {
        return this.#secureKeyRegistry.has(key);
    }
    GetAllSecureKeys() {
        return Array.from(this.#secureKeyRegistry.keys());
    }
    RegistryPrune() {
        const now = Date.now();
        for (const [key, entry] of this.#secureKeyRegistry) {
            if (entry && now > entry) {
                this.UnregisterSecureKey(key);
            }
        }
        for (const [key, entry] of this.#keyRegistry) {
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
        if(found === undefined && this._sessionStorage.HasKey(key)) found = this._sessionStorage.Get(key);
        // 3. Local Storage
        if(found === undefined && this._localStorage.HasKey(key)) found = this._localStorage.GetKey(key);
        // 4. Google Drive (if available)
        if(found === undefined && this._googleDrive && this._googleDrive.HasKey(key)) found = await this._googleDrive.Get(key);
        // 5. GitHub
        if(found === undefined && this._gitHub) {
            if(await this._gitHub.Has(key)) {
                found = await this._gitHub.Get(key, "json");
            }
        }
        if(secure && privateKey) {
            return this._crypto.decrypt(privateKey, found);
        }
        return found;
    }

    // Central Set: cache, session, local, google, github
    async Set(key, value, options = {}) {
        const { cacheTtlMs = null, sessionTtlMs = null, localTtlMs = null, googleId = null, githubFilename = null, publicKey = null, secure = false } = options;
        if (secure) {
            try {
                await this._cache.setSecure(key, value, publicKey, cacheTtlMs);
            } catch (err) {
                console.warn('Cache setSecure error:', err);
            }
            try {
                await this._sessionStorage.setSecureItem(key, value, publicKey, sessionTtlMs);
            } catch (err) {
                console.warn('SessionStorage setSecureItem error:', err);
            }
            // ...existing code for secure path...
        } else {
            try {
                if (typeof this._cache.Set === 'function') {
                    await this._cache.Set(key, value, cacheTtlMs);
                }
            } catch (err) {
                console.warn('Cache Set error:', err);
            }
            try {
                if (typeof this._sessionStorage.Set === 'function') {
                    await this._sessionStorage.Set(key, value, sessionTtlMs);
                }
            } catch (err) {
                console.warn('SessionStorage Set error:', err);
            }
            try {
                if (typeof this._localStorage.Set === 'function') {
                    await this._localStorage.Set(key, value, localTtlMs);
                }
            } catch (err) {
                console.warn('LocalStorage Set error:', err);
            }
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
