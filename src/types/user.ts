
export interface User {
  id: string;
  username: string;
  email?: string;
  phoneNumber: string;
  roles: string[];
  isAdmin?: boolean;
}

export interface Role {
  id: string;
  name: string;
  permissions?: string[]; // Optional field for future permission-based access control
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password?: string; // Optional for auto-generation
  phoneNumber: string;
  roleIds?: string[]; // Array for multiple roles
  generatePassword?: boolean; // Flag to generate random password
  isAdmin?: boolean; // Flag for admin privileges
}

export interface CreateRoleRequest {
  name: string;
  permissions?: string[]; // Optional field for future permission-based access control
}
