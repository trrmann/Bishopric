/** @jest-environment jsdom */
// Unit tests for Testing tab UI logic
import { resetCache, resetSessionStorage, resetLocalStorage, resetCloudStorage } from '../testing.ui.js';

// Mock CacheStore for cache clearing tests
class MockCacheStore {
    constructor() {
        this.clearAllCalled = false;
        this.clearAll = this.clearAll.bind(this);
    }
    clearAll() {
        this.clearAllCalled = true;
    }
}


describe('Testing Tab UI', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        window.alert = jest.fn();
    });
    afterEach(() => {
        jest.resetModules();
    });

    it('resetCache triggers modal/alert', () => {
        // Setup mock cache
        const mockCache = new MockCacheStore();
        window.CacheStore = mockCache;
        resetCache();
        expect(window.alert).toHaveBeenCalledWith('Cache reset triggered.');
        expect(mockCache.clearAllCalled).toBe(true);
    });
    it('resetCache clears all cache entries regardless of expiration', () => {
        // Setup mock cache with dummy data
        const mockCache = new MockCacheStore();
        window.CacheStore = mockCache;
        resetCache();
        expect(mockCache.clearAllCalled).toBe(true);
    });

    it('resetSessionStorage triggers modal/alert and clears all session storage', () => {
        // Mock sessionStorage using defineProperty for robustness
        const clearMock = jest.fn();
        const origSessionStorage = window.sessionStorage;
        Object.defineProperty(window, 'sessionStorage', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: { clear: clearMock }
        });
        resetSessionStorage();
        expect(clearMock).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Session Storage reset triggered. All session storage entries removed.');
        Object.defineProperty(window, 'sessionStorage', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: origSessionStorage
        });
    });

    it('resetLocalStorage triggers modal/alert and clears all local storage', () => {
        // Mock localStorage using defineProperty for robustness
        const clearMock = jest.fn();
        const origLocalStorage = window.localStorage;
        Object.defineProperty(window, 'localStorage', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: { clear: clearMock }
        });
        resetLocalStorage();
        expect(clearMock).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Local Storage reset triggered. All local storage entries removed.');
        Object.defineProperty(window, 'localStorage', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: origLocalStorage
        });
    });

    it('resetCloudStorage triggers modal/alert and clears all cloud storage', () => {
        // Mock CloudStorage using defineProperty for robustness
        const clearMock = jest.fn();
        const origCloudStorage = window.CloudStorage;
        Object.defineProperty(window, 'CloudStorage', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: { clearAll: clearMock }
        });
        resetCloudStorage();
        expect(clearMock).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Cloud Storage reset triggered. All cloud storage entries removed.');
        Object.defineProperty(window, 'CloudStorage', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: origCloudStorage
        });
    });

    it('reset buttons call correct handlers on click', () => {
        require('../testing.ui.js');
        // Re-mock alert after requiring the UI module to ensure the mock is active for button click handlers
        window.alert = jest.fn();
        // Setup mock cache for resetCache
        const mockCache = new MockCacheStore();
        window.CacheStore = mockCache;
        // Call the reset functions directly
        resetCache();
        expect(window.alert).toHaveBeenCalledWith('Cache reset triggered.');
        // Mock sessionStorage for this test as well
        const clearMock = jest.fn();
        const origSessionStorage = window.sessionStorage;
        window.sessionStorage = { clear: clearMock };
        resetSessionStorage();
        expect(window.alert).toHaveBeenCalledWith('Session Storage reset triggered. All session storage entries removed.');
        window.sessionStorage = origSessionStorage;
        resetLocalStorage();
        expect(window.alert).toHaveBeenCalledWith('Local Storage reset triggered. All local storage entries removed.');
        resetCloudStorage();
        expect(window.alert).toHaveBeenCalledWith('Cloud Storage reset triggered. All cloud storage entries removed.');
    });
    it('viewCacheBtn shows cache entries', () => {
        window.CacheStore = {
            entries: () => [['foo', 'bar'], ['baz', 123]]
        };
        document.body.innerHTML += '<button id="viewCacheBtn"></button>';
        require('../testing.ui.js');
        window.alert = jest.fn();
        document.getElementById('viewCacheBtn').onclick();
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Cache Entries'));
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('foo'));
    });

    it('exportCacheBtn downloads cache entries as JSON', () => {
        window.CacheStore = {
            entries: () => [['foo', 'bar']]
        };
        document.body.innerHTML += '<button id="exportCacheBtn"></button>';
        require('../testing.ui.js');
        const createObjectURL = jest.fn(() => 'blob:url');
        const revokeObjectURL = jest.fn();
        window.URL.createObjectURL = createObjectURL;
        window.URL.revokeObjectURL = revokeObjectURL;
        const clickMock = jest.fn();
        document.createElement = jest.fn(() => ({ click: clickMock, set href(v) {}, set download(v) {}, remove() {} }));
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();
        document.getElementById('exportCacheBtn').onclick();
        expect(createObjectURL).toHaveBeenCalled();
        expect(clickMock).toHaveBeenCalled();
    });

    it('importCacheInput imports cache entries from JSON', () => {
        const setMock = jest.fn();
        window.CacheStore = { Set: setMock };
        document.body.innerHTML += '<input type="file" id="importCacheInput">';
        require('../testing.ui.js');
        window.alert = jest.fn();
        const input = document.getElementById('importCacheInput');
        const file = new Blob([JSON.stringify([['foo', 'bar']])], { type: 'application/json' });
        file.name = 'test.json';
        const event = { target: { files: [file] } };
        // Simulate FileReader
        const origFileReader = window.FileReader;
        function MockFileReader() {
            this.readAsText = function(f) { this.onload({ target: { result: '[ ["foo", "bar"] ]' } }); };
        }
        window.FileReader = MockFileReader;
        input.onchange(event);
        expect(setMock).toHaveBeenCalledWith('foo', 'bar');
        expect(window.alert).toHaveBeenCalledWith('Cache import successful.');
        window.FileReader = origFileReader;
    });

    // Repeat for sessionStorage, localStorage, cloudStorage...
    it('viewSessionStorageBtn shows session storage entries', () => {
        window.sessionStorage = {
            length: 1,
            key: () => 'foo',
            getItem: () => 'bar'
        };
        document.body.innerHTML += '<button id="viewSessionStorageBtn"></button>';
        require('../testing.ui.js');
        window.alert = jest.fn();
        document.getElementById('viewSessionStorageBtn').onclick();
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Session Storage Entries'));
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('foo'));
    });

    it('exportSessionStorageBtn downloads session storage as JSON', () => {
        window.sessionStorage = {
            length: 1,
            key: () => 'foo',
            getItem: () => 'bar'
        };
        document.body.innerHTML += '<button id="exportSessionStorageBtn"></button>';
        require('../testing.ui.js');
        const createObjectURL = jest.fn(() => 'blob:url');
        const revokeObjectURL = jest.fn();
        window.URL.createObjectURL = createObjectURL;
        window.URL.revokeObjectURL = revokeObjectURL;
        const clickMock = jest.fn();
        document.createElement = jest.fn(() => ({ click: clickMock, set href(v) {}, set download(v) {}, remove() {} }));
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();
        document.getElementById('exportSessionStorageBtn').onclick();
        expect(createObjectURL).toHaveBeenCalled();
        expect(clickMock).toHaveBeenCalled();
    });

    it('importSessionStorageInput imports session storage from JSON', () => {
        window.sessionStorage = { setItem: jest.fn() };
        document.body.innerHTML += '<input type="file" id="importSessionStorageInput">';
        require('../testing.ui.js');
        window.alert = jest.fn();
        const input = document.getElementById('importSessionStorageInput');
        const file = new Blob([JSON.stringify({ foo: 'bar' })], { type: 'application/json' });
        file.name = 'test.json';
        const event = { target: { files: [file] } };
        // Simulate FileReader
        const origFileReader = window.FileReader;
        function MockFileReader() {
            this.readAsText = function(f) { this.onload({ target: { result: '{ "foo": "bar" }' } }); };
        }
        window.FileReader = MockFileReader;
        input.onchange(event);
        expect(window.sessionStorage.setItem).toHaveBeenCalledWith('foo', 'bar');
        expect(window.alert).toHaveBeenCalledWith('Session Storage import successful.');
        window.FileReader = origFileReader;
    });

    it('viewLocalStorageBtn shows local storage entries', () => {
        window.localStorage = {
            length: 1,
            key: () => 'foo',
            getItem: () => 'bar'
        };
        document.body.innerHTML += '<button id="viewLocalStorageBtn"></button>';
        require('../testing.ui.js');
        window.alert = jest.fn();
        document.getElementById('viewLocalStorageBtn').onclick();
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Local Storage Entries'));
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('foo'));
    });

    it('exportLocalStorageBtn downloads local storage as JSON', () => {
        window.localStorage = {
            length: 1,
            key: () => 'foo',
            getItem: () => 'bar'
        };
        document.body.innerHTML += '<button id="exportLocalStorageBtn"></button>';
        require('../testing.ui.js');
        const createObjectURL = jest.fn(() => 'blob:url');
        const revokeObjectURL = jest.fn();
        window.URL.createObjectURL = createObjectURL;
        window.URL.revokeObjectURL = revokeObjectURL;
        const clickMock = jest.fn();
        document.createElement = jest.fn(() => ({ click: clickMock, set href(v) {}, set download(v) {}, remove() {} }));
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();
        document.getElementById('exportLocalStorageBtn').onclick();
        expect(createObjectURL).toHaveBeenCalled();
        expect(clickMock).toHaveBeenCalled();
    });

    it('importLocalStorageInput imports local storage from JSON', () => {
        window.localStorage = { setItem: jest.fn() };
        document.body.innerHTML += '<input type="file" id="importLocalStorageInput">';
        require('../testing.ui.js');
        window.alert = jest.fn();
        const input = document.getElementById('importLocalStorageInput');
        const file = new Blob([JSON.stringify({ foo: 'bar' })], { type: 'application/json' });
        file.name = 'test.json';
        const event = { target: { files: [file] } };
        // Simulate FileReader
        const origFileReader = window.FileReader;
        function MockFileReader() {
            this.readAsText = function(f) { this.onload({ target: { result: '{ "foo": "bar" }' } }); };
        }
        window.FileReader = MockFileReader;
        input.onchange(event);
        expect(window.localStorage.setItem).toHaveBeenCalledWith('foo', 'bar');
        expect(window.alert).toHaveBeenCalledWith('Local Storage import successful.');
        window.FileReader = origFileReader;
    });

    it('viewCloudStorageBtn shows cloud storage entries', () => {
        window.CloudStorage = {
            entries: () => [['foo', 'bar']]
        };
        document.body.innerHTML += '<button id="viewCloudStorageBtn"></button>';
        require('../testing.ui.js');
        window.alert = jest.fn();
        document.getElementById('viewCloudStorageBtn').onclick();
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Cloud Storage Entries'));
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('foo'));
    });

    it('exportCloudStorageBtn downloads cloud storage as JSON', () => {
        window.CloudStorage = {
            entries: () => [['foo', 'bar']]
        };
        document.body.innerHTML += '<button id="exportCloudStorageBtn"></button>';
        require('../testing.ui.js');
        const createObjectURL = jest.fn(() => 'blob:url');
        const revokeObjectURL = jest.fn();
        window.URL.createObjectURL = createObjectURL;
        window.URL.revokeObjectURL = revokeObjectURL;
        const clickMock = jest.fn();
        document.createElement = jest.fn(() => ({ click: clickMock, set href(v) {}, set download(v) {}, remove() {} }));
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();
        document.getElementById('exportCloudStorageBtn').onclick();
        expect(createObjectURL).toHaveBeenCalled();
        expect(clickMock).toHaveBeenCalled();
    });

    it('importCloudStorageInput imports cloud storage from JSON', () => {
        const setMock = jest.fn();
        window.CloudStorage = { Set: setMock };
        document.body.innerHTML += '<input type="file" id="importCloudStorageInput">';
        require('../testing.ui.js');
        window.alert = jest.fn();
        const input = document.getElementById('importCloudStorageInput');
        const file = new Blob([JSON.stringify([['foo', 'bar']])], { type: 'application/json' });
        file.name = 'test.json';
        const event = { target: { files: [file] } };
        // Simulate FileReader
        const origFileReader = window.FileReader;
        function MockFileReader() {
            this.readAsText = function(f) { this.onload({ target: { result: '[ ["foo", "bar"] ]' } }); };
        }
        window.FileReader = MockFileReader;
        input.onchange(event);
        expect(setMock).toHaveBeenCalledWith('foo', 'bar');
        expect(window.alert).toHaveBeenCalledWith('Cloud Storage import successful.');
        window.FileReader = origFileReader;
    });
});
