
import apiClient from '@/lib/api-client';
import { User, Role, CreateUserRequest, CreateRoleRequest, UpdateUserRequest } from '@/types/user';
import { PaginationParams, PagedResult } from '@/types/pagination';
import { notifyApiError } from '@/lib/notify-error';

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    const res = await this.getPagedUsers({ pageIndex: 1, pageSize: 1000 });
    return res.items;
  }

  static async getPagedUsers(params?: PaginationParams): Promise<PagedResult<User>> {
    const pageIndex = params?.pageIndex ?? 1;
    const pageSize = params?.pageSize ?? 10;
    try {
      const cleanParams: Record<string, unknown> = {};
      if (params?.pageIndex != null) cleanParams.pageIndex = params.pageIndex;
      if (params?.pageSize != null) cleanParams.pageSize = params.pageSize;
      if (params?.search) cleanParams.search = params.search;
      if (params?.sortBy) cleanParams.sortBy = params.sortBy;

      const response = await apiClient.get<any>('/api/User/users', { params: cleanParams });
      const data = response.data;

      const transformUser = (u: any): User => ({
        ...u,
        isAdmin: Array.isArray(u.roles) ? u.roles.includes('Manager') : false,
      });

      if (Array.isArray(data)) {
        const users = data.map(transformUser);
        return {
          items: users,
          totalCount: users.length,
          pageIndex,
          pageSize,
        };
      }

      const rawItems = data?.items ?? data?.data ?? data?.result ?? data?.value ?? [];
      const items = (Array.isArray(rawItems) ? rawItems : []).map(transformUser);
      const totalCount = data?.totalCount ?? data?.total ?? data?.count ?? items.length;

      return {
        items,
        totalCount: typeof totalCount === 'number' ? totalCount : items.length,
        pageIndex: data?.pageIndex ?? pageIndex,
        pageSize: data?.pageSize ?? pageSize,
      };
    } catch (error) {
      console.error('[user] GET /api/User/users failed:', error);
      notifyApiError(error, 'خطا در دریافت لیست کاربران');
      throw error;
    }
  }

  static async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/api/User/users/${id}`);
    return response.data;
  }

  static async createUser(userData: CreateUserRequest): Promise<User> {
    // Generate username from first name and last name if not provided
    if (!userData.username && userData.phoneNumber) {
      userData.username = `${userData.phoneNumber}`;
    }
    
    console.log('Creating user with data:', userData);
    
    try {
      const response = await apiClient.post<User>('/api/User/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiClient.put<User>(`/api/User/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
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
