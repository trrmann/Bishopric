import { createStorageConfig, ObjectUtils } from "./objectUtils.mjs";

export class Callings {
    // ===== Private Fast Lookup Maps =====
    #_idMap = null;
    #_nameMap = null;

    // ===== Instance Accessors =====
    get Storage() { return this.storage; }

    // ===== Constructor =====
    /**
     * @param {Object} configuration - Must have a valid _storageObj with async Get/Set methods.
     */
    constructor(configuration) {
        if (!configuration || !configuration._storageObj || typeof configuration._storageObj.Get !== 'function' || typeof configuration._storageObj.Set !== 'function') {
            throw new Error('Callings: configuration._storageObj must be provided and implement async Get/Set methods.');
        }
        this.storage = configuration._storageObj;
        this.callings = undefined;
        this.#_idMap = null;
    }

    // ===== Internal Map Management =====

    _invalidateMaps() {
        this.#_idMap = null;
        this.#_nameMap = null;
    }

    _buildIdMap() {
        if (!this.#_idMap) {
            this.#_idMap = new Map();
            for (const calling of this.CallingsDetails) {
                if (calling && calling.id !== undefined && calling.id !== null) {
                    this.#_idMap.set(calling.id, calling);
                }
            }
        }
    }

    _buildNameMap() {
        if (!this.#_nameMap) {
            this.#_nameMap = new Map();
            for (const calling of this.CallingsDetails) {
                if (calling && calling.name !== undefined && calling.name !== null) {
                    if (!this.#_nameMap.has(calling.name)) {
                        this.#_nameMap.set(calling.name, []);
                    }
                    this.#_nameMap.get(calling.name).push(calling);
                }
            }
        }
    }

    set callings(val) {
        this._callings = val;
        this._invalidateMaps();
    }
    get callings() {
        return this._callings;
    }
    static CopyFromJSON(dataJSON) {
        const callings = new Callings({ _storageObj: dataJSON._storageObj });
        callings.storage = dataJSON._storageObj;
        callings.callings = dataJSON.callings;
        return callings;
    }
    static CopyToJSON(instance) {
        return {
            _storageObj: instance.storage,
            callings: instance.callings
        };
    }
    static CopyFromObject(destination, source) {
        destination.storage = source.storage;
        destination.callings = source.callings;
    }
    /**
     * Async factory. Always use this to ensure storage is ready before use.
     * @param {Object} configuration
     * @returns {Promise<Callings>}
     */
    static async Factory(configuration) {
        const callings = new Callings(configuration);
        await callings.Fetch();
        return callings;
    }

    // ===== File/Storage Accessors =====
    static get CallingsFileBasename() { return "callings"; }
    static get CallingsFileExtension() { return "json"; }
    static get CallingsFilename() { return `${Callings.CallingsFileBasename}.${Callings.CallingsFileExtension}`; }
    static get CallingsCacheExpireMS() { return 1000 * 60 * 30; }
    static get CallingsSessionExpireMS() { return 1000 * 60 * 60; }
    static get CallingsLocalExpireMS() { return 1000 * 60 * 60 * 2; }
    static get StorageConfig() {
        return createStorageConfig({
            cacheTtlMs: Callings.CallingsCacheExpireMS,
            sessionTtlMs: Callings.CallingsSessionExpireMS,
            localTtlMs: Callings.CallingsLocalExpireMS
        });
    }

