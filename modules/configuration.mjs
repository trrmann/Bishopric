import { Storage } from "./storage.mjs";

export class Configuration {
    static local = true;
    constructor(storageObject) {
        this._storageObj = storageObject;
        this.configuration = null;
    }
    static CopyFromJSON(dataJSON) {
        const configuration = new Configuration();
        configuration.configuration = dataJSON.configuration;
        configuration._storageObj = dataJSON._storageObj;
        return configuration;
    }
    static CopyFromObject(destination, source) {
        destination.configuration = source.configuration;
        destination._storageObj = source._storageObj;
    }
    static async Factory(storageObject) {
        const configuration = new Configuration(await storageObject);
        await configuration.Fetch();
        return configuration;
    }
    GetConfigurationFilename() {
        const file = "configuration.json";
        return file;
    }
    GetConfigurationExpireMS() {
        return 1000 * 60 * 60 * 1;// 1 hour
    }
    GetStorageConfig() {
        return { cacheTtlMs: null, sessionTtlMs: null, localTtlMs: null, googleId: null, githubFilename: null, privateKey: null, publicKey: null, secure: false };
    }
    async Fetch() {
        // Try to get from storage (cache/session/local/google/github)
        let configObj = await this._storageObj.Get(this.GetConfigurationFilename(), this.GetStorageConfig());
        if (configObj) {
            this.configuration = configObj;
        } else {
            // If not found, fallback to empty
            this.configuration = null;
        }
    }
    GetConfiguration() {
        if (!this._configurationObject) {
            this._buildCache();
        }
        return this._configurationObject;
    }
    FlattenObject(obj, parentKey = '', separator = '.') {
        const result = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const newKey = parentKey ? `${parentKey}${separator}${key}` : key;
                const value = obj[key];
                // Check if the value is an object and not an array, and if so, recurse
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    // Recursively call the function and merge the results
                    Object.assign(result, this.FlattenObject(value, newKey, separator));
                } else {
                    // Otherwise, add the key-value pair to the result
                    result[newKey] = value;
                }
            }
        }
        return result;
    }
    GetConfigurationByKey(key) {
        // Fast lookup by name
        if (!this._keyMap) this._buildCache();
        const c = this._keyMap.get(key);
        return c ? [c] : [];
    }
    HasConfiguration() {
        return this.GetConfiguration() !== null && this.GetConfiguration().length > 0;
    }
    HasConfigurationByKey(key) {
        return this.GetConfigurationByKey(key) !== null && this.GetConfigurationByKey(key).length > 0;
    }
    GetConfigurationKeys() {
        return Object.keys(this.GetConfiguration());
    }
}