import { Callings } from "./callings.mjs";
import { createStorageConfig, ObjectUtils } from "./objectUtils.mjs";

export class Roles {
    // ===== Private Fast Lookup Maps and Caches =====
    #_idMap = null;
    #_nameMap = null;
    #_callingIdMap = null;
    #_wardRoles = null;
    #_stakeRoles = null;
    #_rolesDetails = null;

    // ===== Instance Accessors =====
    get Callings() { return this.callings; }
    get Storage() {
        if (!this.Callings || !this.Callings.storage) {
            throw new Error("Callings instance or its storage is not set on Roles.");
        }
        return this.Callings.storage;
    }
    get Roles() { return this.roles; }

    // ===== Constructor =====
    /**
     * Always use Roles.Factory to ensure dependencies are ready before use.
     */
    constructor() {
        this.callings = undefined;
        this.roles = undefined;
        this.#_idMap = null;
    }

    // ===== Static Methods =====
    static CopyFromJSON(dataJSON) {
        const roles = new Roles();
        roles.callings = dataJSON.callings;
        roles.roles = dataJSON.roles;
        return roles;
    }
    static CopyToJSON(instance) {
        return {
            roles: instance.roles,
            callings: instance.callings
        };
    }
    static CopyFromObject(destination, source) {
        if (destination.callings && source.callings) {
            Callings.CopyFromObject(destination.callings, source.callings);
        } else {
            destination.callings = source.callings;
        }
        destination.roles = source.roles;
    }
    /**
     * Async factory. Always use this to ensure callings and storage are ready before use.
     * @param {Object} configuration
     * @returns {Promise<Roles>}
     */
    static async Factory(configuration) {
        const roles = new Roles();
        roles.callings = await Callings.Factory(configuration);
        await roles.Fetch();
        return roles;
    }

    // ===== File/Storage Accessors =====
    static get RolesFileBasename() { return "roles"; }
    static get RolesFileExtension() { return "json"; }
    static get RolesFilename() { return `${Roles.RolesFileBasename}.${Roles.RolesFileExtension}`; }
    static get RolesCacheExpireMS() { return 1000 * 60 * 30; }
    static get RolesSessionExpireMS() { return 1000 * 60 * 60; }
    static get RolesLocalExpireMS() { return 1000 * 60 * 60 * 2; }
    static get StorageConfig() {
        return createStorageConfig({
            cacheTtlMs: Roles.RolesCacheExpireMS,
            sessionTtlMs: Roles.RolesSessionExpireMS,
            localTtlMs: Roles.RolesLocalExpireMS
        });
    }

    // ===== Data Fetching =====
    // ===== Internal Map Management =====


    _invalidateMaps() {
        this.#_idMap = null;
        this.#_nameMap = null;
        this.#_callingIdMap = null;
        this.#_wardRoles = null;
        this.#_stakeRoles = null;
        this.#_rolesDetails = null;
    }
    _buildCallingIdMap() {
        if (!this.#_callingIdMap) {
            this.#_callingIdMap = new Map();
            for (const role of this.RolesDetails) {
                if (role && role.callingID !== undefined && role.callingID !== null) {
                    if (!this.#_callingIdMap.has(role.callingID)) {
                        this.#_callingIdMap.set(role.callingID, []);
                    }
                    this.#_callingIdMap.get(role.callingID).push(role);
                }
            }
        }
    }

    _buildIdMap() {
        if (!this.#_idMap) {
            this.#_idMap = new Map();
            for (const role of this.RolesEntries) {
                if (role && role.id !== undefined && role.id !== null) {
                    this.#_idMap.set(role.id, role);
                }
            }
        }
    }

    _buildNameMap() {
        if (!this.#_nameMap) {
            this.#_nameMap = new Map();
            for (const role of this.RolesDetails) {
                if (role && role.name !== undefined && role.name !== null) {
                    if (!this.#_nameMap.has(role.name)) {
                        this.#_nameMap.set(role.name, []);
                    }
                    this.#_nameMap.get(role.name).push(role);
                }
            }
        }
    }

    set roles(val) {
        this._roles = val;
        this._invalidateMaps();
    }
    get roles() {
        return this._roles;
    }

