import { createContext } from 'react';

export type UserRole = 'ADMIN' | 'USER';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoadingUser: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  updateUser: (user: AuthenticatedUser) => void;
}

export const AuthContext = createContext({} as AuthContextValue);
