import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginRequest, SignupRequest, AuthResponse } from '@/types/auth';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: async (credentials) => {
        try {
          // For development, allow admin user to log in without API call
          if (credentials.username === "admin" && credentials.password === "123456") {
            const adminUser: User = {
              id: "admin-id",
              username: "admin",
              phoneNumber: "1234567890",
              role: "admin"
            };
            
            set({
              user: adminUser,
              token: "dev-token",
              isAuthenticated: true,
              isLoading: false,
            });
            
            localStorage.setItem('auth-token', "dev-token");
            toast.success('Logged in as admin');
            return;
          }
          
          set({ isLoading: true, error: null });
          const response = await apiClient.post<AuthResponse>('/api/Auth/login', credentials);
          const { token, user } = response.data;
          
          localStorage.setItem('auth-token', token);
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          toast.success('Logged in successfully');
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to login';
          set({ error: message, isLoading: false });
          toast.error(message);
        }
      },
      signup: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          await apiClient.post('/api/Auth/signup', userData);
          
          set({ isLoading: false });
          toast.success('Account created successfully');
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to create account';
          set({ error: message, isLoading: false });
          toast.error(message);
        }
      },
      logout: () => {
        localStorage.removeItem('auth-token');
        set({ user: null, token: null, isAuthenticated: false });
        toast.success('Logged out successfully');
      },
    }),
    {
      name: 'auth-store',
    }
  )
);
