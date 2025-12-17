import { Callings } from "./callings.mjs";
import { HasPreference, GetPreferenceObject, SetPreferenceObject } from "./localStorage.mjs";
import { Roles } from "./roles.mjs";
export class Members{
    static local = true;
    constructor() {
        this.members = null;
        this.lastFetched = null;
        this.callings = null;
        this.roles = null;
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
                } catch (error) {
                    console.error('There has been a problem with your fetch operation:', error);
                }
            }
            SetPreferenceObject(key, this);
        }
        this._buildCache();
    }
    async GetCallings() {
        return await this.callings;
    }
    async GetRoles() {
        return await this.roles.GetRoles();
    }

    _buildCache() {
        // Build array and lookup maps for fast access
        this._membersArray = (this.members && this.members.members) ? this.members.members : [];
        this._idMap = new Map();
        this._emailMap = new Map();
        for (const member of this._membersArray) {
            this._idMap.set(member.id, member);
            this._emailMap.set(member.email, member);
        }
    }
    GetMemberEntries(){
        // Ensure cache is built
        if (!this._membersArray) this._buildCache();
        return this._membersArray;
    }
    async GetMembers(){
        // Use cached array and minimize repeated lookups
        if (!this._membersArray) this._buildCache();
        const callings = await this.GetCallings();
        const roles = await this.GetRoles();
        // Dynamically import Users if not already imported
        return this._membersArray.map(member => {
            // Pre-resolve all callings for this member
            const callingsResolved = member.callings.map(callingid => callings.GetCallingById(callingid));
            const callingNames = callingsResolved.map(callingArr => (callingArr && callingArr[0]) ? callingArr[0].name : null);
            const callingLevels = callingsResolved.map(callingArr => (callingArr && callingArr[0]) ? callingArr[0].level : null);
            const callingsActive = callingsResolved.map(callingArr => (callingArr && callingArr[0]) ? callingArr[0].active === true : false);
            // Add callings-role-id: single array of unique role ids for all callings
            const rawCallingsRoles = callingsResolved
                .map(callingArr => {return roles.filter(function(r){return callingArr.map(call => {return call.id;}).includes(r.callingID);});})
                .filter(role => {return role !== null && role !== undefined;});
            const callingsRoles = [];
            rawCallingsRoles.forEach(roleArray => {roleArray.forEach(role => {if(!callingsRoles.includes(role)) {callingsRoles.push(role);}})});
            const callingsRoleId = callingsRoles.map(role => {return role.id;});
            const callingSubRoles = callingsRoleId.map(callingRoleId => {
                const role = roles.filter(role => {return role.id === callingRoleId})[0];
                const subRoles = role.subRoles;
                return subRoles;
            });
            const callingAllSubRoles = callingsRoleId.map(callingRoleId => {
                const role = roles.filter(role => {return role.id === callingRoleId})[0];
                const allSubRoles = role.allSubRoles;
                return allSubRoles;
            });
            return {
                "id": member.id,
                "name": member.name,
                "email": member.email,
                "phone": member.phone,
                "callingIDs": member.callings,
                "callingNames": callingNames,
                "levels": callingLevels,
                "callingsActive": callingsActive,
                "callingRoleIDs": callingsRoleId,
                "callingsSubRoles": callingSubRoles,
                "callingsAllSubRoles": callingAllSubRoles,
                "active": member.active
            };
        });
    }




/*
      "id": 1,
      "name": "Robert Wallace",
      "email": "rdw.engineer@gmail.com",
      "phone": "(864) 607-2777",
      "calling": [ 9 ],
      "active": true
*/
}