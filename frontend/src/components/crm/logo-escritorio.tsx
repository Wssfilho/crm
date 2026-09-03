import { useState } from 'react';
import { cn } from '@/lib/utils';

const caminhoDaLogo = '/logo-eric-melo.png';

interface LogoEscritorioProps {
  className?: string;
}

export function LogoEscritorio({ className }: LogoEscritorioProps) {
  const [falhouAoCarregar, setFalhouAoCarregar] = useState(false);

  if (falhouAoCarregar) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-[9px] bg-[linear-gradient(135deg,#4f46e5,#6366f1)] text-[17px] font-extrabold text-white',
          className,
        )}
      >
        E
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-[9px] bg-white',
        className,
      )}
    >
      <img
        src={caminhoDaLogo}
        alt="Eric Melo Advogado"
        className="size-full object-contain p-[3px]"
        onError={() => setFalhouAoCarregar(true)}
      />
    </div>
  );
}
