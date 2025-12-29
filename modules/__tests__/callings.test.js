                  test('StakeCallingByName uses name map and filters efficiently', () => {
                    callings.callings = [
                      { id: 1, name: 'A', level: 'stake', active: true },
                      { id: 2, name: 'A', level: 'ward', active: false },
                      { id: 3, name: 'B', level: 'stake', active: false },
                      { id: 4, name: 'A', level: 'stake', active: false }
                    ];
                    expect(callings.StakeCallingByName('A')).toEqual([
                      { id: 1, name: 'A', level: 'stake', active: true, hasTitle: false, title: null, titleOrdinal: null },
                      { id: 4, name: 'A', level: 'stake', active: false, hasTitle: false, title: null, titleOrdinal: null }
                    ]);
                    expect(callings.StakeCallingByName('B')).toEqual([
                      { id: 3, name: 'B', level: 'stake', active: false, hasTitle: false, title: null, titleOrdinal: null }
                    ]);
                    expect(callings.StakeCallingByName('C')).toEqual([]);
                  });
                test('WardCallingByName uses name map and filters efficiently', () => {
                  callings.callings = [
                    { id: 1, name: 'A', level: 'ward', active: true },
                    { id: 2, name: 'A', level: 'stake', active: false },
                    { id: 3, name: 'B', level: 'ward', active: false },
                    { id: 4, name: 'A', level: 'ward', active: false }
                  ];
                  expect(callings.WardCallingByName('A')).toEqual([
                    { id: 1, name: 'A', level: 'ward', active: true, hasTitle: false, title: null, titleOrdinal: null },
                    { id: 4, name: 'A', level: 'ward', active: false, hasTitle: false, title: null, titleOrdinal: null }
                  ]);
                  expect(callings.WardCallingByName('B')).toEqual([
                    { id: 3, name: 'B', level: 'ward', active: false, hasTitle: false, title: null, titleOrdinal: null }
                  ]);
                  expect(callings.WardCallingByName('C')).toEqual([]);
                });
              test('StakeCallingById combines filters efficiently', () => {
                callings.callings = [
                  { id: 1, name: 'A', level: 'stake', active: true },
                  { id: 2, name: 'B', level: 'ward', active: false },
                  { id: 3, name: 'C', level: 'stake', active: false },
                  { id: 4, name: 'D', level: 'ward', active: true }
                ];
                expect(callings.StakeCallingById(1)).toEqual([
                  { id: 1, name: 'A', level: 'stake', active: true, hasTitle: false, title: null, titleOrdinal: null }
                ]);
                expect(callings.StakeCallingById(2)).toEqual([]);
                expect(callings.StakeCallingById(3)).toEqual([
                  { id: 3, name: 'C', level: 'stake', active: false, hasTitle: false, title: null, titleOrdinal: null }
                ]);
                expect(callings.StakeCallingById(4)).toEqual([]);
                expect(callings.StakeCallingById(999)).toEqual([]);
              });
            test('WardCallingById combines filters efficiently', () => {
              callings.callings = [
                { id: 1, name: 'A', level: 'ward', active: true },
                { id: 2, name: 'B', level: 'stake', active: false },
                { id: 3, name: 'C', level: 'ward', active: false },
                { id: 4, name: 'D', level: 'stake', active: true }
              ];
              expect(callings.WardCallingById(1)).toEqual([
                { id: 1, name: 'A', level: 'ward', active: true, hasTitle: false, title: null, titleOrdinal: null }
              ]);
              expect(callings.WardCallingById(2)).toEqual([]);
              expect(callings.WardCallingById(3)).toEqual([
                { id: 3, name: 'C', level: 'ward', active: false, hasTitle: false, title: null, titleOrdinal: null }
              ]);
              expect(callings.WardCallingById(4)).toEqual([]);
              expect(callings.WardCallingById(999)).toEqual([]);
            });
          test('ActiveStakeCallingById combines filters efficiently', () => {
            callings.callings = [
              { id: 1, name: 'A', level: 'stake', active: true },
              { id: 2, name: 'B', level: 'stake', active: false },
              { id: 3, name: 'C', level: 'ward', active: true },
              { id: 4, name: 'D', level: 'stake', active: true }
            ];
            expect(callings.ActiveStakeCallingById(1)).toEqual([
              { id: 1, name: 'A', level: 'stake', active: true, hasTitle: false, title: null, titleOrdinal: null }
            ]);
            expect(callings.ActiveStakeCallingById(2)).toEqual([]);
            expect(callings.ActiveStakeCallingById(3)).toEqual([]);
            expect(callings.ActiveStakeCallingById(4)).toEqual([
              { id: 4, name: 'D', level: 'stake', active: true, hasTitle: false, title: null, titleOrdinal: null }
            ]);
            expect(callings.ActiveStakeCallingById(999)).toEqual([]);
          });
        test('ActiveWardCallingById combines filters efficiently', () => {
          callings.callings = [
            { id: 1, name: 'A', level: 'ward', active: true },
            { id: 2, name: 'B', level: 'ward', active: false },
            { id: 3, name: 'C', level: 'stake', active: true },
            { id: 4, name: 'D', level: 'ward', active: true }
          ];
          expect(callings.ActiveWardCallingById(1)).toEqual([
            { id: 1, name: 'A', level: 'ward', active: true, hasTitle: false, title: null, titleOrdinal: null }
          ]);
          expect(callings.ActiveWardCallingById(2)).toEqual([]);
          expect(callings.ActiveWardCallingById(3)).toEqual([]);
          expect(callings.ActiveWardCallingById(4)).toEqual([
            { id: 4, name: 'D', level: 'ward', active: true, hasTitle: false, title: null, titleOrdinal: null }
          ]);
          expect(callings.ActiveWardCallingById(999)).toEqual([]);
        });
      test('HasCallingById and HasCallingByName use fast path and return correct result', () => {
        callings.callings = [
          { id: 1, name: 'A', level: 'ward', active: true },
          { id: 2, name: 'B', level: 'stake', active: false }
        ];
        expect(callings.HasCallingById(1)).toBe(true);
        expect(callings.HasCallingById(2)).toBe(true);
        expect(callings.HasCallingById(999)).toBe(false);
        expect(callings.HasCallingByName('A')).toBe(true);
        expect(callings.HasCallingByName('B')).toBe(true);
        expect(callings.HasCallingByName('Z')).toBe(false);
        // Changing callings invalidates the maps
        callings.callings = [{ id: 3, name: 'C', level: 'ward', active: true }];
        expect(callings.HasCallingById(3)).toBe(true);
        expect(callings.HasCallingById(1)).toBe(false);
        expect(callings.HasCallingByName('C')).toBe(true);
        expect(callings.HasCallingByName('A')).toBe(false);
      });
    test('CallingByName uses fast path and returns correct result', () => {
      callings.callings = [
        { id: 1, name: 'A', level: 'ward', active: true },
        { id: 2, name: 'B', level: 'stake', active: false },
        { id: 3, name: 'A', level: 'stake', active: true }
      ];
      // First access builds the map
      expect(callings.CallingByName('A')).toEqual([
        { id: 1, name: 'A', level: 'ward', active: true, hasTitle: false, title: null, titleOrdinal: null },
        { id: 3, name: 'A', level: 'stake', active: true, hasTitle: false, title: null, titleOrdinal: null }
      ]);
      // Second access should use the map (fast path)
      expect(callings.CallingByName('B')).toEqual([
        { id: 2, name: 'B', level: 'stake', active: false, hasTitle: false, title: null, titleOrdinal: null }
      ]);
      // Non-existent name
      expect(callings.CallingByName('Z')).toEqual([]);
      // Changing callings invalidates the map
      callings.callings = [{ id: 4, name: 'C', level: 'ward', active: true }];
      expect(callings.CallingByName('C')).toEqual([
        { id: 4, name: 'C', level: 'ward', active: true, hasTitle: false, title: null, titleOrdinal: null }
      ]);
    });
  test('CallingById uses fast path and returns correct result', () => {
    callings.callings = [
      { id: 1, name: 'A', level: 'ward', active: true },
      { id: 2, name: 'B', level: 'stake', active: false }
    ];
    // First access builds the map
    expect(callings.CallingById(1)).toEqual([
      { id: 1, name: 'A', level: 'ward', active: true, hasTitle: false, title: null, titleOrdinal: null }
    ]);
    // Second access should use the map (fast path)
    expect(callings.CallingById(2)).toEqual([
      { id: 2, name: 'B', level: 'stake', active: false, hasTitle: false, title: null, titleOrdinal: null }
    ]);
    // Non-existent id
    expect(callings.CallingById(999)).toEqual([]);
    // Changing callings invalidates the map
    callings.callings = [{ id: 3, name: 'C', level: 'ward', active: true }];
    expect(callings.CallingById(3)).toEqual([
      { id: 3, name: 'C', level: 'ward', active: true, hasTitle: false, title: null, titleOrdinal: null }
    ]);
  });
