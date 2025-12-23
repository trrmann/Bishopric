export class Callings {

    // ----- Instance Accessors -----
    get Storage() {
        return this.storage;
    }
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
    get CallingsEntries() {
        return this.Callings.callings;
    }
    get CallingsDetails() {
        return this.CallingsEntries.map(calling => ({
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
    get ActiveCallings() {
        return this.CallingsDetails.filter(calling => calling.active === true);
    }
    get WardCallings() {
        return this.CallingsDetails.filter(calling => calling.level === "ward");
    }
    get StakeCallings() {
        return this.CallingsDetails.filter(calling => calling.level === "stake");
    }
    get ActiveWardCallings() {
        return this.WardCallings.filter(calling => calling.active === true);
    }
    get ActiveStakeCallings() {
        return this.StakeCallings.filter(calling => calling.active === true);
    }

    // ----- ID/Name Accessors -----
    get CallingIds() {
        return this.CallingsDetails.map(calling => calling.id);
    }
    get CallingNames() {
        return this.CallingsDetails.map(calling => calling.name);
    }

    // ----- ID/Name Lookups -----
    CallingById(id) {
        return this.CallingsDetails.filter(calling => calling.id === id);
    }
    CallingByName(name) {
        return this.CallingsDetails.filter(calling => calling.name === name);
    }
    ActiveCallingById(id) {
        return this.CallingById(id).filter(calling => calling.active === true);
    }
    ActiveCallingByName(name) {
        return this.CallingByName(name).filter(calling => calling.active === true);
    }
    WardCallingById(id) {
        return this.CallingById(id).filter(calling => calling.level === "ward");
    }
    WardCallingByName(name) {
        return this.CallingByName(name).filter(calling => calling.level === "ward");
    }
    ActiveWardCallingById(id) {
        return this.ActiveCallingById(id).filter(calling => calling.level === "ward");
    }
    ActiveWardCallingByName(name) {
        return this.ActiveCallingById(name).filter(calling => calling.level === "ward");
    }
    StakeCallingById(id) {
        return this.CallingById(id).filter(calling => calling.level === "stake");
    }
    StakeCallingByName(name) {
        return this.CallingByName(name).filter(calling => calling.level === "stake");
    }
    ActiveStakeCallingById(id) {
        return this.ActiveCallingById(id).filter(calling => calling.level === "stake");
    }
    ActiveStakeCallingByName(name) {
        return this.ActiveCallingById(name).filter(calling => calling.level === "stake");
    }

    // ----- Existence Accessors -----
    get HasCallings() {
        const callings = this.CallingsDetails;
        return callings !== null && callings.length > 0;
    }
    get HasActiveCallings() {
        const active = this.ActiveCallings;
        return active !== null && active.length > 0;
    }
    get HasWardCallings() {
        const ward = this.WardCallings;
        return ward !== null && ward.length > 0;
    }
    get HasStakeCallings() {
        const stake = this.StakeCallings;
        return stake !== null && stake.length > 0;
    }
    get HasActiveWardCallings() {
        const activeWard = this.ActiveWardCallings;
        return activeWard !== null && activeWard.length > 0;
    }
    get HasActiveStakeCallings() {
        return this.ActiveStakeCallings !== null && this.ActiveStakeCallings.length > 0;
    }

    // ----- Existence Lookups -----
    HasCallingById(id) {
        return this.CallingById(id) !== null && this.CallingById(id).length > 0;
    }
    HasCallingByName(name) {
        return this.CallingByName(name) !== null && this.CallingByName(name).length > 0;
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
    get AllCallingIds() {
        return this.CallingsDetails.map(calling => calling.id);
    }
    get AllCallingNames() {
        return this.CallingsDetails.map(calling => calling.name);
    }
    get AllActiveCallingIds() {
        return this.ActiveCallings.map(calling => calling.id);
    }
    get AllActiveCallingNames() {
        return this.ActiveCallings.map(calling => calling.name);
    }
    get AllWardCallingIds() {
        return this.WardCallings.map(calling => calling.id);
    }
    get AllWardCallingNames() {
        return this.WardCallings.map(calling => calling.name);
    }
    get AllStakeCallingIds() {
        return this.StakeCallings.map(calling => calling.id);
    }
    get AllStakeCallingNames() {
        return this.StakeCallings.map(calling => calling.name);
    }
    get AllActiveWardCallingIds() {
        return this.ActiveWardCallings.map(calling => calling.id);
    }
    get AllActiveWardCallingNames() {
        return this.ActiveWardCallings.map(calling => calling.name);
    }
    get AllActiveStakeCallingIds() {
        return this.ActiveStakeCallings.map(calling => calling.id);
    }
    get AllActiveStakeCallingNames() {
        return this.ActiveStakeCallings.map(calling => calling.name);
    }

    // ----- ID/Name Lookups -----
    CallingNameById(id) {
        return this.CallingById(id).map(calling => calling.name);
    }
    CallingIdByName(name) {
        return this.CallingByName(name).map(calling => calling.id);
    }
    ActiveCallingNameById(id) {
        return this.ActiveCallingById(id).map(calling => calling.name);
    }
    ActiveCallingIdByName(name) {
        return this.ActiveCallingByName(name).map(calling => calling.id);
    }
    WardCallingNameById(id) {
        return this.WardCallingById(id).map(calling => calling.name);
    }
    WardCallingIdByName(name) {
        return this.WardCallingByName(name).map(calling => calling.id);
    }
    ActiveWardCallingNameById(id) {
        return this.ActiveWardCallingById(id).map(calling => calling.name);
    }
    ActiveWardCallingIdByName(name) {
        return this.ActiveWardCallingByName(name).map(calling => calling.id);
    }
    StakeCallingNameById(id) {
        return this.StakeCallingById(id).map(calling => calling.name);
    }
    StakeCallingIdByName(name) {
        return this.StakeCallingByName(name).map(calling => calling.id);
    }
    ActiveStakeCallingNameById(id) {
        return this.ActiveStakeCallingById(id).map(calling => calling.name);
    }
    ActiveStakeCallingIdByName(name) {
        return this.ActiveStakeCallingByName(name).map(calling => calling.id);
    }
}