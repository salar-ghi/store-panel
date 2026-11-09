import axios from 'axios';
import { isTokenValid, getToken, clearToken, setToken } from './token';

// const API_URL = 'https://localhost:5000';
const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enables transmitting HttpOnly cookies (with SameSite and Secure flags) in production
  headers: {
    'Content-Type': 'application/json',
  },
});

export function forceLogout() {
  clearToken();
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login?expired=1';
  }
}

// Concurrency control for Refresh Token Rotation
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Attempt to refresh the access token via backend refresh endpoint.
 * Works seamlessly with both HttpOnly cookie-based refresh and explicit token payload.
 */
async function refreshAuthToken(): Promise<string | null> {
  try {
    const response = await axios.post<{ token?: string; accessToken?: string }>(
      `${API_URL || ''}/api/Auth/refresh`,
      {},
      { withCredentials: true }
    );
    const newToken = response.data?.token || response.data?.accessToken;
    if (newToken) {
      setToken(newToken);
      return newToken;
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Request interceptor — attach access token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401s and trigger Refresh Token Rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;
    const isAuthEndpoint = originalRequest?.url?.toLowerCase().includes('/api/auth/');

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshedToken = await refreshAuthToken();
        if (refreshedToken) {
          processQueue(null, refreshedToken);
          originalRequest.headers['Authorization'] = `Bearer ${refreshedToken}`;
          return apiClient(originalRequest);
        } else {
          // If refresh failed or returns no token (and no HttpOnly session renewed)
          processQueue(new Error('Session refresh failed'), null);
          forceLogout();
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        forceLogout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401 && (!originalRequest || originalRequest._retry || isAuthEndpoint)) {
      forceLogout();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
