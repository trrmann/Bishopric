import { createStorageConfig } from "./objectUtils.mjs";

export class Org {

    // ===== Instance Accessors =====
    get Storage() { return this.storage; }
    get Organization() { return this.organization; }

    // ===== Constructor =====
    constructor(configuration) {
        this.storage = configuration._storageObj;
        this.organization = undefined;
    }

    // ===== Static Methods =====
    static CopyFromJSON(dataJSON) {
        const org = new Org(dataJSON._storageObj);
        org.organization = dataJSON.org;
        return org;
    }
    static CopyToJSON(instance) {
        return {
            _storageObj: instance.storage,
            org: instance.organization
        };
    }
    static CopyFromObject(destination, source) {
        destination.storage = source.storage;
        destination.organization = source.organization;
    }
    static async Factory(configuration) {
        const org = new Org(configuration);
        await org.Fetch();
        return org;
    }

    // ===== File/Storage Accessors =====
    static get OrgFileBasename() { return "organizations"; }
    static get OrgFileExtension() { return "json"; }
    static get OrgFilename() { return `${Org.OrgFileBasename}.${Org.OrgFileExtension}`; }
    static get OrgCacheExpireMS() { return 1000 * 60 * 30; }
    static get OrgSessionExpireMS() { return 1000 * 60 * 60; }
    static get OrgLocalExpireMS() { return 1000 * 60 * 60 * 2; }
    static get StorageConfig() {
        return createStorageConfig({
            cacheTtlMs: Org.OrgCacheExpireMS,
            sessionTtlMs: Org.OrgSessionExpireMS,
            localTtlMs: Org.OrgLocalExpireMS
        });
    }

    // ===== Data Fetching =====
    async Fetch() {
        // Try to get from cache first
        let orgObj = await this.Storage.Get(Org.OrgFilename, { ...Org.StorageConfig, cacheTtlMs: Org.OrgCacheExpireMS });
        if (!orgObj) {
            // If not found, fetch from persistent storage (simulate by re-calling Get with no cacheTtlMs)
            orgObj = await this.Storage.Get(Org.OrgFilename, { ...Org.StorageConfig, cacheTtlMs: null });
            // If found, set in cache for future use
            if (orgObj) {
                if (this.Storage.Cache && typeof this.Storage.Cache.Set === 'function') {
                    this.Storage.Cache.Set(Org.OrgFilename, orgObj, Org.OrgCacheExpireMS);
                }
            }
        }
        this.organization = orgObj ? orgObj : undefined;
    }

    // ===== Core Data Accessors =====
    get Stakes() { return this.organization?.stakes || []; }
    get Units() {
        if (!Array.isArray(this.Stakes)) return [];
        const allUnits = [];
        for (const stake of this.Stakes) {
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
    get Wards() { return this.Units.filter(unit => unit.type === "ward"); }
    get Branches() { return this.Units.filter(unit => unit.type === "branch"); }

    // ===== Stake/Unit Lookups =====
    StakeByUnitNumber(unitNumber) {
        return this.Stakes.find(stake => stake.unitNumber === unitNumber);
    }
    StakeByName(stakeName) {
        return this.Stakes.find(stake => stake.name === stakeName);
    }
    StakeUnits(stakeUnitNumber) {
        const stake = this.StakeByUnitNumber(stakeUnitNumber);
        return stake && Array.isArray(stake.units) ? stake.units : [];
    }
    StakeWards(stakeUnitNumber) {
        return this.StakeUnits(stakeUnitNumber).filter(unit => unit.type === "ward");
    }
    StakeBranches(stakeUnitNumber) {
        return this.StakeUnits(stakeUnitNumber).filter(unit => unit.type === "branch");
    }
    UnitByNumber(unitNumber) {
        return this.Units.find(unit => unit.unitNumber === unitNumber);
    }
    WardByNumber(unitNumber) {
        return this.Wards.find(unit => unit.unitNumber === unitNumber);
    }
    BranchByNumber(unitNumber) {
        return this.Branches.find(unit => unit.unitNumber === unitNumber);
    }
    UnitByName(unitName) {
        return this.Units.find(unit => unit.name === unitName);
    }

    // ===== Existence Accessors =====
    get HasStakes() { return this.Stakes.length > 0; }
    get HasUnits() { return this.Units.length > 0; }
    get HasWards() { return this.Wards.length > 0; }
    get HasBranches() { return this.Branches.length > 0; }

    // ===== Existence Lookups =====
    HasStakeByUnitNumber(unitNumber) { return !!this.StakeByUnitNumber(unitNumber); }
    HasStakeByName(stakeName) { return !!this.StakeByName(stakeName); }
    HasUnitByNumber(unitNumber) { return !!this.UnitByNumber(unitNumber); }
    HasUnitByName(unitName) { return !!this.UnitByName(unitName); }
    HasWardByNumber(unitNumber) { return !!this.WardByNumber(unitNumber); }
    HasBranchByNumber(unitNumber) { return !!this.BranchByNumber(unitNumber); }

}
