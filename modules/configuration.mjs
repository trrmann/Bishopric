
import { ObjectUtils, createStorageConfig } from "./objectUtils.mjs";

export class Configuration {
    // ===== Instance Accessors =====
    get Storage() { return this._storageObj; }
    get Config() { return this.configuration; }

    // ===== Constructor =====
    /**
     * Creates a Configuration instance.
     * @param {Object} storageObject - The storage object used for config persistence and retrieval.
     */
    constructor(storageObject) {
        this._storageObj = storageObject;
        this.configuration = undefined;
    }

    // ===== Static Methods =====
    static CopyFromJSON(dataJSON) {
        const config = new Configuration(dataJSON._storageObj);
        config.configuration = dataJSON.configuration;
        return config;
    }

    static CopyToJSON(instance) {
        return {
            _storageObj: instance._storageObj,
            configuration: instance.configuration
        };
    }

    static CopyFromObject(destination, source) {
        destination._storageObj = source._storageObj;
        destination.configuration = source.configuration;
    }

    static async Factory(storageObject) {
        const config = new Configuration(storageObject);
        await config.Fetch();
        return config;
    }

    // ===== File/Storage Accessors =====
    static get ConfigFileBasename() { return "configuration"; }
    static get ConfigFileExtension() { return "json"; }
    static get ConfigFilename() { return `${Configuration.ConfigFileBasename}.${Configuration.ConfigFileExtension}`; }
    static get ConfigCacheExpireMS() { return 1000 * 60 * 30; }
    static get ConfigSessionExpireMS() { return 1000 * 60 * 60; }
    static get ConfigLocalExpireMS() { return 1000 * 60 * 60 * 2; }
    static get StorageConfig() {
        return createStorageConfig({
            cacheTtlMs: Configuration.ConfigCacheExpireMS,
            sessionTtlMs: Configuration.ConfigSessionExpireMS,
            localTtlMs: Configuration.ConfigLocalExpireMS
        });
    }

    // ===== Data Fetching =====
    /**
     * Fetches the configuration from cache, session, local storage, Google Drive, or GitHubDataObj in priority order.
     * Updates the configuration property with the result.
     * @returns {Promise<void>} Resolves when fetch is complete.
     */
    async Fetch() {
        // 1. Try to get from cache
        let configObj = await this._storageObj.Get(Configuration.ConfigFilename, { ...Configuration.StorageConfig, cacheTtlMs: Configuration.ConfigCacheExpireMS });
        // 2. If not found, try session storage
        if (!configObj) {
            configObj = await this._storageObj.Get(Configuration.ConfigFilename, { ...Configuration.StorageConfig, cacheTtlMs: null, sessionTtlMs: Configuration.ConfigSessionExpireMS });
            if (configObj && this._storageObj.Cache && typeof this._storageObj.Cache.Set === 'function') {
                this._storageObj.Cache.Set(Configuration.ConfigFilename, configObj, Configuration.ConfigCacheExpireMS);
            }
        }
        // 3. If still not found, try local storage
        if (!configObj) {
            configObj = await this._storageObj.Get(Configuration.ConfigFilename, { ...Configuration.StorageConfig, cacheTtlMs: null, sessionTtlMs: null, localTtlMs: Configuration.ConfigLocalExpireMS });
            if (configObj) {
                if (this._storageObj.SessionStorage && typeof this._storageObj.SessionStorage.Set === 'function') {
                    this._storageObj.SessionStorage.Set(Configuration.ConfigFilename, configObj, Configuration.ConfigSessionExpireMS);
                }
                if (this._storageObj.Cache && typeof this._storageObj.Cache.Set === 'function') {
                    this._storageObj.Cache.Set(Configuration.ConfigFilename, configObj, Configuration.ConfigCacheExpireMS);
                }
            }
        }
        // 4. If still not found, use GoogleDrive for read/write priority
        if (!configObj && this._storageObj && typeof this._storageObj.Get === 'function' && this._storageObj.constructor.name === 'GoogleDrive') {
            configObj = await this._storageObj.Get(Configuration.ConfigFilename, { ...Configuration.StorageConfig });
        }
        // 5. If still not found, fallback to GitHubDataObj for read-only
        if (!configObj && this._storageObj && typeof this._storageObj._gitHubDataObj === 'object' && typeof this._storageObj._gitHubDataObj.fetchJsonFile === 'function') {
            configObj = await this._storageObj._gitHubDataObj.fetchJsonFile(Configuration.ConfigFilename);
        }
        this.configuration = configObj ? configObj : undefined;
    }

    // ===== Utility Methods =====
    /**
     * Flattens a nested object into a single-level object with dot-separated keys.
     * @param {Object} obj - The object to flatten.
     * @param {string} parentKey - The prefix for the keys (used for recursion).
     * @param {string} separator - The separator between keys.
     * @returns {Object} The flattened object.
     */
    /**
     * Flattens a nested object into a single-level object with dot-separated keys.
     * Delegates to ObjectUtils.flattenObject.
     * @param {Object} obj - The object to flatten.
     * @param {string} [parentKey] - The prefix for the keys (used for recursion).
     * @param {string} [separator] - The separator between keys.
     * @returns {Object} The flattened object.
     */
    FlattenObject(obj, parentKey = '', separator = '.') {
        return ObjectUtils.flattenObject(obj, parentKey, separator);
    }

    /**
     * Retrieves configuration value(s) by key.
     * @param {string} key - The configuration key to look up.
     * @returns {Array} Array containing the config value if found, otherwise an empty array.
     */
    GetConfigByKey(key) {
        if (!this._keyMap) this._buildCache();
        const c = this._keyMap.get(key);
        return c ? [c] : [];
    }

    HasConfig() {
        return !!this.configuration && Object.keys(this.configuration).length > 0;
    }

    HasConfigByKey(key) {
        const configByKey = this.GetConfigByKey(key);
        return configByKey !== null && configByKey.length > 0;
    }

    GetConfigKeys() {
        return this.configuration ? Object.keys(this.configuration) : [];
    }
}