import { Callings } from "./callings.mjs";
export class Roles {

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
    constructor() {
        this.callings = undefined;
        this.roles = undefined;
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
        return {
            cacheTtlMs: Roles.RolesCacheExpireMS,
            sessionTtlMs: Roles.RolesSessionExpireMS,
            localTtlMs: Roles.RolesLocalExpireMS,
            googleId: null,
            githubFilename: null,
            privateKey: null,
            publicKey: null,
            secure: false
        };
    }

    // ===== Data Fetching =====
    async Fetch() {
        // Always use storage from Callings accessor
        if (!this.Callings || !this.Callings.storage) {
            throw new Error("Callings instance or its storage is not set on Roles.");
        }
        let rolesObj = await this.Callings.storage.Get(Roles.RolesFilename, Roles.StorageConfig);
        this.roles = rolesObj ? rolesObj : undefined;
    }

    // ===== Core Data Accessors =====
    get RolesEntries() { return this.roles?.roles || []; }
    get RolesDetails() {
        const entries = this.RolesEntries;
        return entries.map(role => {
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
    RoleEntryById(id) { return this.RolesEntries.filter(role => role.id === id); }
    RoleById(id) { return this.RolesDetails.filter(role => role.id === id); }
    RoleByName(name) { return this.RolesDetails.filter(role => role.name === name); }
    RolesByCalling(callingId) { return this.RolesDetails.filter(role => role.callingID === callingId); }
    ActiveRoleById(id) { return this.RoleById(id).filter(role => role.active === true); }
    ActiveRoleByName(name) { return this.RoleByName(name).filter(role => role.active === true); }
    ActiveRolesByCalling(callingId) { return this.RolesByCalling(callingId).filter(role => role.active === true); }

    // ===== Existence Accessors =====
    get HasRoles() { return this.RolesDetails.length > 0; }
    get HasActiveRoles() { return this.ActiveRoles.length > 0; }

    // ===== Existence Lookups =====
    HasRoleById(id) { return this.RoleById(id).length > 0; }
    HasRoleByName(name) { return this.RoleByName(name).length > 0; }
    HasRolesByCalling(callingId) { return this.RolesByCalling(callingId).length > 0; }
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

    // ===== Ward/Stake Filtering =====
    get WardRoles() { return this.RolesDetails.filter(role => role.level === "ward"); }
    get StakeRoles() { return this.RolesDetails.filter(role => role.level === "stake"); }
    get ActiveWardRoles() { return this.WardRoles.filter(role => role.active === true); }
    get ActiveStakeRoles() { return this.StakeRoles.filter(role => role.active === true); }
    WardRoleById(id) { return this.RoleById(id).filter(role => role.level === "ward"); }
    WardRoleByName(name) { return this.RoleByName(name).filter(role => role.level === "ward"); }
    ActiveWardRoleById(id) { return this.ActiveRoleById(id).filter(role => role.level === "ward"); }
    ActiveWardRoleByName(name) { return this.ActiveRoleByName(name).filter(role => role.level === "ward"); }
    StakeRoleById(id) { return this.RoleById(id).filter(role => role.level === "stake"); }
    StakeRoleByName(name) { return this.RoleByName(name).filter(role => role.level === "stake"); }
    ActiveStakeRoleById(id) { return this.ActiveRoleById(id).filter(role => role.level === "stake"); }
    ActiveStakeRoleByName(name) { return this.ActiveRoleByName(name).filter(role => role.level === "stake"); }

    // ===== Ward/Stake Existence =====
    get HasWardRoles() { return this.WardRoles.length > 0; }
    get HasStakeRoles() { return this.StakeRoles.length > 0; }
    get HasActiveWardRoles() { return this.ActiveWardRoles.length > 0; }
    get HasActiveStakeRoles() { return this.ActiveStakeRoles.length > 0; }
    HasWardRoleById(id) { return this.WardRoleById(id).length > 0; }
    HasWardRoleByName(name) { return this.WardRoleByName(name).length > 0; }
    HasActiveWardRoleById(id) { return this.ActiveWardRoleById(id).length > 0; }
    HasActiveWardRoleByName(name) { return this.ActiveWardRoleByName(name).length > 0; }
    HasStakeRoleById(id) { return this.StakeRoleById(id).length > 0; }
    HasStakeRoleByName(name) { return this.StakeRoleByName(name).length > 0; }
    HasActiveStakeRoleById(id) { return this.ActiveStakeRoleById(id).length > 0; }
    HasActiveStakeRoleByName(name) { return this.ActiveStakeRoleByName(name).length > 0; }

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