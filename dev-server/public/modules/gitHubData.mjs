/**
 * ----------------------------------------------------------------------------------
 *  INTERNAL PRIVATE METHODS POLICY
 * ----------------------------------------------------------------------------------
 *
 * All methods and fields marked as private (using #) are strictly for internal use only.
 * - These private methods implement core logic, validation, and network operations.
 * - They are NOT part of the public API and must not be accessed or relied upon outside this class.
 * - Their signatures, behavior, or existence may change at any time without notice.
 * - Only the documented public methods and static utilities are supported for external use.
 *
 * This policy ensures encapsulation, maintainability, and the ability to refactor internals freely.
 *
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
 * GitHubData: A robust, stateless, and fully encapsulated utility class for accessing files and metadata from a public or private GitHub repository.
 *
 * ## Purpose
 * Provides a direct, validated, and secure interface for fetching raw file content, JSON data, and file metadata
 * from a GitHub repository using either public raw content URLs (for static sites) or the GitHub REST API.
 *
 * ## Key Features
 * - **Stateless by Design:**
 *   - No internal caching. Every method call results in a fresh network request to GitHub, ensuring up-to-date data.
 *   - Caching, if needed, should be implemented by a higher-level storage or cache manager.
 *
 * - **Full Encapsulation:**
 *   - All repository descriptors (`repoOwner`, `repoName`, `dataPath`, `branch`, `defaultToken`, `debug`) are private fields, accessible only via public getters.
 *   - All low-level helpers and parameter validation are private or static, reducing API surface and enforcing correct usage.
 *
 * - **Minimal, High-Level Public API:**
 *   - Only core methods are public: `get`, `has`, `batchExists`, `listDirectory`, and static serialization utilities (`fromJSON`, `toJSON`, `copyObject`, `factory`).
 *   - Public static utilities: `normalizePath`, `requireString` for external validation and normalization.
 *   - All other logic is encapsulated in private or static methods.
 *
 * - **Batch Operations:**
 *   - Use `batchExists` to efficiently check for the existence of multiple files in a directory with a single API call.
 *
 * - **Retry Logic:**
 *   - All network fetches use automatic retry with exponential backoff for improved robustness against transient errors and network instability.
 *   - The retry count and backoff are configurable via constructor/factory options or per-call options.
 *   - Retries only occur for network errors or HTTP 5xx errors (not for 4xx or application errors).
 *
 * - **Debug Mode:**
 *   - Pass `debug: true` to the constructor or async factory to enable detailed logging of all network operations, parameters, errors, and method calls.
 *   - When enabled, all core methods log their activity to the console for troubleshooting and transparency, including method names, parameters, URLs, and error details.
 *
 * - **Token Management:**
 *   - An optional `defaultToken` can be set at construction and is used for all authenticated requests unless overridden per call.
 *   - All fetches (including raw and JSON) support per-call token override.
 *   - Tokens are never stored internally except as an optional default for requests.
 *
 * - **Path Normalization & Utilities:**
 *   - All file and directory paths are normalized (trimmed, slashes collapsed, etc.) to prevent subtle bugs and malformed URLs.
 *   - Public static utilities: `GitHubData.normalizePath(path)` and `GitHubData.requireString(value, name)` are available for external use.
 *
 * - **Parameter Validation & Defensive Input Handling:**
 *   - All public methods validate their parameters and throw clear, consistent errors for invalid input.
 *   - Defensive input handling is enforced for all string and options parameters.
 *
 * - **Error Handling:**
 *   - All errors are thrown with a consistent prefix and include relevant context (e.g., HTTP status, filename).
 *
 * - **Extensibility:**
 *   - This class can be safely wrapped or composed with other classes to add caching, batching, or retry logic as needed.
 *
 * ## Usage
 *
 * ```js
 * import { GitHubData } from './gitHubData.mjs';
 *
 * // Create an instance for a specific repo and branch
 * const gh = new GitHubData('owner', 'repo', 'data', 'main');
 *
 * // Enable debug mode for detailed logging
 * const ghDebug = new GitHubData('owner', 'repo', 'data', 'main', null, true);
 * // or using the async factory:
 * const gh2 = await GitHubData.factory('owner', 'repo', 'data', 'main', null, true);
 *
 * // Fetch a raw file as text
 * const text = await gh.get('myfile.txt', 'raw');
 *
 * // Fetch and parse a JSON file
 * const obj = await gh.get('mydata.json', 'json');
 *
 * // Check if a file exists (uses metadata, does not download the file)
 * const exists = await gh.has('myfile.txt');
 *
 * // List files in a directory
 * const files = await gh.listDirectory('subdir/');
 * ```
 *

 * ## Public API Overview
 *
 * - **constructor(repoOwner, repoName, dataPath = 'data', branch = 'main', defaultToken = null, debug = false)**
 *   - Initializes the object for a specific GitHub repository and branch. All configuration is stored in private fields. Optionally sets a default GitHub token for authenticated requests. Pass `debug: true` to enable detailed logging.
 * - **RepoOwner, RepoName, DataPath, Branch, Debug (getters)**
 *   - Read-only accessors for the repository configuration and debug mode.
 * - **get(filename, type = 'raw', token = null, options = {})**
 *   - Fetches a file as raw text or parsed JSON. Supports per-call token and retry/backoff options. Throws if the file is not found or JSON is invalid. Logs details if debug is enabled.
 * - **has(filename, token = null)**
 *   - Checks if a file exists in the repository (using metadata, not file download). Uses the default token if not provided. Logs details if debug is enabled.
 * - **batchExists(filenames, dirPath = '', token = null)**
 *   - Efficiently checks for the existence of multiple files in a directory. Uses the default token if not provided. Logs details if debug is enabled.
 * - **listDirectory(dirPath = '', token = null, options = {})**
 *   - Lists files and directories at a given path in the repository. Supports per-call token and retry/backoff options. Uses the default token if not provided. Logs details if debug is enabled.
 * - **Static serialization utilities:**
 *   - `fromJSON`, `toJSON`, `copyObject`, `factory` for object creation and serialization. These operate on or return objects with private fields. The factory and fromJSON support the debug flag.
 *
 * ## Private Fields and Methods (Not for external use)
 *
 * - **#repoOwner, #repoName, #dataPath, #branch, #defaultToken, #debug**
 *   - Private fields holding the repository configuration, default token, and debug mode.
 * - **#fetchRawFile(filename)**
 *   - Fetches the raw text content of a file (used internally by `get`).
 * - **#fetchJsonFile(filename)**
 *   - Fetches and parses a file as JSON (used internally by `get`).
 * - **#fetchFileMetadata(filename, token = null)**
 *   - Fetches file metadata from the GitHub API (used internally by `has`).
 * - **#fetchWithRetry(url, options, retries, backoffMs)**
 *   - Performs fetch with retry and exponential backoff (used by all network methods).
 * - **#normalizePath(path)**
 *   - Normalizes file and directory paths for consistency.
 * - **#requireString(value, name)**
 *   - Validates string parameters (used internally by all public methods).
 *
 * ## Design Rationale
 *
 * - **Statelessness:**
 *   - By not caching, this class avoids subtle bugs from stale data and is safe to use in concurrent or serverless environments.
 *   - All caching and persistence should be handled by a separate layer (e.g., a Storage or CacheStore class).
 *
 * - **Separation of Concerns:**
 *   - This class is focused solely on data access. It does not manage authentication tokens, cache policies, or data transformation beyond basic JSON parsing.
 *
 * ## Security
 *
 * - For private repositories or authenticated requests, pass a GitHub token to methods that support it (e.g., `has`, `listDirectory`).
 * - Tokens are never stored internally except as an optional default for requests.
 *
 * ## Extensibility
 *
 * - This class can be safely wrapped or composed with other classes to add caching, batching, or retry logic as needed.
 *
 * ## Debugging
 *
 * - Enable debug mode to trace all network requests, parameters, and errors. This is useful for troubleshooting API issues, authentication, or repository structure problems.
 * - Debug output is sent to the console and includes method names, parameters, URLs, and error details.
 *
 *
 * ## Advanced Usage
 *
 * - **Custom Retry/Backoff:**
 *   - Pass `{ retryCount: N, backoffMs: M }` as the last argument to the constructor/factory, or as the last argument to `get`/`listDirectory` for per-call overrides.
 * - **Token Override:**
 *   - Pass a token as the third argument to `get` or as the second argument to `listDirectory` to override the default token for a single call.
 * - **Static Utilities:**
 *   - Use `GitHubData.normalizePath(path)` and `GitHubData.requireString(value, name)` for your own validation/normalization needs.
 *
 * @class
 */

