import { TimerUtils } from "./objectUtils.mjs";

export class CacheStore {
            // Creates a new CacheStore from a Map of key-value pairs
            static fromMap(map, ttlMs = CacheStore.DefaultCacheValueExpireMS) {
                const cache = new CacheStore();
                for (const [key, value] of map.entries()) {
                    cache.Set(key, value, ttlMs);
                }
                return cache;
            }
        // Returns a new Map of all current key-value pairs
        toMap() {
            const map = new Map();
            for (const [key, entry] of this._store.entries()) {
                map.set(key, entry.value);
            }
            return map;
        }
    // Calls the callback for each [key, value] pair in the cache
    forEachEntry(callback, thisArg = undefined) {
        for (const [key, entry] of this._store.entries()) {
            callback.call(thisArg, key, entry.value, this);
        }
    }

    // Reduces the values in the cache to a single value using the callback
    reduce(callback, initialValue) {
        let accumulator = initialValue;
        let start = 0;
        for (const [key, entry] of this._store.entries()) {
            if (start === 0 && accumulator === undefined) {
                accumulator = entry.value;
            } else {
                accumulator = callback(accumulator, entry.value, key, this);
            }
            start++;
        }
        if (start === 0 && accumulator === undefined) {
            throw new TypeError('Reduce of empty CacheStore with no initial value');
        }
        return accumulator;
    }

    // Returns true if all values pass the callback test, else false
    every(callback, thisArg = undefined) {
        for (const [key, entry] of this._store.entries()) {
            if (!callback.call(thisArg, entry.value, key, this)) {
                return false;
            }
        }
        return true;
    }

    // Returns true if at least one value passes the callback test, else false
    some(callback, thisArg = undefined) {
        for (const [key, entry] of this._store.entries()) {
            if (callback.call(thisArg, entry.value, key, this)) {
                return true;
            }
        }
        return false;
    }

    // Returns the first [key, value] pair for which the callback returns true, or undefined
    findEntry(callback, thisArg = undefined) {
        for (const [key, entry] of this._store.entries()) {
            if (callback.call(thisArg, entry.value, key, this)) {
                return [key, entry.value];
            }
        }
        return undefined;
    }

    // Returns the first value for which the callback returns true, or undefined
    findValue(callback, thisArg = undefined) {
        for (const entry of this._store.values()) {
            if (callback.call(thisArg, entry.value, this)) {
                return entry.value;
            }
        }
        return undefined;
    }

    // Returns an array of values for which the callback returns true
    filterValues(callback, thisArg = undefined) {
        const result = [];
        for (const entry of this._store.values()) {
            if (callback.call(thisArg, entry.value, this)) {
                result.push(entry.value);
            }
        }
        return result;
    }

    // Returns a new array with the results of calling a provided function on every value
    mapValues(callback, thisArg = undefined) {
        const result = [];
        for (const entry of this._store.values()) {
            result.push(callback.call(thisArg, entry.value, this));
        }
        return result;
    }

    // Deletes all keys provided in an array
    deleteAll(keys) {
        if (!Array.isArray(keys)) return this;
        for (const key of keys) {
            this.Delete(key);
        }
        return this;
    }

    // Deletes all entries for which the predicate returns true
    deleteWhere(predicate, thisArg = undefined) {
        if (typeof predicate !== 'function') return 0;
        let count = 0;
        for (const [key, entry] of this._store.entries()) {
            if (predicate.call(thisArg, entry.value, key, this)) {
                this._store.delete(key);
                count++;
            }
        }
        return count;
    }

    // Ergonomic alias for Keys(), returns all keys as an array
    keysArray() {
        return this.Keys();
    }

    // Ergonomic alias for entries(), returns all [key, value] pairs as an array
    entriesArray() {
        return this.entries();
    }

    // Ergonomic alias for values(), returns all values as an array
    valuesArray() {
        return this.values();
    }

    // Ergonomic alias for Clear(), matching common cache APIs
    clearAll() {
        return this.Clear();
    }

    // Ergonomic alias for Size, matching Map API
    get size() {
        return this.Size;
    }

    // Returns a deep copy of this CacheStore
    clone() {
        return CacheStore.FromCacheStore(this);
    }

    // Creates a new CacheStore from an existing instance (deep copy)
    static FromCacheStore(instance) {
        const cache = new CacheStore(instance._cachePruneIntervalMs || CacheStore.DefaultCachePruneIntervalMS);
        for (const [key, entry] of instance._store.entries()) {
            cache._store.set(key, { ...entry });
        }
        return cache;
    }

    // Returns a plain object of key-value pairs (omits expiration)
    toJSON() {
        const obj = {};
        for (const [key, entry] of this._store.entries()) {
            obj[key] = entry.value;
        }
        return obj;
    }

            // Removes all expired entries from the cache
            clearExpired() {
                const now = Date.now();
                for (const [key, entry] of this._store.entries()) {
                    if (entry.expires && now > entry.expires) {
                        this._store.delete(key);
                    }
                }
            }
        // Iterates over all values in the cache
        forEachValue(callback, thisArg = undefined) {
            for (const entry of this._store.values()) {
                callback.call(thisArg, entry.value, this);
            }
        }
    // Ergonomic alias for Has(key), matching Map API
    has(key) {
        return this.Has(key);
    }


    // PascalCase alias for values() to match test expectation
    // Returns true if the key exists and is expired, false otherwise
    hasExpired(key) {
        if (this._store.has(key)) {
            const entry = this._store.get(key);
            return !!(entry.expires && Date.now() > entry.expires);
        }
        return false;
    }

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

    // Returns the value for a key if present and not expired, otherwise sets and returns the new value
    getOrSet(key, valueOrFactory, ttlMs = CacheStore.DefaultCacheValueExpireMS) {
        if (this.Has(key)) {
            return this.Get(key).value;
        }
        const value = (typeof valueOrFactory === 'function') ? valueOrFactory() : valueOrFactory;
        this.Set(key, value, ttlMs);
        return value;
    }
    // Returns the value for a key without checking expiration or deleting expired entries
    peek(key) {
        if (this._store.has(key)) {
            return this._store.get(key).value;
        }
        return undefined;
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
            callback.call(thisArg, entry.value, key, this);
        });
    }


    values() {
        return Array.from(this._store.values()).map(entry => entry.value);
    }

    // PascalCase alias for values() to match test expectation
    Values() {
        return this.values();
    }

    // PascalCase alias for size getter
    get Size() {
        return this._store.size;
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
