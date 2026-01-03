import { ObjectUtils, createStorageConfig } from "./objectUtils.mjs";
import { Storage } from "./storage.mjs";

/**
 * Configuration class provides robust, multi-tiered, async configuration management.
 *
 * **Async Utility Methods:**
 *
 * All methods that access configuration data are async and must be awaited. This includes:
 *   - GetConfigByKey
 *   - HasConfig
 *   - HasConfigByKey
 *   - GetConfigKeys
 *   - _buildCache
 *
 * These methods return Promises and should be used as:
 *   const keys = await config.GetConfigKeys();
 *
 * This ensures that configuration is fully loaded and up to date before use. Calling these methods without await will return a Promise, not the actual data.
 *
 * @example
 *   const config = new Configuration(storage);
 *   const hasKey = await config.HasConfigByKey('foo');
 *   const keys = await config.GetConfigKeys();
 *
 * @note
 *   Always use await with async utility methods to avoid accessing stale or undefined data.
 */
export class Configuration {
        // The filename used for configuration storage and GitHub fetches
        static ConfigFilename = "configuration.json";
    #foundIn = new Set();
    #storage;
    #initTimeoutMS = 5000; // default max wait time in ms
    // ===== Instance Accessors =====
    /**
     * Synchronous accessor for the storage object.
     * Waits for initialization if needed.
     * @returns {Object} The storage object.
     * @example
     *   const storage = config.Storage;
     */
    get Storage() {
        if (this._initPromise && !this._initPromise.resolved) {
            throw new Error("Configuration: Storage not initialized yet. Await Configuration.Factory or _initPromise before accessing Storage.");
        }
        return this.#storage;
    }
    // Protected setter for Storage
    // Synchronous setter for Storage (should only be called after initialization)
    set _Storage(val) {
        if (!val || typeof val.Get !== 'function' || typeof val.Set !== 'function') {
            throw new Error('Configuration: storageObject must be provided and implement async Get/Set methods.');
        }
        this.#storage = val;
    }
    /**
     * Synchronous accessor for the configuration data.
     * Returns the cached configuration if available, otherwise throws if not initialized.
     * @returns {any} The configuration data.
     * @example
     *   const configData = config.Configuration;
     */
    get Configuration() {
        if (this._initPromise && !this._initPromise.resolved) {
            throw new Error("Configuration: Not initialized yet. Await Configuration.Factory or _initPromise before accessing Configuration.");
        }
        return this._keyMap ? Object.fromEntries(this._keyMap) : undefined;
    }
    // Protected setter for Configuration
    // Synchronous setter for Configuration (should only be called after initialization)
    set _Configuration(val) {
        this.Post(val); // Note: #post is still async, but we do not await it here
        this.InvalidateCache();
    }

    // ===== Constructor =====
    /**
     * Creates a Configuration instance.
     * @param {Object} storageObject - The storage object used for config persistence and retrieval.
     */
    /**
     * @param {Object} storageObject - Must be a valid storage object with async Get/Set methods.
     */
    constructor(storageObject) {
        this._Storage = storageObject;
    }



    static async Factory(storageObject) {
        return new Configuration(storageObject);
    }
    static async CopyFromJSON(dataJSON) {
        const config = new Configuration(dataJSON.storage);
        await config._restoreConfigState(dataJSON.storage, dataJSON.configuration);
        return config;
    }

    static async CopyToJSON(instance) {
        return {
            storage: await instance.Storage,
            configuration: await instance.Configuration
        };
    }

    static async CopyFromObject(destination, source) {
        await destination._restoreConfigState(source.storage, source.configuration);
    }

    // Protected: encapsulate config state restoration for maintainability
    async _restoreConfigState(storageObj, configuration) {
        this._Storage = storageObj;
        this._Configuration = configuration;
        this.InvalidateCache();
    }

    /**
     * Invalidates the internal key map cache. Call this after configuration changes to ensure cache is rebuilt.
     */
    InvalidateCache() {
        this._keyMap = undefined;
    }

    // Internal fetch method. Attempts to retrieve configuration from all storage layers in priority order.
    // When a value is found in any storage layer, this method calls #post(configObj) to asynchronously warm all higher-priority caches.
    // Performance Note: The #post calls are intentionally NOT awaited. This means cache warming is performed in the background and does not block the return of the configuration value to the caller.
    // This design ensures that fetch operations remain fast and responsive, especially when cache warming involves slower storage layers (e.g., Google Drive, GitHub).
    // If you require all caches to be up to date before proceeding, you should explicitly await the relevant #post calls outside this method.
    // Returns: Promise<any> The configuration object, or undefined if not found.
    async Fetch() {
        await this._initPromise;
        // Use the async Storage accessor
        const storage = await this.Storage;
        let configObj;
        // 1. Try Cache if not already marked as present
        if (this.#foundIn.has('cache') && storage && storage.Cache && typeof storage.Cache.Get === 'function') {
            configObj = await storage.Cache.Get(Configuration.ConfigFilename);
            if (configObj !== undefined) {
                this.Post(configObj);
                return configObj;
            } else {
                this.#foundIn.delete('cache');
            }
        }
        // 2. Try SessionStorage
        if (this.#foundIn.has('session') && storage && storage.SessionStorage && typeof storage.SessionStorage.Get === 'function') {
            configObj = await storage.SessionStorage.Get(Configuration.ConfigFilename);
            if (configObj !== undefined) {
                this.Post(configObj);
                return configObj;
            } else {
                this.#foundIn.delete('session');
            }
        }
        // 3. Try LocalStorage
        if (this.#foundIn.has('local') && storage && storage.LocalStorage && typeof storage.LocalStorage.Get === 'function') {
            configObj = await storage.LocalStorage.Get(Configuration.ConfigFilename);
            if (configObj !== undefined) {
                this.Post(configObj);
                return configObj;
            } else {
                this.#foundIn.delete('local');
            }
        }
        // 4. Try GoogleDrive (duck-typed: must have Get/Set and isGoogleDrive property)
        if (
            this.#foundIn.has('google') &&
            storage &&
            typeof storage.Get === 'function' &&
            typeof storage.Set === 'function' &&
            (storage.isGoogleDrive === true || (storage.Get.length >= 2 && storage.Set.length >= 2))
        ) {
            configObj = await storage.Get(Configuration.ConfigFilename, { ...Configuration.StorageConfig });
            if (configObj !== undefined) {
                this.Post(configObj);
                return configObj;
            } else {
                this.#foundIn.delete('google');
            }
        }
        // 5. Try GitHubData (robust API, not duck-typed)
        if (await storage && '_gitHubDataObj' in storage) {
            const gitHubDataObj = await storage._gitHubDataObj;
            if (gitHubDataObj && typeof gitHubDataObj.get === 'function') {
                try {
                    configObj = await gitHubDataObj.get(Configuration.ConfigFilename, "json");
                    if (configObj !== undefined) {
                        this.#foundIn.add('github');
                        this.Post(configObj);
                        return configObj;
                    } else {
                        this.#foundIn.delete('github');
                    }
                } catch (e) {
                    this.#foundIn.delete('github');
                }
            }
        }
        // Not found
        return undefined;
    }

