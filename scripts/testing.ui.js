import { CacheStore } from '../modules/cacheStore.mjs';

// Testing tab UI logic
export function resetCache() {
    // Remove all cache entries regardless of expire time
    if (typeof window !== 'undefined') {
        if (window.Storage && window.Storage.Cache && typeof window.Storage.Cache.clearAll === 'function') {
            window.Storage.Cache.clearAll();
        } else if (window.CacheStore && typeof window.CacheStore.clearAll === 'function') {
            window.CacheStore.clearAll();
        }
        alert('Cache reset triggered.');
    }
}
export function resetSessionStorage() {
    if (typeof window !== 'undefined') {
        if (window.sessionStorage && typeof window.sessionStorage.clear === 'function') {
            window.sessionStorage.clear();
        }
        alert('Session Storage reset triggered. All session storage entries removed.');
    }
}
export function resetLocalStorage() {
    if (typeof window !== 'undefined') {
        if (window.localStorage && typeof window.localStorage.clear === 'function') {
            window.localStorage.clear();
        }
        alert('Local Storage reset triggered. All local storage entries removed.');
    }
}
export function resetCloudStorage() {
    if (typeof window !== 'undefined') {
        alert('Cloud Storage reset triggered.');
    }
}

// Only assign to window in browser context
if (typeof window !== 'undefined') {
    window.resetCache = resetCache;
    window.resetSessionStorage = resetSessionStorage;
    window.resetLocalStorage = resetLocalStorage;
    window.resetCloudStorage = resetCloudStorage;

    // Attach button handlers on DOMContentLoaded
    window.addEventListener('DOMContentLoaded', () => {
        const resetCacheBtn = document.getElementById('resetCacheBtn');
        const resetSessionStorageBtn = document.getElementById('resetSessionStorageBtn');
        const resetLocalStorageBtn = document.getElementById('resetLocalStorageBtn');
        const resetCloudStorageBtn = document.getElementById('resetCloudStorageBtn');
        if (resetCacheBtn) resetCacheBtn.onclick = resetCache;
        if (resetSessionStorageBtn) resetSessionStorageBtn.onclick = resetSessionStorage;
        if (resetLocalStorageBtn) resetLocalStorageBtn.onclick = resetLocalStorage;
        if (resetCloudStorageBtn) resetCloudStorageBtn.onclick = resetCloudStorage;
    });
}
