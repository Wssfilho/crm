import { createContext } from 'react';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoadingUser: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  updateUser: (user: AuthenticatedUser) => void;
}

export const AuthContext = createContext({} as AuthContextValue);
