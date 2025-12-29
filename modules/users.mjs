//TODO #01 review the roles module for optimizations of fast paths, performance, memory, consurrency, and API ergonomics, perform only 1 next indiviudal update at a time with any implementations that are required with it to maintain functionality for now for review that no functionality is lost verified with valid unit tests, add new unit tests for any new functionality.  when an update is verfied as passing all valid unit tests continue to the next optimization until there are no more optimizations possible.  to not go into a loop of adding and removing the same optimization in the same module.
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
//TODO #25 add callings scrape function to callings tab
//TODO #26 add members scrape function to users tab
//TODO #27 add schedule module integrate into the schedule tab
//TODO #28 add events module integrate into the schedule module
//TODO #29 first workflow is the calling pipeline
//TODO #30 second workflow is the sacrament talk pipeline
//TODO #31 third workflow is the sacrament prayers pipline
//TODO #32 forth workflow is the youth temple recommend pipline
//TODO #33 fifth workflow is the missing members pipline
//TODO #34 first repeat event schedule is ward council meeting
//TODO #35 second repeat event schedule is bishopric meeting
//TODO #36 third repeat event schedule is sacrament attendance count
//TODO #37 forth repeat event schedule is donation processing
//TODO #38 fifth repeat event schedule is expense review
//TODO #39 sixth repeat event schedule is tithing declaration
//TODO #40 seventh repeat event schedule is leadership youth training
//TODO #41 eighth repeat event schedule is leadership church funds training

import { Members } from "./members.mjs";
import { createStorageConfig } from "./objectUtils.mjs";

export class Users {
    // ===== Instance Accessors =====

    get Members() { return this.members; }
    get Org() {
        return this.members && this.members.Org ? this.members.Org : undefined;
    }
    get Callings() {
        return this.members && this.members.Roles && this.members.Roles.Callings ? this.members.Roles.Callings : undefined;
    }
    get Storage() {
        if (!this.Callings || !this.Callings.storage) {
            throw new Error("Callings instance or its storage is not set on Users.");
        }
        return this.Callings.storage;
    }
    get Users() { return this.users; }

    // ===== Constructor =====
    constructor() {
        this.users = undefined;
        this.members = undefined;
        this._cachedUsersDetails = null;
        this._cacheInvalidationKey = null;
    }

    // ===== Static Methods =====
    static CopyFromJSON(dataJSON) {
        const users = new Users();
        users.users = dataJSON.users;
        users.members = dataJSON.members ? Members.CopyFromJSON(dataJSON.members) : undefined;
        users.lastFetched = dataJSON.lastFetched;
        users._cachedUsersDetails = null;
        users._cacheInvalidationKey = null;
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
        destination._cachedUsersDetails = null;
        destination._cacheInvalidationKey = null;
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
        
        // Pre-create storage configs to avoid repeated object spreading
        const baseConfig = Users.StorageConfig;
        const cacheConfig = { ...baseConfig, cacheTtlMs: Users.UsersCacheExpireMS };
        const sessionConfig = { ...baseConfig, cacheTtlMs: null, sessionTtlMs: Users.UsersSessionExpireMS };
        const localConfig = { ...baseConfig, cacheTtlMs: null, sessionTtlMs: null, localTtlMs: Users.UsersLocalExpireMS };
        
        // 1. Try to get from cache
        let usersObj = await this.Storage.Get(Users.UsersFilename, cacheConfig);
        // 2. If not found, try session storage
        if (!usersObj) {
            usersObj = await this.Storage.Get(Users.UsersFilename, sessionConfig);
            if (usersObj && this.Storage.Cache && typeof this.Storage.Cache.Set === 'function') {
                this.Storage.Cache.Set(Users.UsersFilename, usersObj, Users.UsersCacheExpireMS);
            }
        }
        // 3. If still not found, try local storage
        if (!usersObj) {
            usersObj = await this.Storage.Get(Users.UsersFilename, localConfig);
            if (usersObj) {
                if (this.Storage.SessionStorage && typeof this.Storage.SessionStorage.Set === 'function') {
                    this.Storage.SessionStorage.Set(Users.UsersFilename, usersObj, Users.UsersSessionExpireMS);
                }
                if (this.Storage.Cache && typeof this.Storage.Cache.Set === 'function') {
                    this.Storage.Cache.Set(Users.UsersFilename, usersObj, Users.UsersCacheExpireMS);
                }
            }
        }
        // 4. If still not found, use GoogleDrive for read/write priority
        if (!usersObj && this.Storage && typeof this.Storage.Get === 'function' && this.Storage.constructor.name === 'GoogleDrive') {
            usersObj = await this.Storage.Get(Users.UsersFilename, baseConfig);
        }
        // 5. If still not found, fallback to GitHubDataObj for read-only
        if (!usersObj && this.Storage && typeof this.Storage._gitHubDataObj === 'object' && typeof this.Storage._gitHubDataObj.fetchJsonFile === 'function') {
            usersObj = await this.Storage._gitHubDataObj.fetchJsonFile(Users.UsersFilename);
        }
        this.users = usersObj ? usersObj : undefined;
        // Invalidate cache when data is fetched
        this._invalidateUsersDetailsCache();
    }

