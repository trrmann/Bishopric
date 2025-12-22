export class Callings {
    static local = true;
    constructor() {
        this.callings = null;
        this.lastFetched = null;
        this._callingsArray = null; // cache array
        this._idMap = null; // cache id lookup
        this._nameMap = null; // cache name lookup
    }
    static CopyFromJSON(dataJSON) {
        const callings = new Callings();
        callings.callings = dataJSON.callings;
        callings.lastFetched = dataJSON.lastFetched;
        callings._buildCache();
        return callings;
    }
    static CopyFromObject(destination, source) {
        destination.callings = source.callings;
        destination.lastFetched = source.lastFetched;
        destination._buildCache();
    }
    static async Factory(storageInstance = null) {
        const callings = new Callings();
        await callings.Fetch(storageInstance);
        callings._buildCache();
        return callings;
    }
    GetCallingsURL(local = false) {
        const host = "https://trrmann.github.io/";
        const projectPath = "bishopric/data/";
        const path = "data/";
        const file = "callings.json";
        let url = `${host}${projectPath}${file}`;
        if (local) {
            url = `${path}${file}`;
        }
        return url;
    }
    GetFetchExpireMS() {
        const expireTime = 1000 * 60 * 60 * 24; // 1 day
        return expireTime;
    }
    GetLocalStoreKey() {
        return "callings";
    }
    IsFetched() {
        const callings = this.callings;
        const isFetched = callings != null;
        return isFetched;
    }
    IsLastFetchedExpired() {
        const lastFetchedMS = this.GetLastFetched();
        if (lastFetchedMS == null) {
            return true;
        } else {
            const expireMS = this.GetFetchExpireMS();
            const fetchExpireMS = lastFetchedMS + expireMS;
            const nowMS = Date.now();
            const match = nowMS >= fetchExpireMS;
            return match;
        }
    }
    GetLastFetched() {
        const lastFetched = this.lastFetched;
        return lastFetched;
    }
    SetLastFetched(fetchedDatetime) {
        this.lastFetched = fetchedDatetime;
    }
        async Fetch(storageInstance = null) {
            // Use Storage class for all data access
            const storage = storageInstance || new Storage();
            const key = this.GetLocalStoreKey();
            const githubFilename = "callings.json";
            const cacheTtlMs = this.GetFetchExpireMS();
            // Try to get from storage (cache/session/local/google/github)
            let callingsObj = await storage.get(key, {
                cacheTtlMs,
                githubFilename
            });
            if (callingsObj) {
                Callings.CopyFromObject(this, callingsObj);
            } else {
                // If not found, fallback to empty
                this.callings = null;
            }
            this._buildCache();
        }
        GetCallings() {
            if (!this._callingsArray) {
                this._buildCache();
            }
            // Return callings with new fields (hasTitle, title, titleOrdinal) included
            return this._callingsArray.map(calling => ({
                id: calling.id,
                name: calling.name,
                level: calling.level,
                active: calling.active,
                hasTitle: calling.hasTitle,
                title: calling.title,
                titleOrdinal: calling.titleOrdinal
            }));
        }
        _buildCache() {
            // Build array and lookup maps for fast access
            this._callingsArray = (this.callings && this.callings.callings) ? this.callings.callings : [];
            this._idMap = new Map();
            this._nameMap = new Map();
            for (const calling of this._callingsArray) {
                this._idMap.set(calling.id, calling);
                this._nameMap.set(calling.name, calling);
            }
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
            // Fast lookup by id
            if (!this._idMap) this._buildCache();
            const c = this._idMap.get(id);
            return c ? [c] : [];
        }
        GetCallingByName(name) {
            // Fast lookup by name
            if (!this._nameMap) this._buildCache();
            const c = this._nameMap.get(name);
            return c ? [c] : [];
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