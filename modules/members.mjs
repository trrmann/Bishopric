
import { Roles } from "./roles.mjs";
import { Org } from "./org.mjs";
import { createStorageConfig } from "./objectUtils.mjs";

export class Members {
    #_membersDetails = null;
    // ===== Instance Accessors =====
    get Roles() { return this.roles; }
    get Callings() { return this.roles ? this.roles.Callings : undefined; }
    get Storage() {
        if (!this.roles || !this.roles.Callings || !this.roles.Callings.storage) {
            throw new Error("Callings instance or its storage is not set on Members.");
        }
        return this.roles.Callings.storage;
    }
    get Members() { return this.members; }
    get Org() { return this.org; }

    // ===== Constructor =====
    /**
     * Always use Members.Factory to ensure dependencies are ready before use.
     */
    constructor() {
        this.members = undefined;
        this.roles = undefined;
        this.org = undefined;
        this.#_membersDetails = null;
    }

    set members(val) {
        this._members = val;
        this.#_membersDetails = null;
    }
    get members() {
        return this._members;
    }
    set roles(val) {
        this._roles = val;
        this.#_membersDetails = null;
    }
    get roles() {
        return this._roles;
    }
    set org(val) {
        this._org = val;
        this.#_membersDetails = null;
    }
    get org() {
        return this._org;
    }

    // ===== Static Methods =====

    static CopyFromJSON(dataJSON) {
        const members = new Members();
        members.members = dataJSON.members;
        members.roles = dataJSON.roles ? Roles.CopyFromJSON(dataJSON.roles) : undefined;
        members.org = dataJSON.org ? Org.CopyFromJSON(dataJSON.org) : undefined;
        return members;
    }

    static CopyToJSON(instance) {
        return {
            members: instance.members,
            roles: instance.roles ? Roles.CopyToJSON(instance.roles) : undefined,
            org: instance.org ? Org.CopyToJSON(instance.org) : undefined
        };
    }

    static CopyFromObject(destination, source) {
        destination.members = source.members;
        if (destination.roles && source.roles) {
            Roles.CopyFromObject(destination.roles, source.roles);
        } else {
            destination.roles = source.roles;
        }
        if (destination.org && source.org) {
            Org.CopyFromObject(destination.org, source.org);
        } else {
            destination.org = source.org;
        }
    }

    /**
     * Async factory. Always use this to ensure roles, org, and storage are ready before use.
     * @param {Object} configuration
     * @returns {Promise<Members>}
     */
    static async Factory(configuration) {
        const members = new Members();
        members.roles = await Roles.Factory(configuration);
        members.org = await Org.Factory(configuration);
        await members.Fetch();
        return members;
    }

    // ===== File/Storage Accessors =====
    static get MembersFileBasename() { return "members"; }
    static get MembersFileExtension() { return "json"; }
    static get MembersFilename() { return `${Members.MembersFileBasename}.${Members.MembersFileExtension}`; }
    static get MembersCacheExpireMS() { return 1000 * 60 * 30; }
    static get MembersSessionExpireMS() { return 1000 * 60 * 60; }
    static get MembersLocalExpireMS() { return 1000 * 60 * 60 * 2; }
    static get StorageConfig() {
        return createStorageConfig({
            cacheTtlMs: Members.MembersCacheExpireMS,
            sessionTtlMs: Members.MembersSessionExpireMS,
            localTtlMs: Members.MembersLocalExpireMS
        });
    }

    // ===== Data Fetching =====

