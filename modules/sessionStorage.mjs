export class SessionStorage {
    // ===== Instance Accessors =====
    get KeyRegistry() { return this._keyRegistry; }
    get SessionStoragePruneTimer() { return this._sessionStoragePruneTimer; }
    get SessionStoragePruneIntervalMs() { return this._sessionStoragePruneIntervalMs; }

    // ===== Constructor =====
    constructor(sessionStoragePruneIntervalMs = SessionStorage.DefaultSessionStoragePruneIntervalMS) { 
        this._keyRegistry = new Set();
        this._sessionStoragePruneTimer = null;
        this._sessionStoragePruneIntervalMs = null;
        if (sessionStoragePruneIntervalMs > 0) {
            this.StartSessionStoragePruneTimer(sessionStoragePruneIntervalMs);
        }
    }

    // ===== Static Methods =====
    static get DefaultSessionStoragePruneIntervalMS() { return 120000; }
    static get DefaultSessionStorageValueExpireMS() { return 1800000; }

    static CopyFromJSON(dataJSON) {
        const session = new SessionStorage();
        session._keyRegistry = new Set(dataJSON._keyRegistry);
        session._sessionStoragePruneIntervalMs = dataJSON._sessionStoragePruneIntervalMs;
        // Timer is not restored from JSON
        return session;
    }

    static CopyToJSON(instance) {
        return {
            _keyRegistry: Array.from(instance._keyRegistry),
            _sessionStoragePruneIntervalMs: instance._sessionStoragePruneIntervalMs
        };
    }

    static CopyFromObject(destination, source) {
        destination._keyRegistry = new Set(source._keyRegistry);
        destination._sessionStoragePruneIntervalMs = source._sessionStoragePruneIntervalMs;
    }

    static async Factory(sessionStoragePruneIntervalMs = SessionStorage.DefaultSessionStoragePruneIntervalMS) {
        return new SessionStorage(sessionStoragePruneIntervalMs);
    }

    // ===== Core Methods =====
    Set(key, value, ttlMs = SessionStorage.DefaultSessionStorageValueExpireMS) { 
        if(ttlMs > 0) {
            const expires = Date.now() + ttlMs;
            const payload = JSON.stringify({ value, expires });
            sessionStorage.setItem(key, payload);
        } else {
            sessionStorage.setItem(key, value);
        }
        this._keyRegistry.add(key);
    }
    SetObject(key, value, ttlMs = SessionStorage.DefaultSessionStorageValueExpireMS) {
        this.Set(key, JSON.stringify(value), ttlMs);
    }
    GetAllKeys() {
        return Array.from(this._keyRegistry);
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
                value = payload;
            }
            return value;
        }
        return undefined;
    }
    GetObject(key) {
        const val = this.Get(key);
        return val ? JSON.parse(val) : val;
    }
    Clear() {
        const keys = this.GetAllKeys();
        keys.forEach(key =>{
            this.Delete(key);
        });
    }
    SessionStoragePrune() {
        const keys = this.GetAllKeys();
        keys.forEach(key =>{
            this.Get(key);
        });
    }
    StartSessionStoragePruneTimer(intervalMs = null) {
        this._sessionStoragePruneIntervalMs = intervalMs || SessionStorage.DefaultSessionStoragePruneIntervalMS;
        if (this._sessionStoragePruneTimer) {
            clearInterval(this._sessionStoragePruneTimer);
        }
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