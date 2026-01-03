        /**
         * Private helper to perform fetch with retry and exponential backoff.
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
                    return await fetch(url, options);
                } catch (err) {
                    if (attempt >= retries) throw new Error(`GitHubData: Network error after ${retries + 1} attempts: ${err.message}`);
                    await new Promise(res => setTimeout(res, backoffMs * Math.pow(2, attempt)));
                    attempt++;
                }
            }
        }
    /**
     * Normalize a file or directory path: trims whitespace, removes leading './', and collapses multiple slashes.
     * @param {string} path
     * @returns {string}
     */
    static #normalizePath(path) {
        if (typeof path !== "string") return "";
        let p = path.trim().replace(/^\.+\//, "").replace(/\\/g, "/");
        p = p.replace(/\/+/g, "/");
        return p;
    }

/**
 * GitHubData: A stateless utility class for accessing files and metadata from a public or private GitHub repository.
 *
 * ## Purpose
 * This class provides a direct, validated interface for fetching raw file content, JSON data, and file metadata
 * from a GitHub repository using either the public raw content URLs (for static sites) or the GitHub REST API.
 *
 * ## Key Features
 * - **No Internal Caching:**
 *   - Every method call results in a fresh network request to GitHub. No data is cached or stored internally.
 *   - This guarantees that all data is always up-to-date with the source repository.
 *   - Caching, if needed, should be implemented by a higher-level storage or cache manager.
 *
 * - **Batch Operations:**
 *   - Use `batchExists` to efficiently check for the existence of multiple files in a directory with a single API call.
 *
 * - **Retry Logic:**
 *   - All network fetches use automatic retry with exponential backoff for improved robustness against transient errors.

 * - **Debug Mode:**
 *   - Pass `debug: true` to the constructor or factory to enable detailed logging of all network operations, parameters, errors, and method calls.
 *   - When enabled, all core methods log their activity to the console for troubleshooting and transparency.
 *
 * - **Token Management:**
 *   - An optional `defaultToken` can be set at construction and is used for all authenticated requests unless overridden per call.
 *
 * - **Path Normalization:**
 *   - All file and directory paths are normalized (trimmed, slashes collapsed, etc.) to prevent subtle bugs and malformed URLs.
 *
 * - **Encapsulation and Minimal Public API:**
 *   - Only high-level methods are public: `get`, `has`, `batchExists`, `listDirectory`, and static serialization utilities.
 *   - All repository descriptors (`repoOwner`, `repoName`, `dataPath`, `branch`, `defaultToken`) are private fields, accessible only via public getters.
 *   - All low-level fetch helpers and parameter validation are private, ensuring correct usage and reducing API surface.
 *
 * - **Parameter Validation:**
 *   - All public methods validate their parameters and throw clear, consistent errors for invalid input.
 *
 * - **Private Fields and Public Getters:**
 *   - All repository configuration is stored in private fields: `#repoOwner`, `#repoName`, `#dataPath`, `#branch`, `#defaultToken`.
 *   - Public getters (`RepoOwner`, `RepoName`, `DataPath`, `Branch`) provide read-only access to these values.
 *
 * - **Error Handling:**
 *   - All errors are thrown with a consistent prefix and include relevant context (e.g., HTTP status, filename).
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
 * ## Public Methods Overview
 * - **constructor(repoOwner, repoName, dataPath = 'data', branch = 'main', defaultToken = null, debug = false)**
 *   - Initializes the object for a specific GitHub repository and branch. All configuration is stored in private fields. Optionally sets a default GitHub token for authenticated requests. Pass `debug: true` to enable detailed logging.
 * - **RepoOwner, RepoName, DataPath, Branch, Debug (getters)**
 *   - Read-only accessors for the repository configuration and debug mode.
 * - **get(filename, type = 'raw')**
 *   - Fetches a file as raw text or parsed JSON. Throws if the file is not found or JSON is invalid. Logs details if debug is enabled.
 * - **has(filename, token = null)**
 *   - Checks if a file exists in the repository (using metadata, not file download). Uses the default token if not provided. Logs details if debug is enabled.
 * - **batchExists(filenames, dirPath = '', token = null)**
 *   - Efficiently checks for the existence of multiple files in a directory. Uses the default token if not provided. Logs details if debug is enabled.
 * - **listDirectory(dirPath = '', token = null)**
 *   - Lists files and directories at a given path in the repository. Uses the default token if not provided. Logs details if debug is enabled.
 * - **Static serialization utilities:**
 *   - `fromJSON`, `toJSON`, `copyObject`, `factory` for object creation and serialization. These operate on or return objects with private fields. The factory and fromJSON support the debug flag.
 *
 * ## Private Fields and Methods (Not for external use)
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
 * - **Statelessness:**
 *   - By not caching, this class avoids subtle bugs from stale data and is safe to use in concurrent or serverless environments.
 *   - All caching and persistence should be handled by a separate layer (e.g., a Storage or CacheStore class).
 *
 * - **Separation of Concerns:**
 *   - This class is focused solely on data access. It does not manage authentication tokens, cache policies, or data transformation beyond basic JSON parsing.
 *
 * ## Security
 * - For private repositories or authenticated requests, pass a GitHub token to methods that support it (e.g., `has`, `listDirectory`).
 * - Tokens are never stored internally except as an optional default for requests.
 *
 * ## Extensibility
 * - This class can be safely wrapped or composed with other classes to add caching, batching, or retry logic as needed.
 *
 * ## Debugging
 * - Enable debug mode to trace all network requests, parameters, and errors. This is useful for troubleshooting API issues, authentication, or repository structure problems.
 * - Debug output is sent to the console and includes method names, parameters, URLs, and error details.
 *
 * @class
 */

