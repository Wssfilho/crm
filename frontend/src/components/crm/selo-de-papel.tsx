import type { UserRole } from '@/contexts/auth-context';
import { rotuloDoPapel } from '@/lib/papeis';
import { cn } from '@/lib/utils';

export function SeloDePapel({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-[20px] px-2 py-0.5 text-[10px] font-extrabold tracking-[.4px] uppercase',
        role === 'ADMIN'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-line-faint text-ink-dim',
      )}
    >
      {rotuloDoPapel[role]}
    </span>
  );
}
