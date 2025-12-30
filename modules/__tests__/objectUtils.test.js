import { TimerUtils, createStorageConfig, ObjectUtils } from '../objectUtils.mjs';

describe('TimerUtils', () => {
  let obj;
  beforeEach(() => {
    obj = {};
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test('start sets interval and properties', () => {
    const callback = jest.fn();
    TimerUtils.start(obj, 'timer', 'interval', callback, 1000);
    expect(obj.interval).toBe(1000);
    // Node.js setInterval returns a number, browser returns object
    expect(['number', 'object']).toContain(typeof obj.timer);
    jest.advanceTimersByTime(2000);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('pause clears interval', () => {
    const callback = jest.fn();
    TimerUtils.start(obj, 'timer', 'interval', callback, 1000);
    TimerUtils.pause(obj, 'timer');
    expect(obj.timer).toBeNull();
  });

  test('resume restarts interval', () => {
    const callback = jest.fn();
    TimerUtils.start(obj, 'timer', 'interval', callback, 1000);
    TimerUtils.pause(obj, 'timer');
    TimerUtils.resume(obj, 'timer', 'interval', callback);
    expect(['number', 'object']).toContain(typeof obj.timer);
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalled();
  });

  test('stop clears interval and interval ms', () => {
    const callback = jest.fn();
    TimerUtils.start(obj, 'timer', 'interval', callback, 1000);
    TimerUtils.stop(obj, 'timer', 'interval');
    expect(obj.timer).toBeNull();
    expect(obj.interval).toBeNull();
  });
});

describe('createStorageConfig', () => {
  test('returns config object with all properties', () => {
    const config = createStorageConfig({
      cacheTtlMs: 1,
      sessionTtlMs: 2,
      localTtlMs: 3,
      googleId: 'gid',
      githubFilename: 'file',
      privateKey: 'priv',
      publicKey: 'pub',
      secure: true
    });
    expect(config.cacheTtlMs).toBe(1);
    expect(config.sessionTtlMs).toBe(2);
    expect(config.localTtlMs).toBe(3);
    expect(config.googleId).toBe('gid');
    expect(config.githubFilename).toBe('file');
    expect(config.privateKey).toBe('priv');
    expect(config.publicKey).toBe('pub');
    expect(config.secure).toBe(true);
  });
});

describe('ObjectUtils', () => {
  describe('flattenObject', () => {
    test('flattens nested objects', () => {
      const obj = { a: { b: { c: 1 } }, d: 2 };
      const flat = ObjectUtils.flattenObject(obj);
      expect(flat).toEqual({ 'a.b.c': 1, d: 2 });
    });
  });

  describe('filterByProperty and filterBy', () => {
    test('filterByProperty filters array by property', () => {
      const arr = [{ x: 1 }, { x: 2 }, { x: 1 }];
      const filtered = ObjectUtils.filterByProperty(arr, 'x', 1);
      expect(filtered).toEqual([{ x: 1 }, { x: 1 }]);
    });
    test('filterBy is alias for filterByProperty', () => {
      const arr = [{ y: 'a' }, { y: 'b' }];
      expect(ObjectUtils.filterBy(arr, 'y', 'b')).toEqual([{ y: 'b' }]);
    });
  });

  describe('hasAny', () => {
    test('returns true for non-empty array', () => {
      expect(ObjectUtils.hasAny([1])).toBe(true);
    });
    test('returns false for empty array', () => {
      expect(ObjectUtils.hasAny([])).toBe(false);
    });
    test('returns false for non-array', () => {
      expect(ObjectUtils.hasAny(null)).toBe(false);
      expect(ObjectUtils.hasAny(undefined)).toBe(false);
      expect(ObjectUtils.hasAny({})).toBe(false);
    });
  });
});
