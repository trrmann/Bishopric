//TODO #02 review the members module for optimizations of fast paths, performance, memory, consurrency, and API ergonomics, perform only 1 next indiviudal update at a time with any implementations that are required with it to maintain functionality for now for review that no functionality is lost verified with valid unit tests, add new unit tests for any new functionality.  when an update is verfied as passing all valid unit tests continue to the next optimization until there are no more optimizations possible.  to not go into a loop of adding and removing the same optimization in the same module.
//TODO #03 review the users module for optimizations of fast paths, performance, memory, consurrency, and API ergonomics, perform only 1 next indiviudal update at a time with any implementations that are required with it to maintain functionality for now for review that no functionality is lost verified with valid unit tests, add new unit tests for any new functionality.  when an update is verfied as passing all valid unit tests continue to the next optimization until there are no more optimizations possible.  to not go into a loop of adding and removing the same optimization in the same module.
//TODO #04 review the auth module for optimizations of fast paths, performance, memory, consurrency, and API ergonomics, perform only 1 next indiviudal update at a time with any implementations that are required with it to maintain functionality for now for review that no functionality is lost verified with valid unit tests, add new unit tests for any new functionality.  when an update is verfied as passing all valid unit tests continue to the next optimization until there are no more optimizations possible.  to not go into a loop of adding and removing the same optimization in the same module.
//TODO #05 review the site module for optimizations of fast paths, performance, memory, consurrency, and API ergonomics, perform only 1 next indiviudal update at a time with any implementations that are required with it to maintain functionality for now for review that no functionality is lost verified with valid unit tests, add new unit tests for any new functionality.  when an update is verfied as passing all valid unit tests continue to the next optimization until there are no more optimizations possible.  to not go into a loop of adding and removing the same optimization in the same module.
//TODO #06 read the additional roles from the users record
//TODO #07 validate the additional roles do not have a calling associated with them
//TODO #08 add additional roles to the roleIDs in the userDetails output
//TODO #09 add additional roles to the roleNames in the userDetails output
//TODO #10 ensure the additional roles are available in the role selector on the dashboard
//TODO #11 add configuration tab for system admin, developer and tester
//TODO #12 add organization tab for system admin, developer and tester
//TODO #13 add callings tab for system admin, developer and tester
//TODO #14 add roles tab for system admin, developer and tester
//TODO #15 add users tab for system admin, developer and tester
//TODO #16 add testing tab for developer and tester
//TODO #17 add reset cache/storage functions to testing tab and add full use of these cache tiers to the entire site
//TODO #18 add export / import to configuration, callings, roles, users (users and members) tabs
//TODO #19 add role rights to the new tabs
//TODO #20 add save functions to the special tabs
//TODO #21 add encryption rekey function to configuration tab
//TODO #22 add cloud store migration function to configuration tab
//TODO #23 add workflows / schedule template tab for system admin
//TODO #24 add tasks module - integrate into assignments tab
//TODO #25 add church authentication - field to user for church username and church password and a call to authenticate against the church auth services.
//TODO #26 add callings scrape function to callings tab
//TODO #27 add members scrape function to users tab
//TODO #28 add schedule module integrate into the schedule tab
//TODO #29 add events module integrate into the schedule module
//TODO #30 first workflow is the calling pipeline
//TODO #31 second workflow is the sacrament talk pipeline
//TODO #32 third workflow is the sacrament prayers pipline
//TODO #33 forth workflow is the youth temple recommend pipline
//TODO #34 fifth workflow is the missing members pipline
//TODO #35 first repeat event schedule is ward council meeting
//TODO #36 second repeat event schedule is bishopric meeting
//TODO #37 third repeat event schedule is sacrament attendance count
//TODO #38 forth repeat event schedule is donation processing
//TODO #39 fifth repeat event schedule is expense review
//TODO #40 sixth repeat event schedule is tithing declaration
//TODO #41 seventh repeat event schedule is leadership youth training
//TODO #42 eighth repeat event schedule is leadership church funds training

