import type { UserRole } from '@/contexts/auth-context';

export const papeis: UserRole[] = ['USER', 'ADMIN'];

export const rotuloDoPapel: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  USER: 'Usuário',
};
