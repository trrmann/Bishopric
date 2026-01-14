import { TimerUtils } from "./objectUtils.mjs";

export class LocalStorage {
  // ===== Instance Accessors =====
  get KeyRegistry() {
    return this._keyRegistry;
  }
  get LocalStoragePruneTimer() {
    return this._localStoragePruneTimer;
  }
  get LocalStoragePruneIntervalMs() {
    return this._localStoragePruneIntervalMs;
  }

  // ===== Constructor =====
  constructor(
    localStoragePruneIntervalMs = LocalStorage.DefaultLocalStoragePruneIntervalMS,
  ) {
    this._keyRegistry = new Set();
    this._localStoragePruneTimer = null;
    this._localStoragePruneIntervalMs = null;
    if (localStoragePruneIntervalMs > 0) {
      this.StartLocalStoragePruneTimer(localStoragePruneIntervalMs);
    }
  }

  // ===== Static Methods =====
  static get DefaultLocalStoragePruneIntervalMS() {
    return 180000;
  }
  static get DefaultLocalStorageValueExpireMS() {
    return 2700000;
  }

  static CopyFromJSON(dataJSON) {
    const local = new LocalStorage();
    local._keyRegistry = new Set(dataJSON._keyRegistry);
    local._localStoragePruneIntervalMs = dataJSON._localStoragePruneIntervalMs;
    // Timer is not restored from JSON
    return local;
  }

  static CopyToJSON(instance) {
    return {
      _keyRegistry: Array.from(instance._keyRegistry),
      _localStoragePruneIntervalMs: instance._localStoragePruneIntervalMs,
    };
  }

  static CopyFromObject(destination, source) {
    destination._keyRegistry = new Set(source._keyRegistry);
    destination._localStoragePruneIntervalMs =
      source._localStoragePruneIntervalMs;
  }

  static async Factory(
    localStoragePruneIntervalMs = LocalStorage.DefaultLocalStoragePruneIntervalMS,
  ) {
    return new LocalStorage(localStoragePruneIntervalMs);
  }

  // ===== Core Methods =====
  Set(
    key,
    value,
    ttlMs = LocalStorage.DefaultLocalStorageValueExpireMS,
    isObject = false,
  ) {
    let storeValue = value;
    if (isObject) {
      storeValue = JSON.stringify(value);
    }
    if (ttlMs > 0) {
      const expires = Date.now() + ttlMs;
      const payload = JSON.stringify({ value: storeValue, expires });
      localStorage.setItem(key, payload);
    } else {
      localStorage.setItem(key, storeValue);
    }
    this._keyRegistry.add(key);
  }
  SetObject(key, value, ttlMs = LocalStorage.DefaultLocalStorageValueExpireMS) {
    this.Set(key, value, ttlMs, true);
  }
  GetAllKeys() {
    return Array.from(this._keyRegistry);
  }
  HasKey(key) {
    return this._keyRegistry.has(key);
  }
  Delete(key) {
    localStorage.removeItem(key);
    this._keyRegistry.delete(key);
  }
  Get(key) {
    if (this.HasKey(key)) {
      let payload = localStorage.getItem(key);
      if (!payload) return null;
      let value, expires;
      try {
        ({ value, expires } = JSON.parse(payload));
        if (expires && Date.now() > expires) {
          this.Delete(key);
          return null;
        }
      } catch {
        value = payload;
      }
      return value;
    }
    return undefined;
  }
  GetObject(key) {
    const val = this.Get(key);
    if (val === undefined || val === null) return val;
    try {
      return typeof val === "string" ? JSON.parse(val) : val;
    } catch {
      return val;
    }
  }
  Clear() {
    if (this._keyRegistry.size === 0) return;
    const keys = this.GetAllKeys();
    keys.forEach((key) => {
      this.Delete(key);
    });
  }
  LocalStoragePrune() {
    if (this._keyRegistry.size === 0) return;
    const keys = this.GetAllKeys();
    keys.forEach((key) => {
      this.Get(key);
    });
  }
  StartLocalStoragePruneTimer(intervalMs = null) {
    TimerUtils.start(
      this,
      "_localStoragePruneTimer",
      "_localStoragePruneIntervalMs",
      () => this.LocalStoragePrune(),
      intervalMs || LocalStorage.DefaultLocalStoragePruneIntervalMS,
    );
  }
  PauseLocalStoragePruneTimer() {
    TimerUtils.pause(this, "_localStoragePruneTimer");
  }
  ResumeLocalStoragePruneTimer() {
    TimerUtils.resume(
      this,
      "_localStoragePruneTimer",
      "_localStoragePruneIntervalMs",
      () => this.LocalStoragePrune(),
    );
  }
  StopLocalStoragePruneTimer() {
    TimerUtils.stop(
      this,
      "_localStoragePruneTimer",
      "_localStoragePruneIntervalMs",
    );
  }
}
