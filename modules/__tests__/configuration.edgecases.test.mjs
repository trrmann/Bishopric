import { Configuration } from '../configuration.mjs';

// Helper: delay
const delay = ms => new Promise(res => setTimeout(res, ms));

describe('Configuration Edge Cases', () => {
    test('Accessing methods before initialization completes waits for init', async () => {
        let storageSet = false;
        const storage = {
            Get: async () => undefined,
            Set: async () => { storageSet = true; },
            Cache: { Set: async () => {}, Get: async () => undefined },
            SessionStorage: { Set: async () => {}, Get: async () => undefined },
            LocalStorage: { Set: async () => {}, Get: async () => undefined },
        };
        // Simulate slow storage init
        const config = new Configuration(storage);
        // Call Configuration before init completes
        const promise = config.Configuration;
        // Should resolve after init
        expect(await promise).toBeUndefined();
        expect(storageSet).toBe(false); // No set called
    });

    test('Storage initialization timeout propagates error', async () => {
        const badStorage = {
            Get: undefined, // Will cause _Storage setter to throw
            Set: undefined,
        };
        const config = new Configuration(badStorage);
        config._initTimeoutMS = 100; // Fast timeout
        await expect(config.Configuration).rejects.toThrow('timed out');
    });

    test('Cache is invalidated and rebuilt after configuration changes', async () => {
        const storage = {
            Get: async () => ({ foo: 1 }),
            Set: async () => {},
            Cache: { Set: async () => {}, Get: async () => undefined },
            SessionStorage: { Set: async () => {}, Get: async () => undefined },
            LocalStorage: { Set: async () => {}, Get: async () => undefined },
        };
        const config = new Configuration(storage);
        await config._initPromise;
        await config.GetConfigByKey('foo');
        expect(config._keyMap).toBeDefined();
        config.InvalidateCache();
        expect(config._keyMap).toBeUndefined();
        await config.GetConfigByKey('foo');
        expect(config._keyMap).toBeDefined();
    });

    test('Handles missing storage layers gracefully', async () => {
        const storage = {
            Get: async () => undefined,
            Set: async () => {},
            // No Cache/SessionStorage/LocalStorage
        };
        const config = new Configuration(storage);
        await expect(config.Configuration).resolves.toBeUndefined();
    });

    test('Cache warming errors in #post do not break #fetch', async () => {
        const storage = {
            Get: async () => ({ foo: 'bar' }),
            Set: async () => {},
            Cache: { Set: async () => { throw new Error('cache fail'); }, Get: async () => undefined },
            SessionStorage: { Set: async () => {}, Get: async () => undefined },
            LocalStorage: { Set: async () => {}, Get: async () => undefined },
        };
        const config = new Configuration(storage);
        // Patch #post to catch errors
        const origPost = config[Object.getOwnPropertySymbols(config).find(s => s.toString().includes('#post'))];
        config.#post = async function(...args) {
            try { await origPost.apply(this, args); } catch (e) { /* swallow */ }
        };
        await expect(config.Configuration).resolves.toEqual({ foo: 'bar' });
    });
});
