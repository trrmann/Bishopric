import { Members } from '../members.mjs';

// Mock storage object for testing
class MockStorage {
    constructor() {
        this.data = {};
        this.Cache = { Set: jest.fn(), Get: jest.fn() };
        this.SessionStorage = { Set: jest.fn(), Get: jest.fn() };
        this.LocalStorage = { Set: jest.fn(), Get: jest.fn() };
        this.Get = jest.fn(async (filename) => this.data[filename] || undefined);
        this.Set = jest.fn(async (filename, value) => { this.data[filename] = value; });
    }
}

describe('Members', () => {

        test('Fetch writes to all storage tiers when missing', async () => {
            // Arrange: mock storage with all Get returning undefined, Set as jest.fn
            const storage = new MockStorage();
            storage.LocalStorage = { Set: jest.fn() };
            storage.SessionStorage = { Set: jest.fn() };
            storage.Cache = { Set: jest.fn() };
            storage.constructor = { name: 'GoogleDrive' };
            storage.Set = jest.fn(async () => {});
            // Simulate GitHub fallback
            storage._gitHubDataObj = { fetchJsonFile: jest.fn(async () => ({ members: [{ foo: 'bar' }] })) };
            storage.Get = jest.fn(async () => undefined);
            const members = new Members({ _storageObj: storage });
            members.roles = { Callings: { storage } };
            // Act
            await members.Fetch();
            // Assert: members written to all tiers
            expect(storage.Set).toHaveBeenCalledWith(Members.MembersFilename, { members: [{ foo: 'bar' }] }, expect.any(Object));
            expect(storage.LocalStorage.Set).toHaveBeenCalledWith(Members.MembersFilename, { members: [{ foo: 'bar' }] }, Members.MembersLocalExpireMS);
            expect(storage.SessionStorage.Set).toHaveBeenCalledWith(Members.MembersFilename, { members: [{ foo: 'bar' }] }, Members.MembersSessionExpireMS);
            expect(storage.Cache.Set).toHaveBeenCalledWith(Members.MembersFilename, { members: [{ foo: 'bar' }] }, Members.MembersCacheExpireMS);
            expect(members.members).toEqual({ members: [{ foo: 'bar' }] });
        });

        test('Fetch does not overwrite tiers where members already exists', async () => {
            // Arrange: mock storage with Get returning members for local, undefined for others
            const storage = new MockStorage();
            storage.LocalStorage = { Set: jest.fn() };
            storage.SessionStorage = { Set: jest.fn() };
            storage.Cache = { Set: jest.fn() };
            storage.constructor = { name: 'GoogleDrive' };
            storage.Set = jest.fn(async () => {});
            storage._gitHubDataObj = { fetchJsonFile: jest.fn(async () => ({ members: [{ foo: 'bar' }] })) };
            let call = 0;
            storage.Get = jest.fn(async () => {
                call++;
                if (call === 1) return undefined; // cache
                if (call === 2) return undefined; // session
                if (call === 3) return { members: [{ foo: 'bar' }] }; // local
                return undefined; // google/github
            });
            const members = new Members({ _storageObj: storage });
            members.roles = { Callings: { storage } };
            // Act
            await members.Fetch();
            // Assert: only missing tiers are written
            expect(storage.Set).not.toHaveBeenCalled(); // Not called, not GoogleDrive
            expect(storage.LocalStorage.Set).not.toHaveBeenCalled(); // Already found in local
            expect(storage.SessionStorage.Set).toHaveBeenCalledWith(Members.MembersFilename, { members: [{ foo: 'bar' }] }, Members.MembersSessionExpireMS);
            expect(storage.Cache.Set).toHaveBeenCalledWith(Members.MembersFilename, { members: [{ foo: 'bar' }] }, Members.MembersCacheExpireMS);
            expect(members.members).toEqual({ members: [{ foo: 'bar' }] });
        });
    let storage;
    let members;

    beforeEach(() => {
        storage = new MockStorage();
        members = new Members({ _storageObj: storage });
        // Provide roles/callings/org if needed for Storage
        members.roles = { Callings: { storage } };
    });

    test('constructor initializes storage and members', () => {
        expect(members.Storage).toBe(storage);
        expect(members.Members).toBeUndefined();
    });

    // Add more tests after refactor
});
