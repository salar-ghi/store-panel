
import apiClient from '@/lib/api-client';
import { User, Role, CreateUserRequest, CreateRoleRequest } from '@/types/user';

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/api/User/users');
    return response.data;
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

  static async getAllRoles(): Promise<Role[]> {
    const response = await apiClient.get<Role[]>('/api/User/roles');
    return response.data;
  }

  static async createRole(roleData: CreateRoleRequest): Promise<Role> {
    const response = await apiClient.post<Role>('/api/User/roles', roleData);
    return response.data;
  }
}
