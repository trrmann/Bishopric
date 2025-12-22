export class SessionStorage {
    static DefaultSessionStoragePruneIntervalMS = 120000;//default storage prune interval is 2 minutes
    static DefaultSessionStorageValueExpireMS = 1800000;//default storage value life is 30 minutes
    constructor(sessionStoragePruneIntervalMs = DefaultSessionStoragePruneIntervalMS) { 
        // registry of keys
        this._keyRegistry = new Set();
        this._sessionStoragePruneTimer = null;
        this._sessionStoragePruneIntervalMs = null;
        if (sessionStoragePruneIntervalMs > 0) {
            this.StartSessionStoragePruneTimer(sessionStoragePruneIntervalMs);
        }
    }
    Set(key, value, ttlMs = DefaultSessionStorageValueExpireMS) { 
        if(ttlMs > 0) {
            const expires = Date.now() + ttlMs;
            const payload = JSON.stringify({ value, expires });
            sessionStorage.setItem(key, payload);
        } else {
            sessionStorage.setItem(key, value);
        }
        this._keyRegistry.add(key);
    }
    SetObject(key, value, ttlMs = DefaultSessionStorageValueExpireMS) {
        this.Set(key, JSON.stringify(value), ttlMs);
    }
    GetAllKeys() {
        return Object.keys(this._keyRegistry);
    }
    HasKey(key) {
        return this.GetAllKeys().includes(key);
    }
    Delete(key) {
        sessionStorage.removeItem(key);
        this._keyRegistry.delete(key);
    }
    Get(key) {
        if(this.HasKey(key)) {
            let payload = sessionStorage.getItem(key);
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
    SessionStoragePrune() {
        this.GetAllKeys().forEach(key =>{
            this.Get(key);
        });
    }
    StartSessionStoragePruneTimer(intervalMs = null) {
        this._sessionStoragePruneIntervalMs = intervalMs || DefaultSessionStoragePruneIntervalMS;
        if (this._sessionStoragePruneTimer) {
            clearInterval(this._sessionStoragePruneTimer);
        }
        this._sessionStoragePruneIntervalMs = this._sessionStoragePruneIntervalMs;
        this._sessionStoragePruneTimer = setInterval(() => this.SessionStoragePrune(), this._sessionStoragePruneIntervalMs);
    }
    PauseSessionStoragePruneTimer() {
        if(this._sessionStoragePruneTimer) {
            clearInterval(this._sessionStoragePruneTimer);
            this._sessionStoragePruneTimer = null;
        }
    }
    ResumeSessionStoragePruneTimer() {
        if(this._sessionStoragePruneIntervalMs) {
            if (this._sessionStoragePruneTimer) {
                clearInterval(this._sessionStoragePruneTimer);
            }
            this._sessionStoragePruneTimer = setInterval(() => this.SessionStoragePrune(), this._sessionStoragePruneIntervalMs);
        }
    }
    StopSessionStoragePruneTimer() {
        if (this._sessionStoragePruneTimer) {
            clearInterval(this._sessionStoragePruneTimer);
            this._sessionStoragePruneTimer = null;
            this._sessionStoragePruneIntervalMs = null;
        }
    }
}