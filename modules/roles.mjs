import { Callings } from "./callings.mjs";
export class Roles{
    constructor(config) {
        this._storageObj = config._storageObj;
        this.roles = null;
        this.callings = undefined;
    }
    static CopyFromJSON(dataJSON) {
        this._storageObj = dataJSON._storageObj;
        this.roles = dataJSON.roles;
        this.callings = dataJSON.callings;
    }
    static CopyFromObject(destination, source) {
        destination._storageObj = source._storageObj;
        destination.roles = source.roles;
        destination.callings = source.callings;
    }
    static async Factory(config) {
        const roles = new Roles(await config);
        await roles.Fetch();
        roles.callings = await Callings.Factory(config);
        return roles;
    }
    GetRolesFilename() {
        const file = "roles.json";
        return file;
    }
    GetRolesExpireMS() {
        return 1000 * 60 * 60 * 1;// 1 hour
    }
    GetStorageConfig() {
        return { cacheTtlMs: null, sessionTtlMs: null, localTtlMs: null, googleId: null, githubFilename: null, privateKey: null, publicKey: null, secure: false };
    }
    async Fetch() {
        // Try to get from storage (cache/session/local/google/github)
        let rolesObj = await this._storageObj.Get(this.GetRolesFilename(), this.GetStorageConfig());
        if (rolesObj) {
            this.roles = rolesObj;
        } else {
            // If not found, fallback to empty
            this.roles = undefined;
        }
    }
    GetRolesEntries(){
        // Ensure cache is built
        return this.roles.roles;
    }

    GetRoles(){
        return this.GetRolesEntries().map(role => {
            const callingArr = this.callings ? this.callings.GetCallingById(role.calling) : [];
            const calling = callingArr && callingArr.length > 0 ? callingArr[0] : {};
            const subRoles = this.GetRawSubRolesById(role.id);
            const subRoleNames = this.GetRolesEntries().filter(r => {return subRoles.includes(r.id);}).map(r => {return r.name;});
            const allSubRoles = this.GetSubRolesById(role.id);
            const allSubRoleNames = this.GetRolesEntries().filter(r => {return allSubRoles.includes(r.id);}).map(r => {return r.name;});
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
        const roleArr = this.GetRoleEntryById(roleId);
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
    GetRoleEntryById(id) {
        return this.GetRolesEntries().filter(role => {return (role.id === id);});
    }
    GetRoleById(id) {
        return this.GetRoles().filter(role => {return (role.id === id);});
    }
    GetRoleByName(name) {
        return this.GetRoles().filter(role => {return (role.name === name);});
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