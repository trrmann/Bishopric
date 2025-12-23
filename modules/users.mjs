import { Members } from "./members.mjs";
export class Users {
  static local = true;
  constructor(config) {
    this._storageObj = config._storageObj;
    this.users = { users: [] };
    this.members = undefined;
  }

  static CopyFromJSON(dataJSON) {
    const users = new Users();
    users._storageObj = dataJSON._storageObj;
    users.users = dataJSON.users;
    users.members = dataJSON.members;
    users.lastFetched = dataJSON.lastFetched;
    users._buildCache();
    return users;
  }

  static CopyFromObject(destination, source) {
    destination._storageObj = source._storageObj;
    destination.users = source.users;
    destination.members = source.members;
    destination.lastFetched = source.lastFetched;
    destination._buildCache();
  }

  static async Factory(config) {
    const users = new Users(config);
    await users.Fetch();
    users.members = await Members.Factory(config);
    return users;
  }
    GetUsersFilename() {
        const file = "users.json";
        return file;
    }
    GetUsersExpireMS() {
        return 1000 * 60 * 60 * 1;// 1 hour
    }
    GetStorageConfig() {
        return { cacheTtlMs: null, sessionTtlMs: null, localTtlMs: null, googleId: null, githubFilename: null, privateKey: null, publicKey: null, secure: false };
    }
    async Fetch() {
        // Try to get from storage (cache/session/local/google/github)
        let usersObj = await this._storageObj.Get(this.GetUsersFilename(), this.GetStorageConfig());
        if (usersObj) {
            this.users = usersObj;
        } else {
            // If not found, fallback to empty
            this.users = undefined;
        }
    }
  GetUserEntries() {
    return this.users.users;
  }

  async GetUsers() {
    // Dynamically import Members if not already imported
    let membersData = await this.members.GetMembers();
    return this.GetUserEntries().map(user => {
      // Only use memberNumber for matching
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

  GetUserById(id) {
    if (!this._idMap) this._buildCache();
    // Only use memberNumber for lookup
    let u = this._idMap.get(id);
    if (!u) {
      u = this._idMap.get(String(id)) || this._idMap.get(Number(id));
    }
    return u ? [u] : [];
  }

  GetUserByEmail(email) {
    if (!this._emailMap) this._buildCache();
    const u = this._emailMap.get(email);
    return u ? [u] : [];
  }

  GetActiveUsers() {
    return this.GetUsers().filter(user => user.active === true);
  }

  HasUserById(id) {
    return ((this.GetUserById(id) !== null) && (this.GetUserById(id).length > 0));
  }

  HasUserByEmail(email) {
    return ((this.GetUserByEmail(email) !== null) && (this.GetUserByEmail(email).length > 0));
  }
}