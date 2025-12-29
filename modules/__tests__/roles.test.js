import { Roles } from '../roles.mjs';
import { Callings } from '../callings.mjs';
import { ObjectUtils } from '../objectUtils.mjs';

describe('Roles Class', () => {
  let roles;
  let callings;

  // Mock data for roles and callings
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

  test('constructor initializes properties', () => {
    expect(roles.callings).toBe(callings);
    expect(roles.roles).toEqual(mockRoles);
  });

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

  test('RoleNameById and RoleIdByName', () => {
    expect(roles.RoleNameById('1')).toContain('Leader');
    expect(roles.RoleIdByName('Leader')).toContain('1');
  });
});
