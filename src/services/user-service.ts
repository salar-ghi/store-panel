import apiClient from '@/lib/api-client';
import { PagedResult, PaginationParams } from '@/lib/safe-api';
import { User, Role, CreateUserRequest, CreateRoleRequest, UpdateUserRequest } from '@/types/user';

export interface UserFilterParams extends PaginationParams {
  role?: string;
}

export class UserService {
  /** Returns array of all users (backward-compatible for CustomerPicker, CustomerSegments, etc.) */
  static async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get<User[]>('/api/User/users');
      return response.data.map((user) => ({
        ...user,
        isAdmin: Array.isArray(user.roles) && user.roles.includes('Manager'),
      }));
    } catch (error) {
      console.warn('Error fetching all users:', error);
      return [];
    }
  }

  /** Returns paginated users for the server-paginated admin table */
  static async getPagedUsers(params?: UserFilterParams): Promise<PagedResult<User>> {
    const pageIndex = params?.pageIndex ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const search = params?.search ?? '';

    let url = '/api/User/users';
    if (search) {
      url = `/api/User/users/search/username?username=${encodeURIComponent(search)}`;
    }

    try {
      const response = await apiClient.get<any>(url, {
        params: {
          pageIndex,
          pageSize,
          ...(params?.role && params.role !== 'all' ? { role: params.role } : {}),
        },
      });

      const raw = response.data;
      if (Array.isArray(raw)) {
        const enriched = raw.map((user: any) => ({
          ...user,
          isAdmin: Array.isArray(user.roles) && user.roles.includes('Manager'),
        }));

        const totalCount = enriched.length;
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        const start = (pageIndex - 1) * pageSize;
        const items = enriched.slice(start, start + pageSize);

        return {
          items,
          totalCount,
          pageIndex,
          pageSize,
          totalPages,
          hasPreviousPage: pageIndex > 1,
          hasNextPage: pageIndex < totalPages,
        };
      }

      if (raw && Array.isArray(raw.items)) {
        return {
          ...raw,
          items: raw.items.map((user: any) => ({
            ...user,
            isAdmin: Array.isArray(user.roles) && user.roles.includes('Manager'),
          })),
        };
      }

      return {
        items: [],
        totalCount: 0,
        pageIndex: 1,
        pageSize,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };
    } catch (error) {
      console.warn('Error fetching paged users:', error);
      return {
        items: [],
        totalCount: 0,
        pageIndex: 1,
        pageSize,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };
    }
  }

  static async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/api/User/users/${id}`);
    return response.data;
  }

  static async createUser(userData: CreateUserRequest): Promise<User> {
    if (!userData.username && userData.phoneNumber) {
      userData.username = `${userData.phoneNumber}`;
    }
    const response = await apiClient.post<User>('/api/User/users', userData);
    return response.data;
  }

  static async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<User>(`/api/User/users/${id}`, userData);
    return response.data;
  }

  static async getAllRoles(): Promise<Role[]> {
    const response = await apiClient.get<Role[]>('/api/User/roles');
    return response.data;
  }

  static async createRole(roleData: CreateRoleRequest): Promise<Role> {
    const response = await apiClient.post<Role>('/api/User/roles', roleData);
    return response.data;
  }
}
