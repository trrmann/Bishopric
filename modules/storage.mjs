import { CacheStore } from "./cacheStore.mjs";
import { SessionStorage } from "./sessionStorage.mjs";
import { LocalStorage } from "./localStorage.mjs";
import { GoogleDrive } from "./googleDrive.mjs";
import { GitHubData } from "./gitHubData.mjs";
import { PublicKeyCrypto } from "./crypto.mjs";
import { TimerUtils } from "./objectUtils.mjs";
export class Storage {
  // Compatibility getter for modules expecting _gitHubDataObj
  get _gitHubDataObj() {
    return this._gitHub;
  }
  // ===== Private Fields =====
  #initTimeoutMS = 5000; // default max wait time in ms
  #storage;
  #foundIn = new Set();
  #keyRegistry = new Map();
  #secureKeyRegistry = new Map();
  // ===== Instance Accessors =====
  get KeyRegistry() {
    return this.#keyRegistry;
  }
  set _KeyRegistry(registry) {
    this.#keyRegistry = registry;
  }
  get SecureKeyRegistry() {
    return this.#secureKeyRegistry;
  }
  set _SecureKeyRegistry(registry) {
    this.#secureKeyRegistry = registry;
  }
  get RegistryPruneTimer() {
    return this._registryPruneTimer;
  }
  get RegistryPruneIntervalMs() {
    return this._registryPruneIntervalMs;
  }
  get Cache() {
    return this._cache;
  }
  get SessionStorage() {
    return this._sessionStorage;
  }
  get LocalStorage() {
    return this._localStorage;
  }
  get Crypto() {
    return this._crypto;
  }
  get GoogleDrive() {
    return this._googleDrive;
  }
  get GitHub() {
    return this._gitHub;
  }
  // Synchronous accessor for the storage object (if needed)
  get Storage() {
    return this.#storage;
  }
  // Synchronous setter for the storage object (if needed)
  set _Storage(val) {
    if (
      !val ||
      typeof val.Get !== "function" ||
      typeof val.Set !== "function"
    ) {
      throw new Error(
        "Storage: storageObject must be provided and implement async Get/Set methods.",
      );
    }
    this.#storage = val;
  }

  // ===== Constructor =====
  constructor(
    storageRegistryPruneIntervalMs = Storage.DefaultStoragePruneIntervalMS,
  ) {
    // keyRegistry and secureKeyRegistry are now private fields initialized at declaration
    this._registryPruneTimer = null;
    this._registryPruneIntervalMs = null;
    if (storageRegistryPruneIntervalMs > 0) {
      this.StartRegistryPruneTimer(storageRegistryPruneIntervalMs);
    }
    this._cache_purge_intervalMS = CacheStore.DefaultCachePruneIntervalMS;
    this._cache_default_value_expireMS = CacheStore.DefaultCacheValueExpireMS;
    // Use static Factory methods for instantiation
    // These are async, so we must initialize them in the async Factory method below
    this._cache = null;
    this._sessionStorage = null;
    this._localStorage = null;
    this._crypto = null;
    this._localStorage_purge_intervalMS =
      LocalStorage.DefaultLocalStoragePruneIntervalMS;
    this._localStorage_default_value_expireMS =
      LocalStorage.DefaultLocalStorageValueExpireMS;
    this._sessionStorage_purge_intervalMS =
      SessionStorage.DefaultSessionStoragePruneIntervalMS;
    this._sessionStorage_default_value_expireMS =
      SessionStorage.DefaultSessionStorageValueExpireMS;
    this._googleDrive = null;
    this._gitHub = null;
    // No async initialization pattern; all async setup is handled in the Factory method
  }

  // ===== Static Methods =====
  static get DefaultStoragePruneIntervalMS() {
    return 900000;
  }

  static async CopyFromJSON(dataJSON) {
    const storage = new Storage();
    storage._restoreKeyRegistries(
      dataJSON._keyRegistry,
      dataJSON._secureKeyRegistry,
    );
    // Timers and sub-objects are not restored from JSON
    storage._cache = await CacheStore.Factory();
    storage._sessionStorage = await SessionStorage.Factory();
    storage._localStorage = await LocalStorage.Factory();
    storage._crypto = await PublicKeyCrypto.Factory();
    return storage;
  }

