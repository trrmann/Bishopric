import { createStorageConfig } from "./objectUtils.mjs";

export class Org {
  // ===== Instance Accessors =====
  get Storage() {
    return this.storage;
  }
  get Organization() {
    return this.organization;
  }

  /**
   * Creates an Org instance.
   * @param {object} configuration - Configuration object containing _storageObj.
   */
  /**
   * @param {Object} configuration - Must have a valid _storageObj with async Get/Set methods.
   */
  constructor(configuration) {
    let storageObj = configuration?._storageObj;
    if (
      !storageObj ||
      typeof storageObj.Get !== "function" ||
      typeof storageObj.Set !== "function" ||
      storageObj.Get.constructor.name !== "AsyncFunction" ||
      storageObj.Set.constructor.name !== "AsyncFunction" ||
      !storageObj.hasOwnProperty("Get") ||
      !storageObj.hasOwnProperty("Set")
    ) {
      storageObj = window.Storage;
    }
    this.storage = storageObj;
    this.organization = undefined;
  }

  // ===== Static Methods =====
  /**
   * Creates an Org instance from a JSON object.
   * @param {object} dataJSON - JSON object with _storageObj and org properties.
   * @returns {Org} New Org instance.
   */
  static CopyFromJSON(dataJSON) {
    const org = new Org(dataJSON._storageObj);
    org._restoreOrgState(dataJSON._storageObj, dataJSON.org);
    return org;
  }
  /**
   * Converts an Org instance to a JSON object.
   * @param {Org} instance - Org instance to convert.
   * @returns {object} JSON representation of Org.
   */
  static CopyToJSON(instance) {
    return {
      _storageObj: instance.storage,
      org: instance.organization,
    };
  }
  /**
   * Copies Org properties from source to destination.
   * @param {Org} destination - Destination Org instance.
   * @param {Org} source - Source Org instance.
   */
  static CopyFromObject(destination, source) {
    destination._restoreOrgState(source.storage, source.organization);
  }
  // Protected: encapsulate org state restoration for maintainability
  _restoreOrgState(storage, organization) {
    this.storage = storage;
    this.organization = organization;
  }
  /**
   * Factory method to create and initialize an Org instance.
   * @param {object} configuration - Configuration object containing _storageObj.
   * @returns {Promise<Org>} Initialized Org instance.
   */
  /**
   * Async factory. Always use this to ensure storage is ready before use.
   * @param {Object} configuration
   * @returns {Promise<Org>}
   */
  static async Factory(configuration) {
    const org = new Org(configuration);
    await org.Fetch();
    return org;
  }

  // ===== File/Storage Accessors =====
  static get OrgFileBasename() {
    return "organizations";
  }
  static get OrgFileExtension() {
    return "json";
  }
  static get OrgFilename() {
    return `${Org.OrgFileBasename}.${Org.OrgFileExtension}`;
  }
  static get OrgCacheExpireMS() {
    return 1000 * 60 * 30;
  }
  static get OrgSessionExpireMS() {
    return 1000 * 60 * 60;
  }
  static get OrgLocalExpireMS() {
    return 1000 * 60 * 60 * 2;
  }
  static get StorageConfig() {
    return createStorageConfig({
      cacheTtlMs: Org.OrgCacheExpireMS,
      sessionTtlMs: Org.OrgSessionExpireMS,
      localTtlMs: Org.OrgLocalExpireMS,
    });
  }

