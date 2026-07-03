// Rispecchia i DTO reali di backend/api (com.reflct.api.auth / com.reflct.api.user).

export type Piano = 'FREE' | 'PREMIUM' | 'PRO';

export interface RegisterRequest {
  email: string;
  password: string;
  nome: string;
  cognome: string;
  username: string;
  dataNascita: string; // ISO yyyy-MM-dd
  altezzaCm?: number | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  nome: string;
  piano: Piano;
}

export interface UserResponse {
  id: string;
  email: string;
  nome: string;
  cognome: string;
  username: string;
  dataNascita: string; // ISO yyyy-MM-dd
  altezzaCm: number | null;
  misureJson: string | null;
  unitaMisura: 'cm' | 'in';
  piano: Piano;
  createdAt: string;
}

export interface UpdateUserRequest {
  nome?: string | null;
  cognome?: string | null;
  username?: string | null;
  dataNascita?: string | null;
  altezzaCm?: number | null;
  unitaMisura?: 'cm' | 'in' | null;
}

/** Forma dell'errore restituito da GlobalExceptionHandler (backend/api). */
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details: string[];
}
