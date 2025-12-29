import { Users } from '../users.mjs';

describe('Users Class', () => {
  let users;
  let mockMembers;
  let mockRoles;
  const mockMembersData = [
    {
      memberNumber: '1',
      fullname: 'John Doe',
      email: 'john@example.com',
      active: true,
      callingIDs: ['c1'],
      callingNames: ['Bishop'],
      callingRoleIDs: [1],
      callingRoleNames: ['Bishop'],
    },
    {
      memberNumber: '2',
      fullname: 'Jane Smith',
      email: 'jane@example.com',
      active: false,
      callingIDs: ['c2'],
      callingNames: ['Clerk'],
      callingRoleIDs: [6],
      callingRoleNames: ['Clerk'],
    }
  ];
  const mockUsersData = {
    users: [
      { memberNumber: '1', password: 'pass1', email: 'john@example.com', active: true, roles: [] },
      { memberNumber: '2', password: 'pass2', email: 'jane@example.com', active: false, roles: [] },
      { memberNumber: '3', password: 'pass3', email: 'other@example.com', active: true, roles: [] }
    ]
  };
  beforeEach(() => {
    users = new Users();
    mockRoles = {
      RoleEntryById: jest.fn((id) => {
        const roles = {
          '-1': [{ id: -1, name: 'Application Administrator', calling: null }],
          '-2': [{ id: -2, name: 'Application Tester', calling: null }],
          '-3': [{ id: -3, name: 'Application Developer', calling: null }],
          '1': [{ id: 1, name: 'Bishop', calling: 9 }],
          '6': [{ id: 6, name: 'Clerk', calling: 14 }]
        };
        return roles[id] || [];
      }),
      RoleNameById: jest.fn((id) => {
        const names = {
          '-1': ['Application Administrator'],
          '-2': ['Application Tester'],
          '-3': ['Application Developer'],
          '1': ['Bishop'],
          '6': ['Clerk']
        };
        return names[id] || [];
      })
    };
    mockMembers = {
      MembersDetails: jest.fn(async () => mockMembersData),
      Roles: mockRoles
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
    test('UserById returns correct user', async () => {
      const result = await users.UserById('1');
      expect(result.length).toBe(1);
      expect(result[0].fullname).toBe('John Doe');
    });
    test('UserByEmail returns correct user', async () => {
      const result = await users.UserByEmail('jane@example.com');
      expect(result.length).toBe(1);
      expect(result[0].fullname).toBe('Jane Smith');
    });
    test('HasUserById returns true for existing user', async () => {
      const exists = await users.HasUserById('1');
      expect(exists).toBe(true);
      const notExists = await users.HasUserById('99');
      expect(notExists).toBe(false);
    });
  });

  describe('Additional roles functionality (TODO #06-09)', () => {
    test('UsersDetails includes additional roles from user record in roleIDs and roleNames', async () => {
      // Add additional role to user record
      users.users.users[0].roles = [-1]; // Application Administrator
      const details = await users.UsersDetails();
      expect(details[0].roleIDs).toContain(-1);
      expect(details[0].roleIDs).toContain(1); // Also has calling role
      expect(details[0].roleNames).toContain('Application Administrator');
      expect(details[0].roleNames).toContain('Bishop'); // Also has calling role name
    });

    test('Additional roles with calling associations are filtered out', async () => {
      // Try to add a role that has a calling association
      users.users.users[0].roles = [1]; // Bishop role has calling 9
      const details = await users.UsersDetails();
      // Should only have calling-based roles, not the additional role with calling
      expect(details[0].roleIDs).toEqual([1]); // Only from calling, not added again
      expect(details[0].roleNames).toEqual(['Bishop']); // Only from calling
    });

    test('Users without additional roles still work correctly', async () => {
      // User with empty roles array
      users.users.users[1].roles = [];
      const details = await users.UsersDetails();
      expect(details[1].roleIDs).toEqual([6]); // Only calling role
      expect(details[1].roleNames).toEqual(['Clerk']); // Only calling role name
    });

    test('User with multiple additional roles includes all valid ones', async () => {
      // Add multiple additional roles (all without calling associations)
      users.users.users[0].roles = [-1, -2, -3];
      const details = await users.UsersDetails();
      expect(details[0].roleIDs).toContain(-1);
      expect(details[0].roleIDs).toContain(-2);
      expect(details[0].roleIDs).toContain(-3);
      expect(details[0].roleIDs).toContain(1); // Also has calling role
      expect(details[0].roleNames).toContain('Application Administrator');
      expect(details[0].roleNames).toContain('Application Tester');
      expect(details[0].roleNames).toContain('Application Developer');
      expect(details[0].roleNames).toContain('Bishop'); // Also has calling role name
    });

    test('User without roles property still works', async () => {
      // User without roles property at all
      delete users.users.users[2].roles;
      const details = await users.UsersDetails();
      expect(details[2].roleIDs).toEqual([]); // No member match, no roles
      expect(details[2].roleNames).toEqual([]);
    });

    test('Invalid role IDs are filtered out', async () => {
      // Add an invalid role ID
      users.users.users[0].roles = [999]; // Non-existent role
      mockRoles.RoleEntryById.mockReturnValue([]); // Return empty for invalid ID
      const details = await users.UsersDetails();
      // Should only have calling-based roles
      expect(details[0].roleIDs).toEqual([1]);
      expect(details[0].roleNames).toEqual(['Bishop']);
    });
  });
});
