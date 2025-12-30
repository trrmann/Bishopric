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
        // Placeholder: implement actual cloud storage clearing logic here
        if (window.CloudStorage && typeof window.CloudStorage.clearAll === 'function') {
            window.CloudStorage.clearAll();
        }
        alert('Cloud Storage reset triggered. All cloud storage entries removed.');
    }
}

// Only assign to window in browser context
if (typeof window !== 'undefined') {
    window.resetCache = resetCache;
    window.resetSessionStorage = resetSessionStorage;
    window.resetLocalStorage = resetLocalStorage;
    window.resetCloudStorage = resetCloudStorage;

    function attachTestingTabHandlers() {
        // --- Cache ---
        const resetCacheBtn = document.getElementById('resetCacheBtn');
        const viewCacheBtn = document.getElementById('viewCacheBtn');
        const exportCacheBtn = document.getElementById('exportCacheBtn');
        const importCacheInput = document.getElementById('importCacheInput');
        if (resetCacheBtn) resetCacheBtn.onclick = resetCache;
        if (viewCacheBtn) viewCacheBtn.onclick = () => {
            let entries = [];
            if (window.CacheStore && typeof window.CacheStore.entries === 'function') {
                entries = window.CacheStore.entries();
            }
            alert('Cache Entries:\n' + JSON.stringify(entries, null, 2));
        };
        if (exportCacheBtn) exportCacheBtn.onclick = () => {
            let entries = [];
            if (window.CacheStore && typeof window.CacheStore.entries === 'function') {
                entries = window.CacheStore.entries();
            }
            const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cache-entries.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
        if (importCacheInput) importCacheInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (Array.isArray(data) && window.CacheStore && typeof window.CacheStore.Set === 'function') {
                        data.forEach(([key, value]) => window.CacheStore.Set(key, value));
                        alert('Cache import successful.');
                    }
                } catch (err) {
                    alert('Cache import failed: ' + err.message);
                }
            };
            reader.readAsText(file);
        };

        // --- Session Storage ---
        const resetSessionStorageBtn = document.getElementById('resetSessionStorageBtn');
        const viewSessionStorageBtn = document.getElementById('viewSessionStorageBtn');
        const exportSessionStorageBtn = document.getElementById('exportSessionStorageBtn');
        const importSessionStorageInput = document.getElementById('importSessionStorageInput');
        if (resetSessionStorageBtn) resetSessionStorageBtn.onclick = resetSessionStorage;
        if (viewSessionStorageBtn) viewSessionStorageBtn.onclick = () => {
            let entries = {};
            if (window.sessionStorage) {
                for (let i = 0; i < window.sessionStorage.length; i++) {
                    const key = window.sessionStorage.key(i);
                    entries[key] = window.sessionStorage.getItem(key);
                }
            }
            alert('Session Storage Entries:\n' + JSON.stringify(entries, null, 2));
        };
        if (exportSessionStorageBtn) exportSessionStorageBtn.onclick = () => {
            let entries = {};
            if (window.sessionStorage) {
                for (let i = 0; i < window.sessionStorage.length; i++) {
                    const key = window.sessionStorage.key(i);
                    entries[key] = window.sessionStorage.getItem(key);
                }
            }
            const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'session-storage.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
        if (importSessionStorageInput) importSessionStorageInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (typeof data === 'object' && window.sessionStorage) {
                        Object.entries(data).forEach(([key, value]) => window.sessionStorage.setItem(key, value));
                        alert('Session Storage import successful.');
                    }
                } catch (err) {
                    alert('Session Storage import failed: ' + err.message);
                }
            };
            reader.readAsText(file);
        };

        // --- Local Storage ---
        const resetLocalStorageBtn = document.getElementById('resetLocalStorageBtn');
        const viewLocalStorageBtn = document.getElementById('viewLocalStorageBtn');
        const exportLocalStorageBtn = document.getElementById('exportLocalStorageBtn');
        const importLocalStorageInput = document.getElementById('importLocalStorageInput');
        if (resetLocalStorageBtn) resetLocalStorageBtn.onclick = resetLocalStorage;
        if (viewLocalStorageBtn) viewLocalStorageBtn.onclick = () => {
            let entries = {};
            if (window.localStorage) {
                for (let i = 0; i < window.localStorage.length; i++) {
                    const key = window.localStorage.key(i);
                    entries[key] = window.localStorage.getItem(key);
                }
            }
            alert('Local Storage Entries:\n' + JSON.stringify(entries, null, 2));
        };
        if (exportLocalStorageBtn) exportLocalStorageBtn.onclick = () => {
            let entries = {};
            if (window.localStorage) {
                for (let i = 0; i < window.localStorage.length; i++) {
                    const key = window.localStorage.key(i);
                    entries[key] = window.localStorage.getItem(key);
                }
            }
            const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'local-storage.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
        if (importLocalStorageInput) importLocalStorageInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (typeof data === 'object' && window.localStorage) {
                        Object.entries(data).forEach(([key, value]) => window.localStorage.setItem(key, value));
                        alert('Local Storage import successful.');
                    }
                } catch (err) {
                    alert('Local Storage import failed: ' + err.message);
                }
            };
            reader.readAsText(file);
        };

        // --- Cloud Storage ---
        const resetCloudStorageBtn = document.getElementById('resetCloudStorageBtn');
        const viewCloudStorageBtn = document.getElementById('viewCloudStorageBtn');
        const exportCloudStorageBtn = document.getElementById('exportCloudStorageBtn');
        const importCloudStorageInput = document.getElementById('importCloudStorageInput');
        if (resetCloudStorageBtn) resetCloudStorageBtn.onclick = resetCloudStorage;
        if (viewCloudStorageBtn) viewCloudStorageBtn.onclick = () => {
            let entries = [];
            if (window.CloudStorage && typeof window.CloudStorage.entries === 'function') {
                entries = window.CloudStorage.entries();
            }
            alert('Cloud Storage Entries:\n' + JSON.stringify(entries, null, 2));
        };
        if (exportCloudStorageBtn) exportCloudStorageBtn.onclick = () => {
            let entries = [];
            if (window.CloudStorage && typeof window.CloudStorage.entries === 'function') {
                entries = window.CloudStorage.entries();
            }
            const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cloud-storage.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
        if (importCloudStorageInput) importCloudStorageInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (Array.isArray(data) && window.CloudStorage && typeof window.CloudStorage.Set === 'function') {
                        data.forEach(([key, value]) => window.CloudStorage.Set(key, value));
                        alert('Cloud Storage import successful.');
                    }
                } catch (err) {
                    alert('Cloud Storage import failed: ' + err.message);
                }
            };
            reader.readAsText(file);
        };
    }

    if (document.readyState !== 'loading') {
        attachTestingTabHandlers();
    } else {
        window.addEventListener('DOMContentLoaded', attachTestingTabHandlers);
    }
}