import { Members } from "./members.mjs";
import { createStorageConfig } from "./objectUtils.mjs";

export class Users {
    #_usersDetailsCache = undefined;
    // ===== Instance Accessors =====

    /**
     * Always use Users.Factory to ensure dependencies are ready before use.
     */
    // (Constructor is defined below, only one allowed per class)

    /**
     * Async factory. Always use this to ensure members, roles, org, and storage are ready before use.
     * @param {Object} configuration
     * @returns {Promise<Users>}
     */
    static async Factory(configuration) {
        const users = new Users();
        users.members = await Members.Factory(configuration);
        await users.Fetch?.();
        return users;
    }

    /**
     * Explicitly invalidates the cached users details. Call this after any mutation to users or members data.
     * This ensures that UsersDetails() returns up-to-date information.
     */
    InvalidateUsersDetailsCache() {
        this.#_usersDetailsCache = undefined;
    }

    get Members() { return this.members; }
    set Members(val) {
        // If val.members is an array, wrap it in a Proxy to auto-invalidate cache on mutation
        if (val && Array.isArray(val.members)) {
            const self = this;
            val.members = new Proxy(val.members, {
                set(target, prop, value, receiver) {
                    if (typeof prop === "string" && !isNaN(prop)) {
                        self.InvalidateUsersDetailsCache();
                    }
                    return Reflect.set(target, prop, value, receiver);
                },
                deleteProperty(target, prop) {
                    if (typeof prop === "string" && !isNaN(prop)) {
                        self.InvalidateUsersDetailsCache();
                    }
                    return Reflect.deleteProperty(target, prop);
                }
            });
        }
        this.members = val;
        this.#_usersDetailsCache = undefined;
    }
    get Org() {
        return this.members && this.members.Org ? this.members.Org : undefined;
    }
    get Callings() {
        return this.members && this.members.Roles && this.members.Roles.Callings ? this.members.Roles.Callings : undefined;
    }
    get Storage() {
        // Allow test injection of storage
        if (this.hasOwnProperty('_testStorage')) {
            if (!this._testStorage) {
                throw new Error("Storage is not available in Users. Ensure Members, Roles, and Callings are properly initialized.");
            }
            return this._testStorage;
        }
        if (!this.Callings || !this.Callings.storage) {
            throw new Error("Callings instance or its storage is not set on Users.");
        }
        return this.Callings.storage;
    }
    set Storage(val) {
        // Allow test injection of storage
        this._testStorage = val;
    }
    get Users() { return this.users; }
    set Users(val) {
        // If val.users is an array, wrap it in a Proxy to auto-invalidate cache on mutation
        if (val && Array.isArray(val.users)) {
            const self = this;
            val.users = new Proxy(val.users, {
                set(target, prop, value, receiver) {
                    // Only invalidate cache for mutating operations (not length reads, etc.)
                    if (typeof prop === "string" && !isNaN(prop)) {
                        self.InvalidateUsersDetailsCache();
                    }
                    return Reflect.set(target, prop, value, receiver);
                },
                deleteProperty(target, prop) {
                    if (typeof prop === "string" && !isNaN(prop)) {
                        self.InvalidateUsersDetailsCache();
                    }
                    return Reflect.deleteProperty(target, prop);
                }
            });
        }
        this.users = val;
        this.#_usersDetailsCache = undefined;
    }

