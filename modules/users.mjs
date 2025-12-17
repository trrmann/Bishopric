import { Members } from "./members.mjs";
export class Users {
  static local = true;
  constructor() {
    this.users = null;
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
      const hasPreference = window.HasPreference ? window.HasPreference(key) : false;
      if (hasPreference && window.GetPreferenceObject) {
        const preferenceData = window.GetPreferenceObject(key);
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
      if (window.SetPreferenceObject) window.SetPreferenceObject(key, this);
    }
    this._buildCache();
  }

  _buildCache() {
    this._usersArray = (this.users && this.users.users) ? this.users.users : [];
    this._idMap = new Map();
    this._emailMap = new Map();
    for (const user of this._usersArray) {
      this._idMap.set(user.id, user);
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
    return this._usersArray.map(user => {
      const member = members._idMap.get(user.id);
      let memberactive = member.active;
      let name = member.name;
      let email = member.email;
      let phone = member.phone;
      return {
        id: user.id,
        name: name,
        password: user.password,
        email: email,
        phone: phone,
        roles: user.roles,
        memberactive: memberactive,
        active: user.active
      };
    });
  }

  GetUserById(id) {
    if (!this._idMap) this._buildCache();
    const u = this._idMap.get(id);
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