    async Fetch() {
        if (!this.Storage) {
            throw new Error("Storage is not available in Members. Ensure Roles and Callings are properly initialized.");
        }
        // 1. Try to get from cache
        let membersObj = await this.Storage.Get(Members.MembersFilename, { ...Members.StorageConfig, cacheTtlMs: Members.MembersCacheExpireMS });
        // 2. If not found, try session storage
        if (!membersObj) {
            membersObj = await this.Storage.Get(Members.MembersFilename, { ...Members.StorageConfig, cacheTtlMs: null, sessionTtlMs: Members.MembersSessionExpireMS });
            if (membersObj && this.Storage.Cache && typeof this.Storage.Cache.Set === 'function') {
                this.Storage.Cache.Set(Members.MembersFilename, membersObj, Members.MembersCacheExpireMS);
            }
        }
        // 3. If still not found, try local storage
        if (!membersObj) {
            membersObj = await this.Storage.Get(Members.MembersFilename, { ...Members.StorageConfig, cacheTtlMs: null, sessionTtlMs: null, localTtlMs: Members.MembersLocalExpireMS });
            if (membersObj) {
                if (this.Storage.SessionStorage && typeof this.Storage.SessionStorage.Set === 'function') {
                    this.Storage.SessionStorage.Set(Members.MembersFilename, membersObj, Members.MembersSessionExpireMS);
                }
                if (this.Storage.Cache && typeof this.Storage.Cache.Set === 'function') {
                    this.Storage.Cache.Set(Members.MembersFilename, membersObj, Members.MembersCacheExpireMS);
                }
            }
        }
        // 4. If still not found, use GoogleDrive for read/write priority
        if (!membersObj && this.Storage && typeof this.Storage.Get === 'function' && this.Storage.constructor.name === 'GoogleDrive') {
            membersObj = await this.Storage.Get(Members.MembersFilename, { ...Members.StorageConfig });
        }
        // 5. If still not found, fallback to GitHubDataObj for read-only
        if (!membersObj && this.Storage && typeof this.Storage._gitHubDataObj === 'object' && typeof this.Storage._gitHubDataObj.fetchJsonFile === 'function') {
            membersObj = await this.Storage._gitHubDataObj.fetchJsonFile(Members.MembersFilename);
        }
        this.members = membersObj ? membersObj : undefined;
    }

    // ===== Core Data Accessors =====
    get MemberEntries() { return this.members?.members || []; }

