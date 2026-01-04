
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
  phoneNumber: string;
  description?: string;
  roleIds: string[];
  isAdmin?: boolean; 
}

export interface CreateRoleRequest {
  name: string;
  permissions?: string[]; // Optional field for future permission-based access control
}

export type Permission = 'read' | 'write' | 'update' | 'delete' | 'all';

export const AVAILABLE_PERMISSIONS: Permission[] = ['read', 'write', 'update', 'delete', 'all'];
