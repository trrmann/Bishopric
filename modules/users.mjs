import { Members } from "./members.mjs";
import { LocalStorage } from "./localStorage.mjs";
export class Users {
  static local = true;
  constructor() {
    this.users = { users: [] };
    this.lastFetched = null;
    this._usersArray = null; // cache array
    this._idMap = null; // cache id lookup
    this._emailMap = null; // cache email lookup
  }

  static CopyFromJSON(dataJSON) {
    const users = new Users();
    users.users = dataJSON.users;
    users.lastFetched = dataJSON.lastFetched;
    users._buildCache();
    return users;
  }

  static CopyFromObject(destination, source) {
    destination.users = source.users;
    destination.lastFetched = source.lastFetched;
    destination._buildCache();
  }

  static async Factory() {
    const users = new Users();
    await users.Fetch();
    return users;
  }

  GetUsersURL(local = false) {
    const host = "https://trrmann.github.io/";
    const projectPath = "bishopric/data/";
    const path = "data/";
    const file = "users.json";
    let url = `${host}${projectPath}${file}`;
    if (local) {
      url = `${path}${file}`;
    }
    return url;
  }

  GetFetchExpireMS() {
    const expireTime = 1000 * 60 * 60 * 24; // 1 day
    return expireTime;
  }

  GetLocalStoreKey() {
    return "users";
  }

  IsFetched() {
    const users = this.users;
    const isFetched = (users != null);
    return isFetched;
  }

  IsLastFetchedExpired() {
    const lastFetchedMS = this.GetLastFetched();
    const lastFetched = Date(lastFetchedMS);
    if (lastFetched == null) {
      return true;
    } else {
      const expireMS = this.GetFetchExpireMS();
      const fetchExpireMS = lastFetchedMS + expireMS;
      const nowMS = Date.now();
      return (nowMS >= fetchExpireMS);
    }
  }

  GetLastFetched() {
    return this.lastFetched;
  }

  SetLastFetched(fetchedDatetime) {
    this.lastFetched = fetchedDatetime;
  }

  async Fetch() {
    const isFetched = this.IsFetched();
    if (!isFetched) {
      const key = this.GetLocalStoreKey();
      const hasPreference = LocalStorage.HasPreference(key);
      if (hasPreference) {
        const preferenceData = await LocalStorage.GetObject(key);
        Users.CopyFromObject(this, preferenceData);
      }
      const isLastFetchedExpired = this.IsLastFetchedExpired();
      if (isLastFetchedExpired) {
        try {
          const url = this.GetUsersURL(Users.local);
          const response = await fetch(url);
          const responseOk = response.ok;
          if (!responseOk) {
            throw new Error('Network response was not ok');
          }
          this.users = await response.json();
          const newLastFetchDate = Date.now();
          this.SetLastFetched(newLastFetchDate);
        } catch (error) {
          console.error('There has been a problem with your fetch operation:', error);
        }
      }
      await LocalStorage.SetObject(key, this);
    }
    this._buildCache();
  }

  _buildCache() {
    this._usersArray = (this.users && this.users.users) ? this.users.users : [];
    this._idMap = new Map();
    this._emailMap = new Map();
    for (const user of this._usersArray) {
      // Only use memberNumber for mapping
      this._idMap.set(user.memberNumber, user);
      this._emailMap.set(user.email, user);
    }
  }

  GetUserEntries() {
    if (!this._usersArray) this._buildCache();
    return this._usersArray;
  }

  async GetUsers() {
    if (!this._usersArray) this._buildCache();
    // Dynamically import Members if not already imported
    let members = await Members.Factory();
    let membersData = await members.GetMembers(); 
    return this._usersArray.map(user => {
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