export class GitHubData {
    // Private fields for repository descriptors
    #repoOwner;
    #repoName;
    #dataPath;
    #branch;
    #debug = false;
    /**
     * Validate that a string parameter is non-empty.
     * @param {string} value - The value to check.
     * @param {string} name - The parameter name for error messages.
     */
    static #requireString(value, name) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new Error(`GitHubData: Parameter '${name}' must be a non-empty string.`);
        }
    }

    // ===== Optional Default Token =====
    #defaultToken = null;
    // ===== Instance Accessors =====
    get RepoOwner() { return this.#repoOwner; }
    get RepoName() { return this.#repoName; }
    get DataPath() { return this.#dataPath; }
    get Branch() { return this.#branch; }
    get Debug() { return this.#debug; }

    // ===== Constructor =====
    /**
     * @param {string} repoOwner
     * @param {string} repoName
     * @param {string} [dataPath="data"]
     * @param {string} [branch="main"]
     * @param {string|null} [defaultToken=null] - Optional default GitHub token for authenticated requests
     * @param {boolean} [debug=false] - Enable detailed debug logging
     */
    constructor(repoOwner, repoName, dataPath="data", branch = "main", defaultToken = null, debug = false) {
        GitHubData.#requireString(repoOwner, "repoOwner");
        GitHubData.#requireString(repoName, "repoName");
        GitHubData.#requireString(dataPath, "dataPath");
        GitHubData.#requireString(branch, "branch");
        this.#repoOwner = repoOwner;
        this.#repoName = repoName;
        this.#dataPath = dataPath;
        this.#branch = branch;
        this.#defaultToken = defaultToken;
        this.#debug = !!debug;
        if (this.#debug) {
            console.debug(`[GitHubData] Debug mode enabled.`, {
                repoOwner, repoName, dataPath, branch, defaultToken
            });
        }
    }

    // ===== Static Methods =====
    static fromJSON(dataJSON) {
        if (!dataJSON || typeof dataJSON !== "object") {
            throw new Error("GitHubData.fromJSON: dataJSON must be a non-null object.");
        }
        return new GitHubData(
            dataJSON.repoOwner,
            dataJSON.repoName,
            dataJSON.dataPath,
            dataJSON.branch,
            dataJSON.defaultToken || null,
            dataJSON.debug || false
        );
    }
    static toJSON(instance) {
        if (!(instance instanceof GitHubData)) {
            throw new Error("GitHubData.toJSON: instance must be a GitHubData object.");
        }
        return {
            repoOwner: instance.#repoOwner,
            repoName: instance.#repoName,
            dataPath: instance.#dataPath,
            branch: instance.#branch,
            defaultToken: instance.#defaultToken
        };
    }
    static copyObject(destination, source) {
        if (!destination || !source) {
            throw new Error("GitHubData.copyObject: Both destination and source must be provided.");
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
    static async factory(repoOwner, repoName, dataPath="data", branch = "main", defaultToken = null, debug = false) {
        return new GitHubData(repoOwner, repoName, dataPath, branch, defaultToken, debug);
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
        GitHubData.#requireString(filename, "filename");
        const normFile = GitHubData.#normalizePath(filename);
        // Join parts with single slashes
        const host = this.getHost();
        const project = this.getProject();
        const dataPath = this.getDataPath();
        // Avoid double slashes
        return `${host}/${project}/${dataPath}/${normFile}`.replace(/([^:]\/)\/+/,'$1');
    }
    async has(filename, token = null) {
        GitHubData.#requireString(filename, "filename");
        const normFile = GitHubData.#normalizePath(filename);
        const useToken = token !== null ? token : this.#defaultToken;
        if (this.#debug) {
            console.debug(`[GitHubData.has] Checking existence:`, { filename, normFile, token: !!token, useToken: !!useToken });
        }
        try {
            await this.#fetchFileMetadata(normFile, useToken);
            if (this.#debug) console.debug(`[GitHubData.has] File exists: ${normFile}`);
            return true;
        } catch (e) {
            if (e.message && e.message.includes("Failed to fetch metadata")) {
                if (this.#debug) console.debug(`[GitHubData.has] File does not exist: ${normFile}`);
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
        if (!Array.isArray(filenames)) throw new Error("GitHubData.batchExists: filenames must be an array.");
        const normDir = GitHubData.#normalizePath(dirPath || "");
        const normFiles = filenames.map(f => GitHubData.#normalizePath(f));
        const useToken = token !== null ? token : this.#defaultToken;
        if (this.#debug) {
            console.debug(`[GitHubData.batchExists] Checking batch existence:`, { filenames, normFiles, dirPath, normDir, token: !!token, useToken: !!useToken });
        }
        const listing = await this.listDirectory(normDir, useToken);
        const fileSet = new Set(Array.isArray(listing) ? listing.map(f => f.name) : []);
        const result = {};
        for (const f of normFiles) result[f] = fileSet.has(f);
        if (this.#debug) console.debug(`[GitHubData.batchExists] Result:`, result);
        return result;
    }
    async get(filename, type="raw") {
        GitHubData.#requireString(filename, "filename");
        const normFile = GitHubData.#normalizePath(filename);
        if (this.#debug) {
            console.debug(`[GitHubData.get] Fetching file:`, { filename, normFile, type });
        }
        if (type !== "raw" && type !== "json") {
            throw new Error("GitHubData.get: type must be 'raw' or 'json'.");
        }
        if(type==="raw") {
            return this.#fetchRawFile(normFile);
        } else {
            return this.#fetchJsonFile(normFile);
        }
    }
    async #fetchRawFile(filename) {
        GitHubData.#requireString(filename, "filename");
        const normFile = GitHubData.#normalizePath(filename);
        const url = this.getConfigurationUrl(normFile);
        if (this.#debug) {
            console.debug(`[GitHubData.#fetchRawFile] Fetching raw:`, { filename, normFile, url });
        }
        const response = await this.#fetchWithRetry(url);
        if (!response.ok) {
            if (this.#debug) console.error(`[GitHubData.#fetchRawFile] Failed:`, { url, status: response.status });
            throw new Error(`GitHubData.#fetchRawFile: Failed to fetch file '${normFile}' (HTTP ${response.status})`);
        }
        return response.text();
    }
    async #fetchJsonFile(filename) {
        GitHubData.#requireString(filename, "filename");
        const normFile = GitHubData.#normalizePath(filename);
        if (this.#debug) {
            console.debug(`[GitHubData.#fetchJsonFile] Fetching JSON:`, { filename, normFile });
        }
        const text = await this.#fetchRawFile(normFile);
        try {
            const parsed = JSON.parse(text);
            if (this.#debug) console.debug(`[GitHubData.#fetchJsonFile] Parsed JSON:`, parsed);
            return parsed;
        } catch (e) {
            if (this.#debug) console.error(`[GitHubData.#fetchJsonFile] JSON parse error:`, e);
            throw new Error(`GitHubData.#fetchJsonFile: Failed to parse JSON in file '${normFile}': ${e.message}`);
        }
    }
    async #fetchFileMetadata(filename, token = null) {
        GitHubData.#requireString(filename, "filename");
        const normFile = GitHubData.#normalizePath(filename);
        const url = `https://api.github.com/repos/${this.#repoOwner}/${this.#repoName}/contents/${normFile}?ref=${this.#branch}`;
        const headers = token ? { Authorization: `token ${token}` } : {};
        if (this.#debug) {
            console.debug(`[GitHubData.#fetchFileMetadata] Fetching metadata:`, { filename, normFile, url, token: !!token });
        }
        const response = await this.#fetchWithRetry(url, { headers });
        if (!response.ok) {
            if (this.#debug) console.error(`[GitHubData.#fetchFileMetadata] Failed:`, { url, status: response.status });
            throw new Error(`GitHubData.#fetchFileMetadata: Failed to fetch metadata for file '${normFile}' (HTTP ${response.status})`);
        }
        return await response.json();
    }
    async listDirectory(dirPath = "", token = null) {
        if (typeof dirPath !== "string") {
            throw new Error("GitHubData.listDirectory: dirPath must be a string.");
        }
        const normDir = GitHubData.#normalizePath(dirPath);
        const useToken = token !== null ? token : this.#defaultToken;
        const url = `https://api.github.com/repos/${this.#repoOwner}/${this.#repoName}/contents/${normDir}?ref=${this.#branch}`;
        const headers = useToken ? { Authorization: `token ${useToken}` } : {};
        if (this.#debug) {
            console.debug(`[GitHubData.listDirectory] Listing directory:`, { dirPath, normDir, url, token: !!token, useToken: !!useToken });
        }
        const response = await this.#fetchWithRetry(url, { headers });
        if (!response.ok) {
            if (this.#debug) console.error(`[GitHubData.listDirectory] Failed:`, { url, status: response.status });
            throw new Error(`GitHubData.listDirectory: Failed to list directory '${normDir}' (HTTP ${response.status})`);
        }
        const json = await response.json();
        if (this.#debug) console.debug(`[GitHubData.listDirectory] Result:`, json);
        return json;
    }
}
