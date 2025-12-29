import { Org } from '../org.mjs';

describe('Org Class', () => {
  let org;
  let mockStorage;
  let mockOrgData;

  beforeEach(() => {
    mockStorage = {};
    org = new Org({ _storageObj: mockStorage });
    mockOrgData = {
      stakes: [
        {
          unitNumber: '100',
          name: 'Stake A',
          units: [
            { unitNumber: '101', type: 'ward', name: 'Ward 1' },
            { unitNumber: '102', type: 'branch', name: 'Branch 1' }
          ]
        },
        {
          unitNumber: '200',
          name: 'Stake B',
          units: [
            { unitNumber: '201', type: 'ward', name: 'Ward 2' }
          ]
        }
      ]
    };
    org.organization = mockOrgData;
  });

  test('constructor initializes properties', () => {
    expect(org.storage).toBe(mockStorage);
    expect(org.organization).toBe(mockOrgData);
  });

  test('Stakes returns all stakes', () => {
    expect(org.Stakes.length).toBe(2);
    expect(org.Stakes[0].name).toBe('Stake A');
  });

  test('Units returns all units', () => {
    expect(org.Units.length).toBe(3);
    expect(org.Units[0].name).toBe('Ward 1');
    expect(org.Units[2].name).toBe('Ward 2');
  });

  test('Wards and Branches filter units by type', () => {
    expect(org.Wards.length).toBe(2);
    expect(org.Wards[0].type).toBe('ward');
    expect(org.Branches.length).toBe(1);
    expect(org.Branches[0].type).toBe('branch');
  });

  test('StakeByUnitNumber and StakeByName', () => {
    expect(org.StakeByUnitNumber('100').name).toBe('Stake A');
    expect(org.StakeByName('Stake B').unitNumber).toBe('200');
  });

  test('StakeUnits, StakeWards, StakeBranches', () => {
    expect(org.StakeUnits('100').length).toBe(2);
    expect(org.StakeWards('100').length).toBe(1);
    expect(org.StakeBranches('100').length).toBe(1);
  });

  test('UnitByNumber, WardByNumber, BranchByNumber', () => {
    expect(org.UnitByNumber('101').name).toBe('Ward 1');
    expect(org.WardByNumber('101').type).toBe('ward');
    expect(org.BranchByNumber('102').type).toBe('branch');
  });

  test('UnitByName finds correct unit', () => {
    expect(org.UnitByName('Ward 2').unitNumber).toBe('201');
  });

  test('HasStakeByName and HasUnitByNumber', () => {
    expect(org.HasStakeByName('Stake A')).toBe(true);
    expect(org.HasStakeByName('Nonexistent')).toBe(false);
    expect(org.HasUnitByNumber('101')).toBe(true);
    expect(org.HasUnitByNumber('999')).toBe(false);
  });
});
