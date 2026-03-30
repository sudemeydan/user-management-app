export interface User {
  id: string | number;
  email: string;
  name: string;
  role: string;
  isPrivate?: boolean;
  profileImage?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  data: User;
}

export interface LoginResponse extends AuthResponse {}
export interface RegisterResponse extends AuthResponse {}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
