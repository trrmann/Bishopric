      test('RolesByCalling and HasRolesByCalling use fast path and return correct result', () => {
        roles.roles = {
          roles: [
            { id: '1', name: 'Leader', calling: 'c1', active: true },
            { id: '2', name: 'Assistant', calling: 'c2', active: false },
            { id: '3', name: 'Stake Clerk', calling: 'c1', active: true }
          ]
        };
        // First access builds the map
        expect(roles.RolesByCalling('c1')).toEqual([
          expect.objectContaining({ id: '1', name: 'Leader', calling: 'c1', active: true }),
          expect.objectContaining({ id: '3', name: 'Stake Clerk', calling: 'c1', active: true })
        ]);
        // Second access should use the map (fast path)
        expect(roles.RolesByCalling('c2')).toEqual([
          expect.objectContaining({ id: '2', name: 'Assistant', calling: 'c2', active: false })
        ]);
        // Non-existent callingId
        expect(roles.RolesByCalling('c99')).toEqual([]);
        // Changing roles invalidates the map
        roles.roles = { roles: [{ id: '4', name: 'Clerk', calling: 'c3', active: true }] };
        expect(roles.RolesByCalling('c3')).toEqual([
          expect.objectContaining({ id: '4', name: 'Clerk', calling: 'c3', active: true })
        ]);
        expect(roles.HasRolesByCalling('c3')).toBe(true);
        expect(roles.HasRolesByCalling('c1')).toBe(false);
      });
    test('RoleByName and HasRoleByName use fast path and return correct result', () => {
      roles.roles = {
        roles: [
          { id: '1', name: 'Leader', calling: 'c1', active: true },
          { id: '2', name: 'Assistant', calling: 'c2', active: false },
          { id: '3', name: 'Leader', calling: 'c3', active: true }
        ]
      };
      // First access builds the map
      expect(roles.RoleByName('Leader')).toEqual([
        expect.objectContaining({ id: '1', name: 'Leader', calling: 'c1', active: true }),
        expect.objectContaining({ id: '3', name: 'Leader', calling: 'c3', active: true })
      ]);
      // Second access should use the map (fast path)
      expect(roles.RoleByName('Assistant')).toEqual([
        expect.objectContaining({ id: '2', name: 'Assistant', calling: 'c2', active: false })
      ]);
      // Non-existent name
      expect(roles.RoleByName('Clerk')).toEqual([]);
      // Changing roles invalidates the map
      roles.roles = { roles: [{ id: '4', name: 'Clerk', calling: 'c4', active: true }] };
      expect(roles.RoleByName('Clerk')).toEqual([
        expect.objectContaining({ id: '4', name: 'Clerk', calling: 'c4', active: true })
      ]);
      expect(roles.HasRoleByName('Clerk')).toBe(true);
      expect(roles.HasRoleByName('Leader')).toBe(false);
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
  });
});
