import { describe, it, expect, beforeEach } from 'vitest';
import { api } from '../lib/api.js';

describe('Client API Interceptor Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should have base configuration set', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should attach Authorization Bearer header when token is present in localStorage', async () => {
    localStorage.setItem('placeprep_auth_token', 'test-jwt-token-123');

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