    async MembersDetails() {
        if (this.#_membersDetails) return this.#_membersDetails;
        const callings = this.roles && this.roles.Callings ? this.roles.Callings.CallingsDetails : undefined;
        const roles = this.roles ? this.roles.RolesDetails : undefined;
        const org = this.org ? this.org.Organization : undefined;
        const memberEntries = this.MemberEntries;
        this.#_membersDetails = memberEntries.map(member => {
            // ...existing code for mapping members...
            // Allow members with no callings
            const memberCallings = Array.isArray(member.callings) ? member.callings : [];
            const callingsResolved = memberCallings.length > 0 && this.roles && this.roles.Callings ? memberCallings.filter(callingid => this.roles.Callings.CallingIds.includes(callingid)).map(callingid => this.roles.Callings.CallingById(callingid)) : [];
            const callingNames = callingsResolved.length > 0 ? callingsResolved.map(callingArr => (callingArr && callingArr[0]) ? callingArr[0].name : null) : [];
            const callingLevels = callingsResolved.length > 0 ? callingsResolved.map(callingArr => (callingArr && callingArr[0]) ? callingArr[0].level : null) : [];
            const callingsActive = callingsResolved.length > 0 ? callingsResolved.map(callingArr => (callingArr && callingArr[0]) ? callingArr[0].active === true : false) : [];
            const callingHaveTitles = callingsResolved.length > 0 ? callingsResolved.map(callingArr => (callingArr && callingArr[0]) ? callingArr[0].hasTitle : null) : [];
            const callingTitles = callingsResolved.length > 0 ? callingsResolved.map(callingArr => (callingArr && callingArr[0]) ? callingArr[0].title : null) : [];
            const callingTitleOrdinals = callingsResolved.length > 0 ? callingsResolved.map(callingArr => (callingArr && callingArr[0]) ? callingArr[0].titleOrdinal : null) : [];
            // Add callings-role-id: single array of unique role ids for all callings
            const rawCallingsRoles = callingsResolved.length > 0
                ? callingsResolved.map(callingArr => {return roles.filter(function(r){return callingArr.map(call => {return call.id;}).includes(r.callingID);});})
                    .filter(role => {return role !== null && role !== undefined;})
                : [];
            const callingsRoles = [];
            if (rawCallingsRoles.length > 0) {
                rawCallingsRoles.forEach(roleArray => {roleArray.forEach(role => {if(!callingsRoles.includes(role)) {callingsRoles.push(role);}})});
            }
            const callingsRoleId = callingsRoles.length > 0 ? callingsRoles.map(role => {return role.id;}) : [];
            const callingsRoleName = callingsRoles.length > 0 ? callingsRoles.map(role => {return role.name;}) : [];
            const callingSubRoles = callingsRoleId.length > 0 ? callingsRoleId.map(callingRoleId => {
                const role = roles.filter(role => {return role.id === callingRoleId})[0];
                return role ? role.subRoles : undefined;
            }) : [];
            const callingSubRoleNames = callingsRoleId.length > 0 ? callingsRoleId.map(callingRoleId => {
                const role = roles.filter(role => {return role.id === callingRoleId})[0];
                return role ? role.subRoleNames : undefined;
            }) : [];
            const callingAllSubRoles = callingsRoleId.length > 0 ? callingsRoleId.map(callingRoleId => {
                const role = roles.filter(role => {return role.id === callingRoleId})[0];
                return role ? role.allSubRoles : undefined;
            }) : [];
            const callingAllSubRoleNames = callingsRoleId.length > 0 ? callingsRoleId.map(callingRoleId => {
                const role = roles.filter(role => {return role.id === callingRoleId})[0];
                return role ? role.allSubRoleNames : undefined;
            }) : [];

            // Build full name with title or default prefix
            let prefix = null;
            // Find the calling title with the lowest non-null ordinal
            let minOrdinal = null;
            let selectedTitle = null;
            for (let i = 0; i < callingTitles.length; i++) {
                const title = callingTitles[i];
                const ordinal = callingTitleOrdinals[i];
                if (title && title.trim() && ordinal !== null && ordinal !== undefined) {
                    if (minOrdinal === null || ordinal < minOrdinal) {
                        minOrdinal = ordinal;
                        selectedTitle = title;
                    }
                }
            }
            // If no ordinal-based title, fallback to first non-empty title
            if (!selectedTitle) {
                selectedTitle = callingTitles.find(t => t && t.trim());
            }
            if (selectedTitle) {
                prefix = selectedTitle;
            } else {
                prefix = (member.genderMale === true) ? "Brother" : "Sister";
            }
            const nameParts = [];
            if (member.firstName) nameParts.push(member.firstName);
            if (member.middleName) nameParts.push(member.middleName);
            if (member.maidenName && member.genderMale === false) nameParts.push(member.maidenName);
            if (member.maternalLastName) nameParts.push(member.maternalLastName);
            if (member.paternalLastName) nameParts.push(member.paternalLastName);
            const fullname = [prefix, ...nameParts.filter(Boolean)].join(' ');
            // Titleless full name (no prefix/title)
            const titlelessFullname = nameParts.filter(Boolean).join(' ');

            const stake = this.org.StakeByUnitNumber(member.stakeUnitNumber);
            const unit = this.org.UnitByNumber(member.unitNumber);
            const stakeName = stake ? stake.name : '';
            const unitName = unit ? unit.name : '';
            const unitType = unit ? unit.type : '';

            return {
                memberNumber: member.memberNumber,
                fullname: fullname,
                titlelessFullname: titlelessFullname,
                firstName: member.firstName,
                middleName: member.middleName,
                maidenName: member.maidenName,
                maternalLastName: member.maternalLastName,
                paternalLastName: member.paternalLastName,
                maidenNameMaternal: member.maidenNameMaternal,
                genderMale: member.genderMale,
                gender: member.genderMale === true ? "Male" : "Female",
                email: member.email,
                phone: member.phone,
                callingIDs: member.callings,
                callingNames: callingNames,
                levels: callingLevels,
                callingsActive: callingsActive,
                callingHaveTitles: callingHaveTitles,
                callingTitles: callingTitles,
                callingTitleOrdinals: callingTitleOrdinals,
                callingRoleIDs: callingsRoleId,
                callingRoleNames: callingsRoleName,
                callingsSubRoles: callingSubRoles,
                callingsSubRoleNames: callingSubRoleNames,
                callingsAllSubRoles: callingAllSubRoles,
                callingsAllSubRoleNames: callingAllSubRoleNames,
                active: member.active,
                stakeUnitNumber: member.stakeUnitNumber,
                unitNumber: member.unitNumber,
                stakeName: stakeName,
                unitName: unitName,
                unitType: unitType
            };
        });
        return this.#_membersDetails;
    }

    // ===== Leadership Lookups =====
    static GetStakeLeadership(orgInstance, stakeUnitNumber) {
        if (!orgInstance || typeof orgInstance.StakeByUnitNumber !== 'function') return null;
        const stake = orgInstance.StakeByUnitNumber(stakeUnitNumber);
        return stake && stake.leadership ? stake.leadership : null;
    }

    static GetWardLeadership(orgInstance, wardUnitNumber) {
        if (!orgInstance || typeof orgInstance.WardByNumber !== 'function') return null;
        const ward = orgInstance.WardByNumber(wardUnitNumber);
        return ward && ward.leadership ? ward.leadership : null;
    }
}