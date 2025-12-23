import { Roles } from "./roles.mjs";
import { Org } from "./org.mjs";
export class Members{
    static local = true;
    constructor(config) {
        this._storageObj = config._storageObj;
        this.members = null;
        this.roles = undefined;
        this.callings = undefined;
        this.org = undefined;
    }
    static CopyFromJSON(dataJSON) {
        this._storageObj = dataJSON._storageObj;
        this.members = dataJSON.members;
        this.callings = dataJSON.callings;
        this.roles = dataJSON.roles;
        this.org = dataJSON.org;
    }
    static CopyFromObject(destination, source) {
        destination._storageObj = source._storageObj;
        destination.members = source.members;
        destination.callings = source.callings;
        destination.roles = source.roles;
        destination.org = source.org;
    }
    static async Factory(config) {
        const members = new Members(await config);
        await members.Fetch();
        members.roles = await Roles.Factory(config);
        members.callings = await members.roles.callings;
        members.org = await Org.Factory(config);
        return members;
    }
    GetMembersFilename() {
        const file = "members.json";
        return file;
    }
    GetMembersExpireMS() {
        return 1000 * 60 * 60 * 1;// 1 hour
    }
    GetStorageConfig() {
        return { cacheTtlMs: null, sessionTtlMs: null, localTtlMs: null, googleId: null, githubFilename: null, privateKey: null, publicKey: null, secure: false };
    }
    async Fetch() {
        // Try to get from storage (cache/session/local/google/github)
        let membersObj = await this._storageObj.Get(this.GetMembersFilename(), this.GetStorageConfig());
        if (membersObj) {
            this.members = membersObj;
        } else {
            // If not found, fallback to empty
            this.members = undefined;
        }
    }
    GetMemberEntries(){
        // Ensure cache is built
        return this.members.members;
    }
    async GetMembers() {
        // Use cached array and minimize repeated lookups
        const callings = await this.callings.GetCallings();
        const roles = await this.roles.GetRoles();
        const org = await this.org.GetOrg();
        return this.GetMemberEntries().map(member => {
            // Allow members with no callings
            const memberCallings = Array.isArray(member.callings) ? member.callings : [];
            const callingsResolved = memberCallings.length > 0 ? memberCallings.map(callingid => this.callings.GetCallingById(callingid)) : [];
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

            const stake = this.org.GetStake(member.stakeUnitNumber);
            const unit = this.org.GetUnit(member.unitNumber);
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
    }

    // Get leadership for a stake by unitNumber using an Org instance
    static GetStakeLeadership(orgInstance, stakeUnitNumber) {
        if (!orgInstance || typeof orgInstance.GetStake !== 'function') return null;
        const stake = orgInstance.GetStake(stakeUnitNumber);
        return stake && stake.leadership ? stake.leadership : null;
    }
    // Get leadership for a ward by unitNumber using an Org instance
    static GetWardLeadership(orgInstance, wardUnitNumber) {
        if (!orgInstance || typeof orgInstance.GetWard !== 'function') return null;
        const ward = orgInstance.GetWard(wardUnitNumber);
        return ward && ward.leadership ? ward.leadership : null;
    }
}