export class GitHubData {
  // =============================
  // TODOs: Potential Optimizations
  // =============================
  // TODO: Add a batch directory listing method to reduce API calls when checking many files in a directory.
  // TODO: Expose rate limit headers or provide a callback for rate limit events (especially in debug mode).
  // TODO: Allow passing an AbortSignal in options for fetch cancellation.
  // TODO: Allow custom headers in options for advanced use cases.
  // TODO: Document any required browser polyfills for older browser support.
  // TODO: Provide TypeScript type definitions or JSDoc typedefs for options and responses.
  // Private fields for repository descriptors
  #repoOwner;
  #repoName;
  #dataPath;
  #branch;
  #debug = false;
  #retryCount = 3;
  #backoffMs = 300;
  // ===== Optional Default Token =====
  #defaultToken = null;
  // ===== Instance Accessors =====
  get RepoOwner() {
    return this.#repoOwner;
  }
  get RepoName() {
    return this.#repoName;
  }
  get DataPath() {
    return this.#dataPath;
  }
  get Branch() {
    return this.#branch;
  }
  get Debug() {
    return this.#debug;
  }
  get RetryCount() {
    return this.#retryCount;
  }
  get BackoffMs() {
    return this.#backoffMs;
  }

  /**
   * Validate that a string parameter is non-empty.
   * @param {string} value - The value to check.
   * @param {string} name - The parameter name for error messages.
   */
  static requireString(value, name) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(
        `GitHubData: Parameter '${name}' must be a non-empty string.`,
      );
    }
  }

  /**
   * Normalize a file or directory path: trims whitespace, removes leading './', and collapses multiple slashes.
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

  // ===== Constructor =====
  /**
   * @param {string} repoOwner
   * @param {string} repoName
   * @param {string} [dataPath="data"]
   * @param {string} [branch="main"]
   * @param {string|null} [defaultToken=null] - Optional default GitHub token for authenticated requests
   * @param {boolean} [debug=false] - Enable detailed debug logging
   * @param {object} [options={}] - Optional advanced options: { retryCount, backoffMs }
   */
  constructor(
    repoOwner,
    repoName,
    dataPath = "data",
    branch = "main",
    defaultToken = null,
    debug = false,
    options = {},
  ) {
    GitHubData.requireString(repoOwner, "repoOwner");
    GitHubData.requireString(repoName, "repoName");
    GitHubData.requireString(dataPath, "dataPath");
    GitHubData.requireString(branch, "branch");
    this.#repoOwner = repoOwner;
    this.#repoName = repoName;
    this.#dataPath = dataPath;
    this.#branch = branch;
    this.#defaultToken = defaultToken;
    this.#debug = !!debug;
    if (typeof options.retryCount === "number")
      this.#retryCount = options.retryCount;
    if (typeof options.backoffMs === "number")
      this.#backoffMs = options.backoffMs;
    if (this.#debug) {
      console.debug(`[GitHubData] Debug mode enabled.`, {
        repoOwner,
        repoName,
        dataPath,
        branch,
        defaultToken,
        retryCount: this.#retryCount,
        backoffMs: this.#backoffMs,
      });
    }
  }

  // ===== Static Methods =====
  static fromJSON(dataJSON) {
    if (!dataJSON || typeof dataJSON !== "object") {
      throw new Error(
        "GitHubData.fromJSON: dataJSON must be a non-null object.",
      );
    }
    return new GitHubData(
      dataJSON.repoOwner,
      dataJSON.repoName,
      dataJSON.dataPath,
      dataJSON.branch,
      dataJSON.defaultToken || null,
      dataJSON.debug || false,
    );
  }
  static toJSON(instance) {
    if (!(instance instanceof GitHubData)) {
      throw new Error(
        "GitHubData.toJSON: instance must be a GitHubData object.",
      );
    }
    return {
      repoOwner: instance.#repoOwner,
      repoName: instance.#repoName,
      dataPath: instance.#dataPath,
      branch: instance.#branch,
      defaultToken: instance.#defaultToken,
    };
  }
  static copyObject(destination, source) {
    if (!destination || !source) {
      throw new Error(
        "GitHubData.copyObject: Both destination and source must be provided.",
      );
    }
    destination.#repoOwner = source.#repoOwner;
    destination.#repoName = source.#repoName;
    destination.#dataPath = source.#dataPath;
    destination.#branch = source.#branch;
    destination.#defaultToken = source.#defaultToken;
  }
  /**
   * Factory method for async/consistent creation, now supports debug flag.
   * @param {string} repoOwner
   * @param {string} repoName
   * @param {string} [dataPath="data"]
   * @param {string} [branch="main"]
   * @param {string|null} [defaultToken=null]
   * @param {boolean} [debug=false]
   * @returns {Promise<GitHubData>}
   */
  /**
   * Async factory supporting advanced options.
   * @param {string} repoOwner
   * @param {string} repoName
   * @param {string} [dataPath="data"]
   * @param {string} [branch="main"]
   * @param {string|null} [defaultToken=null]
   * @param {boolean} [debug=false]
   * @param {object} [options={}] - Optional advanced options: { retryCount, backoffMs }
   * @returns {Promise<GitHubData>}
   */
  static async factory(
    repoOwner,
    repoName,
    dataPath = "data",
    branch = "main",
    defaultToken = null,
    debug = false,
    options = {},
  ) {
    return new GitHubData(
      repoOwner,
      repoName,
      dataPath,
      branch,
      defaultToken,
      debug,
      options,
    );
  }

  // ===== Core Methods =====
  getHost() {
    // No trailing slash
    return `https://${this.#repoOwner}.github.io`;
  }
  getProject() {
    // No leading or trailing slash
    return this.#repoName;
  }
  getDataPath() {
    // No leading or trailing slash
    return this.#dataPath;
  }
  getConfigurationUrl(filename) {
    GitHubData.requireString(filename, "filename");
    const normFile = GitHubData.normalizePath(filename);
    // Join parts with single slashes
    const host = this.getHost();
    const project = this.getProject();
    const dataPath = this.getDataPath();
    // Avoid double slashes
    return `${host}/${project}/${dataPath}/${normFile}`.replace(
      /([^:]\/)\/+/,
      "$1",
    );
  }
  async has(filename, token = null) {
    GitHubData.requireString(filename, "filename");
    const normFile = GitHubData.normalizePath(filename);
    const useToken = token !== null ? token : this.#defaultToken;
    if (this.#debug) {
      console.debug(`[GitHubData.has] Checking existence:`, {
        filename,
        normFile,
        token: !!token,
        useToken: !!useToken,
      });
    }
    try {
      await this.#fetchFileMetadata(normFile, useToken);
      if (this.#debug)
        console.debug(`[GitHubData.has] File exists: ${normFile}`);
      return true;
    } catch (e) {
      if (e.message && e.message.includes("Failed to fetch metadata")) {
        if (this.#debug)
          console.debug(`[GitHubData.has] File does not exist: ${normFile}`);
        return false;
      }
      if (this.#debug) console.error(`[GitHubData.has] Error:`, e);
      throw new Error(`GitHubData.has: ${e.message}`);
    }
  }

  /**
   * Batch check existence of multiple files in a directory using a single API call.
   * @param {string[]} filenames - Array of filenames (relative to dataPath)
   * @param {string|null} dirPath - Directory to list (relative to dataPath), or null for root
   * @param {string|null} token - Optional GitHub token
   * @returns {Promise<Object>} - Object mapping filename to boolean (exists or not)
   */
  async batchExists(filenames, dirPath = "", token = null) {
    if (!Array.isArray(filenames))
      throw new Error("GitHubData.batchExists: filenames must be an array.");
    const normDir = GitHubData.normalizePath(dirPath || "");
    const normFiles = filenames.map((f) => GitHubData.normalizePath(f));
    const useToken = token !== null ? token : this.#defaultToken;
    if (this.#debug) {
      console.debug(`[GitHubData.batchExists] Checking batch existence:`, {
        filenames,
        normFiles,
        dirPath,
        normDir,
        token: !!token,
        useToken: !!useToken,
      });
    }
    const listing = await this.listDirectory(normDir, useToken);
    const fileSet = new Set(
      Array.isArray(listing) ? listing.map((f) => f.name) : [],
    );
    const result = {};
    for (const f of normFiles) result[f] = fileSet.has(f);
    if (this.#debug) console.debug(`[GitHubData.batchExists] Result:`, result);
    return result;
  }
  /**
   * Fetch a file as raw text or parsed JSON. Supports authenticated access for private repos.
   * @param {string} filename
   * @param {string} [type="raw"] - "raw" or "json"
   * @param {string|null} [token=null] - Optional GitHub token for authenticated requests
   * @param {object} [options={}] - Optional advanced options: { retryCount, backoffMs }
   * @returns {Promise<string|object>} Raw text or parsed JSON
   */
  async get(filename, type = "raw", token = null, options = {}) {
    GitHubData.requireString(filename, "filename");
    const normFile = GitHubData.normalizePath(filename);
    if (this.#debug) {
      console.debug(`[GitHubData.get] Fetching file:`, {
        filename,
        normFile,
        type,
        token: !!token,
      });
    }
    if (type !== "raw" && type !== "json") {
      throw new Error("GitHubData.get: type must be 'raw' or 'json'.");
    }
    if (type === "raw") {
      return this.#fetchRawFile(normFile, token, options);
    } else {
      return this.#fetchJsonFile(normFile, token, options);
    }
  }
  async #fetchRawFile(filename, token = null, options = {}) {
    GitHubData.requireString(filename, "filename");
    const normFile = GitHubData.normalizePath(filename);
    const url = this.getConfigurationUrl(normFile);
    const useToken = token !== null ? token : this.#defaultToken;
    const headers = useToken ? { Authorization: `token ${useToken}` } : {};
    if (this.#debug) {
      console.debug(`[GitHubData.#fetchRawFile] Fetching raw:`, {
        filename,
        normFile,
        url,
        token: !!token,
        useToken: !!useToken,
      });
    }
    const response = await this.#fetchWithRetry(
      url,
      { headers },
      options.retryCount ?? this.#retryCount,
      options.backoffMs ?? this.#backoffMs,
    );
    if (!response.ok) {
      if (this.#debug)
        console.error(`[GitHubData.#fetchRawFile] Failed:`, {
          url,
          status: response.status,
        });
      throw new Error(
        `GitHubData.#fetchRawFile: Failed to fetch file '${normFile}' (HTTP ${response.status})`,
      );
    }
    return response.text();
  }
  async #fetchJsonFile(filename, token = null, options = {}) {
    GitHubData.requireString(filename, "filename");
    const normFile = GitHubData.normalizePath(filename);
    if (this.#debug) {
      console.debug(`[GitHubData.#fetchJsonFile] Fetching JSON:`, {
        filename,
        normFile,
      });
    }
    const text = await this.#fetchRawFile(normFile, token, options);
    try {
      const parsed = JSON.parse(text);
      if (this.#debug)
        console.debug(`[GitHubData.#fetchJsonFile] Parsed JSON:`, parsed);
      return parsed;
    } catch (e) {
      if (this.#debug)
        console.error(`[GitHubData.#fetchJsonFile] JSON parse error:`, e);
      throw new Error(
        `GitHubData.#fetchJsonFile: Failed to parse JSON in file '${normFile}': ${e.message}`,
      );
    }
  }
  async #fetchFileMetadata(filename, token = null) {
    GitHubData.requireString(filename, "filename");
    const normFile = GitHubData.normalizePath(filename);
    const url = `https://api.github.com/repos/${this.#repoOwner}/${this.#repoName}/contents/${normFile}?ref=${this.#branch}`;
    const headers = token ? { Authorization: `token ${token}` } : {};
    if (this.#debug) {
      console.debug(`[GitHubData.#fetchFileMetadata] Fetching metadata:`, {
        filename,
        normFile,
        url,
        token: !!token,
      });
    }
    const response = await this.#fetchWithRetry(url, { headers });
    if (!response.ok) {
      if (this.#debug)
        console.error(`[GitHubData.#fetchFileMetadata] Failed:`, {
          url,
          status: response.status,
        });
      throw new Error(
        `GitHubData.#fetchFileMetadata: Failed to fetch metadata for file '${normFile}' (HTTP ${response.status})`,
      );
    }
    return await response.json();
  }
  /**
   * List files and directories at a given path in the repository. Returns an empty array on error or non-array response.
   * @param {string} dirPath
   * @param {string|null} [token=null]
   * @param {object} [options={}] - Optional advanced options: { retryCount, backoffMs }
   * @returns {Promise<Array>} Array of file/directory objects
   */
  async listDirectory(dirPath = "", token = null, options = {}) {
    if (typeof dirPath !== "string") {
      throw new Error("GitHubData.listDirectory: dirPath must be a string.");
    }
    const normDir = GitHubData.normalizePath(dirPath);
    const useToken = token !== null ? token : this.#defaultToken;
    const url = `https://api.github.com/repos/${this.#repoOwner}/${this.#repoName}/contents/${normDir}?ref=${this.#branch}`;
    const headers = useToken ? { Authorization: `token ${useToken}` } : {};
    if (this.#debug) {
      console.debug(`[GitHubData.listDirectory] Listing directory:`, {
        dirPath,
        normDir,
        url,
        token: !!token,
        useToken: !!useToken,
      });
    }
    const response = await this.#fetchWithRetry(
      url,
      { headers },
      options.retryCount ?? this.#retryCount,
      options.backoffMs ?? this.#backoffMs,
    );
    if (!response.ok) {
      if (this.#debug)
        console.error(`[GitHubData.listDirectory] Failed:`, {
          url,
          status: response.status,
        });
      return [];
    }
    const json = await response.json();
    if (!Array.isArray(json)) {
      if (this.#debug)
        console.warn(
          `[GitHubData.listDirectory] Non-array response, returning empty array.`,
          json,
        );
      return [];
    }
    if (this.#debug) console.debug(`[GitHubData.listDirectory] Result:`, json);
    return json;
  }
  /**
   * Private helper to perform fetch with retry and exponential backoff.
   * @param {string} url
   * @param {object} options
   * @param {number} retries
   * @param {number} backoffMs
   * @returns {Promise<Response>}
   */
  /**
   * Private helper to perform fetch with retry and exponential backoff.
   * Retries only on network errors or HTTP 5xx errors.
   * @param {string} url
   * @param {object} options
   * @param {number} retries
   * @param {number} backoffMs
   * @returns {Promise<Response>}
   */
  async #fetchWithRetry(url, options = {}, retries = 3, backoffMs = 300) {
    let attempt = 0;
    while (true) {
      try {
        const response = await fetch(url, options);
        // Only retry on network error or HTTP 5xx
        if (!response.ok && response.status >= 500 && response.status < 600) {
          if (attempt >= retries) return response;
          if (this.#debug)
            console.warn(
              `[GitHubData.#fetchWithRetry] 5xx error, retrying...`,
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
        // Only retry on network error
        if (attempt >= retries)
          throw new Error(
            `GitHubData: Network error after ${retries + 1} attempts: ${err.message}`,
          );
        if (this.#debug)
          console.warn(
            `[GitHubData.#fetchWithRetry] Network error, retrying...`,
            { url, attempt, err },
          );
        await new Promise((res) =>
          setTimeout(res, backoffMs * Math.pow(2, attempt)),
        );
        attempt++;
      }
    }
  }
  /**
   * Normalize a file or directory path: trims whitespace, removes leading './', and collapses multiple slashes.
   * @param {string} path
   * @returns {string}
   */
  // (static normalizePath and requireString now public above)
}
