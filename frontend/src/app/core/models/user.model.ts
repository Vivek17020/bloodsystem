export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt?: string;
}

export enum Role {
  ADMIN = 'ADMIN',
  DONOR = 'DONOR',
  HOSPITAL = 'HOSPITAL',
  BLOOD_BANK = 'BLOOD_BANK',
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone?: string;
  bloodType?: string;
  organizationName?: string;
  address?: string;
}