    // ===== Data Fetching =====
    async Fetch() {
        if (!this.Storage) {
            throw new Error("Storage is not available in Callings. Ensure configuration is properly initialized.");
        }
        // 1. Try to get from cache
        let callingsObj = await this.Storage.Get(Callings.CallingsFilename, { ...Callings.StorageConfig, cacheTtlMs: Callings.CallingsCacheExpireMS });
        let foundIn = null;
        if (callingsObj !== undefined && callingsObj !== null) foundIn = 'cache';
        // 2. If not found, try session storage
        if (callingsObj === undefined || callingsObj === null) {
            callingsObj = await this.Storage.Get(Callings.CallingsFilename, { ...Callings.StorageConfig, cacheTtlMs: null, sessionTtlMs: Callings.CallingsSessionExpireMS });
            if (callingsObj !== undefined && callingsObj !== null) foundIn = 'session';
        }
        // 3. If still not found, try local storage
        if (callingsObj === undefined || callingsObj === null) {
            callingsObj = await this.Storage.Get(Callings.CallingsFilename, { ...Callings.StorageConfig, cacheTtlMs: null, sessionTtlMs: null, localTtlMs: Callings.CallingsLocalExpireMS });
            if (callingsObj !== undefined && callingsObj !== null) foundIn = 'local';
        }
        // 4. If still not found, use GoogleDrive for read/write priority
        if ((callingsObj === undefined || callingsObj === null) && this.Storage && typeof this.Storage.Get === 'function' && this.Storage.constructor.name === 'GoogleDrive') {
            callingsObj = await this.Storage.Get(Callings.CallingsFilename, { ...Callings.StorageConfig });
            if (callingsObj !== undefined && callingsObj !== null) foundIn = 'google';
        }
        // 5. If still not found, fallback to GitHubData (read-only, robust API)
        if ((callingsObj === undefined || callingsObj === null) && this.Storage && typeof this.Storage._gitHubDataObj === 'object' && typeof this.Storage._gitHubDataObj.get === 'function') {
            try {
                callingsObj = await this.Storage._gitHubDataObj.get(Callings.CallingsFilename, "json");
                if (callingsObj !== undefined && callingsObj !== null) foundIn = 'github';
            } catch (e) {
                // If file not found or error, leave callingsObj undefined
            }
        }

        // Write to all storage tiers if missing
        if (callingsObj !== undefined && callingsObj !== null) {
            // Only write to Google Drive if config was found in GitHub or GoogleDrive tier (not if found in local/session/cache)
            if (this.Storage.constructor.name === 'GoogleDrive' && (foundIn === 'github' || foundIn === 'google') && typeof this.Storage.Set === 'function') {
                await this.Storage.Set(Callings.CallingsFilename, callingsObj, { ...Callings.StorageConfig });
            }
            // Write to local storage if not found there
            if (foundIn !== 'local' && this.Storage.LocalStorage && typeof this.Storage.LocalStorage.Set === 'function') {
                this.Storage.LocalStorage.Set(Callings.CallingsFilename, callingsObj, Callings.CallingsLocalExpireMS);
            }
            // Write to session storage if not found there
            if (foundIn !== 'session' && this.Storage.SessionStorage && typeof this.Storage.SessionStorage.Set === 'function') {
                this.Storage.SessionStorage.Set(Callings.CallingsFilename, callingsObj, Callings.CallingsSessionExpireMS);
            }
            // Write to cache if not found there
            if (foundIn !== 'cache' && this.Storage.Cache && typeof this.Storage.Cache.Set === 'function') {
                this.Storage.Cache.Set(Callings.CallingsFilename, callingsObj, Callings.CallingsCacheExpireMS);
            }
        }
        this.callings = callingsObj ? callingsObj : undefined;
    }

    // ===== Core Data Accessors =====
    get CallingsEntries() {
        if (Array.isArray(this.callings)) {
            return this.callings;
        } else if (this.callings && Array.isArray(this.callings.callings)) {
            return this.callings.callings;
        } else {
            return [];
        }
    }
    get CallingsDetails() {
        return this.CallingsEntries.map(Callings._normalizeCallingEntry);
    }

    // ===== Utility Methods =====
    static _normalizeCallingEntry(entry) {
        return {
            id: entry?.id ?? null,
            name: entry?.name ?? null,
            level: entry?.level ?? null,
            active: entry?.active ?? false,
            hasTitle: entry?.hasTitle ?? false,
            title: entry?.title ?? null,
            titleOrdinal: entry?.titleOrdinal ?? null
        };
    }

    // ===== Filtering Methods =====
    get ActiveCallings() { return ObjectUtils.filterByProperty(this.CallingsDetails, 'active', true); }
    get WardCallings() { return ObjectUtils.filterByProperty(this.CallingsDetails, 'level', 'ward'); }
    get StakeCallings() { return ObjectUtils.filterByProperty(this.CallingsDetails, 'level', 'stake'); }
    get ActiveWardCallings() { return ObjectUtils.filterByProperty(this.WardCallings, 'active', true); }
    get ActiveStakeCallings() { return ObjectUtils.filterByProperty(this.StakeCallings, 'active', true); }

    // ===== ID/Name Accessors =====
    get CallingIds() { return this.CallingsDetails.map(calling => calling.id); }
    get CallingNames() { return this.CallingsDetails.map(calling => calling.name); }

    // ===== ID/Name Lookups =====
    CallingById(id) {
        this._buildIdMap();
        const result = this.#_idMap.has(id) ? [this.#_idMap.get(id)] : [];
        return result;
    }
    CallingByName(name) {
        this._buildNameMap();
        return this.#_nameMap.has(name) ? this.#_nameMap.get(name) : [];
    }
    ActiveCallingById(id) { return ObjectUtils.filterBy(this.CallingById(id), 'active', true); }
    ActiveCallingByName(name) { return ObjectUtils.filterBy(this.CallingByName(name), 'active', true); }
    WardCallingById(id) {
        this._buildIdMap();
        const calling = this.#_idMap.get(id);
        if (calling && calling.level === "ward") {
            return [calling];
        }
        return [];
    }
    WardCallingByName(name) {
        this._buildNameMap();
        const arr = this.#_nameMap.has(name) ? this.#_nameMap.get(name) : [];
        return arr.filter(calling => calling.level === "ward");
    }
    ActiveWardCallingById(id) {
        // Combine filters in a single pass for efficiency
        this._buildIdMap();
        const calling = this.#_idMap.get(id);
        if (calling && calling.active === true && calling.level === "ward") {
            return [calling];
        }
        return [];
    }
    ActiveWardCallingByName(name) { return this.ActiveCallingById(name).filter(calling => calling.level === "ward"); }
    StakeCallingById(id) {
        this._buildIdMap();
        const calling = this.#_idMap.get(id);
        if (calling && calling.level === "stake") {
            return [calling];
        }
        return [];
    }
    StakeCallingByName(name) {
        this._buildNameMap();
        const arr = this.#_nameMap.has(name) ? this.#_nameMap.get(name) : [];
        return arr.filter(calling => calling.level === "stake");
    }
    ActiveStakeCallingById(id) {
        // Combine filters in a single pass for efficiency
        this._buildIdMap();
        const calling = this.#_idMap.get(id);
        if (calling && calling.active === true && calling.level === "stake") {
            return [calling];
        }
        return [];
    }
    ActiveStakeCallingByName(name) { return this.ActiveStakeCallingById(name).filter(calling => calling.level === "stake"); }