  // Protected: encapsulate registry restoration for maintainability
  _restoreKeyRegistries(keyRegistryArr, secureKeyRegistryArr) {
    this._KeyRegistry = new Map(keyRegistryArr);
    this._SecureKeyRegistry = new Map(secureKeyRegistryArr);
  }
  static CopyToJSON(instance) {
    return {
      _keyRegistry: Array.from(instance.#keyRegistry.entries()),
      _secureKeyRegistry: Array.from(instance.#secureKeyRegistry.entries()),
    };
  }
  static CopyFromObject(destination, source) {
    destination._restoreKeyRegistries(
      Array.from(source.KeyRegistry.entries()),
      Array.from(source.SecureKeyRegistry.entries()),
    );
  }
  static async Factory(
    storageRegistryPruneIntervalMs = Storage.DefaultStoragePruneIntervalMS,
  ) {
    console.log("[DEBUG] [TRACE] TOP OF Storage.Factory");
    console.trace("[TRACE] Storage.Factory stack");
    const storage = new Storage(storageRegistryPruneIntervalMs);
    // Use static Factory methods for all utility/service classes
    storage._cache = await CacheStore.Factory(storage._cache_purge_intervalMS);
    storage._sessionStorage = await SessionStorage.Factory(
      storage._sessionStorage_purge_intervalMS,
    );
    storage._localStorage = await LocalStorage.Factory(
      storage._localStorage_purge_intervalMS,
    );
    storage._crypto = await PublicKeyCrypto.Factory();
    let gitHubOk = false;
    let googleDriveOk = false;
    try {
      storage._gitHub = await GitHubData.factory(
        "trrmann",
        "UnitManagementTools",
      );
      if (storage._gitHub && typeof storage._gitHub.get === "function") {
        gitHubOk = true;
        console.debug(
          "[Storage.Factory] GitHubData object created:",
          storage._gitHub,
        );
      } else {
        storage._gitHub = null;
        console.error(
          "[Storage.Factory] GitHubData.factory did not return a valid object:",
          storage._gitHub,
        );
      }
    } catch (e) {
      storage._gitHub = null;
      console.error("[Storage.Factory] Failed to create GitHubData object:", e);
    }
    // Always proceed to Auth.Factory, even if GoogleDrive.Factory fails or hangs
    let googleDriveTimedOut = false;
    try {
      // Attempt to load Google Drive config from local file
      let googleDriveConfig = null;
      try {
        const response = await fetch("data/googleDrive.json");
        if (!response.ok) throw new Error("Local googleDrive.json not found");
        const rawConfig = await response.json();
        // Normalize config for GoogleDrive.Factory
        if (rawConfig && rawConfig.web) {
          googleDriveConfig = {
            CLIENT_ID: rawConfig.web.client_id,
            API_KEY: rawConfig.web.api_key || undefined,
            SCOPES: rawConfig.web.scopes || rawConfig.web.scope,
            DISCOVERY_DOCS:
              rawConfig.web.discovery_docs ||
              rawConfig.web.discovery_docs ||
              rawConfig.web.discoveryDocs,
            name: rawConfig.web.name || undefined,
            project_id: rawConfig.web.project_id || undefined,
            redirect_uris: rawConfig.web.redirect_uris || undefined,
            javascript_origins: rawConfig.web.javascript_origins || undefined,
          };
        } else {
          googleDriveConfig = rawConfig;
        }
        console.debug(
          "[Storage.Factory] Loaded and normalized googleDrive.json config:",
          googleDriveConfig,
        );
      } catch (configErr) {
        googleDriveConfig = null;
        console.error(
          "[Storage.Factory] Failed to load googleDrive.json config:",
          configErr,
        );
      }
      const googleDrivePromise = await GoogleDrive.Factory(
        storage._gitHub,
        googleDriveConfig,
      );
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          googleDriveTimedOut = true;
          reject(
            new Error(
              "[Storage.Factory] GoogleDrive.Factory timed out after 5 seconds. Proceeding without Google Drive.",
            ),
          );
        }, 5000),
      );
      storage._googleDrive = await Promise.race([
        googleDrivePromise,
        timeoutPromise,
      ]);
      if (
        storage._googleDrive &&
        typeof storage._googleDrive.Get === "function" &&
        typeof storage._googleDrive.Set === "function"
      ) {
        googleDriveOk = true;
      } else {
        storage._googleDrive = null;
        //console.error('[Storage.Factory] GoogleDrive.Factory did not return a valid object:', storage._googleDrive);
      }
    } catch (e) {
      storage._googleDrive = null;
      if (googleDriveTimedOut) {
        console.error(
          "[Storage.Factory] GoogleDrive.Factory timed out. Continuing initialization without Google Drive.",
        );
      } else {
        console.error(
          "[Storage.Factory] Failed to create GoogleDrive object:",
          e,
        );
      }
    }