    // ===== Core Data Accessors =====
    get UserEntries() { return this.users?.users || []; }

    // ===== Cache Management =====
    _getCacheInvalidationKey() {
        // Generate a key based on the current state of users and members data
        const usersKey = this.users ? JSON.stringify(this.users.users) : 'null';
        const membersKey = this.members ? JSON.stringify(this.members.members) : 'null';
        return `${usersKey}:${membersKey}`;
    }

    _invalidateUsersDetailsCache() {
        this._cachedUsersDetails = null;
        this._cacheInvalidationKey = null;
    }

    async UsersDetails() {
        // Check if cache is valid
        const currentKey = this._getCacheInvalidationKey();
        if (this._cachedUsersDetails && this._cacheInvalidationKey === currentKey) {
            return this._cachedUsersDetails;
        }

        // Cache miss - recalculate
        const membersData = await this.members.MembersDetails();
        const result = this.UserEntries.map(user => {
            const member = membersData.find(member => member.memberNumber === user.memberNumber);
            
            // Fast path: if member found, use member data directly; otherwise use defaults
            if (member) {
                return {
                    memberNumber: member.memberNumber,
                    fullname: member.fullname,
                    titlelessFullname: member.titlelessFullname,
                    firstName: member.firstName,
                    middleName: member.middleName,
                    maidenName: member.maidenName,
                    maternalLastName: member.maternalLastName,
                    paternalLastName: member.paternalLastName,
                    maidenNameMaternal: member.maidenNameMaternal,
                    genderMale: member.genderMale,
                    gender: member.gender,
                    password: user.password,
                    email: member.email,
                    phone: member.phone,
                    callingIDs: member.callingIDs,
                    callingNames: member.callingNames,
                    callingHaveTitles: member.callingHaveTitles,
                    callingTitles: member.callingTitles,
                    callingTitleOrdinals: member.callingTitleOrdinals,
                    roleIDs: member.callingRoleIDs,
                    roleNames: member.callingRoleNames,
                    callingsActive: member.callingsActive,
                    allSubRoles: member.callingsAllSubRoles,
                    allSubRoleNames: member.callingsAllSubRoleNames,
                    subRoles: member.callingsSubRoles,
                    subRoleNames: member.callingsSubRoleNames,
                    levels: member.levels,
                    memberactive: member.active,
                    active: user.active,
                    stakeUnitNumber: member.stakeUnitNumber,
                    unitNumber: member.unitNumber,
                    stakeName: member.stakeName,
                    unitName: member.unitName,
                    unitType: member.unitType
                };
            } else {
                // No member found - return user data with defaults
                return {
                    memberNumber: user.memberNumber,
                    fullname: '',
                    titlelessFullname: '',
                    firstName: '',
                    middleName: '',
                    maidenName: '',
                    maternalLastName: '',
                    paternalLastName: '',
                    maidenNameMaternal: false,
                    genderMale: false,
                    gender: '',
                    password: user.password,
                    email: user.email,
                    phone: '',
                    callingIDs: [],
                    callingNames: [],
                    callingHaveTitles: [],
                    callingTitles: [],
                    callingTitleOrdinals: [],
                    roleIDs: [],
                    roleNames: [],
                    callingsActive: [],
                    allSubRoles: [],
                    allSubRoleNames: [],
                    subRoles: [],
                    subRoleNames: [],
                    levels: [],
                    memberactive: false,
                    active: user.active,
                    stakeUnitNumber: undefined,
                    unitNumber: undefined,
                    stakeName: '',
                    unitName: '',
                    unitType: ''
                };
            }
        });

        // Update cache
        this._cachedUsersDetails = result;
        this._cacheInvalidationKey = currentKey;

        return result;
    }

    // ===== Filtering and Lookup Methods =====
    async UserById(id) {
        const users = await this.UsersDetails();
        if (users.length === 0) return [];
        return users.filter(u => u.memberNumber === id || String(u.memberNumber) === String(id));
    }

    async UserByEmail(email) {
        const users = await this.UsersDetails();
        if (users.length === 0) return [];
        return users.filter(u => u.email === email);
    }

    get ActiveUsers() {
        if (!this.users || !Array.isArray(this.users.users)) return [];
        return this.users.users.filter(user => user.active === true);
    }

    async HasUserById(id) {
        const users = await this.UsersDetails();
        return users.some(u => u.memberNumber === id || String(u.memberNumber) === String(id));
    }

    async HasUserByEmail(email) {
        const users = await this.UsersDetails();
        return users.some(u => u.email === email);
    }
}