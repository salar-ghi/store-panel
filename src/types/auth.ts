
export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  phoneNumber: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  phoneNumber: string;
  role: string;
}
