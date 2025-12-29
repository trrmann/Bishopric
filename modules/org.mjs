import { createStorageConfig } from "./objectUtils.mjs";

export class Org {

    // ===== Instance Accessors =====
    get Storage() { return this.storage; }
    get Organization() { return this.organization; }

    /**
     * Creates an Org instance.
     * @param {object} configuration - Configuration object containing _storageObj.
     */
    constructor(configuration) {
        this.storage = configuration._storageObj;
        this.organization = undefined;
    }

    // ===== Static Methods =====
    /**
     * Creates an Org instance from a JSON object.
     * @param {object} dataJSON - JSON object with _storageObj and org properties.
     * @returns {Org} New Org instance.
     */
    static CopyFromJSON(dataJSON) {
        const org = new Org(dataJSON._storageObj);
        org.organization = dataJSON.org;
        return org;
    }
    /**
     * Converts an Org instance to a JSON object.
     * @param {Org} instance - Org instance to convert.
     * @returns {object} JSON representation of Org.
     */
    static CopyToJSON(instance) {
        return {
            _storageObj: instance.storage,
            org: instance.organization
        };
    }
    /**
     * Copies Org properties from source to destination.
     * @param {Org} destination - Destination Org instance.
     * @param {Org} source - Source Org instance.
     */
    static CopyFromObject(destination, source) {
        destination.storage = source.storage;
        destination.organization = source.organization;
    }
    /**
     * Factory method to create and initialize an Org instance.
     * @param {object} configuration - Configuration object containing _storageObj.
     * @returns {Promise<Org>} Initialized Org instance.
     */
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
        // 1. Try to get from cache
        let orgObj = await this.Storage.Get(Org.OrgFilename, { ...Org.StorageConfig, cacheTtlMs: Org.OrgCacheExpireMS });
        // 2. If not found, try session storage
        if (!orgObj) {
            orgObj = await this.Storage.Get(Org.OrgFilename, { ...Org.StorageConfig, cacheTtlMs: null, sessionTtlMs: Org.OrgSessionExpireMS });
            if (orgObj && this.Storage.Cache && typeof this.Storage.Cache.Set === 'function') {
                this.Storage.Cache.Set(Org.OrgFilename, orgObj, Org.OrgCacheExpireMS);
            }
        }
        // 3. If still not found, try local storage
        if (!orgObj) {
            orgObj = await this.Storage.Get(Org.OrgFilename, { ...Org.StorageConfig, cacheTtlMs: null, sessionTtlMs: null, localTtlMs: Org.OrgLocalExpireMS });
            if (orgObj) {
                if (this.Storage.SessionStorage && typeof this.Storage.SessionStorage.Set === 'function') {
                    this.Storage.SessionStorage.Set(Org.OrgFilename, orgObj, Org.OrgSessionExpireMS);
                }
                if (this.Storage.Cache && typeof this.Storage.Cache.Set === 'function') {
                    this.Storage.Cache.Set(Org.OrgFilename, orgObj, Org.OrgCacheExpireMS);
                }
            }
        }
        // 4. If still not found, use GoogleDrive for read/write priority
        if (!orgObj && this.Storage && typeof this.Storage.Get === 'function' && this.Storage.constructor.name === 'GoogleDrive') {
            orgObj = await this.Storage.Get(Org.OrgFilename, { ...Org.StorageConfig });
        }
        // 5. If still not found, fallback to GitHubDataObj for read-only
        if (!orgObj && this.Storage && typeof this.Storage._gitHubDataObj === 'object' && typeof this.Storage._gitHubDataObj.fetchJsonFile === 'function') {
            orgObj = await this.Storage._gitHubDataObj.fetchJsonFile(Org.OrgFilename);
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
    /**
     * Finds a stake by unit number.
     * @param {string|number} unitNumber - Stake unit number.
     * @returns {object|undefined} Stake object or undefined.
     */
    StakeByUnitNumber(unitNumber) {
        if (!Array.isArray(this.Stakes)) return undefined;
        return this.Stakes.find(stake => stake.unitNumber === unitNumber);
    }

    /**
     * Finds a stake by name.
     * @param {string} stakeName - Stake name.
     * @returns {object|undefined} Stake object or undefined.
     */
    StakeByName(stakeName) {
        if (!Array.isArray(this.Stakes)) return undefined;
        return this.Stakes.find(stake => stake.name === stakeName);
    }

    /**
     * Gets all units for a stake by unit number.
     * @param {string|number} stakeUnitNumber - Stake unit number.
     * @returns {Array<object>} Array of unit objects.
     */
    StakeUnits(stakeUnitNumber) {
        const stake = this.StakeByUnitNumber(stakeUnitNumber);
        return stake && Array.isArray(stake.units) ? stake.units : [];
    }

    /**
     * Gets all wards for a stake by unit number.
     * @param {string|number} stakeUnitNumber - Stake unit number.
     * @returns {Array<object>} Array of ward unit objects.
     */
    StakeWards(stakeUnitNumber) {
        return this.StakeUnits(stakeUnitNumber).filter(unit => unit.type === "ward");
    }

    /**
     * Gets all branches for a stake by unit number.
     * @param {string|number} stakeUnitNumber - Stake unit number.
     * @returns {Array<object>} Array of branch unit objects.
     */
    StakeBranches(stakeUnitNumber) {
        return this.StakeUnits(stakeUnitNumber).filter(unit => unit.type === "branch");
    }

    /**
     * Finds a unit by number.
     * @param {string|number} unitNumber - Unit number.
     * @returns {object|undefined} Unit object or undefined.
     */
    UnitByNumber(unitNumber) {
        return this.Units.find(unit => unit.unitNumber === unitNumber);
    }

    /**
     * Finds a ward by number.
     * @param {string|number} unitNumber - Ward unit number.
     * @returns {object|undefined} Ward object or undefined.
     */
    WardByNumber(unitNumber) {
        return this.Wards.find(unit => unit.unitNumber === unitNumber);
    }

    /**
     * Finds a branch by number.
     * @param {string|number} unitNumber - Branch unit number.
     * @returns {object|undefined} Branch object or undefined.
     */
    BranchByNumber(unitNumber) {
        return this.Branches.find(unit => unit.unitNumber === unitNumber);
    }

    /**
     * Finds a unit by name.
     * @param {string} unitName - Unit name.
     * @returns {object|undefined} Unit object or undefined.
     */
    UnitByName(unitName) {
        return this.Units.find(unit => unit.name === unitName);
    }
    /**
     * Checks if a stake exists by name.
     * @param {string} stakeName - Stake name.
     * @returns {boolean}
     */
    HasStakeByName(stakeName) { return !!this.StakeByName(stakeName); }

    /**
     * Checks if a unit exists by number.
     * @param {string|number} unitNumber - Unit number.
     * @returns {boolean}
     */
    HasUnitByNumber(unitNumber) { return !!this.UnitByNumber(unitNumber); }

    /**
     * Checks if a unit exists by name.
     * @param {string} unitName - Unit name.
     * @returns {boolean}
     */
    HasUnitByName(unitName) { return !!this.UnitByName(unitName); }

    /**
     * Checks if a ward exists by number.
     * @param {string|number} unitNumber - Ward unit number.
     * @returns {boolean}
     */
    HasWardByNumber(unitNumber) { return !!this.WardByNumber(unitNumber); }

    /**
     * Checks if a branch exists by number.
     * @param {string|number} unitNumber - Branch unit number.
     * @returns {boolean}
     */
    HasBranchByNumber(unitNumber) { return !!this.BranchByNumber(unitNumber); }

}
