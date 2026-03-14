/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Paginated response for list endpoints
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

/**
 * Auth response after login
 */
export interface AuthResponse {
  user: User;
  token?: string;
}

import { User } from './user';
