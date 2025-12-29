import { Users } from '../users.mjs';

describe('Users Class', () => {
  let users;
  let mockMembers;
  const mockMembersData = [
    {
      memberNumber: '1',
      fullname: 'John Doe',
      email: 'john@example.com',
      active: true,
      callingIDs: ['c1'],
      callingNames: ['Bishop'],
    },
    {
      memberNumber: '2',
      fullname: 'Jane Smith',
      email: 'jane@example.com',
      active: false,
      callingIDs: ['c2'],
      callingNames: ['Clerk'],
    }
  ];
  const mockUsersData = {
    users: [
      { memberNumber: '1', password: 'pass1', email: 'john@example.com', active: true },
      { memberNumber: '2', password: 'pass2', email: 'jane@example.com', active: false },
      { memberNumber: '3', password: 'pass3', email: 'other@example.com', active: true }
    ]
  };
  beforeEach(() => {
    users = new Users();
    mockMembers = {
      MembersDetails: jest.fn(async () => mockMembersData)
    };
    users.members = mockMembers;
    users.users = mockUsersData;
  });

  describe('Initialization', () => {
    test('constructor initializes properties', () => {
      expect(users.users).toBeDefined();
      expect(users.members).toBeDefined();
    });
  });

  describe('User queries', () => {
    test('UserEntries returns all user objects', () => {
      expect(users.UserEntries.length).toBe(3);
    });
    test('ActiveUsers returns only active users', () => {
      expect(users.ActiveUsers.length).toBe(2);
      expect(users.ActiveUsers[0].memberNumber).toBe('1');
      expect(users.ActiveUsers[1].memberNumber).toBe('3');
    });
  });

  describe('User details and lookup', () => {
    test('UsersDetails returns enriched user details', async () => {
      const details = await users.UsersDetails();
      expect(details.length).toBe(3);
      expect(details[0].fullname).toBe('John Doe');
      expect(details[1].fullname).toBe('Jane Smith');
      expect(details[2].fullname).toBe(''); // No member match
    });
    test('UsersDetails caches results and reuses them', async () => {
      // First call
      const details1 = await users.UsersDetails();
      expect(mockMembers.MembersDetails).toHaveBeenCalledTimes(1);
      
      // Second call - should use cache
      const details2 = await users.UsersDetails();
      expect(mockMembers.MembersDetails).toHaveBeenCalledTimes(1); // Still 1, not 2
      
      // Results should be the same
      expect(details1).toBe(details2);
    });
    test('UsersDetails cache invalidates when users data changes', async () => {
      // First call
      await users.UsersDetails();
      expect(mockMembers.MembersDetails).toHaveBeenCalledTimes(1);
      
      // Change users data
      users.users = {
        users: [
          { memberNumber: '1', password: 'pass1', email: 'john@example.com', active: true }
        ]
      };
      
      // Second call - should recalculate
      await users.UsersDetails();
      expect(mockMembers.MembersDetails).toHaveBeenCalledTimes(2);
    });
    test('UserById returns correct user', async () => {
      const result = await users.UserById('1');
      expect(result.length).toBe(1);
      expect(result[0].fullname).toBe('John Doe');
    });
    test('UserById returns empty array for empty users list', async () => {
      users.users = { users: [] };
      const result = await users.UserById('1');
      expect(result).toEqual([]);
    });
    test('UserByEmail returns correct user', async () => {
      const result = await users.UserByEmail('jane@example.com');
      expect(result.length).toBe(1);
      expect(result[0].fullname).toBe('Jane Smith');
    });
    test('UserByEmail returns empty array for empty users list', async () => {
      users.users = { users: [] };
      const result = await users.UserByEmail('test@example.com');
      expect(result).toEqual([]);
    });
    test('HasUserById returns true for existing user', async () => {
      const exists = await users.HasUserById('1');
      expect(exists).toBe(true);
      const notExists = await users.HasUserById('99');
      expect(notExists).toBe(false);
    });
    test('HasUserById returns false for empty users list', async () => {
      users.users = { users: [] };
      const exists = await users.HasUserById('1');
      expect(exists).toBe(false);
    });
    test('HasUserByEmail returns true for existing user', async () => {
      const exists = await users.HasUserByEmail('john@example.com');
      expect(exists).toBe(true);
      const notExists = await users.HasUserByEmail('nonexistent@example.com');
      expect(notExists).toBe(false);
    });
    test('HasUserByEmail returns false for empty users list', async () => {
      users.users = { users: [] };
      const exists = await users.HasUserByEmail('john@example.com');
      expect(exists).toBe(false);
    });
  });
});
