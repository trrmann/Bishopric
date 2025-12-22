import { Callings } from "./callings.mjs";
import { Storage } from "./storage.mjs";
export class Roles{
    static local = true;
    constructor() {
        this.roles = null;
        this.lastFetched = null;
        this.callings = null;
        this._rolesArray = null; // cache array
        this._idMap = null; // cache id lookup
        this._nameMap = null; // cache name lookup
    }
    static CopyFromJSON(dataJSON) {
        const roles = new Roles();
        roles.roles = dataJSON.roles;
        roles.lastFetched = dataJSON.lastFetched;
        roles._buildCache();
        return roles;
    }
    static CopyFromObject(destination, source) {
        destination.roles = source.roles;
        destination.lastFetched = source.lastFetched;
        destination._buildCache();
    }
    static async Factory(storageInstance = null) {
        const roles = new Roles();
        await roles.Fetch(storageInstance);
        roles._buildCache();
        return roles;
    }
    GetRolesURL(local=false) {
        const host = "https://trrmann.github.io/";
        const projectPath = "bishopric/data/";
        const path = "data/";
        const file = "roles.json";
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
        return "roles";
    }
    IsFetched(){
        const roles = this.roles;
        const isFetched = (roles != null);
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
    async Fetch(storageInstance = null) {
        // Use Storage class for all data access
        this.callings = await Callings.Factory(storageInstance);
        const storage = storageInstance || new Storage();
        const key = this.GetLocalStoreKey();
        const githubFilename = "roles.json";
        const cacheTtlMs = this.GetFetchExpireMS();
        // Try to get from storage (cache/session/local/google/github)
        let rolesObj = await storage.get(key, {
            cacheTtlMs,
            githubFilename
        });
        if (rolesObj) {
            Roles.CopyFromObject(this, rolesObj);
        } else {
            // If not found, fallback to empty
            this.roles = null;
        }
        this._buildCache();
    }
    GetCallings() {
        return this.callings;
    }
    GetRoleEntries(){
        if (!this._rolesArray) {
            this._buildCache();
        }
        return this._rolesArray;
    }
    GetRoles(){
        if (!this._rolesArray) {
            this._buildCache();
        }
        return this._rolesArray.map(role => {
            const callingArr = this.callings ? this.callings.GetCallingById(role.calling) : [];
            const calling = callingArr && callingArr.length > 0 ? callingArr[0] : {};
            const subRoles = this.GetRawSubRolesById(role.id);
            const subRoleNames = this._rolesArray.filter(r => {return subRoles.includes(r.id);}).map(r => {return r.name;});
            const allSubRoles = this.GetSubRolesById(role.id);
            const allSubRoleNames = this._rolesArray.filter(r => {return allSubRoles.includes(r.id);}).map(r => {return r.name;});
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
    GetRawSubRolesById(roleId) {
        // Returns the array of subrole IDs for a given roleId, or [] if none
        const roleArr = this.GetRoleById(roleId);
        if (!roleArr || roleArr.length === 0) return [];
        const role = roleArr[0];
        // subRoles may be undefined or not an array
        return Array.isArray(role.subRoles) ? role.subRoles : [];
    }

    /**
     * Recursively get all subroles (direct and indirect) for a given roleId.
     * Returns a flat array of unique subrole IDs.
     */
    GetSubRolesById(roleId, visited = new Set()) {
        // Prevent infinite recursion
        if (visited.has(roleId)) return [];
        visited.add(roleId);

        // Get direct subroles
        const subRoleIds = this.GetRawSubRolesById(roleId);
        let allSubRoles = [...subRoleIds];
        for (const subId of subRoleIds) {
            const descendants = this.GetSubRolesById(subId, visited);
            for (const descId of descendants) {
                if (!allSubRoles.includes(descId)) {
                    allSubRoles.push(descId);
                }
            }
        }
        return allSubRoles;
    }
    GetActiveRoles(){
        return this.GetRoles().filter(role => {return (role.active === true);});
    }
    GetRoleById(id) {
        if (!this._idMap) this._buildCache();
        const r = this._idMap.get(id);
        return r ? [r] : [];
    }
    GetRoleByName(name) {
        if (!this._nameMap) this._buildCache();
        const r = this._nameMap.get(name);
        return r ? [r] : [];
    }
    _buildCache() {
        // Build array and lookup maps for fast access
        this._rolesArray = (this.roles && this.roles.roles) ? this.roles.roles : [];
        this._idMap = new Map();
        this._nameMap = new Map();
        for (const role of this._rolesArray) {
            this._idMap.set(role.id, role);
            this._nameMap.set(role.name, role);
        }
    }
    GetRolesByCalling(callingId) {
        return this.GetRoles().filter(role => {return role.callingID === callingId;});
    }
    GetActiveRoleById(id) {
        return this.GetRoleById(id).filter(role => {return (role.active === true);});
    }
    GetActiveRoleByName(name) {
        return this.GetRoleByName(name).filter(role => {return (role.active === true);});
    }
    GetActiveRolesByCalling(callingId) {
        return this.GetRolesByCalling(callingId).filter(role => {return (role.active === true);});
    }
    HasRoles(){
        return ((this.GetRoles() !== null) && (this.GetRoles().length > 0));
    }
    HasActiveRoles(){
        return ((this.GetActiveRoles() !== null) && (this.GetActiveRoles().length > 0));
    }
    HasRoleById(id) {
        return ((this.GetRoleById(id) !== null) && (this.GetRoleById(id).length > 0));
    }
    HasRoleByName(name) {
        return ((this.GetRoleByName(name) !== null) && (this.GetRoleByName(name).length > 0));
    }
    HasRolesByCalling(callingId) {
        return ((this.GetRolesByCalling(callingId) !== null) && (this.GetRolesByCalling(callingId).length > 0));
    }
    HasActiveRoleById(id) {
        return ((this.GetActiveRoleById(id) !== null) && (this.GetActiveRoleById(id).length > 0));
    }
    HasActiveRoleByName(name) {
        return ((this.GetActiveRoleByName(name) !== null) && (this.GetActiveRoleByName(name).length > 0));
    }
    HasActiveRolesByCalling(callingId) {
        return ((this.GetActiveRolesByCalling(callingId) !== null) && (this.GetActiveRolesByCalling(callingId).length > 0));
    }
    GetRoleIds(){
        return this.GetRoles().map(role => { return role.id; });
    }
    GetRoleNames(){
        return this.GetRoles().map(role => { return role.name; });
    }
    GetRoleCallings(){
        return this.GetRoles().map(role => { return role.calling; });
    }
    GetActiveRoleIds(){
        return this.GetActiveRoles().map(role => { return role.id; });
    }
    GetActiveRoleNames(){
        return this.GetActiveRoles().map(role => { return role.name; });
    }
    GetActiveRoleCallings(){
        return this.GetActiveRoles().map(role => { return role.calling; });
    }
    GetRoleNameById(id) {
        return this.GetRoleById(id).map(role => { return role.name; });
    }
    GetRoleNamesByCalling(callingId) {
        return this.GetRolesByCalling(callingId).map(role => { return role.name; });
    }
    GetRoleIdByName(name) {
        return this.GetRoleByName(name).map(role => { return role.id; });
    }
    GetRoleIdsByCalling(callingId) {
        return this.GetRolesByCalling(callingId).map(role => { return role.id; });
    }
    GetRoleCallingById(id) {
        return this.GetRoleById(id).map(role => { return role.calling; });
    }
    GetRoleCallingByName(name) {
        return this.GetRoleByName(name).map(role => { return role.calling; });
    }
    GetActiveRoleNameById(id) {
        return this.GetActiveRoleById(id).map(role => { return role.name; });
    }
    GetActiveRoleNamesByCalling(callingId) {
        return this.GetActiveRolesByCalling(callingId).map(role => { return role.name; });
    }
    GetActiveRoleIdByName(name) {
        return this.GetActiveRoleByName(name).map(role => { return role.id; });
    }
    GetActiveRoleIdsByCalling(callingId) {
        return this.GetActiveRolesByCalling(callingId).map(role => { return role.id; });
    }
    GetActiveRoleCallingById(id) {
        return this.GetActiveRoleById(id).map(role => { return role.calling; });
    }
    GetActiveRoleCallingByName(name) {
        return this.GetActiveRoleByName(name).map(role => { return role.calling; });
    }

    GetWardRoles(){
        return this.GetRoles().filter(role => {return (role.level === "ward");});
    }
    GetStakeRoles(){
        return this.GetRoles().filter(role => {return (role.level === "stake");});
    }
    GetActiveWardRoles(){
        return this.GetWardRoles().filter(role => {return (role.active === true);});
    }
    GetActiveStakeRoles(){
        return this.GetStakeRoles().filter(role => {return (role.active === true);});        
    }
    GetWardRoleById(id) {
        return this.GetRoleById(id).filter(role => {return (role.level === "ward");});
    }
    GetWardRoleByName(name) {
        return this.GetRoleByName(name).filter(role => {return (role.level === "ward");});
    }
    GetActiveWardRoleById(id) {
        return this.GetActiveRoleById(id).filter(role => {return (role.level === "ward");});
    }
    GetActiveWardRoleByName(name) {
        return this.GetActiveRoleById(name).filter(role => {return (role.level === "ward");});
    }
    GetStakeRoleById(id) {
        return this.GetRoleById(id).filter(role => {return (role.level === "stake");});
    }
    GetStakeRoleByName(name) {
        return this.GetRoleByName(name).filter(role => {return (role.level === "stake");});
    }
    GetActiveStakeRoleById(id) {
        return this.GetActiveRoleById(id).filter(role => {return (role.level === "stake");});
    }
    GetActiveStakeRoleByName(name) {
        return this.GetActiveRoleById(name).filter(role => {return (role.level === "stake");});
    }
    HasWardRoles(){
        return ((this.GetWardRoles() !== null) && (this.GetWardRoles().length > 0));
    }
    HasStakeRoles(){
        return ((this.GetStakeRoles() !== null) && (this.GetStakeRoles().length > 0));
    }
    HasActiveWardRoles(){
        return ((this.GetActiveWardRoles() !== null) && (this.GetActiveWardRoles().length > 0));
    }
    HasActiveStakeRoles(){
        return ((this.GetActiveStakeRoles() !== null) && (this.GetActiveStakeRoles().length > 0));
    }
    HasWardRoleById(id) {
        return ((this.GetWardRoleById(id) !== null) && (this.GetWardRoleById(id).length > 0));
    }
    HasWardRoleByName(name) {
        return ((this.GetWardRoleByName(name) !== null) && (this.GetWardRoleByName(name).length > 0));
    }
    HasActiveWardRoleById(id) {
        return ((this.GetActiveWardRoleById(id) !== null) && (this.GetActiveWardRoleById(id).length > 0));
    }
    HasActiveWardRoleByName(name) {
        return ((this.GetActiveWardRoleByName(name) !== null) && (this.GetActiveWardRoleByName(name).length > 0));
    }
    HasStakeRoleById(id) {
        return ((this.GetStakeRoleById(id) !== null) && (this.GetStakeRoleById(id).length > 0));
    }
    HasStakeRoleByName(name) {
        return ((this.GetStakeRoleByName(name) !== null) && (this.GetStakeRoleByName(name).length > 0));
    }
    HasActiveStakeRoleById(id) {
        return ((this.GetActiveStakeRoleById(id) !== null) && (this.GetActiveStakeRoleById(id).length > 0));
    }
    HasActiveStakeRoleByName(name) {
        return ((this.GetActiveStakeRoleByName(name) !== null) && (this.GetActiveStakeRoleByName(name).length > 0));
    }
    GetWardRoleIds(){
        return this.GetWardRoles().map(role => { return role.id; });
    }
    GetWardRoleNames(){
        return this.GetWardRoles().map(role => { return role.name; });
    }
    GetStakeRoleIds(){
        return this.GetStakeRoles().map(role => { return role.id; });
    }
    GetStakeRoleNames(){
        return this.GetStakeRoles().map(role => { return role.name; });
    }
    GetActiveWardRoleIds(){
        return this.GetActiveWardRoles().map(role => { return role.id; });
    }
    GetActiveWardRoleNames(){
        return this.GetActiveWardRoles().map(role => { return role.name; });
    }
    GetActiveStakeRoleIds(){
        return this.GetActiveStakeRoles().map(role => { return role.id; });
    }
    GetActiveStakeRoleNames(){
        return this.GetActiveStakeRoles().map(role => { return role.name; });
    }
    GetWardRoleNameById(id) {
        return this.GetWardRoleById(id).map(role => { return role.name; });
    }
    GetWardRoleIdByName(name) {
        return this.GetWardRoleByName(name).map(role => { return role.id; });
    }
    GetActiveWardRoleNameById(id) {
        return this.GetActiveWardRoleById(id).map(role => { return role.name; });
    }
    GetActiveWardRoleIdByName(name) {
        return this.GetActiveWardRoleByName(name).map(role => { return role.id; });
    }
    GetStakeRoleNameById(id) {
        return this.GetStakeRoleById(id).map(role => { return role.name; });
    }
    GetStakeRoleIdByName(name) {
        return this.GetStakeRoleByName(name).map(role => { return role.id; });
    }
    GetActiveStakeRoleNameById(id) {
        return this.GetActiveStakeRoleById(id).map(role => { return role.name; });
    }
    GetActiveStakeRoleIdByName(name) {
        return this.GetActiveStakeRoleByName(name).map(role => { return role.id; });
    }

}