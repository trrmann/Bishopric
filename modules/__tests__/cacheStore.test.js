          describe('CacheStore.deleteWhere', () => {
            let cache;
            beforeEach(() => {
              cache = new CacheStore();
              cache.Set('a', 1);
              cache.Set('b', 2);
              cache.Set('c', 3);
              cache.Set('d', 4);
            });

            test('deletes all entries matching predicate', () => {
              const deleted = cache.deleteWhere((v, k) => v % 2 === 0); // delete even values
              expect(deleted).toBe(2);
              expect(cache.Has('b')).toBe(false);
              expect(cache.Has('d')).toBe(false);
              expect(cache.Has('a')).toBe(true);
              expect(cache.Has('c')).toBe(true);
            });

            test('returns 0 if no entries match', () => {
              const deleted = cache.deleteWhere((v) => v > 10);
              expect(deleted).toBe(0);
              expect(cache.Size).toBe(4);
            });

            test('returns 0 if predicate is not a function', () => {
              expect(cache.deleteWhere(null)).toBe(0);
              expect(cache.Size).toBe(4);
            });

            test('supports thisArg', () => {
              const context = { min: 3 };
              const deleted = cache.deleteWhere(function(v) { return v < this.min; }, context);
              expect(deleted).toBe(2);
              expect(cache.Has('a')).toBe(false);
              expect(cache.Has('b')).toBe(false);
              expect(cache.Has('c')).toBe(true);
              expect(cache.Has('d')).toBe(true);
            });
          });
          describe('getOrSet', () => {
            let cache;
            beforeEach(() => {
              cache = new CacheStore();
            });

            test('returns existing value if present and not expired', () => {
              cache.Set('a', 1, 1000);
              expect(cache.getOrSet('a', 2)).toBe(1);
            });

            test('sets and returns new value if key is missing', () => {
              expect(cache.getOrSet('b', 42)).toBe(42);
              expect(cache.Get('b').value).toBe(42);
            });

            test('sets and returns new value if key is expired', () => {
              cache.Set('c', 5, 1);
              jest.advanceTimersByTime(2);
              expect(cache.getOrSet('c', 99)).toBe(99);
              expect(cache.Get('c').value).toBe(99);
            });

            test('uses factory function if provided', () => {
              let called = false;
              const factory = () => { called = true; return 123; };
              expect(cache.getOrSet('d', factory)).toBe(123);
              expect(called).toBe(true);
            });
          });
        describe('hasExpired', () => {
          let cache;
          beforeEach(() => {
            cache = new CacheStore();
          });

          test('returns true if key exists and is expired', () => {
            cache.Set('a', 1, 1); // expires quickly
            jest.advanceTimersByTime(2);
            expect(cache.hasExpired('a')).toBe(true);
          });

          test('returns false if key exists and is not expired', () => {
            cache.Set('b', 2, 10000);
            expect(cache.hasExpired('b')).toBe(false);
          });

          test('returns false if key does not exist', () => {
            expect(cache.hasExpired('missing')).toBe(false);
          });
        });
      describe('fromMap', () => {
        it('should create a CacheStore from a Map', () => {
          const map = new Map([
            ['a', 1],
            ['b', 2],
            ['c', 3]
          ]);
          const cache = CacheStore.fromMap(map);
          expect(cache instanceof CacheStore).toBe(true);
          expect(cache.Get('a').value).toBe(1);
          expect(cache.Get('b').value).toBe(2);
          expect(cache.Get('c').value).toBe(3);
          expect(cache.size).toBe(3);
        });

        it('should allow custom ttlMs for all entries', () => {
          const map = new Map([
            ['x', 10],
            ['y', 20]
          ]);
          const cache = CacheStore.fromMap(map, 12345);
          expect(cache.Get('x').expires - Date.now()).toBeLessThanOrEqual(12345);
          expect(cache.Get('y').expires - Date.now()).toBeLessThanOrEqual(12345);
        });
      });
    describe('toMap', () => {
      it('should return a Map of all key-value pairs', () => {
        const cache = new CacheStore();
        cache.Set('a', 1);
        cache.Set('b', 2);
        const map = cache.toMap();
        expect(map instanceof Map).toBe(true);
        expect(map.size).toBe(2);
        expect(map.get('a')).toBe(1);
        expect(map.get('b')).toBe(2);
      });

      it('should not include expired entries', () => {
        const cache = new CacheStore();
        cache.Set('a', 1, 1); // expires quickly
        cache.Set('b', 2, 10000); // long expiry
        jest.advanceTimersByTime(2); // expire 'a'
        cache.clearExpired();
        const map = cache.toMap();
        expect(map.has('a')).toBe(false);
        expect(map.get('b')).toBe(2);
      });
    });
  describe('forEachEntry', () => {
    it('should call callback for each [key, value] pair', () => {
      const cache = new CacheStore();
      cache.Set('a', 1);
      cache.Set('b', 2);
      cache.Set('c', 3);
      const entries = [];
      cache.forEachEntry((key, value) => entries.push([key, value]));
      expect(entries).toEqual(expect.arrayContaining([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ]));
      expect(entries.length).toBe(3);
    });

    it('should respect thisArg', () => {
      const cache = new CacheStore();
      cache.Set('x', 5);
      const context = { arr: [] };
      cache.forEachEntry(function(key, value) { this.arr.push([key, value]); }, context);
      expect(context.arr).toEqual([['x', 5]]);
    });
  });
