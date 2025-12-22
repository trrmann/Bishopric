import { LocalStorage } from "./localStorage.mjs";
import { SessionStorage } from "./sessionStorage.mjs";
import { GitHubData } from "./gitHubData.mjs";
import { GoogleDrive } from "./googleDrive.mjs";
import { CacheStore } from "./cacheStore.mjs";

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
        this._googleDrive = null;
        this._gitHub = null;
    }
    static async Factory(storageRegistryPruneIntervalMs = Storage.DefaultStoragePruneIntervalMS) {
        const storage = new Storage(storageRegistryPruneIntervalMs);
        storage._gitHub = new GitHubData("trrmann","UnitManagementTools");
        storage._googleDrive = await GoogleDrive.Factory(storage._gitHub);
        return storage
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
    async get(key, options = {}) {
        const { cacheTtlMs = null, sessionTtlMs = null, localTtlMs = null, googleId = null, githubFilename = null, privateKey = null, publicKey = null, secure = false } = options;
        // 1. Cache
        if (secure && this._cache.Has(key)) return await this._cache.getSecure(key, privateKey);
        if (!secure && this._cache.Has(key)) return this._cache.Get(key);
        // 2. Session Storage
        let value;
        if (secure) {
            value = await this._session.getSecureItem(key, privateKey);
        } else {
            value = this._session.getItem(key);
        }
        if (value != null) {
            if (secure) await this._cache.setSecure(key, value, publicKey, cacheTtlMs); else this._cache.Set(key, value, cacheTtlMs);
            return value;
        }
        // 3. Local Storage
        if (secure) {
            value = await this._localStorage.Get(key, privateKey);
        } else {
            value = await this._localStorage.Get(key);
        }
        if (value != null) {
            if (secure) await this._cache.setSecure(key, value, publicKey, cacheTtlMs); else this._cache.Set(key, value, cacheTtlMs);
            if (secure) await this._session.setSecureItem(key, value, publicKey, sessionTtlMs); else this._session.setItem(key, value, sessionTtlMs);
            return value;
        }
        // 4. Google Drive (if available)
        if (this._googleDrive && googleId) {
            try {
                value = await this._googleDrive.downloadRawFile(googleId);
                if (value != null) {
                    if (secure) await this._cache.setSecure(key, value, publicKey, cacheTtlMs); else this._cache.Set(key, value, cacheTtlMs);
                    if (secure) await this._session.setSecureItem(key, value, publicKey, sessionTtlMs); else this._session.setItem(key, value, sessionTtlMs);
                    if (secure) await this._localStorage.SetSecurePreference(key, value, publicKey, localTtlMs); else this._localStorage.Set(key, value, localTtlMs);
                    return value;
                }
            } catch (err) {
                console.warn('Google Drive unavailable or error:', err);
            }
        }
        // 5. GitHub (if available)
        if (this._gitHub && githubFilename) {
            try {
                value = await this._gitHub.fetchRawFile(githubFilename);
                if (value != null) {
                    if (secure) await this._cache.setSecure(key, value, publicKey, cacheTtlMs); else this._cache.Set(key, value, cacheTtlMs);
                    if (secure) await this._session.setSecureItem(key, value, publicKey, sessionTtlMs); else this._session.setItem(key, value, sessionTtlMs);
                    if (secure) await this._localStorage.SetSecurePreference(key, value, publicKey, localTtlMs); else this._localStorage.Set(key, value, localTtlMs);
                    return value;
                }
            } catch (err) {
                console.warn('GitHub unavailable or error:', err);
            }
        }
        return null;
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
