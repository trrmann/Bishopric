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
