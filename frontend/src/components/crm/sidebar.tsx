import { LogOut, SquareKanban, Users, Workflow } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { LogoEscritorio } from '@/components/crm/logo-escritorio';
import { listaDeFeaturesFuturas } from '@/data/features-futuras';
import { useAuth } from '@/hooks/use-auth';
import { useTriagem } from '@/hooks/use-triagem';
import { iniciaisDe } from '@/lib/triagem';
import { cn } from '@/lib/utils';

const navegacaoPrincipal = [
  {
    to: '/',
    label: 'Clientes',
    icon: Users,
    tone: 'text-green-500',
    comContador: true,
  },
  {
    to: '/kanban',
    label: 'Kanban de triagem',
    icon: SquareKanban,
    tone: 'text-brand-500',
  },
  { to: '/painel', label: 'Painel n8n', icon: Workflow, tone: 'text-sky-400' },
];

const tituloDeSecao =
  'px-2.5 pt-3.5 pb-2 text-[10px] font-bold uppercase tracking-[1.3px] text-sidebar-label';

export function Sidebar() {
  const { user, signOut } = useAuth();
  const { totalDeClientes } = useTriagem();

  return (
    <aside className="flex w-[262px] shrink-0 flex-col bg-sidebar px-4 py-[22px]">
      <div className="flex items-center gap-[11px] px-2 pt-1.5 pb-5">
        <LogoEscritorio className="size-9 shrink-0 shadow-[0_4px_12px_rgba(0,0,0,.28)]" />

        <div>
          <div className="text-[15px] leading-[1.05] font-bold text-white">
            Eric Melo
          </div>
          <div className="text-[10.5px] font-medium tracking-[.4px] text-sidebar-dim uppercase">
            CRM Jurídico
          </div>
        </div>
      </div>

      <div className={tituloDeSecao}>Operação</div>

      <nav className="flex flex-col gap-[3px]">
        {navegacaoPrincipal.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-[11px] rounded-[9px] px-[11px] py-2.5 text-[13.5px] transition-colors',
                isActive
                  ? 'bg-[linear-gradient(135deg,#4f46e5,#4338ca)] font-semibold text-white shadow-[0_6px_16px_rgba(79,70,229,.35)]'
                  : 'font-medium text-sidebar-text',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'size-[17px] shrink-0',
                    isActive ? 'text-white' : item.tone,
                  )}
                  strokeWidth={2}
                />
                <span>{item.label}</span>

                {item.comContador && (
                  <span
                    className={cn(
                      'ml-auto rounded-[20px] px-[7px] py-px text-[10.5px] font-extrabold',
                      isActive
                        ? 'bg-white/90 text-brand-800'
                        : 'bg-green-500 text-green-950',
                    )}
                  >
                    {totalDeClientes}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={tituloDeSecao}>Próximas etapas</div>

      <nav className="flex flex-col gap-[3px]">
        {listaDeFeaturesFuturas.map((feature) => (
          <NavLink
            key={feature.id}
            to={`/em-breve/${feature.id}`}
            className="flex items-center gap-[11px] rounded-[9px] px-[11px] py-2.5 text-[13px] font-medium text-sidebar-dim"
          >
            <feature.icon
              className="size-[17px] shrink-0 text-sidebar-dash"
              strokeWidth={1.75}
            />
            <span>{feature.label}</span>

            <span className="ml-auto rounded-[20px] border border-[rgba(124,111,232,.28)] whitespace-nowrap bg-[rgba(124,111,232,.14)] px-1.5 py-0.5 text-[9px] font-extrabold tracking-[.4px] text-future uppercase">
              Em breve
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 border-t border-white/[.07] px-2 pt-3.5 pb-0.5">
        <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-sidebar-avatar text-[13px] font-bold text-sidebar-avatar-ink">
          {user ? iniciaisDe(user.name) : 'EM'}
        </div>

        <div className="min-w-0">
          <div className="truncate text-[12.5px] font-semibold text-sidebar-user">
            {user?.name ?? 'Dr. Eric Melo'}
          </div>
          <div className="text-[11px] text-sidebar-dim">Sócio · Itabuna-BA</div>
        </div>

        <button
          type="button"
          onClick={signOut}
          title="Sair"
          className="ml-auto rounded-lg p-2 text-sidebar-dim transition-colors hover:bg-white/5 hover:text-sidebar-user"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  );
}