    /**
     * Read-only accessor for additional roles from the users record, filtered to exclude roles with callings.
     * Returns an array of objects: { memberNumber, additionalRoles }
     * where additionalRoles is an array of role IDs/names (as stored in user.additionalRoles),
     * but only those roles that do NOT have a calling associated with them.
     */
    get AdditionalRoles() {
        if (!this.users || !Array.isArray(this.users.users)) return [];
        // Get set of role IDs/names that have callings associated with them
        // Assumes this.Callings and this.Callings.rolesWithCallings is an array of role IDs/names
        // If not available, fallback to empty set (no filtering)
        let rolesWithCallings = [];
        if (this.Callings && Array.isArray(this.Callings.rolesWithCallings)) {
            rolesWithCallings = this.Callings.rolesWithCallings;
        } else if (this.members && this.members.Roles && Array.isArray(this.members.Roles.rolesWithCallings)) {
            rolesWithCallings = this.members.Roles.rolesWithCallings;
        }
        const rolesWithCallingsSet = new Set(rolesWithCallings);
        return this.users.users
            .filter(user => Array.isArray(user.additionalRoles) && user.additionalRoles.length > 0)
            .map(user => {
                const filteredRoles = user.additionalRoles.filter(role => !rolesWithCallingsSet.has(role));
                return {
                    memberNumber: user.memberNumber,
                    additionalRoles: filteredRoles
                };
            })
            .filter(user => user.additionalRoles.length > 0);
    }

    // ===== Constructor =====
    constructor() {
        this.users = undefined;
        this.members = undefined;
    }

    // ===== Static Methods =====
    static CopyFromJSON(dataJSON) {
        const users = new Users();
        users.users = dataJSON.users;
        users.members = dataJSON.members ? Members.CopyFromJSON(dataJSON.members) : undefined;
        users.lastFetched = dataJSON.lastFetched;
        return users;
    }

    static CopyToJSON(instance) {
        return {
            users: instance.users,
            members: instance.members ? Members.CopyToJSON(instance.members) : undefined,
            lastFetched: instance.lastFetched
        };
    }

    static CopyFromObject(destination, source) {
        destination.users = source.users;
        if (destination.members && source.members) {
            Members.CopyFromObject(destination.members, source.members);
        } else {
            destination.members = source.members;
        }
        destination.lastFetched = source.lastFetched;
    }

    static async Factory(configuration) {
        const users = new Users();
        users.members = await Members.Factory(configuration);
        await users.Fetch();
        return users;
    }

    // ===== File/Storage Accessors =====
    static get UsersFileBasename() { return "users"; }
    static get UsersFileExtension() { return "json"; }
    static get UsersFilename() { return `${Users.UsersFileBasename}.${Users.UsersFileExtension}`; }
    static get UsersCacheExpireMS() { return 1000 * 60 * 30; }
    static get UsersSessionExpireMS() { return 1000 * 60 * 60; }
    static get UsersLocalExpireMS() { return 1000 * 60 * 60 * 2; }
    static get StorageConfig() {
        return createStorageConfig({
            cacheTtlMs: Users.UsersCacheExpireMS,
            sessionTtlMs: Users.UsersSessionExpireMS,
            localTtlMs: Users.UsersLocalExpireMS
        });
    }

