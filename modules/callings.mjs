export class Callings {
        // ----- Instance Accessors -----
        get Storage() {
            return this.storage;
        }
    // ----- Instance Accessors -----
    get Callings() {
        return this.callings;
    }

    // ----- Constructor -----
    constructor(configuration) {
        this.storage = configuration._storageObj;
        this.callings = undefined;
    }
    
    // ----- Static Methods -----
    static CopyFromJSON(dataJSON) {
        const callings = new Callings(dataJSON._storageObj);
        this.callings = dataJSON.callings;
        return callings;
    }
    static CopyToJSON() {
        return {
            _storageObj: this.storage,
            callings: this.Callings
        };
    }
    static CopyFromObject(destination, source) {
        destination.storage = source.storage;
        destination.callings = source.Callings;
    }
    static async Factory(configuration) {
        const callings = new Callings(configuration);
        await callings.Fetch();
        return callings;
    }

    // ----- File/Storage Accessors -----
    static get CallingsFileBasename() {
        return "callings";
    }
    static get CallingsFileExtension() {
        return "json";
    }
    static get CallingsFilename() {
        return `${Callings.CallingsFileBasename}.${Callings.CallingsFileExtension}`;
    }
    static get CallingsCacheExpireMS() {
        return 1000 * 60 * 30; // 1/2 hour
    }
    static get CallingsSessionExpireMS() {
        return 1000 * 60 * 60; // 1 hour
    }
    static get CallingsLocalExpireMS() {
        return 1000 * 60 * 60 * 2; // 2 hours
    }
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

    // ----- Data Fetching -----
    async Fetch() {
        let callingsObj = await this.Storage.Get(Callings.CallingsFilename, Callings.StorageConfig);
        if (callingsObj) {
            this.callings = callingsObj;
        } else {
            this.callings = undefined;
        }
    }

    // ----- Core Data Accessors -----
    GetCallingsEntries() {
        return this.Callings.callings;
    }
    GetCallingsDetails() {
        return this.GetCallingsEntries().map(calling => ({
            id: calling.id,
            name: calling.name,
            level: calling.level,
            active: calling.active,
            hasTitle: calling.hasTitle,
            title: calling.title,
            titleOrdinal: calling.titleOrdinal
        }));
    }

    // ----- Filtering Methods -----
    GetActiveCallings() {
        return this.GetCallingsDetails().filter(calling => calling.active === true);
    }
    GetWardCallings() {
        return this.GetCallingsDetails().filter(calling => calling.level === "ward");
    }
    GetStakeCallings() {
        return this.GetCallingsDetails().filter(calling => calling.level === "stake");
    }
    GetActiveWardCallings() {
        return this.GetWardCallings().filter(calling => calling.active === true);
    }
    GetActiveStakeCallings() {
        return this.GetStakeCallings().filter(calling => calling.active === true);
    }

    // ----- Lookup Methods -----
    GetCallingById(id) {
        return this.GetCallingsDetails().filter(calling => calling.id === id);
    }
    GetCallingByName(name) {
        return this.GetCallingsDetails().filter(calling => calling.name === name);
    }
    GetActiveCallingById(id) {
        return this.GetCallingById(id).filter(calling => calling.active === true);
    }
    GetActiveCallingByName(name) {
        return this.GetCallingByName(name).filter(calling => calling.active === true);
    }
    GetWardCallingById(id) {
        return this.GetCallingById(id).filter(calling => calling.level === "ward");
    }
    GetWardCallingByName(name) {
        return this.GetCallingByName(name).filter(calling => calling.level === "ward");
    }
    GetActiveWardCallingById(id) {
        return this.GetActiveCallingById(id).filter(calling => calling.level === "ward");
    }
    GetActiveWardCallingByName(name) {
        return this.GetActiveCallingById(name).filter(calling => calling.level === "ward");
    }
    GetStakeCallingById(id) {
        return this.GetCallingById(id).filter(calling => calling.level === "stake");
    }
    GetStakeCallingByName(name) {
        return this.GetCallingByName(name).filter(calling => calling.level === "stake");
    }
    GetActiveStakeCallingById(id) {
        return this.GetActiveCallingById(id).filter(calling => calling.level === "stake");
    }
    GetActiveStakeCallingByName(name) {
        return this.GetActiveCallingById(name).filter(calling => calling.level === "stake");
    }

    // ----- Existence Checks -----
    HasCallings() {
        const callings = this.GetCallingsDetails();
        return callings !== null && callings.length > 0;
    }
    HasActiveCallings() {
        const active = this.GetActiveCallings();
        return active !== null && active.length > 0;
    }
    HasWardCallings() {
        const ward = this.GetWardCallings();
        return ward !== null && ward.length > 0;
    }
    HasStakeCallings() {
        const stake = this.GetStakeCallings();
        return stake !== null && stake.length > 0;
    }
    HasActiveWardCallings() {
        const activeWard = this.GetActiveWardCallings();
        return activeWard !== null && activeWard.length > 0;
    }
    HasActiveStakeCallings() {
        return this.GetActiveStakeCallings() !== null && this.GetActiveStakeCallings().length > 0;
    }
    HasCallingById(id) {
        return this.GetCallingById(id) !== null && this.GetCallingById(id).length > 0;
    }
    HasCallingByName(name) {
        return this.GetCallingByName(name) !== null && this.GetCallingByName(name).length > 0;
    }
    HasActiveCallingById(id) {
        return this.GetActiveCallingById(id) !== null && this.GetActiveCallingById(id).length > 0;
    }
    HasActiveCallingByName(name) {
        return this.GetActiveCallingByName(name) !== null && this.GetActiveCallingByName(name).length > 0;
    }
    HasWardCallingById(id) {
        return this.GetWardCallingById(id) !== null && this.GetWardCallingById(id).length > 0;
    }
    HasWardCallingByName(name) {
        return this.GetWardCallingByName(name) !== null && this.GetWardCallingByName(name).length > 0;
    }
    HasActiveWardCallingById(id) {
        return this.GetActiveWardCallingById(id) !== null && this.GetActiveWardCallingById(id).length > 0;
    }
    HasActiveWardCallingByName(name) {
        return this.GetActiveWardCallingByName(name) !== null && this.GetActiveWardCallingByName(name).length > 0;
    }
    HasStakeCallingById(id) {
        return this.GetStakeCallingById(id) !== null && this.GetStakeCallingById(id).length > 0;
    }
    HasStakeCallingByName(name) {
        return this.GetStakeCallingByName(name) !== null && this.GetStakeCallingByName(name).length > 0;
    }
    HasActiveStakeCallingById(id) {
        return this.GetActiveStakeCallingById(id) !== null && this.GetActiveStakeCallingById(id).length > 0;
    }
    HasActiveStakeCallingByName(name) {
        return this.GetActiveStakeCallingByName(name) !== null && this.GetActiveStakeCallingByName(name).length > 0;
    }

    // ----- ID/Name Accessors -----
    GetCallingIds() {
        return this.GetCallingsDetails().map(calling => calling.id);
    }
    GetCallingNames() {
        return this.GetCallingsDetails().map(calling => calling.name);
    }
    GetActiveCallingIds() {
        return this.GetActiveCallings().map(calling => calling.id);
    }
    GetActiveCallingNames() {
        return this.GetActiveCallings().map(calling => calling.name);
    }
    GetWardCallingIds() {
        return this.GetWardCallings().map(calling => calling.id);
    }
    GetWardCallingNames() {
        return this.GetWardCallings().map(calling => calling.name);
    }
    GetStakeCallingIds() {
        return this.GetStakeCallings().map(calling => calling.id);
    }
    GetStakeCallingNames() {
        return this.GetStakeCallings().map(calling => calling.name);
    }
    GetActiveWardCallingIds() {
        return this.GetActiveWardCallings().map(calling => calling.id);
    }
    GetActiveWardCallingNames() {
        return this.GetActiveWardCallings().map(calling => calling.name);
    }
    GetActiveStakeCallingIds() {
        return this.GetActiveStakeCallings().map(calling => calling.id);
    }
    GetActiveStakeCallingNames() {
        return this.GetActiveStakeCallings().map(calling => calling.name);
    }
    GetCallingNameById(id) {
        return this.GetCallingById(id).map(calling => calling.name);
    }
    GetCallingIdByName(name) {
        return this.GetCallingByName(name).map(calling => calling.id);
    }
    GetActiveCallingNameById(id) {
        return this.GetActiveCallingById(id).map(calling => calling.name);
    }
    GetActiveCallingIdByName(name) {
        return this.GetActiveCallingByName(name).map(calling => calling.id);
    }
    GetWardCallingNameById(id) {
        return this.GetWardCallingById(id).map(calling => calling.name);
    }
    GetWardCallingIdByName(name) {
        return this.GetWardCallingByName(name).map(calling => calling.id);
    }
    GetActiveWardCallingNameById(id) {
        return this.GetActiveWardCallingById(id).map(calling => calling.name);
    }
    GetActiveWardCallingIdByName(name) {
        return this.GetActiveWardCallingByName(name).map(calling => calling.id);
    }
    GetStakeCallingNameById(id) {
        return this.GetStakeCallingById(id).map(calling => calling.name);
    }
    GetStakeCallingIdByName(name) {
        return this.GetStakeCallingByName(name).map(calling => calling.id);
    }
    GetActiveStakeCallingNameById(id) {
        return this.GetActiveStakeCallingById(id).map(calling => calling.name);
    }
    GetActiveStakeCallingIdByName(name) {
        return this.GetActiveStakeCallingByName(name).map(calling => calling.id);
    }
}