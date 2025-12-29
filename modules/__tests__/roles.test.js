import { Roles } from '../roles.mjs';
import { Callings } from '../callings.mjs';
import { ObjectUtils } from '../objectUtils.mjs';

describe('Roles Class', () => {
  let roles;
  let callings;
  const mockRoles = {
    roles: [
      { id: '1', name: 'Leader', calling: 'c1', active: true, subRoles: ['2'] },
      { id: '2', name: 'Assistant', calling: 'c2', active: false, subRoles: [] },
      { id: '3', name: 'Stake Clerk', calling: 'c3', active: true, subRoles: [] }
    ]
  };
  const mockCallings = {
    callings: [
      { id: 'c1', name: 'Bishop', level: 'ward', active: true, hasTitle: true, title: 'Bishop', titleOrdinal: 1 },
      { id: 'c2', name: 'Clerk', level: 'ward', active: true, hasTitle: false, title: '', titleOrdinal: 2 },
      { id: 'c3', name: 'Stake Clerk', level: 'stake', active: true, hasTitle: false, title: '', titleOrdinal: 3 }
    ]
  };
  beforeEach(() => {
    callings = new Callings({ _storageObj: {} });
    callings.callings = mockCallings.callings;
    roles = new Roles();
    roles.callings = callings;
    roles.roles = mockRoles;
  });

  describe('Initialization', () => {
    test('constructor initializes properties', () => {
      expect(roles.callings).toBe(callings);
      expect(roles.roles).toEqual(mockRoles);
    });
  });

  describe('Role queries', () => {
    test('RolesEntries returns all roles', () => {
      expect(roles.RolesEntries.length).toBe(3);
    });
    test('ActiveRoles returns only active roles', () => {
      expect(roles.ActiveRoles.length).toBe(2);
      expect(roles.ActiveRoleNames).toContain('Leader');
      expect(roles.ActiveRoleNames).toContain('Stake Clerk');
    });
    test('RoleEntryById returns correct role', () => {
      expect(roles.RoleEntryById('1')[0].name).toBe('Leader');
    });
    test('RoleByName returns correct role', () => {
      expect(roles.RoleByName('Assistant')[0].id).toBe('2');
    });
    test('SubRolesById returns subroles recursively', () => {
      expect(roles.SubRolesById('1')).toContain('2');
      expect(roles.SubRolesById('2')).toEqual([]);
    });
    test('HasRoleById and HasRoleByName', () => {
      expect(roles.HasRoleById('1')).toBe(true);
      expect(roles.HasRoleByName('Leader')).toBe(true);
      expect(roles.HasRoleById('99')).toBe(false);
    });
    test('RoleEntryById and HasRoleById use fast path and return correct result', () => {
      roles.roles = {
        roles: [
          { id: '1', name: 'Leader', calling: 'c1', active: true },
          { id: '2', name: 'Assistant', calling: 'c2', active: false }
        ]
      };
      // First access builds the map
      expect(roles.RoleEntryById('1')).toEqual([
        { id: '1', name: 'Leader', calling: 'c1', active: true }
      ]);
      // Second access should use the map (fast path)
      expect(roles.RoleEntryById('2')).toEqual([
        { id: '2', name: 'Assistant', calling: 'c2', active: false }
      ]);
      // Non-existent id
      expect(roles.RoleEntryById('999')).toEqual([]);
      // Changing roles invalidates the map
      roles.roles = { roles: [{ id: '3', name: 'Clerk', calling: 'c3', active: true }] };
      expect(roles.RoleEntryById('3')).toEqual([
        { id: '3', name: 'Clerk', calling: 'c3', active: true }
      ]);
      expect(roles.HasRoleById('3')).toBe(true);
      expect(roles.HasRoleById('1')).toBe(false);
    });
    test('RolesDetails caching works correctly', () => {
      // First access should compute and cache
      const details1 = roles.RolesDetails;
      expect(details1).toHaveLength(3);
      
      // Second access should return the same cached instance
      const details2 = roles.RolesDetails;
      expect(details2).toBe(details1); // Same reference
      
      // Changing roles should invalidate cache
      roles.roles = {
        roles: [
          { id: '10', name: 'New Role', calling: 'c1', active: true, subRoles: [] }
        ]
      };
      const details3 = roles.RolesDetails;
      expect(details3).not.toBe(details1); // Different reference
      expect(details3).toHaveLength(1);
      expect(details3[0].name).toBe('New Role');
    });
  });

  describe('Role filtering', () => {
    test('WardRoles and StakeRoles filtering', () => {
      expect(roles.WardRoles.length).toBe(2);
      expect(roles.StakeRoles.length).toBe(1);
      expect(roles.WardRoleNames).toContain('Leader');
      expect(roles.StakeRoleNames).toContain('Stake Clerk');
    });
    test('ActiveWardRoles and ActiveStakeRoles', () => {
      expect(roles.ActiveWardRoles.length).toBe(1);
      expect(roles.ActiveStakeRoles.length).toBe(1);
      expect(roles.ActiveWardRoleNames).toContain('Leader');
      expect(roles.ActiveStakeRoleNames).toContain('Stake Clerk');
    });
  });

  describe('Role name/id mapping', () => {
    test('RoleNameById and RoleIdByName', () => {
      expect(roles.RoleNameById('1')).toContain('Leader');
      expect(roles.RoleIdByName('Leader')).toContain('1');
    });
    test('RoleByName and HasRoleByName use fast path', () => {
      // Test that name map is used for lookups
      expect(roles.RoleByName('Leader')).toHaveLength(1);
      expect(roles.RoleByName('Leader')[0].id).toBe('1');
      expect(roles.HasRoleByName('Leader')).toBe(true);
      expect(roles.HasRoleByName('NonExistent')).toBe(false);
      
      // Changing roles should invalidate the name map
      roles.roles = {
        roles: [
          { id: '20', name: 'New Leader', calling: 'c1', active: true, subRoles: [] }
        ]
      };
      expect(roles.RoleByName('New Leader')).toHaveLength(1);
      expect(roles.RoleByName('New Leader')[0].id).toBe('20');
      expect(roles.HasRoleByName('New Leader')).toBe(true);
      expect(roles.HasRoleByName('Leader')).toBe(false);
    });
  });
});
