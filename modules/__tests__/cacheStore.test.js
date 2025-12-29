import { CacheStore } from '../cacheStore.mjs';

describe('CacheStore', () => {
  let cache;
  beforeEach(() => {
    jest.useFakeTimers();
    cache = new CacheStore(0); // Disable timer for unit tests
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test('Values returns all values', () => {
    cache.Set('a', 1, 1000);
    cache.Set('b', 2, 1000);
    expect(cache.Values().sort()).toEqual([1, 2]);
  });

  describe('FromJSON', () => {
    test('should create a CacheStore from a plain object', () => {
      const obj = { a: 1, b: 'two', c: { nested: true } };
      const cache = CacheStore.FromJSON(obj);
      expect(cache.Get('a').value).toBe(1);
      expect(cache.Get('b').value).toBe('two');
      expect(cache.Get('c').value).toEqual({ nested: true });
      expect(cache.Size).toBe(3);
    });

    test('should return an empty CacheStore for null or non-object', () => {
      expect(CacheStore.FromJSON(null).Size).toBe(0);
      expect(CacheStore.FromJSON(undefined).Size).toBe(0);
      expect(CacheStore.FromJSON(42).Size).toBe(0);
    });

    test('should round-trip with ToJSON()', () => {
      const original = new CacheStore();
      original.Set('x', 123);
      original.Set('y', 'abc');
      const json = {};
      for (const key of original.Keys()) {
        json[key] = original.Get(key).value;
      }
      const restored = CacheStore.FromJSON(json);
      expect(restored.Get('x').value).toBe(123);
      expect(restored.Get('y').value).toBe('abc');
      expect(restored.Size).toBe(2);
    });
  });

  describe('Basic operations', () => {
    test('Set and Get store values', () => {
      cache.Set('foo', 123, 1000);
      const entry = cache.Get('foo');
      expect(entry.value).toBe(123);
      expect(typeof entry.expires).toBe('number');
    });
    test('Has returns true for existing key', () => {
      cache.Set('bar', 'baz', 1000);
      expect(cache.Has('bar')).toBe(true);
    });
    test('Delete removes key', () => {
      cache.Set('baz', 42, 1000);
      cache.Delete('baz');
      expect(cache.Has('baz')).toBe(false);
    });
    test('Clear empties the store', () => {
      cache.Set('a', 1, 1000);
      cache.Set('b', 2, 1000);
      cache.Clear();
      expect(cache.Keys().length).toBe(0);
    });
    test('Keys returns all keys', () => {
      cache.Set('x', 1, 1000);
      cache.Set('y', 2, 1000);
      expect(cache.Keys().sort()).toEqual(['x', 'y']);
    });
  });

  describe('Timer and expiry', () => {
    test('Expired key is removed and returns false for Has', () => {
      cache.Set('exp', 'gone', 1); // 1ms TTL
      jest.advanceTimersByTime(2); // Fast-forward time
      expect(cache.Has('exp')).toBe(false);
    });
    test('CachePrune removes expired entries', () => {
      cache.Set('prune', 'me', 1);
      jest.advanceTimersByTime(2);
      cache.CachePrune();
      expect(cache.Has('prune')).toBe(false);
    });
  });
});
