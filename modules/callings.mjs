export class Callings {
    constructor(config) {
        this._storageObj = config._storageObj;
        this.callings = null;
    }
    static CopyFromJSON(dataJSON) {
        this._storageObj = dataJSON._storageObj;
        this.callings = dataJSON.callings;
    }
    static CopyFromObject(destination, source) {
        destination._storageObj = source._storageObj;
        destination.callings = source.callings;
    }
    static async Factory(config) {
        const callings = new Callings(await config);
        await callings.Fetch();
        return callings;
    }
    GetCallingsFilename() {
        const file = "callings.json";
        return file;
    }
    GetCallingsExpireMS() {
        return 1000 * 60 * 60 * 1;// 1 hour
    }
    GetStorageConfig() {
        return { cacheTtlMs: null, sessionTtlMs: null, localTtlMs: null, googleId: null, githubFilename: null, privateKey: null, publicKey: null, secure: false };
    }
    async Fetch() {
        // Try to get from storage (cache/session/local/google/github)
        let callingsObj = await this._storageObj.Get(this.GetCallingsFilename(), this.GetStorageConfig());
        if (callingsObj) {
            this.callings = callingsObj;
        } else {
            // If not found, fallback to empty
            this.callings = undefined;
        }
    }
    GetCallingsEntries(){
        // Ensure cache is built
        return this.callings.callings;
    }
    GetCallings() {
            // Return callings with new fields (hasTitle, title, titleOrdinal) included
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
        GetActiveCallings() {
            return this.GetCallings().filter(calling => calling.active === true);
        }
        GetWardCallings() {
            return this.GetCallings().filter(calling => calling.level === "ward");
        }
        GetStakeCallings() {
            return this.GetCallings().filter(calling => calling.level === "stake");
        }
        GetActiveWardCallings() {
            return this.GetWardCallings().filter(calling => calling.active === true);
        }
        GetActiveStakeCallings() {
            return this.GetStakeCallings().filter(calling => calling.active === true);
        }
        GetCallingById(id) {
            return this.GetCallings().filter(calling => calling.id === id);
        }
        GetCallingByName(name) {
            return this.GetCallings().filter(calling => calling.name === name);
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
        HasCallings() {
            return this.GetCallings() !== null && this.GetCallings().length > 0;
        }
        HasActiveCallings() {
            return this.GetActiveCallings() !== null && this.GetActiveCallings().length > 0;
        }
        HasWardCallings() {
            return this.GetWardCallings() !== null && this.GetWardCallings().length > 0;
        }
        HasStakeCallings() {
            return this.GetStakeCallings() !== null && this.GetStakeCallings().length > 0;
        }
        HasActiveWardCallings() {
            return this.GetActiveWardCallings() !== null && this.GetActiveWardCallings().length > 0;
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
        GetCallingIds() {
            return this.GetCallings().map(calling => calling.id);
        }
        GetCallingNames() {
            return this.GetCallings().map(calling => calling.name);
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