import { CacheStore } from '../cacheStore.mjs';

describe('CacheStore', () => {
                describe('reduce', () => {
                  it('should sum all values with initial value', () => {
                    const cache = new CacheStore();
                    cache.Set('a', 1);
                    cache.Set('b', 2);
                    cache.Set('c', 3);
                    const result = cache.reduce((acc, v) => acc + v, 0);
                    expect(result).toBe(6);
                  });

                  it('should sum all values without initial value', () => {
                    const cache = new CacheStore();
                    cache.Set('a', 1);
                    cache.Set('b', 2);
                    cache.Set('c', 3);
                    const result = cache.reduce((acc, v) => acc + v);
                    expect(result).toBe(6);
                  });

                  it('should throw if empty and no initial value', () => {
                    const cache = new CacheStore();
                    expect(() => cache.reduce((acc, v) => acc + v)).toThrow(TypeError);
                  });

                  it('should return initial value if empty and initial value provided', () => {
                    const cache = new CacheStore();
                    expect(cache.reduce((acc, v) => acc + v, 10)).toBe(10);
                  });

                  it('should pass key and store to callback', () => {
                    const cache = new CacheStore();
                    cache.Set('x', 2);
                    cache.Set('y', 3);
                    const keys = [];
                    cache.reduce((acc, v, k) => { keys.push(k); return acc + v; }, 0);
                    expect(keys).toEqual(['x', 'y']);
                  });
                });
            describe('every', () => {
              it('should return true if all values match the callback', () => {
                const cache = new CacheStore();
                cache.Set('a', 2);
                cache.Set('b', 4);
                cache.Set('c', 6);
                expect(cache.every((v) => v % 2 === 0)).toBe(true);
              });

              it('should return false if any value does not match the callback', () => {
                const cache = new CacheStore();
                cache.Set('a', 2);
                cache.Set('b', 3);
                expect(cache.every((v) => v % 2 === 0)).toBe(false);
              });

              it('should return true for empty cache', () => {
                const cache = new CacheStore();
                expect(cache.every(() => false)).toBe(true);
              });

              it('should respect thisArg', () => {
                const cache = new CacheStore();
                cache.Set('x', 5);
                const context = { target: 5 };
                expect(cache.every(function(v) { return v === this.target; }, context)).toBe(true);
              });
            });
        describe('some', () => {
          it('should return true if at least one value matches the callback', () => {
            const cache = new CacheStore();
            cache.Set('a', 1);
            cache.Set('b', 2);
            cache.Set('c', 3);
            expect(cache.some((v) => v % 2 === 0)).toBe(true);
          });

          it('should return false if no value matches the callback', () => {
            const cache = new CacheStore();
            cache.Set('a', 1);
            cache.Set('b', 3);
            expect(cache.some((v) => v > 10)).toBe(false);
          });

          it('should respect thisArg', () => {
            const cache = new CacheStore();
            cache.Set('x', 5);
            const context = { target: 5 };
            expect(cache.some(function(v) { return v === this.target; }, context)).toBe(true);
          });
        });
    describe('findEntry', () => {
      it('should return the first [key, value] pair matching the callback', () => {
        const cache = new CacheStore();
        cache.Set('a', 1);
        cache.Set('b', 2);
        cache.Set('c', 3);
        const result = cache.findEntry((v, k) => v % 2 === 0);
        expect(result).toEqual(['b', 2]);
      });

      it('should return undefined if no entry matches', () => {
        const cache = new CacheStore();
        cache.Set('a', 1);
        cache.Set('b', 3);
        const result = cache.findEntry((v) => v > 10);
        expect(result).toBeUndefined();
      });

      it('should respect thisArg', () => {
        const cache = new CacheStore();
        cache.Set('x', 5);
        const context = { target: 5 };
        const result = cache.findEntry(function(v) { return v === this.target; }, context);
        expect(result).toEqual(['x', 5]);
      });
    });
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
      // Test the new has(key) alias
      expect(cache.has('bar')).toBe(true);
      cache.Delete('bar');
      expect(cache.has('bar')).toBe(false);
      expect(cache.Has('bar')).toBe(false);
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

    test('clearExpired removes only expired entries', () => {
      cache.Set('a', 1, 1); // expires quickly
      cache.Set('b', 2, 10000); // long expiry
      jest.advanceTimersByTime(2); // expire 'a'
      cache.clearExpired();
      expect(cache.Has('a')).toBe(false);
      expect(cache.Has('b')).toBe(true);
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
  describe('peek', () => {
      let cache;
      beforeEach(() => {
        cache = new CacheStore();
      });

      test('returns value for existing key regardless of expiration', () => {
        cache.Set('a', 123, 1); // expires quickly
        expect(cache.peek('a')).toBe(123);
        jest.advanceTimersByTime(2);
        // Even after expiration, peek returns the value
        expect(cache.peek('a')).toBe(123);
      });

      test('returns undefined for missing key', () => {
        expect(cache.peek('missing')).toBeUndefined();
      });
    });
  });
