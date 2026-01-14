# GoogleDrive Module — UnitManagementTools

> **IMPORTANT: STANDALONE, BROWSER-ONLY MODULE — NO NODE.JS SUPPORT OR DEPENDENCIES**

This module is designed to be fully standalone and compatible with browser environments only.

- No Node.js-specific APIs, modules, or dependencies.
- All code uses standard ECMAScript features and browser APIs (such as fetch).
- Intended for static sites, browser-based apps, and environments where Node.js is not available.

---

## Overview

**GoogleDrive** is a robust, stateless, and fully encapsulated utility class for accessing and managing files in Google Drive, with advanced tracking, expiration, sharding, versioning, compression, quota awareness, and metadata features.

### Key Features

- **Stateless by Design:** No internal Drive data caching; every method call is a fresh network request.
- **Full Encapsulation:** All configuration/data fields are private; only documented public API is supported.
- **Minimal, High-Level Public API:** Unified `get`, `set`, `has`, `batchExists`, `listDirectory`, and static utilities.
- **Batch Operations:** Efficiently check for existence of multiple files.
- **Retry Logic:** Automatic retry with exponential backoff for network/5xx errors; configurable.
- **Debug Mode:** Enable detailed logging of all public method calls, parameters, errors, and network operations.
- **Token Management:** OAuth2 tokens managed per instance; never stored except as optional default.
- **Path Normalization & Utilities:** All paths normalized; public static utilities for validation/normalization.
- **Defensive Input Handling:** All public methods validate parameters and throw clear errors for invalid input.
- **Error Handling:** Consistent error prefix and context.
- **Extensibility:** Can be wrapped/composed for caching, batching, or retry logic.

### Advanced Features

- **Tracking Map:**
  - In-memory and Drive-synced map of file metadata, expiration, version history, tags, owner, and custom metadata.
  - Sharded for scalability; supports batch operations and optional compression.
- **Expiration & Prune Logic:**
  - Files and versions can have expiration dates; prune logic can be triggered manually or on schedule.
  - Configurable, batch, and graceful expiration handling.
- **File Versioning:**
  - Each file can maintain a version history with metadata, tags, and expiration per version.
- **Compression:**
  - Optional compression for tracking map shards to save space and bandwidth.
- **Drive Quota Awareness:**
  - Warns or errors if Drive usage is close to quota; configurable threshold.
- **Advanced Metadata:**
  - Arbitrary custom metadata, tags, and owner fields for files and versions.
- **JSDoc Typedefs:**
  - Comprehensive typedefs for all new data structures and options.

---

## Usage

```js
import { GoogleDrive } from "./modules/googleDrive.mjs";

// Create an instance (optionally pass options for retry/backoff/debug)
const gd = new GoogleDrive(gitHubDataObj, {
  retryCount: 3,
  backoffMs: 300,
  debug: true,
});

// Unified read/write API
const text = await gd.get("fileId", "raw");
const obj = await gd.get("fileId", "json");
await gd.set("filename.txt", "some text", "raw");
await gd.set("data.json", { foo: 1 }, "json");

// Check if a file exists
const exists = await gd.has("fileId");

// List files in a directory (by query)
const files = await gd.listDirectory("name contains 'report'");

// Batch existence check
const existsMap = await gd.batchExists(["id1", "id2"]);
```

---

## Migration & Integration Notes

- All new features are encapsulated; existing usage of `get`, `set`, etc. will continue to work.
- To leverage advanced features (tracking, expiration, versioning, etc.), update your usage to pass the relevant options and handle new metadata.
- See JSDoc typedefs in `googleDrive.mjs` for details on all new data structures and options.

---

## For Maintainers

- All advanced logic (tracking map, sharding, versioning, etc.) is fully encapsulated and documented in `googleDrive.mjs`.
- Do not introduce Node.js dependencies or break browser compatibility.
- Update this README and module-level docs with any new features or changes.

---

## License

MIT
