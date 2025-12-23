export class Org {
    constructor(config) {
        this._storageObj = config._storageObj;
        this.org = null;
    }
    static CopyFromJSON(dataJSON) {
        this._storageObj = dataJSON._storageObj;
        this.org = dataJSON.org;
    }
    static CopyFromObject(destination, source) {
        destination._storageObj = source._storageObj;
        destination.org = source.org;
    }
    static async Factory(config) {
        const org = new Org(config);
        await org.Fetch();
        return org;
    }
    GetOrgFilename() {
        const file = "organizations.json";
        return file;
    }
    GetOrgExpireMS() {
        return 1000 * 60 * 60 * 1;// 1 hour
    }
    GetStorageConfig() {
        return { cacheTtlMs: null, sessionTtlMs: null, localTtlMs: null, googleId: null, githubFilename: null, privateKey: null, publicKey: null, secure: false };
    }
    async Fetch() {
        // Try to get from storage (cache/session/local/google/github)
        let orgObj = await this._storageObj.Get(this.GetOrgFilename(), this.GetStorageConfig());
        if (orgObj) {
            this.org = orgObj;
        } else {
            // If not found, fallback to empty
            this.org = undefined;
        }
    }
    GetOrg(){
        // Ensure cache is built
        return this.org;
    }
    async GetAllStakes() {
        // Ensure data is loaded before returning stakes
        return await this.GetOrg().stakes;
    }
    GetAllUnits() {
        // Synchronous: use cached org data
        if (!this.GetOrg() || !Array.isArray(this.GetOrg().stakes)) return [];
        const allUnits = [];
        for (const stake of this.GetOrg().stakes) {
            if (Array.isArray(stake.units)) {
                for (const unit of stake.units) {
                    allUnits.push({
                        stakeUnitNumber: stake.unitNumber,
                        unitNumber: unit.unitNumber,
                        type: unit.type,
                        name: unit.name
                    });
                }
            }
        }
        return allUnits;
    }
    GetAllWards() {
        return this.GetAllUnits().filter(unit => unit.type === "ward");
    }
    GetAllBranches() {
        return this.GetAllUnits().filter(unit => unit.type === "branch");
    }
    GetStake(unitNumber) {
        if (!this.GetOrg() || !Array.isArray(this.GetOrg().stakes)) return undefined;
        return this.GetOrg().stakes.find(stake => stake.unitNumber === unitNumber);
    }
    GetAllStakeUnits(stakeUnitNumber) {
        const stake = this.GetStake(stakeUnitNumber);
        return stake && Array.isArray(stake.units) ? stake.units : [];
    }
    GetAllStakeWards(stakeUnitNumber) {
        return this.GetAllStakeUnits(stakeUnitNumber).filter(unit => unit.type === "ward");
    }
    GetAllStakeBranches(stakeUnitNumber) {
        return this.GetAllStakeUnits(stakeUnitNumber).filter(unit => unit.type === "branch");
    }
    GetUnit(unitNumber) {
        return this.GetAllUnits().find(unit => unit.unitNumber === unitNumber);
    }
    GetWard(unitNumber) {
        return this.GetAllWards().find(unit => unit.unitNumber === unitNumber);
    }
    GetBranch(unitNumber) {
        return this.GetAllBranches().find(unit => unit.unitNumber === unitNumber);
    }
    GetStakeByName(stakeName) {
        if (!this.GetOrg() || !Array.isArray(this.GetOrg().stakes)) return undefined;
        return this.GetOrg().stakes.find(stake => stake.name === stakeName);
    }
    GetUnitByName(unitName) {
        return this.GetAllUnits().find(unit => unit.name === unitName);
    }
}
