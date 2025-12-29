import { CacheStore } from '../cacheStore.mjs';

describe('CacheStore', () => {
  let cache;

  beforeEach(() => {
    cache = new CacheStore(0); // Disable timer for unit tests
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
