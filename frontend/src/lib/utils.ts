import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Junta classes condicionais e resolve conflitos do Tailwind.
 *
 * @example
 * ```ts
 * cn('px-2 py-1', isActive && 'bg-brand-600');
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