    async Fetch() {
        // Always use storage from Callings accessor
        if (!this.Callings || !this.Callings.storage) {
            throw new Error("Callings instance or its storage is not set on Roles.");
        }
        // 1. Try to get from cache
        let rolesObj = await this.Callings.storage.Get(Roles.RolesFilename, { ...Roles.StorageConfig, cacheTtlMs: Roles.RolesCacheExpireMS });
        // 2. If not found, try session storage
        if (!rolesObj) {
            rolesObj = await this.Callings.storage.Get(Roles.RolesFilename, { ...Roles.StorageConfig, cacheTtlMs: null, sessionTtlMs: Roles.RolesSessionExpireMS });
            if (rolesObj && this.Callings.storage.Cache && typeof this.Callings.storage.Cache.Set === 'function') {
                this.Callings.storage.Cache.Set(Roles.RolesFilename, rolesObj, Roles.RolesCacheExpireMS);
            }
        }
        // 3. If still not found, try local storage
        if (!rolesObj) {
            rolesObj = await this.Callings.storage.Get(Roles.RolesFilename, { ...Roles.StorageConfig, cacheTtlMs: null, sessionTtlMs: null, localTtlMs: Roles.RolesLocalExpireMS });
            if (rolesObj) {
                if (this.Callings.storage.SessionStorage && typeof this.Callings.storage.SessionStorage.Set === 'function') {
                    this.Callings.storage.SessionStorage.Set(Roles.RolesFilename, rolesObj, Roles.RolesSessionExpireMS);
                }
                if (this.Callings.storage.Cache && typeof this.Callings.storage.Cache.Set === 'function') {
                    this.Callings.storage.Cache.Set(Roles.RolesFilename, rolesObj, Roles.RolesCacheExpireMS);
                }
            }
        }
        // 4. If still not found, use GoogleDrive for read/write priority
        if (!rolesObj && this.Callings.storage && typeof this.Callings.storage.Get === 'function' && this.Callings.storage.constructor.name === 'GoogleDrive') {
            rolesObj = await this.Callings.storage.Get(Roles.RolesFilename, { ...Roles.StorageConfig });
        }
        // 5. If still not found, fallback to GitHubDataObj for read-only
        if (!rolesObj && this.Callings.storage && typeof this.Callings.storage._gitHubDataObj === 'object' && typeof this.Callings.storage._gitHubDataObj.fetchJsonFile === 'function') {
            rolesObj = await this.Callings.storage._gitHubDataObj.fetchJsonFile(Roles.RolesFilename);
        }
        this.roles = rolesObj ? rolesObj : undefined;
    }

