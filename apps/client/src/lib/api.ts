import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Authorization Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('placeprep_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorPayload = error.response?.data?.error;
    let message = 'An unexpected network error occurred';

    if (errorPayload?.details && Array.isArray(errorPayload.details) && errorPayload.details.length > 0) {
      message = errorPayload.details
        .map((d: any) => (d.message ? `${d.field ? `${d.field}: ` : ''}${d.message}` : JSON.stringify(d)))
        .join('; ');
    } else if (errorPayload?.message) {
      message = errorPayload.message;
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);
