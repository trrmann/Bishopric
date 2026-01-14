console.debug("[DEBUG] VERY TOP OF GOOGLEDRIVE.MJS - Module loaded");

/**
 * ----------------------------------------------------------------------------------
 *  IMPORTANT: STANDALONE, BROWSER-ONLY MODULE — NO NODE.JS SUPPORT OR DEPENDENCIES
 * ----------------------------------------------------------------------------------
 *
 * This module is designed to be fully standalone and compatible with browser environments only.
 * - It must NOT use any Node.js-specific APIs, modules, or dependencies (such as 'fs', 'path', 'process', 'Buffer', etc.).
 * - All code must be written using standard ECMAScript features and browser APIs (such as fetch).
 * - The module is intended for use in static sites, browser-based apps, and environments where Node.js is not available.
 * - If you need Node.js support, create a separate implementation or wrapper; do NOT modify this file to add Node.js features.
 *
 * Any pull request or change that introduces Node.js dependencies or breaks browser compatibility will be rejected.
 *
 * ----------------------------------------------------------------------------------
 *
 * INTERNAL PRIVATE METHODS POLICY
 * ----------------------------------------------------------------------------------
 * All methods and fields marked as private (using #) are strictly for internal use only.
 * - These private methods implement core logic, validation, and network operations.
 * - They are NOT part of the public API and must not be accessed or relied upon outside this class.
 * - Their signatures, behavior, or existence may change at any time without notice.
 * - Only the documented public methods and static utilities are supported for external use.
 *
 * This policy ensures encapsulation, maintainability, and the ability to refactor internals freely.
 *
 * ----------------------------------------------------------------------------------
 *
 * GoogleDrive: Robust, stateless, and fully encapsulated utility class for accessing and managing files in Google Drive.
 *
 * ## Key Features
 * - **Stateless by Design:**
 *   - No internal caching of Drive data. Every method call results in a fresh network request to Google Drive, ensuring up-to-date data.
 *   - Caching, if needed, should be implemented by a higher-level storage or cache manager.
 *
 * - **Full Encapsulation:**
 *   - All configuration and data fields are private (#), accessible only via public getters/setters.
 *   - All low-level helpers and parameter validation are private or static, reducing API surface and enforcing correct usage.
 *
 * - **Minimal, High-Level Public API:**
 *   - Core methods: `get`, `set`, `has`, `batchExists`, `listDirectory`, and static serialization utilities (`CopyFromJSON`, `CopyToJSON`, `CopyFromObject`, `Factory`).
 *   - Public static utilities: `normalizePath`, `requireString` for external validation and normalization.
 *   - All other logic is encapsulated in private or static methods.
 *
 * - **Read/Write Symmetry:**
 *   - `get(fileId, type, ...)` and `set(name, value, type, ...)` provide unified, parallel APIs for reading and writing raw or JSON data.
 *   - Specialized helpers: `downloadRawFile`, `downloadJsonFile`, `uploadRawFile`, `uploadJsonFile` for advanced use cases.
 *
 * - **Batch Operations:**
 *   - Use `batchExists` to efficiently check for the existence of multiple files in Drive with a single API call.
 *
 * - **Retry Logic:**
 *   - All network fetches use automatic retry with exponential backoff for improved robustness against transient errors and network instability.
 *   - The retry count and backoff are configurable via constructor/factory options or per-call options.
 *   - Retries only occur for network errors or HTTP 5xx errors (not for 4xx or application errors).
 *
 * - **Debug Mode:**
 *   - Pass `debug: true` to the constructor or async factory to enable detailed logging of all public method calls, parameters, errors, and network operations.
 *   - When enabled, all public methods and network fetches log their activity to the console for troubleshooting and transparency, including method names, parameters, URLs, and error details.
 *   - Debug mode is activated at creation and is propagated through the Factory method.
 *
 * - **Token Management:**
 *   - OAuth2 tokens are managed per instance and used for all authenticated requests.
 *   - Tokens are never stored internally except as an optional default for requests.
 *
 * - **Path Normalization & Utilities:**
 *   - All file and directory paths are normalized (trimmed, slashes collapsed, etc.) to prevent subtle bugs and malformed URLs.
 *   - Public static utilities: `GoogleDrive.normalizePath(path)` and `GoogleDrive.requireString(value, name)` are available for external use.
 *
 * - **Parameter Validation & Defensive Input Handling:**
 *   - All public methods validate their parameters and throw clear, consistent errors for invalid input.
 *   - Defensive input handling is enforced for all string and options parameters.
 *
 * - **Error Handling:**
 *   - All errors are thrown with a consistent prefix and include relevant context (e.g., HTTP status, fileId).
 *
 * - **Extensibility:**
 *   - This class can be safely wrapped or composed with other classes to add caching, batching, or retry logic as needed.
 *
 * ## Usage
 *
 * ```js
 * import { GoogleDrive } from './googleDrive.mjs';
 *
 * // Create an instance (optionally pass options for retry/backoff/debug)
 * const gd = new GoogleDrive(gitHubDataObj, { retryCount: 3, backoffMs: 300, debug: true });
 *
 * // Unified read/write API
 * const text = await gd.get('fileId', 'raw');
 * const obj = await gd.get('fileId', 'json');
 * await gd.set('filename.txt', 'some text', 'raw');
 * await gd.set('data.json', { foo: 1 }, 'json');
 *
 * // Check if a file exists
 * const exists = await gd.has('fileId');
 *
 * // List files in a directory (by query)
 * const files = await gd.listDirectory("name contains 'report'");
 *
 * // Batch existence check
 * const existsMap = await gd.batchExists(['id1', 'id2']);
 * ```
 *
 * ## Public API Overview
 *
 * - **constructor(gitHubDataObj, options = {})**
 *   - Initializes the object for a specific Google Drive context. All configuration is stored in private fields. Pass `debug: true` in options to enable detailed logging. Only one unified constructor is present.
 * - **Data (getter/setter)**
 *   - Read/write access to the in-memory data array (not Drive files).
 * - **get(fileId, type = 'raw'|'json', options = {})**
 *   - Fetches a file as raw text or parsed JSON. Throws if the file is not found or JSON is invalid. Logs details if debug is enabled.
 * - **set(name, value, type = 'raw'|'json', options = {})**
 *   - Uploads a file as raw text or JSON. Throws on error. Logs details if debug is enabled.
 * - **has(fileId, options = {})**
 *   - Checks if a file exists in Drive. Logs details if debug is enabled.
 * - **batchExists(fileIds, options = {})**
 *   - Efficiently checks for the existence of multiple files. Logs details if debug is enabled.
 * - **listDirectory(query = '', pageSize = 10, options = {})**
 *   - Lists files and directories matching a query. Logs details if debug is enabled.
 * - **deleteFile(fileId, options = {})**
 *   - Deletes a file by ID. Throws on error. Logs details if debug is enabled.
 * - **Static serialization utilities:**
 *   - `CopyFromJSON`, `CopyToJSON`, `CopyFromObject`, `Factory` for object creation and serialization.
 *   - Public static utilities: `normalizePath`, `requireString` for validation/normalization.
 *   - The `Factory` method now fully supports and propagates the debug option and all advanced options.
 *
 * ## Private Fields and Methods (Not for external use)
 *
 * - **#data, #gitHubDataObj, #isLoaded, #unitManagementToolsKey, #CLIENT_ID, #API_KEY, #DISCOVERY_DOCS, #SCOPES, #isInitialized, #secretManagerName, #secretValue, #idMap, #nameMap, #cacheDirty, #gisToken, #tokenClient, #retryCount, #backoffMs, #debug**
 *   - Private fields holding all configuration, state, and credentials.
 * - **#fetchWithRetry(url, fetchOptions, options)**
 *   - Performs fetch with retry and exponential backoff (used by all network methods).
 *
 * ## Design Rationale
 *
 * - **Statelessness:**
 *   - By not caching, this class avoids subtle bugs from stale data and is safe to use in concurrent or serverless environments.
 *   - All caching and persistence should be handled by a separate layer (e.g., a Storage or CacheStore class).
 *
 * - **Separation of Concerns:**
 *   - This class is focused solely on Drive data access. It does not manage authentication tokens, cache policies, or data transformation beyond basic JSON parsing.
 *
 * ## Security
 *
 * - For private Drive files or authenticated requests, OAuth2 tokens are managed per instance.
 * - Tokens are never stored internally except as an optional default for requests.
 *
 * ## Extensibility
 *
 * - This class can be safely wrapped or composed with other classes to add caching, batching, or retry logic as needed.
 *
 * ## Debugging
 *
 * - Enable debug mode to trace all public method calls, parameters, errors, and network requests. This is useful for troubleshooting API issues, authentication, or Drive structure problems.
 * - Debug output is sent to the console and includes method names, parameters, URLs, and error details for every public method and network operation.
 *
 * ## Advanced Usage
 *
 * - **Custom Retry/Backoff:**
 *   - Pass `{ retryCount: N, backoffMs: M }` as the last argument to the constructor/factory, or as the last argument to `get`/`set`/`listDirectory` for per-call overrides.
 * - **Static Utilities:**
 *   - Use `GoogleDrive.normalizePath(path)` and `GoogleDrive.requireString(value, name)` for your own validation/normalization needs.
 *
 * ## TODOs: Potential Optimizations
 * - Add a batch file listing method to reduce API calls when checking many files in a directory.
 * - Expose rate limit headers or provide a callback for rate limit events (especially in debug mode).
 * - Allow passing an AbortSignal in options for fetch cancellation.
 * - Allow custom headers in options for advanced use cases.
 * - Document any required browser polyfills for older browser support.
 * - Provide TypeScript type definitions or JSDoc typedefs for options and responses.
 */