    // Always attach async Get/Set methods to the storage object
    // Prefer SessionStorage, then Cache, then LocalStorage, then fallback in-memory
    const _memoryStore = new Map();
    Object.defineProperty(storage, "Get", {
      value: async function (key, options = {}) {
        if (
          this._sessionStorage &&
          typeof this._sessionStorage.HasKey === "function" &&
          this._sessionStorage.HasKey(key)
        ) {
          return await this._sessionStorage.Get(key);
        }
        if (
          this._cache &&
          typeof this._cache.Has === "function" &&
          this._cache.Has(key)
        ) {
          return await this._cache.Get(key);
        }
        if (
          this._localStorage &&
          typeof this._localStorage.HasKey === "function" &&
          this._localStorage.HasKey(key)
        ) {
          return await this._localStorage.GetKey(key);
        }
        if (_memoryStore.has(key)) {
          return _memoryStore.get(key);
        }
        return undefined;
      },
      writable: true,
      configurable: true,
      enumerable: false,
    });
    Object.defineProperty(storage, "Set", {
      value: async function (key, value, options = {}) {
        if (
          this._sessionStorage &&
          typeof this._sessionStorage.Set === "function"
        ) {
          await this._sessionStorage.Set(key, value);
        }
        if (this._cache && typeof this._cache.Set === "function") {
          await this._cache.Set(key, value);
        }
        if (
          this._localStorage &&
          typeof this._localStorage.Set === "function"
        ) {
          await this._localStorage.Set(key, value);
        }
        _memoryStore.set(key, value);
      },
      writable: true,
      configurable: true,
      enumerable: false,
    });