    // ===== Existence Accessors =====
    get HasCallings() { return this.CallingsDetails?.length > 0; }
    get HasActiveCallings() { return ObjectUtils.hasAny(this.ActiveCallings); }
    get HasWardCallings() { return ObjectUtils.hasAny(this.WardCallings); }
    get HasStakeCallings() { return ObjectUtils.hasAny(this.StakeCallings); }
    get HasActiveWardCallings() { return ObjectUtils.hasAny(this.ActiveWardCallings); }
    get HasActiveStakeCallings() { return ObjectUtils.hasAny(this.ActiveStakeCallings); }

    // ===== Existence Lookups =====
    HasCallingById(id) {
        this._buildIdMap();
        return this.#_idMap.has(id);
    }
    HasCallingByName(name) {
        this._buildNameMap();
        return this.#_nameMap.has(name) && this.#_nameMap.get(name).length > 0;
    }
    HasActiveCallingById(id) { return this.ActiveCallingById(id)?.length > 0; }
    HasActiveCallingByName(name) { return this.ActiveCallingByName(name)?.length > 0; }
    HasWardCallingById(id) { return this.WardCallingById(id)?.length > 0; }
    HasWardCallingByName(name) { return this.WardCallingByName(name)?.length > 0; }
    HasActiveWardCallingById(id) { return this.ActiveWardCallingById(id)?.length > 0; }
    HasActiveWardCallingByName(name) { return this.ActiveWardCallingByName(name)?.length > 0; }
    HasStakeCallingById(id) { return this.StakeCallingById(id)?.length > 0; }
    HasStakeCallingByName(name) { return this.StakeCallingByName(name)?.length > 0; }
    HasActiveStakeCallingById(id) { return this.ActiveStakeCallingById(id)?.length > 0; }
    HasActiveStakeCallingByName(name) { return this.ActiveStakeCallingByName(name)?.length > 0; }

    // ===== ID/Name Accessors =====
    get AllCallingIds() { return this.CallingsDetails.map(calling => calling.id); }
    get AllCallingNames() { return this.CallingsDetails.map(calling => calling.name); }
    get AllActiveCallingIds() { return this.ActiveCallings.map(calling => calling.id); }
    get AllActiveCallingNames() { return this.ActiveCallings.map(calling => calling.name); }
    get AllWardCallingIds() { return this.WardCallings.map(calling => calling.id); }
    get AllWardCallingNames() { return this.WardCallings.map(calling => calling.name); }
    get AllStakeCallingIds() { return this.StakeCallings.map(calling => calling.id); }
    get AllStakeCallingNames() { return this.StakeCallings.map(calling => calling.name); }
    get AllActiveWardCallingIds() { return this.ActiveWardCallings.map(calling => calling.id); }
    get AllActiveWardCallingNames() { return this.ActiveWardCallings.map(calling => calling.name); }
    get AllActiveStakeCallingIds() { return this.ActiveStakeCallings.map(calling => calling.id); }
    get AllActiveStakeCallingNames() { return this.ActiveStakeCallings.map(calling => calling.name); }

    // ===== ID/Name Lookups =====
    CallingNameById(id) { return this.CallingById(id).map(calling => calling.name); }
    CallingIdByName(name) { return this.CallingByName(name).map(calling => calling.id); }
    ActiveCallingNameById(id) { return this.ActiveCallingById(id).map(calling => calling.name); }
    ActiveCallingIdByName(name) { return this.ActiveCallingByName(name).map(calling => calling.id); }
    WardCallingNameById(id) { return this.WardCallingById(id).map(calling => calling.name); }
    WardCallingIdByName(name) { return this.WardCallingByName(name).map(calling => calling.id); }
    ActiveWardCallingNameById(id) { return this.ActiveWardCallingById(id).map(calling => calling.name); }
    ActiveWardCallingIdByName(name) { return this.ActiveWardCallingByName(name).map(calling => calling.id); }
    StakeCallingNameById(id) { return this.StakeCallingById(id).map(calling => calling.name); }
    StakeCallingIdByName(name) { return this.StakeCallingByName(name).map(calling => calling.id); }
    ActiveStakeCallingNameById(id) { return this.ActiveStakeCallingById(id).map(calling => calling.name); }
    ActiveStakeCallingIdByName(name) { return this.ActiveStakeCallingByName(name).map(calling => calling.id); }

}