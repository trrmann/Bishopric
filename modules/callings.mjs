export class Callings {

    // ===== Instance Accessors =====
    get Storage() { return this.storage; }

    // ===== Constructor =====
    constructor(configuration) {
        this.storage = configuration._storageObj;
        this.callings = undefined;
    }

    // ===== Static Methods =====
    static CopyFromJSON(dataJSON) {
        const callings = new Callings(dataJSON._storageObj);
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
        return {
            cacheTtlMs: Callings.CallingsCacheExpireMS,
            sessionTtlMs: Callings.CallingsSessionExpireMS,
            localTtlMs: Callings.CallingsLocalExpireMS,
            googleId: null,
            githubFilename: null,
            privateKey: null,
            publicKey: null,
            secure: false
        };
    }

    // ===== Data Fetching =====
    async Fetch() {
        let callingsObj = await this.Storage.Get(Callings.CallingsFilename, Callings.StorageConfig);
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
    get ActiveCallings() { return Callings._filterByProperty(this.CallingsDetails, 'active', true); }
        // ===== Filtering Utility =====
        static _filterByProperty(array, property, value) {
            return Array.isArray(array) ? array.filter(item => item && item[property] === value) : [];
        }
    get WardCallings() { return Callings._filterByProperty(this.CallingsDetails, 'level', 'ward'); }
    get StakeCallings() { return Callings._filterByProperty(this.CallingsDetails, 'level', 'stake'); }
    get ActiveWardCallings() { return Callings._filterByProperty(this.WardCallings, 'active', true); }
    get ActiveStakeCallings() { return Callings._filterByProperty(this.StakeCallings, 'active', true); }

    // ===== ID/Name Accessors =====
    get CallingIds() { return this.CallingsDetails.map(calling => calling.id); }
    get CallingNames() { return this.CallingsDetails.map(calling => calling.name); }

    // ===== ID/Name Lookups =====
    CallingById(id) { return this.CallingsDetails.filter(calling => calling.id === id); }
    CallingByName(name) { return this.CallingsDetails.filter(calling => calling.name === name); }
    ActiveCallingById(id) { return this.CallingById(id).filter(calling => calling.active === true); }
    ActiveCallingByName(name) { return this.CallingByName(name).filter(calling => calling.active === true); }
    WardCallingById(id) { return this.CallingById(id).filter(calling => calling.level === "ward"); }
    WardCallingByName(name) { return this.CallingByName(name).filter(calling => calling.level === "ward"); }
    ActiveWardCallingById(id) { return this.ActiveCallingById(id).filter(calling => calling.level === "ward"); }
    ActiveWardCallingByName(name) { return this.ActiveCallingById(name).filter(calling => calling.level === "ward"); }
    StakeCallingById(id) { return this.CallingById(id).filter(calling => calling.level === "stake"); }
    StakeCallingByName(name) { return this.CallingByName(name).filter(calling => calling.level === "stake"); }
    ActiveStakeCallingById(id) { return this.ActiveCallingById(id).filter(calling => calling.level === "stake"); }
    ActiveStakeCallingByName(name) { return this.ActiveCallingById(name).filter(calling => calling.level === "stake"); }

    // ===== Existence Accessors =====
    get HasCallings() { return this.CallingsDetails?.length > 0; }
    get HasActiveCallings() { return Callings._hasAny(this.ActiveCallings); }
        // ===== Existence Utility =====
        static _hasAny(array) {
            return Array.isArray(array) && array.length > 0;
        }
    get HasWardCallings() { return Callings._hasAny(this.WardCallings); }
    get HasStakeCallings() { return Callings._hasAny(this.StakeCallings); }
    get HasActiveWardCallings() { return this.ActiveWardCallings?.length > 0; }
    get HasActiveStakeCallings() { return this.ActiveStakeCallings?.length > 0; }

    // ===== Existence Lookups =====
    HasCallingById(id) { return this.CallingById(id)?.length > 0; }
    HasCallingByName(name) { return this.CallingByName(name)?.length > 0; }
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