  // ===== Data Fetching =====
  async Fetch() {
    // 1. Try to get from cache
    let orgObj = await this.Storage.Get(Org.OrgFilename, {
      ...Org.StorageConfig,
      cacheTtlMs: Org.OrgCacheExpireMS,
    });
    let foundIn = null;
    if (orgObj !== undefined) foundIn = "cache";
    // 2. If not found, try session storage
    if (orgObj === undefined) {
      orgObj = await this.Storage.Get(Org.OrgFilename, {
        ...Org.StorageConfig,
        cacheTtlMs: null,
        sessionTtlMs: Org.OrgSessionExpireMS,
      });
      if (orgObj !== undefined) foundIn = "session";
    }
    // 3. If still not found, try local storage
    if (orgObj === undefined) {
      orgObj = await this.Storage.Get(Org.OrgFilename, {
        ...Org.StorageConfig,
        cacheTtlMs: null,
        sessionTtlMs: null,
        localTtlMs: Org.OrgLocalExpireMS,
      });
      if (orgObj !== undefined) foundIn = "local";
    }
    // 4. If still not found, use GoogleDrive for read/write priority
    if (
      orgObj === undefined &&
      this.Storage &&
      typeof this.Storage.Get === "function" &&
      this.Storage.constructor.name === "GoogleDrive"
    ) {
      // Use robust options for GoogleDrive fetch
      const googleOptions = {
        ...Org.StorageConfig,
        retryCount: 2,
        retryDelay: 300,
        debug: true,
      };
      orgObj = await this.Storage.Get(Org.OrgFilename, googleOptions);
      if (orgObj !== undefined) foundIn = "google";
    }
    // 5. If still not found, fallback to GitHubData (read-only, robust API)
    if (
      orgObj === undefined &&
      this.Storage &&
      typeof this.Storage._gitHubDataObj === "object" &&
      typeof this.Storage._gitHubDataObj.get === "function"
    ) {
      try {
        orgObj = await this.Storage._gitHubDataObj.get(
          Org.OrgFilename,
          "json",
          null,
          {},
        );
        if (orgObj !== undefined) foundIn = "github";
      } catch (e) {
        // If file not found or error, leave orgObj undefined
      }
    }

    // If still not found, try to fetch from /data/organizations.json (direct file fetch fallback)
    if (orgObj === undefined && typeof fetch === "function") {
      try {
        const resp = await fetch("/data/organizations.json");
        if (resp.ok) {
          orgObj = await resp.json();
          foundIn = "file";
        }
      } catch (e) {
        // Ignore fetch errors
      }
    }
    // Write to all storage tiers if found (from any source)
    if (orgObj !== undefined) {
      // Only write to Google Drive if config was found in GitHub, GoogleDrive, or file tier (not if found in local/session/cache)
      if (
        this.Storage.constructor.name === "GoogleDrive" &&
        (foundIn === "github" || foundIn === "google" || foundIn === "file") &&
        typeof this.Storage.Set === "function"
      ) {
        const googleOptions = {
          ...Org.StorageConfig,
          retryCount: 2,
          retryDelay: 300,
          debug: true,
        };
        await this.Storage.Set(Org.OrgFilename, orgObj, googleOptions);
      }
      // Write to local storage if not found there
      if (
        foundIn !== "local" &&
        this.Storage.LocalStorage &&
        typeof this.Storage.LocalStorage.Set === "function"
      ) {
        this.Storage.LocalStorage.Set(
          Org.OrgFilename,
          orgObj,
          Org.OrgLocalExpireMS,
        );
      }
      // Write to session storage if not found there
      if (
        foundIn !== "session" &&
        this.Storage.SessionStorage &&
        typeof this.Storage.SessionStorage.Set === "function"
      ) {
        this.Storage.SessionStorage.Set(
          Org.OrgFilename,
          orgObj,
          Org.OrgSessionExpireMS,
        );
      }
      // Write to cache if not found there
      if (
        foundIn !== "cache" &&
        this.Storage.Cache &&
        typeof this.Storage.Cache.Set === "function"
      ) {
        this.Storage.Cache.Set(Org.OrgFilename, orgObj, Org.OrgCacheExpireMS);
      }
    }
    this.organization = orgObj !== undefined ? orgObj : undefined;
  }

  // ===== Core Data Accessors =====
  get Stakes() {
    return this.organization?.stakes || [];
  }
  get Units() {
    if (!Array.isArray(this.Stakes)) return [];
    const allUnits = [];
    for (const stake of this.Stakes) {
      if (Array.isArray(stake.units)) {
        for (const unit of stake.units) {
          allUnits.push({
            stakeUnitNumber: stake.unitNumber,
            unitNumber: unit.unitNumber,
            type: unit.type,
            name: unit.name,
          });
        }
      }
    }
    return allUnits;
  }
  get Wards() {
    return this.Units.filter((unit) => unit.type === "ward");
  }
  get Branches() {
    return this.Units.filter((unit) => unit.type === "branch");
  }

