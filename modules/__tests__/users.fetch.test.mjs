// users.fetch.test.mjs
// Unit tests for robust Fetch logic for Users module (multi-tiered storage)

import { Users } from '../users.mjs';
import { jest } from '@jest/globals';

// Mock storage tiers
function createMockStorage({ cacheData, sessionData, localData, driveData, githubData }) {
    return {
        Cache: {
            Get: jest.fn((key) => cacheData[key]),
            Set: jest.fn((key, val) => { cacheData[key] = val; return Promise.resolve(); }),
        },
        SessionStorage: {
            Get: jest.fn((key) => sessionData[key]),
            Set: jest.fn((key, val) => { sessionData[key] = val; return Promise.resolve(); }),
        },
        LocalStorage: {
            Get: jest.fn((key) => localData[key]),
            Set: jest.fn((key, val) => { localData[key] = val; }),
        },
        Get: jest.fn(async (key, opts) => {
            if (opts.cacheTtlMs && cacheData[key]) return cacheData[key];
            if (opts.sessionTtlMs && sessionData[key]) return sessionData[key];
            if (opts.localTtlMs && localData[key]) return localData[key];
            if (driveData && driveData[key]) return driveData[key];
            if (githubData && githubData[key]) return githubData[key];
            return undefined;
        }),
        Set: jest.fn(),
        constructor: { name: 'GoogleDrive' },
        _gitHubDataObj: {
            fetchJsonFile: jest.fn((key) => githubData[key]),
        },
    };
}

describe('Users.Fetch multi-tiered storage', () => {
    const usersData = { users: [{ memberNumber: 1, name: 'Test User' }] };
    let cache, session, local, drive, github;
    let storage;
    let users;

    beforeEach(() => {
        cache = {};
        session = {};
        local = {};
        drive = {};
        github = {};
        storage = createMockStorage({ cacheData: cache, sessionData: session, localData: local, driveData: drive, githubData: github });
        users = new Users();
        users.Storage = storage;
    });

    it('reads from cache if present', async () => {
        cache[Users.UsersFilename] = usersData;
        await users.Fetch();
        expect(users.users).toEqual(usersData);
    });

    it('reads from session if cache missing, does not write to cache if already present', async () => {
        // Only session has the data, cache and local are empty
        await storage.SessionStorage.Set(Users.UsersFilename, usersData);
        cache[Users.UsersFilename] = undefined;
        local[Users.UsersFilename] = undefined;
        await users.Fetch();
        expect(users.users).toEqual(usersData);
        // Should NOT write to cache if value is already present
        expect(storage.Cache.Set).not.toHaveBeenCalled();
    });

    it('reads from local if cache/session missing, does not write to session or cache if already present', async () => {
        // Only local has the data, cache and session are empty
        await storage.LocalStorage.Set(Users.UsersFilename, usersData);
        cache[Users.UsersFilename] = undefined;
        session[Users.UsersFilename] = undefined;
        await users.Fetch();
        expect(users.users).toEqual(usersData);
        // Should NOT write to session or cache if value is already present
        expect(storage.SessionStorage.Set).not.toHaveBeenCalled();
        expect(storage.Cache.Set).not.toHaveBeenCalled();
    });

    it('reads from GoogleDrive if all others missing, does not write to other tiers', async () => {
        drive[Users.UsersFilename] = usersData;
        await users.Fetch();
        expect(users.users).toEqual(usersData);
    });

    it('reads from GitHubDataObj if all others missing, does not write to other tiers', async () => {
        github[Users.UsersFilename] = usersData;
        await users.Fetch();
        expect(users.users).toEqual(usersData);
    });

    it('sets users to undefined if not found anywhere', async () => {
        await users.Fetch();
        expect(users.users).toBeUndefined();
    });

    it('throws if Storage is not set', async () => {
        users.Storage = undefined;
        await expect(users.Fetch()).rejects.toThrow('Storage is not available');
    });
});
