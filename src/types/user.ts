
export interface User {
  id: string;
  username: string;
  email?: string;
  phoneNumber: string;
  roles: string[];
}

export interface Role {
  id: string;
  name: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password?: string; // Make password optional for auto-generation
  phoneNumber: string;
  roleIds?: string[]; // Change to array for multiple roles
  generatePassword?: boolean; // Flag to generate random password
}

export interface CreateRoleRequest {
  name: string;
}
