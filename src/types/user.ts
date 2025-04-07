
export interface User {
  id: string;
  username: string;
  email?: string;
  phoneNumber: string;
  role: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  roleId?: string;
}

export interface CreateRoleRequest {
  name: string;
}
