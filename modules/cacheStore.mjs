// cacheStore.mjs
// Simple in-memory cache variable store with get/set/delete/clear and optional expiration
export class CacheStore {
    static DefaultCachePruneIntervalMS = 60000;//default storage prune interval is 1 minute
    static DefaultCacheValueExpireMS = 900000;//default storage value life is 15 minutes
    constructor(cachePruneIntervalMs = DefaultCachePruneIntervalMS) {
        this._store = new Map();
        this._cachePruneTimer = null;
        this._cachePruneIntervalMs = null;
        if (cachePruneIntervalMs > 0) {
            this.StartCachePruneTimer(cachePruneIntervalMs);
        }
    }
    Set(key, value, ttlMs = DefaultCacheValueExpireMS) {
        // if ttlMs is 0 or less, then no expire
        let expires = null;
        if(ttlMs > 0) {
            expires = Date.now() + ttlMs;
        }
        if(this.Has(key)) {
            this.Delete(key);
        }
        this._store.set(key, { value, expires });
    }
    Keys() {
        return Array.from(this._store.keys());
    }
    Delete(key) {
        return this._store.delete(key);
    }
    Has(key) {
        if(this.Keys().includes(key)) {
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
    Get(key) {
        if(this.Has(key)) {
            return this._store.get(key);
        } else {
            return undefined;
        }
    }
    Clear() {
        this._store.clear();
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
        this._cachePruneIntervalMs = intervalMs || DefaultCachePruneIntervalMS;
        if (this._cachePruneTimer) {
            clearInterval(this._cachePruneTimer);
        }
        this._cachePruneIntervalMs = this._cachePruneIntervalMs;
        this._cachePruneTimer = setInterval(() => this.CachePrune(), this._cachePruneIntervalMs);
    }
    PauseCachePruneTimer() {
        if(this._cachePruneTimer) {
            clearInterval(this._cachePruneTimer);
            this._cachePruneTimer = null;
        }
    }
    ResumeCachePruneTimer() {
        if(this._cachePruneIntervalMs) {
            if (this._cachePruneTimer) {
                clearInterval(this._cachePruneTimer);
            }
            this._cachePruneTimer = setInterval(() => this.CachePrune(), this._cachePruneIntervalMs);
        }
    }
    StopCachePruneTimer() {
        if (this._cachePruneTimer) {
            clearInterval(this._cachePruneTimer);
            this._cachePruneTimer = null;
            this._cachePruneIntervalMs = null;
        }
    }
}
// Example usage:
// import { CacheStore } from './cacheStore.mjs';
// const cache = new CacheStore();
// cache.set('foo', 123, 1000); // expires in 1s
// cache.get('foo');
// cache.delete('foo');
// cache.clear();
