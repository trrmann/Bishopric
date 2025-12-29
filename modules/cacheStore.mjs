// cacheStore.mjs
// Simple in-memory cache variable store with get/set/delete/clear and optional expiration
import { TimerUtils } from "./objectUtils.mjs";

export class CacheStore {
    // Ergonomic alias for Has(key), matching Map API
    has(key) {
        return this.Has(key);
    }


    // PascalCase alias for values() to match test expectation
    Values() {
        return this.values();
    }
    // ===== Instance Accessors =====
    get Store() { return this._store; }
    get CachePruneTimer() { return this._cachePruneTimer; }
    get CachePruneIntervalMs() { return this._cachePruneIntervalMs; }
    get Size() { return this._store.size; }

    // ===== Constructor =====
    constructor(cachePruneIntervalMs = CacheStore.DefaultCachePruneIntervalMS) {
        this._store = new Map();
        this._cachePruneTimer = null;
        this._cachePruneIntervalMs = null;
        if (cachePruneIntervalMs > 0) {
            this.StartCachePruneTimer(cachePruneIntervalMs);
        }
    }

    // ===== Static Methods =====
    static get DefaultCachePruneIntervalMS() { return 60000; }
    static get DefaultCacheValueExpireMS() { return 900000; }

    static CopyFromJSON(dataJSON) {
        if (!dataJSON) return null;
        const cache = new CacheStore();
        cache._store = new Map(dataJSON._store);
        cache._cachePruneIntervalMs = dataJSON._cachePruneIntervalMs;
        // Timer is not restored from JSON
        return cache;
    }
    static FromJSON(obj) {
        const cache = new CacheStore();
        if (obj && typeof obj === 'object') {
            for (const [key, value] of Object.entries(obj)) {
                cache.Set(key, value);
            }
        }
        return cache;
    }

    static CopyToJSON(instance) {
        return {
            _store: Array.from(instance._store.entries()),
            _cachePruneIntervalMs: instance._cachePruneIntervalMs
        };
    }

    static CopyFromObject(destination, source) {
        destination._store = new Map(source._store);
        destination._cachePruneIntervalMs = source._cachePruneIntervalMs;
        return destination;
    }

    static async Factory(cachePruneIntervalMs = CacheStore.DefaultCachePruneIntervalMS) {
        return new CacheStore(cachePruneIntervalMs);
    }

    // ===== Core Methods =====
    Set(key, value, ttlMs = CacheStore.DefaultCacheValueExpireMS) {
        let expires = null;
        if (ttlMs > 0) {
            expires = Date.now() + ttlMs;
        }
        if (this.Has(key)) {
            this.Delete(key);
        }
        this._store.set(key, { value, expires });
        return this;
    }
    Keys() {
        return Array.from(this._store.keys());
    }
    Delete(key) {
        this._store.delete(key);
        return this;
    }
    Has(key) {
        if (this._store.has(key)) {
            const expires = this._store.get(key).expires;
            if (expires && Date.now() > expires) {
                this.Delete(key);
                return false;
            }
            return true;
        } else {
            return false;
        }
    }
    Get(key, defaultValue = undefined) {
        if (this._store.has(key)) {
            const entry = this._store.get(key);
            if (entry.expires && Date.now() > entry.expires) {
                this.Delete(key);
                return defaultValue;
            }
            return entry;
        } else {
            return defaultValue;
        }
    }
    Clear() {
        this._store.clear();
        return this;
    }
    CachePrune() {
        const now = Date.now();
        for (const [key, entry] of this._store.entries()) {
            if (entry.expires && now > entry.expires) {
                this._store.delete(key);
            }
        }
    }
    StartCachePruneTimer(intervalMs = null) {
        TimerUtils.start(this, '_cachePruneTimer', '_cachePruneIntervalMs', () => this.CachePrune(), intervalMs || CacheStore.DefaultCachePruneIntervalMS);
    }
    PauseCachePruneTimer() {
        TimerUtils.pause(this, '_cachePruneTimer');
    }
    ResumeCachePruneTimer() {
        TimerUtils.resume(this, '_cachePruneTimer', '_cachePruneIntervalMs', () => this.CachePrune());
    }
    StopCachePruneTimer() {
        TimerUtils.stop(this, '_cachePruneTimer', '_cachePruneIntervalMs');
    }

    forEach(callback, thisArg = undefined) {
        this._store.forEach((entry, key) => {
            callback.call(thisArg, entry, key, this);
        });
    }

    values() {
        return Array.from(this._store.values()).map(entry => entry.value);
    }

    entries() {
        return Array.from(this._store.entries()).map(([key, entry]) => [key, entry.value]);
    }

    [Symbol.iterator]() {
        return this.entries()[Symbol.iterator]();
    }
}
// Example usage:
// import { CacheStore } from './cacheStore.mjs';
// const cache = new CacheStore();
// cache.set('foo', 123, 1000); // expires in 1s
// cache.get('foo');
// cache.delete('foo');
// cache.clear();
