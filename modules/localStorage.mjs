export class LocalStorage {
    static DefaultLocalStoragePruneIntervalMS = 180000;//default storage prune interval is 3 minutes
    static DefaultLocalStorageValueExpireMS = 2700000;//default storage value life is 45 minutes
    constructor(localStoragePruneIntervalMs = DefaultLocalStoragePruneIntervalMS) { 
        // registry of keys
        this._keyRegistry = new Set();
        this._localStoragePruneTimer = null;
        this._localStoragePruneIntervalMs = null;
        if (localStoragePruneIntervalMs > 0) {
            this.StartLocalStoragePruneTimer(localStoragePruneIntervalMs);
        }
    }
    Set(key, value, ttlMs = DefaultLocalStorageValueExpireMS) { 
        if(ttlMs > 0) {
            const expires = Date.now() + ttlMs;
            const payload = JSON.stringify({ value, expires });
            localStorage.setItem(key, payload);
        } else {
            localStorage.setItem(key, value);
        }
        this._keyRegistry.add(key);
    }
    SetObject(key, value, ttlMs = DefaultLocalStorageValueExpireMS) {
        this.Set(key, JSON.stringify(value), ttlMs);
    }
    GetAllKeys() {
        return Object.keys(this._keyRegistry);
    }
    HasKey(key) {
        return this.GetAllKeys().includes(key);
    }
    Delete(key) {
        localStorage.removeItem(key);
        this._keyRegistry.delete(key);
    }
    Get(key) {
        if(this.HasKey(key)) {
            let payload = localStorage.getItem(key);
            if (!payload) return null;
            let value, expires;
            try {
                ({ value, expires } = JSON.parse(payload));
                if (expires && Date.now() > expires) {
                    this.Delete(key);
                    return null;
                }
            } catch {
                // fallback for non expiring values
                value = payload;
            }
            return value;
        }
        else {
            return undefined;
        }
    }
    GetObject(key) {
        const val = this.Get(key);
        if(val) {
            return JSON.parse(val);
        } else {
            return val;
        }
    }
    Clear() {
        this.GetAllKeys().forEach(key =>{
            this.Delete(key);
        });
    }
    LocalStoragePrune() {
        this.GetAllKeys().forEach(key =>{
            this.Get(key);
        });
    }
    StartLocalStoragePruneTimer(intervalMs = null) {
        this._localStoragePruneIntervalMs = intervalMs || DefaultLocalStoragePruneIntervalMS;
        if (this._localStoragePruneTimer) {
            clearInterval(this._localStoragePruneTimer);
        }
        this._localStoragePruneIntervalMs = this._localStoragePruneIntervalMs;
        this._localStoragePruneTimer = setInterval(() => this.LocalStoragePrune(), this._localStoragePruneIntervalMs);
    }
    PauseLocalStoragePruneTimer() {
        if(this._localStoragePruneTimer) {
            clearInterval(this._localStoragePruneTimer);
            this._localStoragePruneTimer = null;
        }
    }
    ResumeLocalStoragePruneTimer() {
        if(this._localStoragePruneIntervalMs) {
            if (this._localStoragePruneTimer) {
                clearInterval(this._localStoragePruneTimer);
            }
            this._localStoragePruneTimer = setInterval(() => this.LocalStoragePrune(), this._localStoragePruneIntervalMs);
        }
    }
    StopLocalStoragePruneTimer() {
        if (this._localStoragePruneTimer) {
            clearInterval(this._localStoragePruneTimer);
            this._localStoragePruneTimer = null;
            this._localStoragePruneIntervalMs = null;
        }
    }
}