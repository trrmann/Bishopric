import { LocalStorage } from "./localStorage.mjs";

export class Org {
    static local = true;
    constructor() {
        this.org = null;
        this.lastFetched = null;
        this._unitMap = null;
    }
    static CopyFromJSON(dataJSON) {
        const org = new Org();
        org.org = dataJSON.org;
        org.lastFetched = dataJSON.lastFetched;
        org._buildCache();
        return org;
    }
    static CopyFromObject(destination, source) {
        destination.org = source.org;
        destination.lastFetched = source.lastFetched;
        destination._buildCache();
    }
    static async Factory() {
        const org = new Org();
        await org.Fetch();
        return org;
    }
    GetOrgURL(local=false) {
        const host = "https://trrmann.github.io/";
        const projectPath = "bishopric/data/";
        const path = "data/";
        const file = "organizations.json";
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
        return "org";
    }
    IsFetched(){
        return (this.org != null);
    }
    IsLastFetchedExpired(){
        const lastFetchedMS = this.GetLastFetched();
        if(lastFetchedMS==null) {
            return true;
        } else {
            const expireMS = this.GetFetchExpireMS();
            const fetchExpireMS = lastFetchedMS + expireMS;
            const nowMS = Date.now();
            return (nowMS >= fetchExpireMS);
        }
    }
    GetLastFetched(){
        return this.lastFetched;
    }
    SetLastFetched(fetchedDatetime){
        this.lastFetched = fetchedDatetime;
    }
    async Fetch() {
        const isFetched = this.IsFetched();
        if(!isFetched) {
            const key = this.GetLocalStoreKey();
            const hasPreference = LocalStorage.HasPreference(key);
            if(hasPreference) {
                const preferenceData = await LocalStorage.GetObject(key);
                Org.CopyFromObject(this, preferenceData);
            }
            const isLastFetchedExpired = this.IsLastFetchedExpired();
            if(isLastFetchedExpired){
                try {
                    const url = this.GetOrgURL(Org.local);
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    this.org = await response.json();
                    this.SetLastFetched(Date.now());
                } catch (error) {
                    console.error('There has been a problem with your fetch operation:', error);
                }
            }
            LocalStorage.SetObject(key, this);
        }
        this._buildCache();
    }
    _buildCache() {
        // Cache all stakes and units for fast lookup
        this._stakeMap = new Map();
        this._unitMap = new Map();
        if (this.org && Array.isArray(this.org.stakes)) {
            for (const stake of this.org.stakes) {
                this._stakeMap.set(stake.unitNumber, stake);
                if (Array.isArray(stake.units)) {
                    for (const unit of stake.units) {
                        this._unitMap.set(unit.unitNumber, unit);
                    }
                }
            }
        }
    }
    async GetAllStakes() {
        // Ensure data is loaded before returning stakes
        return await this.org.stakes;
    }
    GetAllUnits() {
        // Synchronous: use cached org data
        if (!this.org || !Array.isArray(this.org.stakes)) return [];
        const allUnits = [];
        for (const stake of this.org.stakes) {
            if (Array.isArray(stake.units)) {
                for (const unit of stake.units) {
                    allUnits.push({
                        stakeUnitNumber: stake.unitNumber,
                        unitNumber: unit.unitNumber,
                        type: unit.type,
                        name: unit.name
                    });
                }
            }
        }
        return allUnits;
    }
    GetAllWards() {
        return this.GetAllUnits().filter(unit => unit.type === "ward");
    }
    GetAllBranches() {
        return this.GetAllUnits().filter(unit => unit.type === "branch");
    }
    GetStake(unitNumber) {
        if (!this.org || !Array.isArray(this.org.stakes)) return undefined;
        return this.org.stakes.find(stake => stake.unitNumber === unitNumber);
    }
    GetAllStakeUnits(stakeUnitNumber) {
        const stake = this.GetStake(stakeUnitNumber);
        return stake && Array.isArray(stake.units) ? stake.units : [];
    }
    GetAllStakeWards(stakeUnitNumber) {
        return this.GetAllStakeUnits(stakeUnitNumber).filter(unit => unit.type === "ward");
    }
    GetAllStakeBranches(stakeUnitNumber) {
        return this.GetAllStakeUnits(stakeUnitNumber).filter(unit => unit.type === "branch");
    }
    GetUnit(unitNumber) {
        return this.GetAllUnits().find(unit => unit.unitNumber === unitNumber);
    }
    GetWard(unitNumber) {
        return this.GetAllWards().find(unit => unit.unitNumber === unitNumber);
    }
    GetBranch(unitNumber) {
        return this.GetAllBranches().find(unit => unit.unitNumber === unitNumber);
    }
    GetStakeByName(stakeName) {
        if (!this.org || !Array.isArray(this.org.stakes)) return undefined;
        return this.org.stakes.find(stake => stake.name === stakeName);
    }
    GetUnitByName(unitName) {
        return this.GetAllUnits().find(unit => unit.name === unitName);
    }
}