import { Callings } from '../callings.mjs';

describe('Callings', () => {
  let config;
  let storage;
  let callings;

  beforeEach(() => {
    storage = {
      Get: jest.fn(() => Promise.resolve({ role: 'demo' })),
    };
    config = { _storageObj: storage };
    callings = new Callings(config);
  });

  test('constructor initializes storage and callings', () => {
    expect(callings.Storage).toBe(storage);
    expect(callings.callings).toBeUndefined();
  });

  test('CopyFromJSON and CopyToJSON work as expected', () => {
    const json = { _storageObj: storage, callings: { a: 1 } };
    const instance = Callings.CopyFromJSON(json);
    expect(instance.Storage).toBe(storage);
    expect(instance.callings).toEqual({ a: 1 });
    const out = Callings.CopyToJSON(instance);
    expect(out._storageObj).toBe(storage);
    expect(out.callings).toEqual({ a: 1 });
  });

  test('CopyFromObject copies properties', () => {
    const dest = new Callings(config);
    const src = { storage, callings: { b: 2 } };
    Callings.CopyFromObject(dest, src);
    expect(dest.Storage).toBe(storage);
    expect(dest.callings).toEqual({ b: 2 });
  });

  test('Factory calls Fetch and returns callings', async () => {
    const instance = await Callings.Factory(config);
    expect(instance.callings).toEqual({ role: 'demo' });
  });

  test('Fetch sets callings property', async () => {
    await callings.Fetch();
    expect(callings.callings).toEqual({ role: 'demo' });
  });
});
