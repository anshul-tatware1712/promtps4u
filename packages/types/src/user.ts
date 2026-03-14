/**
 * User entity shared between frontend and backend
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  provider: 'github' | 'google' | 'email';
  providerId: string | null;
  subscriptionStatus: 'free' | 'active' | 'cancelled';
  subscriptionId: string | null;
  subscriptionEnd: Date | null;
  createdAt: Date;
}

/**
 * User session type
 */
export interface Session {
  user: User;
  expires: string;
}

/**
 * User entity for database (Prisma)
 */
export interface UserEntity {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  provider: string;
  providerId: string | null;
  subscriptionStatus: string;
  subscriptionId: string | null;
  subscriptionEnd: Date | null;
  createdAt: Date;
}
