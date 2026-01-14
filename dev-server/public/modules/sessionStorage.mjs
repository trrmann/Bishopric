
import { TimerUtils } from "./objectUtils.mjs";

export class SessionStorage {
    // Syncs the key registry with actual sessionStorage keys
    _syncKeyRegistry() {
        this._keyRegistry = new Set();
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key) this._keyRegistry.add(key);
        }
    }
    // ===== Instance Accessors =====
    get KeyRegistry() { return this._keyRegistry; }
    get SessionStoragePruneTimer() { return this._sessionStoragePruneTimer; }
    get SessionStoragePruneIntervalMs() { return this._sessionStoragePruneIntervalMs; }

    // ===== Constructor =====
    constructor(sessionStoragePruneIntervalMs = SessionStorage.DefaultSessionStoragePruneIntervalMS) {
        this._keyRegistry = new Set();
        this._sessionStoragePruneTimer = null;
        this._sessionStoragePruneIntervalMs = null;
        this._syncKeyRegistry();
        if (sessionStoragePruneIntervalMs > 0) {
            this.StartSessionStoragePruneTimer(sessionStoragePruneIntervalMs);
        }
        // Guarantee async Get/Set as own properties, always
        if (typeof this.Get !== 'function' || this.Get.constructor.name !== 'AsyncFunction') {
            Object.defineProperty(this, 'Get', {
                value: async (key) => this._getSync(key),
                writable: false,
                enumerable: false,
                configurable: true
            });
        }
        if (typeof this.Set !== 'function' || this.Set.constructor.name !== 'AsyncFunction') {
            Object.defineProperty(this, 'Set', {
                value: async (key, value, ttlMs = SessionStorage.DefaultSessionStorageValueExpireMS, isObject = false) => this._setSync(key, value, ttlMs, isObject),
                writable: false,
                enumerable: false,
                configurable: true
            });
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
    // ===== Async Interface Methods =====
    async Get(key) {
        return this._getSync(key);
    }
    async Set(key, value, ttlMs = SessionStorage.DefaultSessionStorageValueExpireMS, isObject = false) {
        return this._setSync(key, value, ttlMs, isObject);
    }
    _setSync(key, value, ttlMs = SessionStorage.DefaultSessionStorageValueExpireMS, isObject = false) {
        this._syncKeyRegistry();
        let storeValue = value;
        if (isObject) {
            storeValue = JSON.stringify(value);
        }
        if (ttlMs > 0) {
            const expires = Date.now() + ttlMs;
            const payload = JSON.stringify({ value: storeValue, expires });
            sessionStorage.setItem(key, payload);
        } else {
            sessionStorage.setItem(key, storeValue);
        }
        this._keyRegistry.add(key);
    }
    SetObject(key, value, ttlMs = SessionStorage.DefaultSessionStorageValueExpireMS) {
        this._setSync(key, value, ttlMs, true);
    }
    GetAllKeys() {
        this._syncKeyRegistry();
        return Array.from(this._keyRegistry);
    }
    HasKey(key) {
        this._syncKeyRegistry();
        return this._keyRegistry.has(key);
    }
    Delete(key) {
        sessionStorage.removeItem(key);
        this._syncKeyRegistry();
        this._keyRegistry.delete(key);
    }
    _getSync(key) {
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
        const val = this._getSync(key);
        if (val === undefined || val === null) return val;
        try {
            return typeof val === 'string' ? JSON.parse(val) : val;
        } catch {
            return val;
        }
    }
    Clear() {
        if (this._keyRegistry.size === 0) return;
        const keys = this.GetAllKeys();
        keys.forEach(key => {
            this.Delete(key);
        });
    }
    SessionStoragePrune() {
        if (this._keyRegistry.size === 0) return;
        const keys = this.GetAllKeys();
        keys.forEach(key => {
            this._getSync(key);
        });
    }
    StartSessionStoragePruneTimer(intervalMs = null) {
        TimerUtils.start(this, '_sessionStoragePruneTimer', '_sessionStoragePruneIntervalMs', () => this.SessionStoragePrune(), intervalMs || SessionStorage.DefaultSessionStoragePruneIntervalMS);
    }
    PauseSessionStoragePruneTimer() {
        TimerUtils.pause(this, '_sessionStoragePruneTimer');
    }
    ResumeSessionStoragePruneTimer() {
        TimerUtils.resume(this, '_sessionStoragePruneTimer', '_sessionStoragePruneIntervalMs', () => this.SessionStoragePrune());
    }
    StopSessionStoragePruneTimer() {
        TimerUtils.stop(this, '_sessionStoragePruneTimer', '_sessionStoragePruneIntervalMs');
    }
}