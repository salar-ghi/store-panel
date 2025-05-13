
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  phoneNumber: string;
  description?: string;
  roles: string[];
  isAdmin?: boolean;
}

export interface Role {
  id: string;
  name: string;
  permissions?: string[]; // Optional field for future permission-based access control
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  password?: string; // Optional for auto-generation
  phoneNumber: string;
  description?: string;
  roleIds: string[]; // Array for multiple roles
  generatePassword?: boolean; // Flag to generate random password
  isAdmin?: boolean; // Flag for admin privileges
  notificationMethod?: 'email' | 'sms' | 'both'; // Method to send credentials
}

export interface CreateRoleRequest {
  name: string;
  permissions?: string[]; // Optional field for future permission-based access control
}

export type Permission = 'read' | 'write' | 'update' | 'delete' | 'all';

export const AVAILABLE_PERMISSIONS: Permission[] = ['read', 'write', 'update', 'delete', 'all'];