    async Post(configObj) {
        await this._initPromise;
        const storage = await this.Storage;
        // 1. Write to cache if not present
        if (configObj !== undefined && storage.Cache && typeof storage.Cache.Set === 'function' && !this.#foundIn.has('cache')) {
            try {
                await storage.Cache.Set(Configuration.ConfigFilename, configObj, Configuration.ConfigCacheExpireMS);
                this.#foundIn.add('cache');
            } catch (err) {
                console.error('[Configuration] Failed to warm cache layer:', err);
            }
        }
        // 2. Write to session if not present
        if (configObj !== undefined && storage.SessionStorage && typeof storage.SessionStorage.Set === 'function' && !this.#foundIn.has('session')) {
            try {
                await storage.SessionStorage.Set(Configuration.ConfigFilename, configObj, null);
                this.#foundIn.add('session');
            } catch (err) {
                console.error('[Configuration] Failed to warm session storage layer:', err);
            }
        }
        // 3. Write to local if not present
        if (configObj !== undefined && storage.LocalStorage && typeof storage.LocalStorage.Set === 'function' && !this.#foundIn.has('local')) {
            try {
                await storage.LocalStorage.Set(Configuration.ConfigFilename, configObj, Configuration.ConfigLocalExpireMS);
                this.#foundIn.add('local');
            } catch (err) {
                console.error('[Configuration] Failed to warm local storage layer:', err);
            }
        }
        // 4. Write to GoogleDrive if not present (duck-typed)
        if (
            configObj !== undefined &&
            typeof storage.Set === 'function' &&
            typeof storage.Get === 'function' &&
            (storage.isGoogleDrive === true || (storage.Get.length >= 2 && storage.Set.length >= 2)) &&
            !this.#foundIn.has('google')
        ) {
            try {
                await storage.Set(Configuration.ConfigFilename, configObj, { ...Configuration.StorageConfig });
                this.#foundIn.add('google');
            } catch (err) {
                console.error('[Configuration] Failed to warm Google Drive storage layer:', err);
            }
        }
    }

    // ===== Utility Methods =====
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
     *
     * **Async:** This method is async and must be awaited.
     *
     * @param {string} key - The configuration key to look up.
     * @returns {Promise<Array>} Array containing the config value if found, otherwise an empty array.
     *
     * @example
     *   const values = await config.GetConfigByKey('foo');
     */
    async GetConfigByKey(key) {
        if (!this._keyMap) await this._buildCache();
        const c = this._keyMap.get(key);
        return c ? [c] : [];
    }

    /**
     * Checks if configuration exists and is non-empty.
     *
     * **Async:** This method is async and must be awaited.
     *
     * @returns {Promise<boolean>} True if configuration exists and has keys, false otherwise.
     *
     * @example
     *   const hasConfig = await config.HasConfig();
     */
    async HasConfig() {
        const config = await this.Configuration;
        return !!config && Object.keys(config).length > 0;
    }

    /**
     * Checks if configuration contains a value for the specified key.
     *
     * **Async:** This method is async and must be awaited.
     *
     * @param {string} key - The configuration key to check.
     * @returns {Promise<boolean>} True if the key exists and has a value, false otherwise.
     *
     * @example
     *   const hasKey = await config.HasConfigByKey('foo');
     */
    async HasConfigByKey(key) {
        const configByKey = await this.GetConfigByKey(key);
        return configByKey !== null && configByKey.length > 0;
    }

    /**
     * Returns all configuration keys.
     *
     * **Async:** This method is async and must be awaited.
     *
     * @returns {Promise<Array<string>>} Array of configuration keys, or empty array if configuration is undefined.
     *
     * @example
     *   const keys = await config.GetConfigKeys();
     */
    async GetConfigKeys() {
        const config = await this.Configuration;
        return config ? Object.keys(config) : [];
    }

    /**
     * Builds the internal key map cache for configuration lookups.
     *
     * **Async:** This method is async and must be awaited.
     *
     * @private
     * @returns {Promise<void>}
     */
    async _buildCache() {
        if (!this._keyMap) {
            this._keyMap = new Map();
            const config = await this.Configuration;
            if (config) {
                for (const key of Object.keys(config)) {
                    this._keyMap.set(key, config[key]);
                }
            }
        }
    }
}