    // ===== Data Fetching =====
    async Fetch() {
        if (!this.Storage) {
            throw new Error("Storage is not available in Users. Ensure Members, Roles, and Callings are properly initialized.");
        }
        let usersObj = await this.Storage.Get(Users.UsersFilename, { ...Users.StorageConfig, cacheTtlMs: Users.UsersCacheExpireMS });
        // If not found in cache, try session
        if (!usersObj) {
            usersObj = await this.Storage.Get(Users.UsersFilename, { ...Users.StorageConfig, cacheTtlMs: null, sessionTtlMs: Users.UsersSessionExpireMS });
            // If found in session, only write to cache if not already present
            if (usersObj && this.Storage.Cache && typeof this.Storage.Cache.Set === 'function') {
                let cacheVal;
                if (this.Storage.Cache.Get) {
                    cacheVal = this.Storage.Cache.Get(Users.UsersFilename);
                    if (cacheVal instanceof Promise) cacheVal = await cacheVal;
                }
                if (!cacheVal) {
                    this.Storage.Cache.Set(Users.UsersFilename, usersObj, Users.UsersCacheExpireMS);
                }
            }
        }
        // If not found in cache/session, try local
        if (!usersObj) {
            usersObj = await this.Storage.Get(Users.UsersFilename, { ...Users.StorageConfig, cacheTtlMs: null, sessionTtlMs: null, localTtlMs: Users.UsersLocalExpireMS });
            // If found in local, only write to session/cache if not already present
            if (usersObj) {
                if (this.Storage.SessionStorage && typeof this.Storage.SessionStorage.Set === 'function') {
                    let sessionVal;
                    if (this.Storage.SessionStorage.Get) {
                        sessionVal = this.Storage.SessionStorage.Get(Users.UsersFilename);
                        if (sessionVal instanceof Promise) sessionVal = await sessionVal;
                    }
                    if (!sessionVal) {
                        this.Storage.SessionStorage.Set(Users.UsersFilename, usersObj, Users.UsersSessionExpireMS);
                    }
                }
                if (this.Storage.Cache && typeof this.Storage.Cache.Set === 'function') {
                    let cacheVal;
                    if (this.Storage.Cache.Get) {
                        cacheVal = this.Storage.Cache.Get(Users.UsersFilename);
                        if (cacheVal instanceof Promise) cacheVal = await cacheVal;
                    }
                    if (!cacheVal) {
                        this.Storage.Cache.Set(Users.UsersFilename, usersObj, Users.UsersCacheExpireMS);
                    }
                }
            }
        }
        // If not found in any local tier, try GoogleDrive
        if (!usersObj && this.Storage && typeof this.Storage.Get === 'function' && this.Storage.constructor.name === 'GoogleDrive') {
            usersObj = await this.Storage.Get(Users.UsersFilename, { ...Users.StorageConfig });
        }
        // If not found in GoogleDrive, try GitHubDataObj (read-only)
        if (!usersObj && this.Storage && typeof this.Storage._gitHubDataObj === 'object' && typeof this.Storage._gitHubDataObj.fetchJsonFile === 'function') {
            usersObj = await this.Storage._gitHubDataObj.fetchJsonFile(Users.UsersFilename);
        }
        this.users = usersObj ? usersObj : undefined;
    }

    // ===== Core Data Accessors =====
    get UserEntries() { return this.users?.users || []; }

