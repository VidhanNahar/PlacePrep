import { describe, it, expect, beforeEach } from 'vitest';
import { cacheService } from '../../services/cache.service.js';

describe('Cache Service Test Suite', () => {
  beforeEach(async () => {
    await cacheService.flush();
  });

  it('should store, retrieve and delete values', async () => {
    await cacheService.set('user:123', { name: 'Aarav' });
    const cached = await cacheService.get<{ name: string }>('user:123');
    expect(cached).toEqual({ name: 'Aarav' });

    await cacheService.del('user:123');
    const deleted = await cacheService.get('user:123');
    expect(deleted).toBeNull();
  });

  it('should return null for non-existent key', async () => {
    const value = await cacheService.get('non-existent-key');
    expect(value).toBeNull();
  });

  it('should delete keys matching wildcard pattern', async () => {
    await cacheService.set('analytics:overview', { count: 10 });
    await cacheService.set('analytics:company:google', { count: 5 });
    await cacheService.set('other:key', 'keep me');

    await cacheService.delPattern('analytics:*');

    expect(await cacheService.get('analytics:overview')).toBeNull();
    expect(await cacheService.get('analytics:company:google')).toBeNull();
    expect(await cacheService.get('other:key')).toBe('keep me');
  });

  it('should flush all keys', async () => {
    await cacheService.set('k1', 'v1');
    await cacheService.set('k2', 'v2');
    await cacheService.flush();

    expect(await cacheService.get('k1')).toBeNull();
    expect(await cacheService.get('k2')).toBeNull();
  });
});