    // ===== Core Data Accessors =====
    get RolesEntries() { return this.roles?.roles || []; }
    get RolesDetails() {
        if (!this.#_rolesDetails) {
            const entries = this.RolesEntries;
            this.#_rolesDetails = entries.map(role => {
                const callingArr = this.Callings ? (this.Callings.CallingIds.includes(role.calling) ? this.Callings.CallingById(role.calling) : []) : [];
                const calling = callingArr && callingArr.length > 0 ? callingArr[0] : {};
                const subRoles = this.RawSubRolesById(role.id);
                const subRoleNames = entries.filter(r => subRoles.includes(r.id)).map(r => r.name);
                const allSubRoles = this.SubRolesById(role.id);
                const allSubRoleNames = entries.filter(r => allSubRoles.includes(r.id)).map(r => r.name);
                return {
                    id: role.id,
                    name: role.name,
                    callingID: role.calling,
                    callingName: calling.name,
                    level: calling.level,
                    callingActive: calling.active,
                    callingHasTitle: calling.hasTitle,
                    callingTitle: calling.title,
                    callingTitleOrdinal: calling.titleOrdinal,
                    subRoles: subRoles,
                    subRoleNames: subRoleNames,
                    allSubRoles: allSubRoles,
                    allSubRoleNames: allSubRoleNames,
                    active: role.active
                };
            });
        }
        return this.#_rolesDetails;
    }

    // ===== SubRole Accessors =====
    RawSubRolesById(roleId) {
        const roleArr = this.RoleEntryById(roleId);
        if (!roleArr || roleArr.length === 0) return [];
        const role = roleArr[0];
        return Array.isArray(role.subRoles) ? role.subRoles : [];
    }
    SubRolesById(roleId, visited = new Set()) {
        if (visited.has(roleId)) return [];
        visited.add(roleId);
        const subRoleIds = this.RawSubRolesById(roleId);
        let allSubRoles = [...subRoleIds];
        for (const subId of subRoleIds) {
            const descendants = this.SubRolesById(subId, visited);
            for (const descId of descendants) {
                if (!allSubRoles.includes(descId)) {
                    allSubRoles.push(descId);
                }
            }
        }
        return allSubRoles;
    }

    // ===== Filtering Methods =====
    get ActiveRoles() { return this.RolesDetails.filter(role => role.active === true); }
    RoleEntryById(id) {
        this._buildIdMap();
        return this.#_idMap.has(id) ? [this.#_idMap.get(id)] : [];
    }
    RoleById(id) {
        this._buildIdMap();
        // RolesDetails is a mapped version, so we need to find the mapped role by id
        return this.RolesDetails.filter(role => role.id === id);
    }
    RoleByName(name) {
        this._buildNameMap();
        return this.#_nameMap.has(name) ? this.#_nameMap.get(name) : [];
    }
    RolesByCalling(callingId) {
        this._buildCallingIdMap();
        return this.#_callingIdMap.has(callingId) ? this.#_callingIdMap.get(callingId) : [];
    }
    ActiveRoleById(id) { return this.RoleById(id).filter(role => role.active === true); }
    ActiveRoleByName(name) { return this.RoleByName(name).filter(role => role.active === true); }
    ActiveRolesByCalling(callingId) { return this.RolesByCalling(callingId).filter(role => role.active === true); }

    // ===== Existence Accessors =====
    get HasRoles() { return this.RolesDetails.length > 0; }
    get HasActiveRoles() { return this.ActiveRoles.length > 0; }

    // ===== Existence Lookups =====
    HasRoleById(id) {
        this._buildIdMap();
        return this.#_idMap.has(id);
    }
    HasRoleByName(name) {
        this._buildNameMap();
        return this.#_nameMap.has(name) && this.#_nameMap.get(name).length > 0;
    }
    HasRolesByCalling(callingId) {
        this._buildCallingIdMap();
        return this.#_callingIdMap.has(callingId) && this.#_callingIdMap.get(callingId).length > 0;
    }
    HasActiveRoleById(id) { return this.ActiveRoleById(id).length > 0; }
    HasActiveRoleByName(name) { return this.ActiveRoleByName(name).length > 0; }
    HasActiveRolesByCalling(callingId) { return this.ActiveRolesByCalling(callingId).length > 0; }

    // ===== ID/Name Accessors =====
    get RoleIds() { return this.RolesDetails.map(role => role.id); }
    get RoleNames() { return this.RolesDetails.map(role => role.name); }
    get RoleCallings() { return this.RolesDetails.map(role => role.callingID); }
    get ActiveRoleIds() { return this.ActiveRoles.map(role => role.id); }
    get ActiveRoleNames() { return this.ActiveRoles.map(role => role.name); }
    get ActiveRoleCallings() { return this.ActiveRoles.map(role => role.callingID); }

    // ===== ID/Name Lookups =====
    RoleNameById(id) { return this.RoleById(id).map(role => role.name); }
    RoleNamesByCalling(callingId) { return this.RolesByCalling(callingId).map(role => role.name); }
    RoleIdByName(name) { return this.RoleByName(name).map(role => role.id); }
    RoleIdsByCalling(callingId) { return this.RolesByCalling(callingId).map(role => role.id); }
    RoleCallingById(id) { return this.RoleById(id).map(role => role.callingID); }
    RoleCallingByName(name) { return this.RoleByName(name).map(role => role.callingID); }
    ActiveRoleNameById(id) { return this.ActiveRoleById(id).map(role => role.name); }
    ActiveRoleNamesByCalling(callingId) { return this.ActiveRolesByCalling(callingId).map(role => role.name); }
    ActiveRoleIdByName(name) { return this.ActiveRoleByName(name).map(role => role.id); }
    ActiveRoleIdsByCalling(callingId) { return this.ActiveRolesByCalling(callingId).map(role => role.id); }
    ActiveRoleCallingById(id) { return this.ActiveRoleById(id).map(role => role.callingID); }
    ActiveRoleCallingByName(name) { return this.ActiveRoleByName(name).map(role => role.callingID); }

    // ===== Ward/Stake Filtering (with caching) =====
    get WardRoles() {
        if (!this.#_wardRoles) {
            this.#_wardRoles = ObjectUtils.filterByProperty(this.RolesDetails, 'level', 'ward');
        }
        return this.#_wardRoles;
    }
    get StakeRoles() {
        if (!this.#_stakeRoles) {
            this.#_stakeRoles = ObjectUtils.filterByProperty(this.RolesDetails, 'level', 'stake');
        }
        return this.#_stakeRoles;
    }
    get ActiveWardRoles() { return ObjectUtils.filterByProperty(this.WardRoles, 'active', true); }
    get ActiveStakeRoles() { return ObjectUtils.filterByProperty(this.StakeRoles, 'active', true); }
    WardRoleById(id) { return ObjectUtils.filterBy(this.RoleById(id), 'level', 'ward'); }
    WardRoleByName(name) { return ObjectUtils.filterBy(this.RoleByName(name), 'level', 'ward'); }
    ActiveWardRoleById(id) { return ObjectUtils.filterBy(this.ActiveRoleById(id), 'level', 'ward'); }
    ActiveWardRoleByName(name) { return ObjectUtils.filterBy(this.ActiveRoleByName(name), 'level', 'ward'); }
    StakeRoleById(id) { return ObjectUtils.filterBy(this.RoleById(id), 'level', 'stake'); }
    StakeRoleByName(name) { return ObjectUtils.filterBy(this.RoleByName(name), 'level', 'stake'); }
    ActiveStakeRoleById(id) { return ObjectUtils.filterBy(this.ActiveRoleById(id), 'level', 'stake'); }
    ActiveStakeRoleByName(name) { return ObjectUtils.filterBy(this.ActiveRoleByName(name), 'level', 'stake'); }

    // ===== Ward/Stake Existence =====
    get HasWardRoles() { return ObjectUtils.hasAny(this.WardRoles); }
    get HasStakeRoles() { return ObjectUtils.hasAny(this.StakeRoles); }
    get HasActiveWardRoles() { return ObjectUtils.hasAny(this.ActiveWardRoles); }
    get HasActiveStakeRoles() { return ObjectUtils.hasAny(this.ActiveStakeRoles); }
    HasWardRoleById(id) { return ObjectUtils.hasAny(this.WardRoleById(id)); }
    HasWardRoleByName(name) { return ObjectUtils.hasAny(this.WardRoleByName(name)); }
    HasActiveWardRoleById(id) { return ObjectUtils.hasAny(this.ActiveWardRoleById(id)); }
    HasActiveWardRoleByName(name) { return ObjectUtils.hasAny(this.ActiveWardRoleByName(name)); }
    HasStakeRoleById(id) { return ObjectUtils.hasAny(this.StakeRoleById(id)); }
    HasStakeRoleByName(name) { return ObjectUtils.hasAny(this.StakeRoleByName(name)); }
    HasActiveStakeRoleById(id) { return ObjectUtils.hasAny(this.ActiveStakeRoleById(id)); }
    HasActiveStakeRoleByName(name) { return ObjectUtils.hasAny(this.ActiveStakeRoleByName(name)); }

    // ===== Ward/Stake ID/Name Accessors =====
    get WardRoleIds() { return this.WardRoles.map(role => role.id); }
    get WardRoleNames() { return this.WardRoles.map(role => role.name); }
    get StakeRoleIds() { return this.StakeRoles.map(role => role.id); }
    get StakeRoleNames() { return this.StakeRoles.map(role => role.name); }
    get ActiveWardRoleIds() { return this.ActiveWardRoles.map(role => role.id); }
    get ActiveWardRoleNames() { return this.ActiveWardRoles.map(role => role.name); }
    get ActiveStakeRoleIds() { return this.ActiveStakeRoles.map(role => role.id); }
    get ActiveStakeRoleNames() { return this.ActiveStakeRoles.map(role => role.name); }

    // ===== Ward/Stake ID/Name Lookups =====
    WardRoleNameById(id) { return this.WardRoleById(id).map(role => role.name); }
    WardRoleIdByName(name) { return this.WardRoleByName(name).map(role => role.id); }
    ActiveWardRoleNameById(id) { return this.ActiveWardRoleById(id).map(role => role.name); }
    ActiveWardRoleIdByName(name) { return this.ActiveWardRoleByName(name).map(role => role.id); }
    StakeRoleNameById(id) { return this.StakeRoleById(id).map(role => role.name); }
    StakeRoleIdByName(name) { return this.StakeRoleByName(name).map(role => role.id); }
    ActiveStakeRoleNameById(id) { return this.ActiveStakeRoleById(id).map(role => role.name); }
    ActiveStakeRoleIdByName(name) { return this.ActiveStakeRoleByName(name).map(role => role.id); }

}