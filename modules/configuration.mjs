import { LocalStorage } from "./localStorage.mjs";
export class Configuration{
    static local = true;
    constructor() {
        this.configuration = null;
        this.lastFetched = null;
        this._configurationObject = null; // cache object
        this._keyMap = null; // cache key lookup
    }
    static CopyFromJSON(dataJSON) {
        const configuration = new Configuration();
        configuration.configuration = dataJSON.configuration;
        configuration.lastFetched = dataJSON.lastFetched;
        configuration._buildCache();
        return configuration;
    }
    static CopyFromObject(destination, source) {
        destination.configuration = source.configuration;
        destination.lastFetched = source.lastFetched;
        destination._buildCache();
    }
    static async Factory() {
        const configuration = new Configuration();
        await configuration.Fetch();
        configuration._buildCache();
        return configuration;
    }
    GetConfigurationURL(local=false) {
        const host = "https://trrmann.github.io/";
        const projectPath = "bishopric/data/";
        const path = "data/";
        const file = "configuration.json";
        let url = `${host}${projectPath}${file}`;
        if(local) {
            url = `${path}${file}`;
        }
        return url;
    }
    GetFetchExpireMS(){
        const expireTime = 1000 * 60 * 60 * 24; // 1 day
        return expireTime;
    }
    GetLocalStoreKey() {
        return "configuration";
    }
    IsFetched(){
        const configuration = this.configuration;
        const isFetched = (configuration != null);
        return isFetched;
    }
    IsLastFetchedExpired(){
        const lastFetchedMS = this.GetLastFetched();
        const lastFetched = Date(lastFetchedMS);
        if(lastFetched==null) {
            return true;
        } else {
            const expireMS = this.GetFetchExpireMS();
            const fetchExpireMS = lastFetchedMS + expireMS;
            //const fetchExpire = Date(fetchExpireMS);
            const nowMS = Date.now();
            //const now = Date(nowMS);
            const match = (nowMS >= fetchExpireMS);
            return match;
        }
    }
    GetLastFetched(){
        const lastFetched = this.lastFetched;
        return lastFetched;
    }
    SetLastFetched(fetchedDatetime){
        const fetchedDatetimeIn = fetchedDatetime;
        this.lastFetched = fetchedDatetimeIn;
    }
    async Fetch() {
        const isFetched = this.IsFetched();
        if(!isFetched) {
            const key = this.GetLocalStoreKey();
            const hasPreference = await LocalStorage.HasPreference(key);
            if(hasPreference) {
                const preferenceData = await LocalStorage.GetPreferenceObject(key);
                Configuration.CopyFromObject(this, preferenceData);
            }
            const isLastFetchedExpired = this.IsLastFetchedExpired();
            if(isLastFetchedExpired){
                try {
                    const url = this.GetConfigurationURL(Configuration.local);
                    const response = await fetch(url);
                    const responseOk = response.ok;
                    if (!responseOk) {
                        throw new Error('Network response was not ok');
                    }
                    this.configuration = await response.json();
                    const newLastFetchDate = Date.now();
                    this.SetLastFetched(newLastFetchDate);
                } catch (error) {
                    console.error('There has been a problem with your fetch operation:', error);
                }
            }
            await LocalStorage.SetPreferenceObject(key, this);
            this._buildCache();
        }
    }
    GetConfiguration(){
        if (!this._configurationObject) {
            this._buildCache();
        }
        return this._configurationObject;

    }

    FlattenObject = (obj, parentKey = '', separator = '.') => {
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
    };
    _buildCache() {
        // Build array and lookup maps for fast access
        this._configurationObject = (this.configuration && this.configuration.configuration) ? this.configuration.configuration : [];
        this._keyMap = new Map();
        const config = this.FlattenObject(this._configurationObject);
        const keys = Object.keys(config);
        keys.forEach(key => { this._keyMap.set(key, this._configurationObject[key]); });
    }
    GetConfigurationByKey(key) {
        // Fast lookup by name
        if (!this._keyMap) this._buildCache();
        const c = this._keyMap.get(key);
        return c ? [c] : [];
    }
    HasConfiguration(){
        return ((this.GetConfiguration() !== null) && (this.GetConfiguration().length > 0));
    }
    HasConfigurationByKey(key) {
        return ((this.GetConfigurationByKey(key) !== null) && (this.GetConfigurationByKey(key).length > 0));
    }
    GetConfigurationKeys(){
        return Object.keys(this.GetConfiguration());
    }
}