    /**
     * Returns merged user/member details. Do not mutate the returned array or objects.
     * All mutating operations must call InvalidateUsersDetailsCache().
     * In development mode, the returned array and objects are frozen to catch accidental mutation.
     */
    async UsersDetails() {
        if (this.#_usersDetailsCache) {
            return this.#_usersDetailsCache;
        }
        const userEntries = this.UserEntries;
        if (!userEntries || userEntries.length === 0) {
            // In development, freeze the empty array
            let details = [];
            if (typeof process !== "undefined" && process.env && process.env.NODE_ENV === "development") {
                Object.freeze(details);
            }
            this.#_usersDetailsCache = details;
            return details;
        }
        const membersData = await this.members.MembersDetails();
        // Only build additionalRolesMap if there are additional roles
        let additionalRolesMap = undefined;
        const additionalRolesArr = this.AdditionalRoles;
        if (additionalRolesArr.length > 0) {
            additionalRolesMap = {};
            additionalRolesArr.forEach(({ memberNumber, additionalRoles }) => {
                additionalRolesMap[memberNumber] = additionalRoles;
            });
        }
        // Only build roleIdToName if there are roles
        let roleIdToName = undefined;
        if (this.members && this.members.Roles && Array.isArray(this.members.Roles.roles) && this.members.Roles.roles.length > 0) {
            roleIdToName = {};
            for (const role of this.members.Roles.roles) {
                if (role && role.id != null && role.name != null) {
                    roleIdToName[role.id] = role.name;
                }
            }
        }
        const details = userEntries.map(user => {
            const member = membersData.find(member => member.memberNumber === user.memberNumber);
            // Merge roleIDs: member.callingRoleIDs + additionalRoles (if any, deduped)
            const memberRoleIDs = member ? (Array.isArray(member.callingRoleIDs) ? member.callingRoleIDs : []) : [];
            const addRoles = (additionalRolesMap && Array.isArray(additionalRolesMap[user.memberNumber])) ? additionalRolesMap[user.memberNumber] : [];
            // Merge and dedupe
            const roleIDs = Array.from(new Set([...memberRoleIDs, ...addRoles]));
            // Merge roleNames: member.callingRoleNames + additionalRoleNames (if any, deduped)
            const memberRoleNames = member ? (Array.isArray(member.callingRoleNames) ? member.callingRoleNames : []) : [];
            const addRoleNames = (roleIdToName && addRoles.length > 0)
                ? addRoles.map(roleId => roleIdToName[roleId]).filter(name => name && !memberRoleNames.includes(name))
                : [];
            const roleNames = Array.from(new Set([...memberRoleNames, ...addRoleNames]));
            return {
                memberNumber: member ? member.memberNumber : user.memberNumber,
                fullname: member ? member.fullname : '',
                titlelessFullname: member ? member.titlelessFullname : '',
                firstName: member ? member.firstName : '',
                middleName: member ? member.middleName : '',
                maidenName: member ? member.maidenName : '',
                maternalLastName: member ? member.maternalLastName : '',
                paternalLastName: member ? member.paternalLastName : '',
                maidenNameMaternal: member ? member.maidenNameMaternal : false,
                genderMale: member ? member.genderMale : false,
                gender: member ? member.gender : '',
                password: user.password,
                email: member ? member.email : user.email,
                phone: member ? member.phone : '',
                callingIDs: member ? member.callingIDs : [],
                callingNames: member ? member.callingNames : [],
                callingHaveTitles: member ? member.callingHaveTitles : [],
                callingTitles: member ? member.callingTitles : [],
                callingTitleOrdinals: member ? member.callingTitleOrdinals : [],
                roleIDs,
                roleNames,
                callingsActive: member ? member.callingsActive : [],
                allSubRoles: member ? member.callingsAllSubRoles : [],
                allSubRoleNames: member ? member.callingsAllSubRoleNames : [],
                subRoles: member ? member.callingsSubRoles : [],
                subRoleNames: member ? member.callingsSubRoleNames : [],
                levels: member ? member.levels : [],
                memberactive: member ? member.active : false,
                active: user.active,
                stakeUnitNumber: member ? member.stakeUnitNumber : undefined,
                unitNumber: member ? member.unitNumber : undefined,
                stakeName: member ? member.stakeName : '',
                unitName: member ? member.unitName : '',
                unitType: member ? member.unitType : ''
            };
        });
        // In development, freeze the array and its objects ONCE, immediately after caching
        if (typeof process !== "undefined" && process.env && process.env.NODE_ENV === "development") {
            details.forEach(obj => Object.freeze(obj));
            Object.freeze(details);
        }
        this.#_usersDetailsCache = details;
        return details;
    }

    // ===== Filtering and Lookup Methods =====
    /**
     * Returns the user object for the given id, or null if not found.
     */
    async UserById(id) {
        const users = await this.UsersDetails();
        return users.find(u => u.memberNumber === id || String(u.memberNumber) === String(id)) || null;
    }

    /**
     * Returns the user object for the given email, or null if not found.
     */
    async UserByEmail(email) {
        const users = await this.UsersDetails();
        return users.find(u => u.email === email) || null;
    }

    get ActiveUsers() {
        if (!this.users || !Array.isArray(this.users.users)) return [];
        return this.users.users.filter(user => user.active === true);
    }

    async HasUserById(id) {
        const userById = await this.UserById(id);
        return userById !== null;
    }

    async HasUserByEmail(email) {
        const userByEmail = await this.UserByEmail(email);
        return userByEmail !== null;
    }

    /**
     * Returns merged user details (like UsersDetails) for only active users.
     */
    async ActiveUserDetails() {
        const all = await this.UsersDetails();
        return all.filter(u => u.active === true);
    }
}