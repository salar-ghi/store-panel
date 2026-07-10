import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginRequest, SignupRequest, AuthResponse } from '@/types/auth';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { setToken, clearToken, isTokenValid, getToken } from '@/lib/token';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  logout: (opts?: { silent?: boolean; expired?: boolean }) => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      checkAuth: () => {
        const valid = isTokenValid();
        if (!valid) {
          const hadToken = !!getToken();
          clearToken();
          set({ user: null, token: null, isAuthenticated: false });
          if (hadToken) {
            toast.error('نشست شما منقضی شده است، لطفاً دوباره وارد شوید');
          }
          return false;
        }
        return true;
      },

      login: async (credentials) => {
        try {
          // Dev shortcut
          if (credentials.PhoneNumber === "admin" && credentials.password === "123456") {
            const adminUser: User = {
              id: "1",
              username: "admin",
              phoneNumber: "1234567890",
              role: "admin"
            };
            setToken("dev-token");
            set({
              user: adminUser,
              token: "dev-token",
              isAuthenticated: true,
              isLoading: false,
            });
            toast.success('Logged in as admin');
            return;
          }

          set({ isLoading: true, error: null });
          const response = await apiClient.post<AuthResponse>('/api/Auth/login', credentials);
          const { token, user } = response.data;

          setToken(token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success('Logged in successfully');
        } catch (error: any) {
          const message = error.response?.data?.message || 'خطا، دوباره تلاش کنید';
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
      logout: (opts) => {
        clearToken();
        set({ user: null, token: null, isAuthenticated: false });
        if (!opts?.silent) {
          toast.success(opts?.expired ? 'نشست منقضی شد' : 'Logged out successfully');
        }
      },
    }),
    {
      name: 'auth-store',
    }
  )
);

// Sync persisted state with token validity on app boot
if (typeof window !== 'undefined') {
  if (!isTokenValid()) {
    clearToken();
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null });
  }
}
