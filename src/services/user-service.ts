
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
    // If generatePassword is true, create a random password

    // if (userData.generatePassword) {
    //   userData.password = this.generateRandomPassword();
    // }
    
    const response = await apiClient.post<User>('/api/User/users', userData);    
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

  // Generate a random password for a user
  static generateRandomPassword(length = 12): string {
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    
    const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
    
    // Ensure at least one of each character type
    let password = 
      uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length)) +
      lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length)) +
      numberChars.charAt(Math.floor(Math.random() * numberChars.length)) +
      specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    
    // Fill the rest of the password
    for (let i = 4; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allChars.length);
      password += allChars[randomIndex];
    }
    
    // Shuffle the password characters
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }
}
