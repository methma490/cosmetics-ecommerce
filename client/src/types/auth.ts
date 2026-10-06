export type UserRole = 'admin' | 'customer';

export interface UserProfile {
  _id?: string;
  user?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  _id?: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  profile?: UserProfile | null;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
