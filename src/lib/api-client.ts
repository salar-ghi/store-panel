import axios from 'axios';
import { isTokenValid, getToken, clearToken } from './token';

const API_URL = 'https://localhost:5000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function forceLogout() {
  clearToken();
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login?expired=1';
  }
}

// Request interceptor — block expired tokens before they hit the network
apiClient.interceptors.request.use(
  (config) => {
    const isAuthEndpoint = config.url?.includes('/api/Auth/');
    if (!isAuthEndpoint) {
      const token = getToken();
      if (token && !isTokenValid()) {
        forceLogout();
        return Promise.reject(new Error('Token expired'));
      }
    }
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle backend 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response && response.status === 401) {
      forceLogout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
