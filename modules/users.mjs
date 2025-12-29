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
        // 1. Try to get from cache
        let usersObj = await this.Storage.Get(Users.UsersFilename, { ...Users.StorageConfig, cacheTtlMs: Users.UsersCacheExpireMS });
        // 2. If not found, fetch from persistent storage (simulate by re-calling Get with no cacheTtlMs)
        if (!usersObj) {
            usersObj = await this.Storage.Get(Users.UsersFilename, { ...Users.StorageConfig, cacheTtlMs: null });
            // If found, set in cache for future use
            if (usersObj && this.Storage.Cache && typeof this.Storage.Cache.Set === 'function') {
                this.Storage.Cache.Set(Users.UsersFilename, usersObj, Users.UsersCacheExpireMS);
            }
        }
        this.users = usersObj ? usersObj : undefined;
    }

    // ===== Core Data Accessors =====
    get UserEntries() { return this.users?.users || []; }

    async UsersDetails() {
        const membersData = await this.members.MembersDetails();
        return this.UserEntries.map(user => {
            const member = membersData.find(member => member.memberNumber === user.memberNumber);
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
                roleIDs: member ? member.callingRoleIDs : [],
                roleNames: member ? member.callingRoleNames : [],
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
    }

    // ===== Filtering and Lookup Methods =====
    async UserById(id) {
        const users = await this.UsersDetails();
        return users.filter(u => u.memberNumber === id || String(u.memberNumber) === String(id));
    }

    async UserByEmail(email) {
        const users = await this.UsersDetails();
        return users.filter(u => u.email === email);
    }

    get ActiveUsers() {
        if (!this.users || !Array.isArray(this.users.users)) return [];
        return this.users.users.filter(user => user.active === true);
    }

    async HasUserById(id) {
        const userById = await this.UserById(id);
        return (userById !== null && userById.length > 0);
    }

    async HasUserByEmail(email) {
        const userByEmail = await this.UserByEmail(email);
        return (userByEmail !== null && userByEmail.length > 0);
    }
}