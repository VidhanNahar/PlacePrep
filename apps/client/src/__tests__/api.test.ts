import { describe, it, expect, beforeEach } from 'vitest';

// Mock localStorage in Node test environment
const storageMap = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, value: string) => storageMap.set(key, value),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};
(globalThis as any).localStorage = localStorageMock;

import { api } from '../lib/api.js';

describe('Client API Interceptor Test Suite', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should have base configuration set', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should attach Authorization Bearer header when token is present in localStorage', async () => {
    localStorageMock.setItem('placeprep_auth_token', 'test-jwt-token-123');

    // Simulate request interceptor
    const config: any = { headers: {} };
    const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    const resultConfig = requestInterceptor(config);

    expect(resultConfig.headers.Authorization).toBe('Bearer test-jwt-token-123');
  });

  it('should not attach Authorization Bearer header when token is missing', async () => {
    const config: any = { headers: {} };
    const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    const resultConfig = requestInterceptor(config);

    expect(resultConfig.headers.Authorization).toBeUndefined();
  });

  it('should extract error message cleanly from API error envelope in response interceptor', async () => {
    const responseInterceptorErr = (api.interceptors.response as any).handlers[0].rejected;

    const mockAxiosError = {
      response: {
        data: {
          success: false,
          error: {
            code: 'ValidationError',
            message: 'Full name is required',
          },
        },
      },
    };

    await expect(responseInterceptorErr(mockAxiosError)).rejects.toThrow('Full name is required');
  });

  it('should fallback to default error message if error envelope is absent', async () => {
    const responseInterceptorErr = (api.interceptors.response as any).handlers[0].rejected;

    const mockNetworkError = {
      message: 'Network Timeout',
    };

    await expect(responseInterceptorErr(mockNetworkError)).rejects.toThrow('Network Timeout');
  });
});
