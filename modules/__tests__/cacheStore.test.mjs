import { CacheStore } from '../cacheStore.mjs';

describe('CacheStore', () => {
  let cache;
  beforeEach(() => {
    cache = new CacheStore();
  });

  test('Set and Get store values', () => {
    cache.Set('foo', 123, 1000);
    const entry = cache.Get('foo');
    expect(entry.value).toBe(123);
    expect(typeof entry.expires).toBe('number');
  });

  test('Has returns true for existing key', () => {
    cache.Set('bar', 'baz', 1000);
    expect(cache.Has('bar')).toBe(true);
    cache.Delete('bar');
    expect(cache.Has('bar')).toBe(false);
  });

  test('Delete removes key', () => {
    cache.Set('baz', 42, 1000);
    const deleted = cache.Delete('baz');
    expect(deleted).toBe(true);
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

  test('valuesArray returns all values as array', () => {
    cache.Set('a', 10);
    cache.Set('b', 20);
    expect(cache.valuesArray().sort((a, b) => a - b)).toEqual([10, 20]);
  });

  test('entriesArray returns all [key, value] pairs as array', () => {
    cache.Set('foo', 1);
    cache.Set('bar', 2);
    const entries = cache.entriesArray();
    expect(entries).toEqual(expect.arrayContaining([
      ['foo', 1],
      ['bar', 2]
    ]));
    expect(entries.length).toBe(2);
  });

  test('keysArray returns all keys as array', () => {
    cache.Set('a', 10);
    cache.Set('b', 20);
    expect(cache.keysArray().sort()).toEqual(['a', 'b']);
  });

  test('deleteAll removes all specified keys', () => {
    cache.Set('a', 1);
    cache.Set('b', 2);
    cache.Set('c', 3);
    cache.deleteAll(['a', 'c']);
    expect(cache.Has('a')).toBe(false);
    expect(cache.Has('c')).toBe(false);
    expect(cache.Has('b')).toBe(true);
  });

  test('mapValues maps over all values', () => {
    cache.Set('a', 2);
    cache.Set('b', 3);
    cache.Set('c', 4);
    const squares = cache.mapValues(v => v * v);
    expect(squares.sort((a, b) => a - b)).toEqual([4, 9, 16]);
  });

  test('filterValues filters values correctly', () => {
    cache.Set('a', 2);
    cache.Set('b', 3);
    cache.Set('c', 4);
    const evens = cache.filterValues(v => v % 2 === 0);
    expect(evens).toEqual([2, 4]);
  });

  test('findValue finds the first matching value or undefined', () => {
    cache.Set('a', 2);
    cache.Set('b', 3);
    cache.Set('c', 4);
    const found = cache.findValue(v => v > 2);
    expect(found).toBe(3);
    const notFound = cache.findValue(v => v > 10);
    expect(notFound).toBeUndefined();
  });

  test('clearAll empties the cache', () => {
    cache.Set('a', 1);
    cache.Set('b', 2);
    expect(cache.size).toBe(2);
    cache.clearAll();
    expect(cache.size).toBe(0);
    expect(cache.Keys()).toEqual([]);
  });

  test('size getter matches Size and updates', () => {
    expect(cache.size).toBe(0);
    cache.Set('a', 1);
    expect(cache.size).toBe(1);
    expect(cache.size).toBe(cache.Size);
    cache.Set('b', 2);
    expect(cache.size).toBe(2);
    cache.Delete('a');
    expect(cache.size).toBe(1);
    cache.Clear();
    expect(cache.size).toBe(0);
  });

  test('FromCacheStore creates a deep copy', () => {
    cache.Set('a', 10);
    cache.Set('b', 20);
    const clone = CacheStore.FromCacheStore(cache);
    expect(clone).not.toBe(cache);
    expect(clone.toJSON()).toEqual(cache.toJSON());
    clone.Set('c', 30);
    expect(cache.Has('c')).toBe(false);
    expect(clone.Has('c')).toBe(true);
  });

  test('clone() returns a deep copy', () => {
    cache.Set('x', 1);
    cache.Set('y', 2);
    const clone = cache.clone();
    expect(clone).not.toBe(cache);
    expect(clone.toJSON()).toEqual(cache.toJSON());
    clone.Set('z', 3);
    expect(cache.Has('z')).toBe(false);
    expect(clone.Has('z')).toBe(true);
  });

  test('toJSON returns plain object of key-value pairs', () => {
    cache.Set('a', 10);
    cache.Set('b', 20);
    expect(cache.toJSON()).toEqual({ a: 10, b: 20 });
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

  describe('Timer and expiry', () => {
    test('Expired key is removed and returns false for Has', () => {
      cache.Set('exp', 'gone', 1); // 1ms TTL
      // Simulate time passing
      setTimeout(() => {
        expect(cache.Has('exp')).toBe(false);
      }, 2);
    });
    test('CachePrune removes expired entries', () => {
      cache.Set('prune', 'me', 1);
      setTimeout(() => {
        cache.CachePrune();
        expect(cache.Has('prune')).toBe(false);
      }, 2);
    });
  });

  test('forEachValue iterates all values', () => {
    cache.Set('a', 10);
    cache.Set('b', 20);
    cache.Set('c', 30);
    const values = [];
    cache.forEachValue((value) => values.push(value));
    expect(values.sort((a, b) => a - b)).toEqual([10, 20, 30]);
  });
});
