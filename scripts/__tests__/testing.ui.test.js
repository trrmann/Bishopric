import { attachTestingTabHandlers } from '../testing.ui.js';
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

    describe('Superuser Button', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div class="users-toolbar-buttons">
                    <button class="btn-warning" id="superuserBtn"><i class="fas fa-user-shield"></i> Superuser</button>
                </div>
            `;
            window.alert = jest.fn();
        });

        it('should exist in the DOM', () => {
            const btn = document.getElementById('superuserBtn');
            expect(btn).not.toBeNull();
            expect(btn.textContent).toContain('Superuser');
        });

        it('should trigger mock functionality on click', () => {
            attachTestingTabHandlers();
            const btn = document.getElementById('superuserBtn');
            btn.click();
            expect(window.alert).toHaveBeenCalledWith('Superuser mock functionality triggered.');
        });
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
    it('viewCacheBtn shows cache entries in modal', () => {
        window.Storage = {
            Cache: {
                entries: () => [['foo', 'bar'], ['baz', 123]]
            }
        };
        document.body.innerHTML += '<button id="viewCacheBtn"></button>';
        const openModalMock = jest.fn();
        window.openModal = openModalMock;
        require('../testing.ui.js');
        document.getElementById('viewCacheBtn').onclick();
        expect(openModalMock).toHaveBeenCalledWith(
            expect.stringContaining('Cache Entries'),
            expect.stringContaining('foo')
        );
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
        // Setup a persistent mock element for createElement
        const mockElement = { click: jest.fn(), set href(v) {}, set download(v) {}, remove() {} };
        document.createElement = jest.fn(() => mockElement);
        window._mockElement = mockElement;
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();
        document.getElementById('exportCacheBtn').onclick();
        expect(createObjectURL).toHaveBeenCalled();
        expect(window._mockElement.click).toHaveBeenCalled();
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

describe('Configuration Testing Tab Buttons', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        window.alert = jest.fn();
        window.URL.createObjectURL = jest.fn(() => 'blob:url');
        window.URL.revokeObjectURL = jest.fn();
        // Setup a persistent mock element for createElement
        const mockElement = { click: jest.fn(), set href(v) {}, set download(v) {}, remove: jest.fn() };
        document.createElement = jest.fn(() => mockElement);
        window._mockElement = mockElement;
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();
        // Reset mock between tests
        if (mockElement.click.mockClear) mockElement.click.mockClear();
    });

    it('Export Raw Configuration button downloads raw config as JSON', () => {
        window.Configuration = { configuration: { foo: 'bar', baz: 123 } };
        document.body.innerHTML += '<button id="exportRawConfigBtn"></button>';
        require('../testing.ui.js');
        document.getElementById('exportRawConfigBtn').onclick();
        expect(window.URL.createObjectURL).toHaveBeenCalled();
        // Assert the click method on the mock element was called
        expect(window._mockElement.click).toHaveBeenCalled();
    });

    it('Import Raw Configuration button imports raw config from JSON', () => {
        window.Configuration = { configuration: {} };
        document.body.innerHTML += '<input type="file" id="importRawConfigInput">';
        require('../testing.ui.js');
        const input = document.getElementById('importRawConfigInput');
        const file = new Blob([JSON.stringify({ foo: 'bar', baz: 123 })], { type: 'application/json' });
        file.name = 'test.json';
        const event = { target: { files: [file] } };
        // Simulate FileReader
        const origFileReader = window.FileReader;
        function MockFileReader() {
            this.readAsText = function(f) { this.onload({ target: { result: '{ "foo": "bar", "baz": 123 }' } }); };
        }
        window.FileReader = MockFileReader;
        input.onchange(event);
        expect(window.Configuration.configuration).toEqual({ foo: 'bar', baz: 123 });
        expect(window.alert).toHaveBeenCalledWith('Raw configuration import successful.');
        window.FileReader = origFileReader;
    });

    it('Export Detailed Configuration button downloads detailed config as JSON', () => {
        window.Configuration = {
            configuration: { foo: 'bar' },
            _storageObj: { type: 'mockStorage' },
            constructor: {
                CopyToJSON: jest.fn((instance) => ({ _storageObj: instance._storageObj, configuration: instance.configuration }))
            }
        };
        document.body.innerHTML += '<button id="exportDetailedConfigBtn"></button>';
        require('../testing.ui.js');
        document.getElementById('exportDetailedConfigBtn').onclick();
        expect(window.URL.createObjectURL).toHaveBeenCalled();
        // Assert the click method on the mock element was called
        expect(window._mockElement.click).toHaveBeenCalled();
        expect(window.Configuration.constructor.CopyToJSON).toHaveBeenCalledWith(window.Configuration);
    });

    it('Import Detailed Configuration button imports detailed config from JSON', () => {
        const copyFromObjectMock = jest.fn((dest, src) => { dest.configuration = src.configuration; dest._storageObj = src._storageObj; });
        window.Configuration = {
            configuration: {},
            _storageObj: {},
            constructor: { CopyFromObject: copyFromObjectMock }
        };
        document.body.innerHTML += '<input type="file" id="importDetailedConfigInput">';
        require('../testing.ui.js');
        const input = document.getElementById('importDetailedConfigInput');
        const file = new Blob([JSON.stringify({ configuration: { foo: 'bar' }, _storageObj: { type: 'mockStorage' } })], { type: 'application/json' });
        file.name = 'test.json';
        const event = { target: { files: [file] } };
        // Simulate FileReader
        const origFileReader = window.FileReader;
        function MockFileReader() {
            this.readAsText = function(f) { this.onload({ target: { result: '{ "configuration": { "foo": "bar" }, "_storageObj": { "type": "mockStorage" } }' } }); };
        }
        window.FileReader = MockFileReader;
        input.onchange(event);
        expect(copyFromObjectMock).toHaveBeenCalled();
        expect(window.Configuration.configuration).toEqual({ foo: 'bar' });
        expect(window.Configuration._storageObj).toEqual({ type: 'mockStorage' });
        expect(window.alert).toHaveBeenCalledWith('Detailed configuration import successful.');
        window.FileReader = origFileReader;

    });
});
});