    // Log the final storage object before returning
    const finalOwnProps = Object.getOwnPropertyNames(storage);
    const finalGetType = typeof storage.Get;
    const finalSetType = typeof storage.Set;
    const finalGetCtor =
      storage.Get && storage.Get.constructor
        ? storage.Get.constructor.name
        : "undefined";
    const finalSetCtor =
      storage.Set && storage.Set.constructor
        ? storage.Set.constructor.name
        : "undefined";
    console.debug(
      "[Storage.Factory][FINAL] Own property names:",
      finalOwnProps,
    );
    console.debug(
      "[Storage.Factory][FINAL] typeof Get:",
      finalGetType,
      "constructor:",
      finalGetCtor,
    );
    console.debug(
      "[Storage.Factory][FINAL] typeof Set:",
      finalSetType,
      "constructor:",
      finalSetCtor,
    );
    console.log("[DEBUG] [TRACE] END OF Storage.Factory");
    console.log("[DEBUG] Storage.Factory is about to return storage object.");
    return storage;
    // Ensure the storage object itself implements async Get/Set for all consumers
    storage.#storage = storage;
    // Optionally test GoogleDrive if available
    if (googleDriveOk) {
      await Storage.testGoogleDrive(storage);
    }
    return storage;
  }
  static async testGoogleDrive(storage) {
    // --- GoogleDrive advanced feature demo ---
    let fileList = null;
    const options = {
      retryCount: 2,
      backoffMs: 300,
      debug: true,
      enableTrackingMap: true,
      enableCompression: true,
      enableVersioning: true,
      enableQuotaAwareness: true,
    };
    try {
      // List files (uses tracking map if enabled)
      fileList = await storage._googleDrive.listDirectory("", 100, options);
    } catch (error) {
      console.warn("Google Drive listFiles error:", error);
    }
    const myData = {
      foo: "bar",
      baz: 123,
      expires: new Date(Date.now() + 86400000).toISOString(),
    };
    let uploadResult = null;
    try {
      // Upload with expiration and metadata
      uploadResult = await storage._googleDrive.set(
        "mydata.json",
        myData,
        "json",
        {
          ...options,
          expires: myData.expires,
          tags: ["demo", "test"],
          owner: "system",
          custom: { note: "Advanced GoogleDrive test" },
        },
      );
    } catch (error) {
      console.warn("Google Drive uploadFile error:", error);
    }
    try {
      fileList = await storage._googleDrive.listDirectory("", 100, options);
    } catch (error) {
      console.warn("Google Drive listFiles error:", error);
    }
    try {
      // Use uploadResult.id for downloadFile
      if (uploadResult && uploadResult.id) {
        const fileDownload = await storage._googleDrive.get(
          uploadResult.id,
          "json",
          options,
        );
        // Optionally handle fileDownload result here if needed
      }
    } catch (error) {
      console.warn("Google Drive downloadFile error:", error);
    }
    try {
      // Prune expired files (if any)
      if (typeof storage._googleDrive.pruneExpiredFiles === "function") {
        await storage._googleDrive.pruneExpiredFiles(options);
      }
    } catch (error) {
      console.warn("Google Drive pruneExpiredFiles error:", error);
    }
    try {
      // Show Drive quota info
      if (typeof storage._googleDrive.getDriveQuota === "function") {
        const quota = await storage._googleDrive.getDriveQuota();
        console.info("Google Drive quota:", quota);
      }
    } catch (error) {
      console.warn("Google Drive getDriveQuota error:", error);
    }
    try {
      fileList = await storage._googleDrive.listDirectory("", 100, options);
    } catch (error) {
      console.warn("Google Drive listFiles error:", error);
    }
    // --- End GoogleDrive advanced feature demo ---
  }
  RegisterKey(key, expire) {
    this.#keyRegistry.set(key, expire);
  }
  UnregisterKey(key) {
    if (this.SecureKeyRegistered(key)) {
      this.UnregisterSecureKey(key);
    } else {
      this.#keyRegistry.delete(key);
    }
  }
  KeyRegistered(key) {
    return this.#keyRegistry.has(key);
  }
  GetAllKeys() {
    return Array.from(this.#keyRegistry.keys());
  }
  RegisterSecureKey(key, expire) {
    this.RegisterKey(key, expire);
    this.#secureKeyRegistry.set(key, expire);
  }
  UnregisterSecureKey(key) {
    this.#secureKeyRegistry.delete(key);
    this.UnregisterKey(key);
  }
  SecureKeyRegistered(key) {
    return this.#secureKeyRegistry.has(key);
  }
  GetAllSecureKeys() {
    return Array.from(this.#secureKeyRegistry.keys());
  }
  RegistryPrune() {
    const now = Date.now();
    for (const [key, entry] of this.#secureKeyRegistry) {
      if (entry && now > entry) {
        this.UnregisterSecureKey(key);
      }
    }
    for (const [key, entry] of this.#keyRegistry) {
      if (entry && now > entry) {
        this.UnregisterKey(key);
      }
    }
  }
  StartRegistryPruneTimer(intervalMs = null) {
    TimerUtils.start(
      this,
      "_registryPruneTimer",
      "_registryPruneIntervalMs",
      () => this.RegistryPrune(),
      intervalMs || 60000,
    );
  }
  PauseRegistryPruneTimer() {
    TimerUtils.pause(this, "_registryPruneTimer");
  }
  ResumeRegistryPruneTimer() {
    TimerUtils.resume(
      this,
      "_registryPruneTimer",
      "_registryPruneIntervalMs",
      () => this.RegistryPrune(),
    );
  }
  StopRegistryPruneTimer() {
    TimerUtils.stop(this, "_registryPruneTimer", "_registryPruneIntervalMs");
  }

  // Central get: cache → session → local → google → github
  async Get(key, options = {}) {
    const {
      cacheTtlMs = null,
      sessionTtlMs = null,
      localTtlMs = null,
      googleId = null,
      githubFilename = null,
      privateKey = null,
      publicKey = null,
      secure = false,
    } = options;
    let found = undefined;
    // 1. Cache
    if (
      this._cache &&
      typeof this._cache.Has === "function" &&
      this._cache.Has(key)
    )
      found = this._cache.Get(key);
    // 2. Session Storage
    if (
      found === undefined &&
      this._sessionStorage &&
      typeof this._sessionStorage.HasKey === "function" &&
      this._sessionStorage.HasKey(key)
    )
      found = this._sessionStorage.Get(key);
    // 3. Local Storage
    if (
      found === undefined &&
      this._localStorage &&
      typeof this._localStorage.HasKey === "function" &&
      this._localStorage.HasKey(key)
    )
      found = this._localStorage.GetKey(key);
    // 4. Google Drive (if available)
    if (
      found === undefined &&
      this._googleDrive &&
      typeof this._googleDrive.HasKey === "function" &&
      this._googleDrive.HasKey(key)
    ) {
      found = await this._googleDrive.Get(key, options);
    }
    // 5. GitHub
    if (
      found === undefined &&
      this._gitHub &&
      typeof this._gitHub.Has === "function"
    ) {
      if (await this._gitHub.Has(key)) {
        found = await this._gitHub.Get(key, "json");
      }
    }
    if (secure && privateKey) {
      return this._crypto.decrypt(privateKey, found);
    }
    return found;
  }

  // Central Set: cache, session, local, google, github
  async Set(key, value, options = {}) {
    const {
      cacheTtlMs = null,
      sessionTtlMs = null,
      localTtlMs = null,
      googleId = null,
      githubFilename = null,
      publicKey = null,
      secure = false,
    } = options;
    if (secure) {
      try {
        await this._cache.setSecure(key, value, publicKey, cacheTtlMs);
      } catch (err) {
        console.warn("Cache setSecure error:", err);
      }
      try {
        await this._sessionStorage.setSecureItem(
          key,
          value,
          publicKey,
          sessionTtlMs,
        );
      } catch (err) {
        console.warn("SessionStorage setSecureItem error:", err);
      }
      // ...existing code for secure path...
    } else {
      try {
        if (typeof this._cache.Set === "function") {
          await this._cache.Set(key, value, cacheTtlMs);
        }
      } catch (err) {
        console.warn("Cache Set error:", err);
      }
      try {
        if (typeof this._sessionStorage.Set === "function") {
          await this._sessionStorage.Set(key, value, sessionTtlMs);
        }
      } catch (err) {
        console.warn("SessionStorage Set error:", err);
      }
      try {
        if (typeof this._localStorage.Set === "function") {
          await this._localStorage.Set(key, value, localTtlMs);
        }
      } catch (err) {
        console.warn("LocalStorage Set error:", err);
      }
    }
    if (this._googleDrive && googleId) {
      try {
        // Use advanced options if provided
        await this._googleDrive.set(googleId, value, "raw", {
          ...options,
          // Example: propagate expiration, tags, owner, custom metadata if present
          expires: options.expires,
          tags: options.tags,
          owner: options.owner,
          custom: options.custom,
        });
      } catch (err) {
        console.warn("Google Drive unavailable or error:", err);
      }
    }
    if (this._gitHub && githubFilename) {
      try {
        await this._gitHub.uploadRawFile(githubFilename, value);
      } catch (err) {
        console.warn("GitHub unavailable or error:", err);
      }
    }
  }

  clearCache() {
    this._cache.Clear();
  }
  deleteCacheKey(key) {
    this._cache.Delete(key);
  }
  //
  // --- Migration Note ---
  // All GoogleDrive usage is now routed through the advanced Factory and supports tracking, expiration, versioning, compression, and quota awareness.
  // To leverage new features, pass the relevant options (expires, tags, owner, custom, etc.) to Set/Get methods.
  // See README and googleDrive.mjs for details.
  //
}