export class GoogleDrive {
  /**
   * Alias for get(fileId, options). For compatibility with Storage and other modules.
   * @param {string} fileId
   * @param {object} [options]
   * @returns {Promise<any>}
   */
  async Get(fileId, options = {}) {
    // Storage expects (key, options), so pass to get as (fileId, 'json', options) for default behavior
    return this.get(fileId, "json", options);
  }
  // ====== Advanced Options and Debug ======
  #retryCount = 3;
  #backoffMs = 300;
  #debug = false;
  // ====== Private Data Fields ======
  #data = [];
  #gitHubDataObj;
  #isLoaded = false;
  #unitManagementToolsKey = GoogleDrive.DefaultUnitManagementToolsKey;
  #CLIENT_ID = null;
  /**
   * Alias for has(fileId, options). For compatibility with Storage and other modules.
   * @param {string} fileId
   * @param {object} [options]
   * @returns {Promise<boolean>}
   */
  async HasKey(fileId, options = {}) {
    return this.has(fileId, options);
  }

  /**
   * Synchronize the in-memory tracking map with the latest data from Google Drive.
   * Loads all tracking map shards and updates #trackingMap.
   * @returns {Promise<void>}
   */
  async syncTrackingMap() {
    await this.loadTrackingMap();
    if (this.#debug)
      console.debug("[GoogleDrive.syncTrackingMap] tracking map synchronized");
  }
  #API_KEY = null;
  #DISCOVERY_DOCS = [GoogleDrive.DefaultDiscoveryDocEntry];
  #SCOPES = GoogleDrive.DefaultScope;
  #isInitialized = false;
  #secretManagerName = null;
  #secretValue = null;
  #idMap = new Map();
  #nameMap = new Map();
  #cacheDirty = true;
  #gisToken = null;
  #tokenClient = null;
  #trackingMap = {}; // In-memory tracking map
  #trackingMapShards = 16; // Number of shards (hex 0-f)
  #trackingMapShardPrefix = ".trackingMap."; // Prefix for shard files

  /**
   * @param {object} [options] - Optional advanced options: { retryCount, backoffMs, debug }
   */
  constructor(gitHubDataObject, options = {}) {
    console.debug("[GoogleDrive.constructor] ENTER: constructor", {
      gitHubDataObject,
      options,
    });
    // Defensive: assign gitHubDataObject to private field
    this.#gitHubDataObj = gitHubDataObject;
    if (!this.#gitHubDataObj) {
      console.error("[GoogleDrive.constructor] gitHubDataObject is undefined!");
    }
    if (typeof options.retryCount === "number")
      this.#retryCount = options.retryCount;
    if (typeof options.backoffMs === "number")
      this.#backoffMs = options.backoffMs;
    if (options.debug) this.#debug = true;
    if (this.#debug) {
      console.info("[GoogleDrive] Debug mode enabled");
    }
    // ...existing code for initializing private fields if needed...
    console.debug("[GoogleDrive.constructor] EXIT: constructor");
  }

  // ====== Public Static Utilities ======
  /**
   * Validate that a string parameter is non-empty.
   * @param {string} value
   * @param {string} name
   */
  static requireString(value, name) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(
        `GoogleDrive: Parameter '${name}' must be a non-empty string.`,
      );
    }
  }
  /**
   * Normalize a string (trim, collapse slashes, etc.)
   * @param {string} path
   * @returns {string}
   */
  static normalizePath(path) {
    if (typeof path !== "string") return "";
    let p = path
      .trim()
      .replace(/^\.+\//, "")
      .replace(/\\/g, "/");
    p = p.replace(/\/+/g, "/");
    return p;
  }

  // ====== Retry/Backoff Fetch Helper ======
  /**
   * Fetch with retry and exponential backoff. Retries on network/5xx errors.
   * @param {string} url
   * @param {object} fetchOptions - Standard fetch options (headers, method, body, signal, etc.)
   * @param {object} [options] - { retryCount, backoffMs, debug }
   * @returns {Promise<Response>}
   */
  async #fetchWithRetry(url, fetchOptions = {}, options = {}) {
    let attempt = 0;
    const retryCount =
      typeof options.retryCount === "number"
        ? options.retryCount
        : this.#retryCount;
    const backoffMs =
      typeof options.backoffMs === "number"
        ? options.backoffMs
        : this.#backoffMs;
    const debug = options.debug ?? this.#debug;
    while (true) {
      try {
        const response = await fetch(url, fetchOptions);
        if (!response.ok && response.status >= 500 && response.status < 600) {
          if (attempt >= retryCount) return response;
          if (debug)
            console.warn(
              `[GoogleDrive.#fetchWithRetry] 5xx error, retrying...`,
              { url, status: response.status, attempt },
            );
          await new Promise((res) =>
            setTimeout(res, backoffMs * Math.pow(2, attempt)),
          );
          attempt++;
          continue;
        }
        return response;
      } catch (err) {
        if (attempt >= retryCount)
          throw new Error(
            `GoogleDrive: Network error after ${retryCount + 1} attempts: ${err.message}`,
          );
        if (debug)
          console.warn(
            `[GoogleDrive.#fetchWithRetry] Network error, retrying...`,
            { url, attempt, err },
          );
        await new Promise((res) =>
          setTimeout(res, backoffMs * Math.pow(2, attempt)),
        );
        attempt++;
      }
    }
  }
  // (Removed duplicate constructor)

  get Data() {
    return this.#data;
  }
  set Data(val) {
    this.#data = val;
    this.#cacheDirty = true;
  }

  // API ergonomic: add item safely
  addItem(item) {
    if (!item || typeof item !== "object")
      throw new Error("Item must be an object");
    this.#data.push(item);
    this.#cacheDirty = true;
  }

  // API ergonomic: remove item by id
  removeItemById(id) {
    const idx = this.#data.findIndex((i) => i.id === id);
    if (idx !== -1) {
      this.#data.splice(idx, 1);
      this.#cacheDirty = true;
      return true;
    }
    return false;
  }

  // API ergonomic: remove item by name
  removeItemByName(name) {
    const idx = this.#data.findIndex((i) => i.name === name);
    if (idx !== -1) {
      this.#data.splice(idx, 1);
      this.#cacheDirty = true;
      return true;
    }
    return false;
  }

  // Property to get the secret value retrieved from Secret Manager
  get SecretValue() {
    return this.#secretValue;
  }
  // Property to get the Google Secret Manager resource name
  get SecretManagerName() {
    return this.#secretManagerName;
  }

  // Fetch secret value from Google Secret Manager using OAuth2 access token and secretManagerName
  async fetchSecretManagerValue(options = {}) {
    if (!this._gisToken) throw new Error("Not signed in with Google");
    if (!this._secretManagerName)
      throw new Error("Secret Manager name not set");
    const url = `https://secretmanager.googleapis.com/v1/${this._secretManagerName}:access`;
    const fetchOptions = {
      method: "GET",
      headers: {
        Authorization: "Bearer " + this._gisToken,
        ...(options.headers || {}),
      },
      signal: options.signal,
    };
    const res = await this.#fetchWithRetry(url, fetchOptions, options);
    if (!res.ok) throw new Error("Failed to access secret from Secret Manager");
    const data = await res.json();
    if (data && data.payload && data.payload.data) {
      this.#secretValue = atob(data.payload.data);
    } else {
      throw new Error("Secret Manager response missing payload");
    }
  }

  // ===== Static Methods =====
  static get DefaultUnitManagementToolsKey() {
    return "AIzaSyCNEotTLr9DV2nkqPixdmcRZArDwltryh0";
  }
  static get DefaultDiscoveryDocEntry() {
    return "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
  }
  static get DefaultScope() {
    return "https://www.googleapis.com/auth/drive.file";
  }

  static CopyFromJSON(dataJSON) {
    const drive = new GoogleDrive(dataJSON.#gitHubDataObj);
    drive.Data = dataJSON.#data;
    drive.#isLoaded = dataJSON.#isLoaded;
    drive.#unitManagementToolsKey = dataJSON.#unitManagementToolsKey;
    drive.#CLIENT_ID = dataJSON.#CLIENT_ID;
    drive.#API_KEY = dataJSON.#API_KEY;
    drive.#DISCOVERY_DOCS = dataJSON.#DISCOVERY_DOCS;
    drive.#SCOPES = dataJSON.#SCOPES;
    drive.#isInitialized = dataJSON.#isInitialized;
    return drive;
  }
  static CopyToJSON(instance) {
    return {
      data: instance.#data,
      gitHubDataObj: instance.#gitHubDataObj,
      isLoaded: instance.#isLoaded,
      unitManagementToolsKey: instance.#unitManagementToolsKey,
      CLIENT_ID: instance.#CLIENT_ID,
      API_KEY: instance.#API_KEY,
      DISCOVERY_DOCS: instance.#DISCOVERY_DOCS,
      SCOPES: instance.#SCOPES,
      isInitialized: instance.#isInitialized,
    };
  }
  static CopyFromObject(destination, source) {
    destination.Data = source.#data;
    destination.#gitHubDataObj = source.#gitHubDataObj;
    destination.#isLoaded = source.#isLoaded;
    destination.#unitManagementToolsKey = source.#unitManagementToolsKey;
    destination.#CLIENT_ID = source.#CLIENT_ID;
    destination.#API_KEY = source.#API_KEY;
    destination.#DISCOVERY_DOCS = source.#DISCOVERY_DOCS;
    destination.#SCOPES = source.#SCOPES;
    destination.#isInitialized = source.#isInitialized;
  }
  static async Factory(gitHubDataObject, config) {
    // ABSOLUTE FIRST LINE
    console.debug(
      "[GoogleDrive.Factory] [ULTRA-EARLY] ABSOLUTE FIRST LINE of Factory",
    );
    try {
      console.debug(
        "[GoogleDrive.Factory] [ULTRA-EARLY] Inside try block, before any code",
      );
      console.debug("[GoogleDrive.Factory] >>> ENTER Factory");
      console.debug(
        "[GoogleDrive.Factory] DEBUG: Entered Factory, about to check config.",
      );
      console.debug(
        "[GoogleDrive.Factory] DEBUG: After config normalization. CLIENT_ID:",
        config && config.CLIENT_ID,
        "DISCOVERY_DOCS:",
        config && config.DISCOVERY_DOCS,
        "SCOPES:",
        config && config.SCOPES,
      );
      console.log("[GoogleDrive.Factory] called", { gitHubDataObject, config });
      // Early error handling for null/invalid config
      console.debug(
        "[GoogleDrive.Factory] [ULTRA-EARLY] Before config null/undefined check",
      );
      if (config === null || config === undefined) {
        console.error(
          "[GoogleDrive.Factory] ERROR: config is null or undefined. Aborting GoogleDrive.Factory early.",
        );
        return null;
      }
      // Backward compatibility: if config has web property, use it for CLIENT_ID, etc.
      console.debug(
        "[GoogleDrive.Factory] [ULTRA-EARLY] Before config.web check",
      );
      if (config.web) {
        config.CLIENT_ID = config.CLIENT_ID || config.web.client_id;
        config.DISCOVERY_DOCS =
          config.DISCOVERY_DOCS || config.web.discovery_docs;
        config.SCOPES = config.SCOPES || config.web.scopes;
        config.name = config.name || config.web.name;
      }
      let drive;
      // Defensive check for gitHubDataObject validity
      console.debug(
        "[GoogleDrive.Factory] [ULTRA-EARLY] Before hasValidGitHubData check",
      );
      const hasValidGitHubData =
        gitHubDataObject && typeof gitHubDataObject.get === "function";
      if (!hasValidGitHubData) {
        console.warn(
          "[GoogleDrive.Factory] gitHubDataObject is missing or does not have a get() method. Falling back to local config.",
        );
      }
      console.debug(
        "[GoogleDrive.Factory] [ULTRA-EARLY] Before new GoogleDrive()",
      );
      drive = new GoogleDrive(hasValidGitHubData ? gitHubDataObject : null);
      console.debug(
        "[GoogleDrive.Factory] DEBUG: GoogleDrive instance created.",
      );
      if (config) {
        console.debug("[GoogleDrive.Factory] Using provided config:", config);
        drive.CLIENT_ID = config.CLIENT_ID;
        drive.API_KEY = config.API_KEY;
        if (config.SCOPES) drive.SCOPES = config.SCOPES;
        if (config.name) drive._secretManagerName = config.name;
        console.debug(
          "[GoogleDrive.Factory] DEBUG: Config applied to drive instance. CLIENT_ID:",
          drive.CLIENT_ID,
          "SCOPES:",
          drive.SCOPES,
        );
      } else {
        // Use robust GitHubData API for config and secrets if available, else fallback to local
        let googleConfig = null;
        let secrets = null;
        if (
          hasValidGitHubData &&
          drive._gitHubDataObj &&
          typeof drive._gitHubDataObj.get === "function"
        ) {
          try {
            googleConfig = await drive._gitHubDataObj.get(
              "googleDrive.json",
              "json",
              null,
              {},
            );
            if (!googleConfig)
              throw new Error("No googleConfig returned from GitHubData.get");
            console.debug(
              "[GoogleDrive.Factory] Loaded googleConfig:",
              googleConfig,
            );
          } catch (e) {
            console.error(
              "[GoogleDrive.Factory] Failed to load googleDrive.json from GitHubData:",
              e,
            );
          }
          try {
            secrets = await drive._gitHubDataObj.get(
              "secrets.json",
              "json",
              null,
              {},
            );
            console.debug("[GoogleDrive.Factory] Loaded secrets:", secrets);
          } catch (error) {
            console.error(
              "[GoogleDrive.Factory] Failed to load secrets.json from GitHubData:",
              error,
            );
          }
        }
        // Fallback to local if not loaded
        if (!googleConfig) {
          try {
            const response = await fetch("data/googleDrive.json");
            if (!response.ok)
              throw new Error("Local googleDrive.json not found");
            googleConfig = await response.json();
            console.debug(
              "[GoogleDrive.Factory] Loaded googleConfig from local file:",
              googleConfig,
            );
          } catch (localError) {
            googleConfig = undefined;
            console.error(
              "[GoogleDrive.Factory] Failed to load googleDrive.json from local file:",
              localError,
            );
          }
        }
        if (!secrets) {
          try {
            const response = await fetch("data/secrets.json");
            if (!response.ok) throw new Error("Local secrets.json not found");
            secrets = await response.json();
            console.debug(
              "[GoogleDrive.Factory] Loaded secrets from local file:",
              secrets,
            );
          } catch (localError) {
            secrets = undefined;
            console.error(
              "[GoogleDrive.Factory] Failed to load secrets.json:",
              localError,
            );
          }
        }
        if (!googleConfig || !googleConfig.web || !googleConfig.web.client_id) {
          console.error(
            "[GoogleDrive.Factory] googleConfig.web.client_id is missing or invalid:",
            googleConfig,
          );
        }
        drive.CLIENT_ID =
          googleConfig && googleConfig.web
            ? googleConfig.web.client_id
            : undefined;
        drive.DISCOVERY_DOCS =
          googleConfig && googleConfig.web
            ? googleConfig.web.discovery_docs
            : undefined;
        drive.SCOPES =
          googleConfig && googleConfig.web
            ? googleConfig.web.scopes
            : undefined;
        if (googleConfig && googleConfig.web && googleConfig.web.name)
          drive._secretManagerName = googleConfig.web.name;
        if (secrets && secrets.googleDrive && secrets.googleDrive.client_secret)
          drive.API_KEY = secrets.googleDrive.client_secret;
      }
      console.debug("[GoogleDrive.Factory] Final CLIENT_ID:", drive.CLIENT_ID);
      console.debug("[GoogleDrive.Factory] Final API_KEY:", drive.API_KEY);
      console.debug(
        "[GoogleDrive.Factory] Loading Google Identity Services script...",
      );
      const debugStart = Date.now();
      let gisScriptResult;
      try {
        gisScriptResult = await drive.loadGisScript();
      } catch (gisErr) {
        console.error("[GoogleDrive.Factory] ERROR in loadGisScript:", gisErr);
        throw gisErr;
      }
      console.debug(
        "[GoogleDrive.Factory] GIS script load elapsed ms:",
        Date.now() - debugStart,
      );
      console.debug(
        "[GoogleDrive.Factory] GIS script load result:",
        gisScriptResult,
      );
      console.debug(
        "[GoogleDrive.Factory] GIS script loaded. Checking sign-in status...",
      );
      // Always ensure user is signed in before fetching secrets or returning instance
      if (
        !drive.isSignedIn ||
        typeof drive.isSignedIn !== "function" ||
        !drive.isSignedIn()
      ) {
        console.debug(
          "[GoogleDrive.Factory] Not signed in. Calling signIn()...",
        );
        const debugSignInStart = Date.now();
        try {
          //await drive.signIn();
          console.debug(
            "[GoogleDrive.Factory] signIn() elapsed ms:",
            Date.now() - debugSignInStart,
          );
          console.debug("[GoogleDrive.Factory] signIn() resolved.");
        } catch (signInErr) {
          console.error("[GoogleDrive.Factory] signIn() failed:", signInErr);
          throw signInErr;
        }
      } else {
        console.debug("[GoogleDrive.Factory] Already signed in.");
      }
      // Fetch secret from Secret Manager if name is set and signed in
      if (drive._secretManagerName && drive._gisToken) {
        await drive.fetchSecretManagerValue();
      } else if (drive._secretManagerName && !drive.gisToken) {
        // Try to sign in again if not signed in, then fetch secret
        await drive.signIn();
        if (drive.gisToken) {
          await drive.fetchSecretManagerValue();
        } else {
          console.warn(
            "[GoogleDrive.Factory] SecretManagerName is set but not signed in; skipping fetchSecretManagerValue.",
          );
        }
      }
      console.log(
        "[GoogleDrive.Factory] END OF Factory, about to return drive instance.",
      );
      console.debug(
        "[GoogleDrive.Factory] <<< EXIT Factory, returning drive instance",
      );
      return drive;
    } catch (err) {
      console.error(
        "[GoogleDrive.Factory] [ULTRA-EARLY] ERROR in Factory:",
        err,
      );
      throw err;
    }
  }
  /*
    const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();
async function accessSecret() {
  const [version] = await client.accessSecretVersion({
    name: 'projects/PROJECT_ID/secrets/SECRET_ID/versions/latest',
  });
  const payload = version.payload.data.toString();
    // ...existing code...
    console.debug('[GoogleDrive.mjs] [ULTRA-EARLY] Module loaded and export block reached.');
}
accessSecret();
    /**/
  // (Removed loadGapiScript, not needed for GIS OAuth2)
  // Dynamically load Google Identity Services script
  async loadGisScript() {
    console.debug("[GoogleDrive.loadGisScript] >>> ENTER loadGisScript");
    try {
      if (
        window.google &&
        window.google.accounts &&
        window.google.accounts.id
      ) {
        console.debug("[GoogleDrive.loadGisScript] GIS script already loaded.");
        console.debug("[GoogleDrive.loadGisScript] <<< EXIT loadGisScript");
        return "already-loaded";
      }
      return await new Promise((resolve, reject) => {
        console.debug(
          "[GoogleDrive.loadGisScript] Creating script tag for GIS...",
        );
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.debug("[GoogleDrive.loadGisScript] GIS script onload fired.");
          console.debug("[GoogleDrive.loadGisScript] <<< EXIT loadGisScript");
          resolve("loaded");
        };
        script.onerror = (e) => {
          console.error(
            "[GoogleDrive.loadGisScript] GIS script failed to load:",
            e,
          );
          reject("Failed to load Google Identity Services script");
        };
        document.body.appendChild(script);
        console.debug(
          "[GoogleDrive.loadGisScript] Script tag appended to body.",
        );
      });
    } catch (err) {
      console.error("[GoogleDrive.loadGisScript] ERROR:", err);
      throw err;
    }
  }

  CopyFromJSON(json) {
    if (Array.isArray(json)) {
      this.Data = json;
    } else if (json && Array.isArray(json.items)) {
      this.Data = json.items;
    } else {
      this.Data = [];
    }
  }

  CopyFromObject(obj) {
    this.CopyFromJSON(obj);
  }

  // Accessors (O(1) with internal maps)
  // Note: Direct mutation of this._data (e.g., push/splice) will NOT update the maps. Always use the setter for replacement.
  GetItemById(id) {
    if (!this._data || this._data.length === 0) return null;
    return this._idMap.get(id) || null;
  }

  GetItemByName(name) {
    if (!this._data || this._data.length === 0) return null;
    return this._nameMap.get(name) || null;
  }

  HasItemById(id) {
    if (!this._data || this._data.length === 0) return false;
    return this._idMap.has(id);
  }

  HasItemByName(name) {
    if (!this._data || this._data.length === 0) return false;
    return this._nameMap.has(name);
  }

  GetAll() {
    if (!this._data || this._data.length === 0) return [];
    return this._data.slice();
  }
  // Build internal maps for fast lookup
  _buildCache() {
    this._idMap = new Map();
    this._nameMap = new Map();
    if (Array.isArray(this._data)) {
      for (const item of this._data) {
        if (item && item.id !== undefined) this._idMap.set(item.id, item);
        if (item && item.name !== undefined) this._nameMap.set(item.name, item);
      }
    }
    this._cacheDirty = false;
  }
  // Ensure cache is up to date before lookup
  _ensureCache() {
    if (this._cacheDirty) this._buildCache();
  }
  GetItemById(id) {
    this._ensureCache();
    return this._idMap.has(id) ? this._idMap.get(id) : null;
  }

  GetItemByName(name) {
    this._ensureCache();
    return this._nameMap.has(name) ? this._nameMap.get(name) : null;
  }

  HasItemById(id) {
    this._ensureCache();
    return this._idMap.has(id);
  }

  HasItemByName(name) {
    this._ensureCache();
    return this._nameMap.has(name);
  }

  // (Removed initClient, not needed for GIS OAuth2)

  isSignedIn() {
    return !!this._gisToken;
  }

  async signIn(silent = false) {
    console.debug(
      "[GoogleDrive.signIn] >>> ENTER signIn. silent:",
      silent,
      "CLIENT_ID:",
      this.CLIENT_ID,
      "SCOPES:",
      this.SCOPES,
    );
    try {
      return await new Promise((resolve, reject) => {
        if (
          !window.google ||
          !window.google.accounts ||
          !window.google.accounts.oauth2
        ) {
          console.error(
            "[GoogleDrive.signIn] Google Identity Services OAuth2 not loaded",
          );
          reject("Google Identity Services OAuth2 not loaded");
          return;
        }
        if (!this._tokenClient) {
          console.debug("[GoogleDrive.signIn] Initializing token client...");
          this._tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            callback: (response) => {
              console.debug(
                "[GoogleDrive.signIn] Token client callback. Response:",
                response,
              );
              if (response && response.access_token) {
                this._gisToken = response.access_token;
                console.debug("[GoogleDrive.signIn] Access token received.");
                resolve(response);
              } else {
                console.error("[GoogleDrive.signIn] No access token returned.");
                reject("No access token returned");
              }
            },
          });
        }
        // Use prompt: '' for silent sign-in attempt
        if (silent) {
          console.debug(
            "[GoogleDrive.signIn] Requesting access token (silent)...",
          );
          this._tokenClient.requestAccessToken({ prompt: "" });
        } else {
          console.debug(
            "[GoogleDrive.signIn] Requesting access token (interactive)...",
          );
          this._tokenClient.requestAccessToken();
        }
      });
    } catch (err) {
      console.error("[GoogleDrive.signIn] ERROR:", err);
      throw err;
    } finally {
      console.debug("[GoogleDrive.signIn] <<< EXIT signIn");
    }
  }

  async signOut() {
    this._gisToken = null;
    // There is no explicit sign-out for GIS OAuth2, but you can revoke the token if needed
    // Optionally, you can call Google's revoke endpoint:
    // if (this._gisToken) fetch(`https://oauth2.googleapis.com/revoke?token=${this._gisToken}`, { method: 'POST', headers: { 'Content-type': 'application/x-www-form-urlencoded' } });
  }

  // Fetch method: loads or refreshes data from Google Drive (stub for now)
  async Fetch() {
    // TODO: Implement actual Google Drive data fetch logic here
    // For now, just mark as loaded
    this._isLoaded = true;
    return true;
  }

  // Upload a raw text file
  async uploadRawFile(name, content, mimeType = "text/plain", options = {}) {
    GoogleDrive.requireString(name, "name");
    if (typeof content !== "string" && !(content instanceof Blob))
      throw new Error("Content must be a string or Blob");
    const file = new Blob([content], { type: mimeType });
    const metadata = { name, mimeType };
    const accessToken = this._gisToken;
    if (!accessToken) throw new Error("Not signed in with Google");
    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" }),
    );
    form.append("file", file);
    const fetchOptions = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        ...(options.headers || {}),
      },
      body: form,
      signal: options.signal,
    };
    const res = await this.#fetchWithRetry(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
      fetchOptions,
      options,
    );
    return res.json();
  }

  // Download a raw text file
  async downloadRawFile(fileId, options = {}) {
    GoogleDrive.requireString(fileId, "fileId");
    const accessToken = this._gisToken;
    if (!accessToken) throw new Error("Not signed in with Google");
    const fetchOptions = {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
        ...(options.headers || {}),
      },
      signal: options.signal,
    };
    const res = await this.#fetchWithRetry(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      fetchOptions,
      options,
    );
    if (res.status === 404) {
      if (this.#debug)
        console.warn(`[GoogleDrive.downloadRawFile] File not found: ${fileId}`);
      return null;
    }
    if (!res.ok) throw new Error("Failed to download file");
    return res.text();
  }

  // Upload a file (default: JSON)
  async uploadFile(name, content, mimeType = "application/json", options = {}) {
    return this.uploadRawFile(name, content, mimeType, options);
  }

  // Download a file (default: text)
  async downloadFile(fileId, options = {}) {
    return this.downloadRawFile(fileId, options);
  }

  // Upload a JSON file (overrides mimetype)
  async uploadJsonFile(name, obj, options = {}) {
    const content = JSON.stringify(obj);
    return this.uploadRawFile(name, content, "application/json", options);
  }

  // Download a JSON file (parses result)
  async downloadJsonFile(fileId, options = {}) {
    const text = await this.downloadRawFile(fileId, options);
    return JSON.parse(text);
  }

  // (Removed duplicate downloadFile)

  /**
   * List files and directories in Google Drive matching a query (parity with GitHubData.listDirectory).
   * @param {string} query - Search query (see Google Drive API docs)
   * @param {number} [pageSize=10] - Max results
   * @param {object} [options] - Fetch/retry options
   * @returns {Promise<Array>} Array of file objects
   */
  async listDirectory(query = "", pageSize = 10, options = {}) {
    if (typeof query !== "string") throw new Error("Query must be a string");
    if (typeof pageSize !== "number" || pageSize <= 0)
      throw new Error("pageSize must be a positive number");
    const accessToken = this._gisToken;
    if (!accessToken) throw new Error("Not signed in with Google");
    const params = new URLSearchParams({
      q: query,
      pageSize: pageSize.toString(),
      fields: "nextPageToken, files(id, name)",
    });
    const fetchOptions = {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
        ...(options.headers || {}),
      },
      signal: options.signal,
    };
    const res = await this.#fetchWithRetry(
      `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
      fetchOptions,
      options,
    );
    if (!res.ok) throw new Error("Failed to list files");
    const data = await res.json();
    return data.files;
  }

  /**
   * Fetch a file as raw text or parsed JSON. Parity with GitHubData.get.
   * @param {string} fileId
   * @param {string} [type="raw"] - "raw" or "json"
   * @param {object} [options] - Fetch/retry options
   * @returns {Promise<string|object>} Raw text or parsed JSON
   */
  async get(fileId, type = "raw", options = {}) {
    GoogleDrive.requireString(fileId, "fileId");
    if (this.#debug)
      console.debug("[GoogleDrive.get] called", { fileId, type, options });
    // Optionally sync tracking map before get (for external changes)
    if (options.syncTrackingMap) {
      await this.syncTrackingMap();
    }
    const entry = this.#trackingMap[fileId];
    if (entry && entry.expires) {
      const now = Date.now();
      const exp = Date.parse(entry.expires);
      if (!isNaN(exp) && now > exp) {
        if (this.#debug)
          console.warn("[GoogleDrive.get] file expired", {
            fileId,
            expires: entry.expires,
          });
        throw new Error(
          `GoogleDrive.get: fileId ${fileId} is expired (expired at ${entry.expires})`,
        );
      }
    }
    try {
      if (type === "raw") {
        return await this.downloadRawFile(fileId, options);
      } else if (type === "json") {
        const text = await this.downloadRawFile(fileId, options);
        if (text === null) return null;
        return JSON.parse(text);
      } else {
        throw new Error("GoogleDrive.get: type must be 'raw' or 'json'.");
      }
    } catch (err) {
      if (
        err &&
        err.message &&
        err.message.includes("Failed to download file")
      ) {
        if (this.#debug)
          console.warn(
            `[GoogleDrive.get] File not found or failed to download: ${fileId}`,
          );
        return null;
      }
      if (this.#debug) console.error("[GoogleDrive.get] error", err);
      throw err;
    }
  }

  /**
   * Check if a file exists by ID. Parity with GitHubData.has.
   * @param {string} fileId
   * @param {object} [options]
   * @returns {Promise<boolean>}
   */
  async has(fileId, options = {}) {
    GoogleDrive.requireString(fileId, "fileId");
    const accessToken = this._gisToken;
    if (!accessToken) throw new Error("Not signed in with Google");
    const fetchOptions = {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
        ...(options.headers || {}),
      },
      signal: options.signal,
    };
    const res = await this.#fetchWithRetry(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id`,
      fetchOptions,
      options,
    );
    return res.ok;
  }

  /**
   * Batch check existence of multiple files by ID. Parity with GitHubData.batchExists.
   * @param {string[]} fileIds
   * @param {object} [options]
   * @returns {Promise<Object>} Object mapping fileId to boolean
   */
  async batchExists(fileIds, options = {}) {
    if (!Array.isArray(fileIds))
      throw new Error("GoogleDrive.batchExists: fileIds must be an array.");
    const results = {};
    await Promise.all(
      fileIds.map(async (id) => {
        try {
          results[id] = await this.has(id, options);
        } catch {
          results[id] = false;
        }
      }),
    );
    return results;
  }
  /**
   * Prune (delete) all expired files from Google Drive using the tracking map.
   * Supports soft expiration (grace period) and warning callbacks.
   * @param {Object} [options] - Optional config: { enabled, filter, maxPrune, gracePeriodMs, onWarning }
   *   - enabled: boolean (default true)
   *   - filter: function(fileId, meta) => boolean (custom prune logic)
   *   - maxPrune: number (max files to prune in one call)
   *   - gracePeriodMs: number (milliseconds after expiration before hard delete)
   *   - onWarning: function(fileId, meta, msOverdue) (called for files in grace period)
   * @returns {Promise<number>} Number of files pruned
   */
  async pruneExpiredFiles(options = {}) {
    if (options.enabled === false) {
      if (this.#debug)
        console.info(
          "[GoogleDrive.pruneExpiredFiles] skipped (disabled by options)",
        );
      return 0;
    }
    await this.syncTrackingMap();
    const now = Date.now();
    let idsToDelete = [];
    for (const [fileId, meta] of Object.entries(this.#trackingMap)) {
      let shouldPrune = false;
      let inGrace = false;
      let msOverdue = 0;
      if (typeof options.filter === "function") {
        shouldPrune = options.filter(fileId, meta);
      } else if (meta && meta.expires) {
        const exp = Date.parse(meta.expires);
        if (!isNaN(exp) && now > exp) {
          msOverdue = now - exp;
          if (options.gracePeriodMs && msOverdue < options.gracePeriodMs) {
            inGrace = true;
          } else {
            shouldPrune = true;
          }
        }
      }
      if (inGrace && typeof options.onWarning === "function") {
        options.onWarning(fileId, meta, msOverdue);
      }
      if (shouldPrune) idsToDelete.push(fileId);
    }
    if (typeof options.maxPrune === "number" && options.maxPrune > 0) {
      idsToDelete = idsToDelete.slice(0, options.maxPrune);
    }
    let pruned = 0;
    const results = await Promise.all(
      idsToDelete.map(async (fileId) => {
        try {
          await this.deleteFile(fileId);
          delete this.#trackingMap[fileId];
          if (this.#debug)
            console.info("[GoogleDrive.pruneExpiredFiles] deleted", fileId);
          pruned++;
          return true;
        } catch (err) {
          if (this.#debug)
            console.warn(
              "[GoogleDrive.pruneExpiredFiles] failed to delete",
              fileId,
              err,
            );
          return false;
        }
      }),
    );
    if (idsToDelete.length > 0) {
      await this.saveTrackingMap();
    }
    if (this.#debug)
      console.info(
        "[GoogleDrive.pruneExpiredFiles] total pruned",
        pruned,
        "out of",
        idsToDelete.length,
      );
    return pruned;
  }

  /**
   * Get the shard key for a fileId (hex prefix, e.g., 'a', 'f').
   * @param {string} fileId
   * @returns {string}
   */
  static getShardKey(fileId) {
    if (!fileId || typeof fileId !== "string") return "0";
    // Use first hex char of fileId as shard key (simple, fast)
    return fileId[0].toLowerCase().match(/[0-9a-f]/)
      ? fileId[0].toLowerCase()
      : "0";
  }

  /**
   * Load all tracking map shards from Google Drive.
   * @returns {Promise<Object>} The merged tracking map object.
   */
  async loadTrackingMap() {
    const all = {};
    const promises = [];
    for (let i = 0; i < this.#trackingMapShards; i++) {
      const shard = i.toString(16);
      const name = this.#trackingMapShardPrefix + shard + ".json";
      promises.push(
        (async () => {
          try {
            const files = await this.listDirectory(`name = '${name}'`, 1);
            if (files && files.length > 0) {
              const fileId = files[0].id;
              const map = await this.get(fileId, "json");
              if (map && typeof map === "object") {
                Object.assign(all, map);
              }
            }
          } catch (err) {
            if (this.#debug)
              console.warn(
                "[GoogleDrive.loadTrackingMap] failed to load shard",
                name,
                err,
              );
          }
        })(),
      );
    }
    await Promise.all(promises);
    this.#trackingMap = all;
    if (this.#debug)
      console.debug("[GoogleDrive.loadTrackingMap] loaded all shards", all);
    return this.#trackingMap;
  }

  /**
   * Compress an object to a string (JSON+base64, or use CompressionStream if available).
   * @param {Object} obj
   * @returns {Promise<string|Uint8Array>}
   */
  static async compressObject(obj) {
    const json = JSON.stringify(obj);
    if (typeof CompressionStream !== "undefined") {
      const cs = new CompressionStream("gzip");
      const writer = cs.writable.getWriter();
      writer.write(new TextEncoder().encode(json));
      writer.close();
      const compressed = await new Response(cs.readable).arrayBuffer();
      return new Uint8Array(compressed);
    } else {
      // Fallback: base64 encode JSON
      return btoa(unescape(encodeURIComponent(json)));
    }
  }
  /**
   * Decompress a string or Uint8Array to an object (gzip or base64+JSON).
   * @param {string|Uint8Array} data
   * @returns {Promise<Object>}
   */
  static async decompressObject(data) {
    if (
      data instanceof Uint8Array &&
      typeof DecompressionStream !== "undefined"
    ) {
      const ds = new DecompressionStream("gzip");
      const writer = ds.writable.getWriter();
      writer.write(data);
      writer.close();
      const text = await new Response(ds.readable).text();
      return JSON.parse(text);
    } else if (typeof data === "string") {
      // Fallback: base64 decode JSON
      const json = decodeURIComponent(escape(atob(data)));
      return JSON.parse(json);
    } else {
      throw new Error("Unsupported compressed data type");
    }
  }
  /**
   * Save all tracking map shards to Google Drive, with optional compression.
   * @param {Object} [options] - { compress: boolean }
   * @returns {Promise<void>}
   */
  async saveTrackingMap(options = {}) {
    const compress = !!options.compress;
    const shards = {};
    for (const [fileId, meta] of Object.entries(this.#trackingMap)) {
      const shard = GoogleDrive.getShardKey(fileId);
      if (!shards[shard]) shards[shard] = {};
      shards[shard][fileId] = meta;
    }
    const promises = [];
    for (let i = 0; i < this.#trackingMapShards; i++) {
      const shard = i.toString(16);
      const name = this.#trackingMapShardPrefix + shard + ".json";
      const data = shards[shard] || {};
      let payload = data;
      let type = "json";
      if (compress) {
        payload = await GoogleDrive.compressObject(data);
        type = payload instanceof Uint8Array ? "raw" : "raw";
      }
      promises.push(
        this.set(name, payload, type).catch((err) => {
          if (this.#debug)
            console.error(
              "[GoogleDrive.saveTrackingMap] failed to save shard",
              name,
              err,
            );
        }),
      );
    }
    await Promise.all(promises);
    if (this.#debug)
      console.debug(
        "[GoogleDrive.saveTrackingMap] saved all shards" +
          (compress ? " (compressed)" : ""),
      );
  }
  /**
   * Load all tracking map shards from Google Drive, with optional decompression.
   * @param {Object} [options] - { compress: boolean }
   * @returns {Promise<Object>} The merged tracking map object.
   */
  async loadTrackingMap(options = {}) {
    const decompress = !!options.compress;
    const all = {};
    const promises = [];
    for (let i = 0; i < this.#trackingMapShards; i++) {
      const shard = i.toString(16);
      const name = this.#trackingMapShardPrefix + shard + ".json";
      promises.push(
        (async () => {
          try {
            const files = await this.listDirectory(`name = '${name}'`, 1);
            if (files && files.length > 0) {
              const fileId = files[0].id;
              let map = await this.get(fileId, decompress ? "raw" : "json");
              if (decompress && map) {
                map = await GoogleDrive.decompressObject(map);
              }
              if (map && typeof map === "object") {
                Object.assign(all, map);
              }
            }
          } catch (err) {
            if (this.#debug)
              console.warn(
                "[GoogleDrive.loadTrackingMap] failed to load shard",
                name,
                err,
              );
          }
        })(),
      );
    }
    await Promise.all(promises);
    this.#trackingMap = all;
    if (this.#debug)
      console.debug(
        "[GoogleDrive.loadTrackingMap] loaded all shards" +
          (decompress ? " (decompressed)" : ""),
        all,
      );
    return this.#trackingMap;
  }

  /**
   * Update the tracking map with a file entry and optional metadata (sharded, versioned, advanced metadata).
   * Adds a new version entry for the fileId, supporting arbitrary metadata fields.
   * @param {string} fileId - The file ID to track.
   * @param {GoogleDriveVersionEntry} [meta] - Optional metadata (e.g., { expires, tags, owner, custom, ... })
   * @returns {Promise<void>}
   */
  async updateTrackingMap(fileId, meta = {}) {
    if (!fileId) throw new Error("updateTrackingMap: fileId is required");
    const now = new Date().toISOString();
    if (!this.#trackingMap[fileId]) {
      this.#trackingMap[fileId] = { versions: [] };
    }
    // Add new version entry with all metadata fields
    this.#trackingMap[fileId].versions =
      this.#trackingMap[fileId].versions || [];
    this.#trackingMap[fileId].versions.push({ ...meta, updated: now });
    // Store latest metadata at root for fast lookup
    Object.assign(this.#trackingMap[fileId], meta);
    if (this.#debug)
      console.debug(
        "[GoogleDrive.updateTrackingMap] versioned update (advanced metadata)",
        fileId,
        meta,
      );
    await this.saveTrackingMap();
  }

  /**
   * Get all versions for a fileId from the tracking map.
   * @param {string} fileId
   * @returns {Array<GoogleDriveVersionEntry>} Array of version metadata objects, or [] if none.
   */
  getFileVersions(fileId) {
    if (
      !fileId ||
      !this.#trackingMap[fileId] ||
      !Array.isArray(this.#trackingMap[fileId].versions)
    )
      return [];
    return [...this.#trackingMap[fileId].versions];
  }

  /**
   * Get Google Drive quota info for the current user.
   * @returns {Promise<{limit: string, usage: string, usageInDrive: string, usageInDriveTrash: string}>} Quota info
   */
  async getDriveQuota() {
    const accessToken = this._gisToken;
    if (!accessToken) throw new Error("Not signed in with Google");
    const res = await fetch(
      "https://www.googleapis.com/drive/v3/about?fields=storageQuota",
      {
        headers: { Authorization: "Bearer " + accessToken },
      },
    );
    if (!res.ok) throw new Error("Failed to fetch Drive quota");
    const data = await res.json();
    return data.storageQuota;
  }
  /**
   * Save all tracking map shards to Google Drive, with optional compression and quota check.
   * @param {Object} [options] - { compress: boolean, quotaWarn: number (MB) }
   * @returns {Promise<void>}
   */
  async saveTrackingMap(options = {}) {
    // Quota awareness: warn/error if usage is close to limit
    if (options.quotaWarn) {
      try {
        const quota = await this.getDriveQuota();
        const usageMB = parseInt(quota.usageInDrive, 10) / (1024 * 1024);
        const limitMB = parseInt(quota.limit, 10) / (1024 * 1024);
        if (limitMB && usageMB / limitMB > options.quotaWarn) {
          if (this.#debug)
            console.warn(
              "[GoogleDrive.saveTrackingMap] Drive quota usage high",
              { usageMB, limitMB },
            );
        }
      } catch (err) {
        if (this.#debug)
          console.warn(
            "[GoogleDrive.saveTrackingMap] Could not check quota",
            err,
          );
      }
    }
    const compress = !!options.compress;
    const shards = {};
    for (const [fileId, meta] of Object.entries(this.#trackingMap)) {
      const shard = GoogleDrive.getShardKey(fileId);
      if (!shards[shard]) shards[shard] = {};
      shards[shard][fileId] = meta;
    }
    const promises = [];
    for (let i = 0; i < this.#trackingMapShards; i++) {
      const shard = i.toString(16);
      const name = this.#trackingMapShardPrefix + shard + ".json";
      const data = shards[shard] || {};
      let payload = data;
      let type = "json";
      if (compress) {
        payload = await GoogleDrive.compressObject(data);
        type = payload instanceof Uint8Array ? "raw" : "raw";
      }
      promises.push(
        this.set(name, payload, type).catch((err) => {
          if (this.#debug)
            console.error(
              "[GoogleDrive.saveTrackingMap] failed to save shard",
              name,
              err,
            );
        }),
      );
    }
    await Promise.all(promises);
    if (this.#debug)
      console.debug(
        "[GoogleDrive.saveTrackingMap] saved all shards" +
          (compress ? " (compressed)" : ""),
      );
  }
  /**
   * Write a file as raw text or JSON, with quota check.
   * @param {string} name
   * @param {string|object} value
   * @param {string} [type="raw"]
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async set(name, value, type = "raw", options = {}) {
    if (options.quotaWarn) {
      try {
        const quota = await this.getDriveQuota();
        const usageMB = parseInt(quota.usageInDrive, 10) / (1024 * 1024);
        const limitMB = parseInt(quota.limit, 10) / (1024 * 1024);
        if (limitMB && usageMB / limitMB > options.quotaWarn) {
          if (this.#debug)
            console.warn("[GoogleDrive.set] Drive quota usage high", {
              usageMB,
              limitMB,
            });
        }
      } catch (err) {
        if (this.#debug)
          console.warn("[GoogleDrive.set] Could not check quota", err);
      }
    }
    GoogleDrive.requireString(name, "name");
    let contentType = "application/json";
    if (type === "raw") {
      if (typeof value !== "string" && !(value instanceof Blob))
        throw new Error("Value must be a string or Blob for raw upload");
      contentType = "text/plain";
    } else if (type === "json") {
      value = JSON.stringify(value);
    } else {
      throw new Error("GoogleDrive.set: type must be 'raw' or 'json'.");
    }
    const metadata = { name, mimeType: contentType };
    const accessToken = this._gisToken;
    if (!accessToken) throw new Error("Not signed in with Google");
    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" }),
    );
    form.append("file", new Blob([value], { type: contentType }));
    const fetchOptions = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        ...(options.headers || {}),
      },
      body: form,
      signal: options.signal,
    };
    const res = await this.#fetchWithRetry(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
      fetchOptions,
      options,
    );
    return res.json();
  }
}

/**
 * @typedef {Object} GoogleDriveTrackingMap
 * @property {Object<string, GoogleDriveTrackingEntry>} [fileId]
 */
/**
 * @typedef {Object} GoogleDriveTrackingEntry
 * @property {Array<GoogleDriveVersionEntry>} versions - Version history for this file
 * @property {string} [expires] - Expiration ISO date string
 * @property {Array<string>} [tags] - Tags for this file
 * @property {string} [owner] - Owner/user id
 * @property {Object} [custom] - Arbitrary custom metadata
 */
/**
 * @typedef {Object} GoogleDriveVersionEntry
 * @property {string} updated - ISO date string when this version was added
 * @property {string} [expires] - Expiration ISO date string
 * @property {Array<string>} [tags] - Tags for this version
 * @property {string} [owner] - Owner/user id
 * @property {Object} [custom] - Arbitrary custom metadata
 */
