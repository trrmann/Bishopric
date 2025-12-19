import { Callings } from "./callings.mjs";
import { HasPreference, GetPreferenceObject, SetPreferenceObject } from "./localStorage.mjs";
import { Roles } from "./roles.mjs";
import { Org } from "./org.mjs";
export class Members{
    static local = true;
    constructor() {
        this.members = null;
        this.lastFetched = null;
        this.callings = null;
        this.roles = null;
        this.org = null;
        this._membersArray = null; // cache array
        this._idMap = null; // cache id lookup
        this._emailMap = null; // cache email lookup
    }
    static CopyFromJSON(dataJSON) {
        const members = new Members();
        members.members = dataJSON.members;
        members.lastFetched = dataJSON.lastFetched;
        members._buildCache();
        return members;
    }
    static CopyFromObject(destination, source) {
        destination.members = source.members;
        destination.lastFetched = source.lastFetched;
        destination._buildCache();
    }
    static async Factory() {
        const members = new Members();
        await members.Fetch();
        return members;
    }
    GetMembersURL(local=false) {
        const host = "https://trrmann.github.io/";
        const projectPath = "bishopric/data/";
        const path = "data/";
        const file = "members.json";
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
        return "members";
    }
    IsFetched(){
        const members = this.members;
        const isFetched = (members != null);
        return isFetched;
    }
    IsLastFetchedExpired(){
        const lastFetchedMS = this.GetLastFetched();
        const lastFetched = Date(lastFetchedMS);
        if(lastFetched==null) {
            return true;
        } else {
            const expireMS = this.GetFetchExpireMS();
            const fetchExpireMS = lastFetchedMS + expireMS;
            //const fetchExpire = Date(fetchExpireMS);
            const nowMS = Date.now();
            //const now = Date(nowMS);
            const match = (nowMS >= fetchExpireMS);
            return match;
        }
    }
    GetLastFetched(){
        const lastFetched = this.lastFetched;
        return lastFetched;
    }
    SetLastFetched(fetchedDatetime){
        const fetchedDatetimeIn = fetchedDatetime;
        this.lastFetched = fetchedDatetimeIn;
    }
    async Fetch() {
        this.callings = await Callings.Factory();
        this.roles = await Roles.Factory();
        this.org = await Org.Factory();
        let fetched = false;
        const isFetched = this.IsFetched();
        if(!isFetched) {
            const key = this.GetLocalStoreKey();
            const hasPreference = HasPreference(key);
            if(hasPreference) {
                const preferenceData = GetPreferenceObject(key);
                Members.CopyFromObject(this, preferenceData);
            }
            const isLastFetchedExpired = this.IsLastFetchedExpired();
            if(isLastFetchedExpired){
                try {
                    const url = this.GetMembersURL(Members.local);
                    const response = await fetch(url);
                    const responseOk = response.ok;
                    if (!responseOk) {
                        throw new Error('Network response was not ok');
                    }
                    this.members = await response.json();
                    const newLastFetchDate = Date.now();
                    this.SetLastFetched(newLastFetchDate);
                    fetched = true;
                } catch (error) {
                    console.error('There has been a problem with your fetch operation:', error);
                }
            }
            SetPreferenceObject(key, this);
        }
        // Always rebuild cache after fetch or local load
        this._buildCache();
        // if (fetched) {
        //     console.log('Fetched members from remote:', this.members);
        // }
    }
    async GetCallings() {
        return await this.callings;
    }
    async GetRoles() {
        return await this.roles.GetRoles();
    }
    async GetOrg() {
        return await this.org;
    }

    _buildCache() {
        // Build array and lookup maps for fast access
        this._membersArray = (this.members && this.members.members) ? this.members.members : [];
        this._idMap = new Map();
        this._emailMap = new Map();
        for (const member of this._membersArray) {
            // Only use memberNumber for mapping
            this._idMap.set(member.memberNumber, member);
            this._emailMap.set(member.email, member);
        }
    }
    GetMemberEntries(){
        // Ensure cache is built
        if (!this._membersArray) this._buildCache();
        return this._membersArray;
    }
    async GetMembers() {
        // Use cached array and minimize repeated lookups
        if (!this._membersArray) this._buildCache();
        const callings = await this.GetCallings();
        const roles = await this.GetRoles();
        const org = await this.GetOrg();
        return this._membersArray.map(member => {
            // Allow members with no callings
            const memberCallings = Array.isArray(member.callings) ? member.callings : [];
            const callingsResolved = memberCallings.length > 0 ? memberCallings.map(callingid => callings.GetCallingById(callingid)) : [];
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

            const stake = org.GetStake(member.stakeUnitNumber);
            const unit = org.GetUnit(member.unitNumber);
            const stakeName = stake ? stake.name : '';
            const unitName = unit ? unit.name : '';
            const unitType = unit ? unit.type : '';

            return {
                memberNumber: member.memberNumber,
                fullname: fullname,
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