  // ===== Stake/Unit Lookups =====
  StakeByUnitNumber(unitNumber) {
    return this.Stakes.find((stake) => stake.unitNumber === unitNumber);
  }
  StakeByName(stakeName) {
    return this.Stakes.find((stake) => stake.name === stakeName);
  }
  StakeUnits(stakeUnitNumber) {
    const stake = this.StakeByUnitNumber(stakeUnitNumber);
    return stake && Array.isArray(stake.units) ? stake.units : [];
  }
  StakeWards(stakeUnitNumber) {
    return this.StakeUnits(stakeUnitNumber).filter(
      (unit) => unit.type === "ward",
    );
  }
  StakeBranches(stakeUnitNumber) {
    return this.StakeUnits(stakeUnitNumber).filter(
      (unit) => unit.type === "branch",
    );
  }
  /**
   * Finds a stake by unit number.
   * @param {string|number} unitNumber - Stake unit number.
   * @returns {object|undefined} Stake object or undefined.
   */
  StakeByUnitNumber(unitNumber) {
    if (!Array.isArray(this.Stakes)) return undefined;
    return this.Stakes.find((stake) => stake.unitNumber === unitNumber);
  }

  /**
   * Finds a stake by name.
   * @param {string} stakeName - Stake name.
   * @returns {object|undefined} Stake object or undefined.
   */
  StakeByName(stakeName) {
    if (!Array.isArray(this.Stakes)) return undefined;
    return this.Stakes.find((stake) => stake.name === stakeName);
  }

  /**
   * Gets all units for a stake by unit number.
   * @param {string|number} stakeUnitNumber - Stake unit number.
   * @returns {Array<object>} Array of unit objects.
   */
  StakeUnits(stakeUnitNumber) {
    const stake = this.StakeByUnitNumber(stakeUnitNumber);
    return stake && Array.isArray(stake.units) ? stake.units : [];
  }

  /**
   * Gets all wards for a stake by unit number.
   * @param {string|number} stakeUnitNumber - Stake unit number.
   * @returns {Array<object>} Array of ward unit objects.
   */
  StakeWards(stakeUnitNumber) {
    return this.StakeUnits(stakeUnitNumber).filter(
      (unit) => unit.type === "ward",
    );
  }

  /**
   * Gets all branches for a stake by unit number.
   * @param {string|number} stakeUnitNumber - Stake unit number.
   * @returns {Array<object>} Array of branch unit objects.
   */
  StakeBranches(stakeUnitNumber) {
    return this.StakeUnits(stakeUnitNumber).filter(
      (unit) => unit.type === "branch",
    );
  }

  /**
   * Finds a unit by number.
   * @param {string|number} unitNumber - Unit number.
   * @returns {object|undefined} Unit object or undefined.
   */
  UnitByNumber(unitNumber) {
    return this.Units.find((unit) => unit.unitNumber === unitNumber);
  }

  /**
   * Finds a ward by number.
   * @param {string|number} unitNumber - Ward unit number.
   * @returns {object|undefined} Ward object or undefined.
   */
  WardByNumber(unitNumber) {
    return this.Wards.find((unit) => unit.unitNumber === unitNumber);
  }

  /**
   * Finds a branch by number.
   * @param {string|number} unitNumber - Branch unit number.
   * @returns {object|undefined} Branch object or undefined.
   */
  BranchByNumber(unitNumber) {
    return this.Branches.find((unit) => unit.unitNumber === unitNumber);
  }

  /**
   * Finds a unit by name.
   * @param {string} unitName - Unit name.
   * @returns {object|undefined} Unit object or undefined.
   */
  UnitByName(unitName) {
    return this.Units.find((unit) => unit.name === unitName);
  }
  /**
   * Checks if a stake exists by name.
   * @param {string} stakeName - Stake name.
   * @returns {boolean}
   */
  HasStakeByName(stakeName) {
    return !!this.StakeByName(stakeName);
  }

  /**
   * Checks if a unit exists by number.
   * @param {string|number} unitNumber - Unit number.
   * @returns {boolean}
   */
  HasUnitByNumber(unitNumber) {
    return !!this.UnitByNumber(unitNumber);
  }

  /**
   * Checks if a unit exists by name.
   * @param {string} unitName - Unit name.
   * @returns {boolean}
   */
  HasUnitByName(unitName) {
    return !!this.UnitByName(unitName);
  }

  /**
   * Checks if a ward exists by number.
   * @param {string|number} unitNumber - Ward unit number.
   * @returns {boolean}
   */
  HasWardByNumber(unitNumber) {
    return !!this.WardByNumber(unitNumber);
  }

  /**
   * Checks if a branch exists by number.
   * @param {string|number} unitNumber - Branch unit number.
   * @returns {boolean}
   */
  HasBranchByNumber(unitNumber) {
    return !!this.BranchByNumber(unitNumber);
  }
}
