import { LRUCache } from 'lru-cache';
import { logger } from '../utils/logger.js';

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  del(key: string): Promise<void>;
  delPattern(pattern: string): Promise<void>;
  flush(): Promise<void>;
}

class InMemoryCacheService implements ICacheService {
  private cache: LRUCache<string, any>;

  constructor() {
    this.cache = new LRUCache({
      max: 1000, // Maximum items in cache
      ttl: 1000 * 60 * 15, // Default 15 minutes TTL
    });
    logger.info('📦 In-memory LRU Cache initialized');
  }

  async get<T>(key: string): Promise<T | null> {
    const value = this.cache.get(key);
    if (value === undefined) return null;
    return value as T;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    this.cache.set(key, value, { ttl: ttlMs });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}`);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  async flush(): Promise<void> {
    this.cache.clear();
  }
}

export const cacheService: ICacheService = new InMemoryCacheService();
