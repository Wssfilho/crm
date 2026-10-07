import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  SquareKanban,
  Users,
  Workflow,
} from 'lucide-react';
import { useState } from 'react';
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

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'crm:sidebar-collapsed';

function lerPreferenciaRecolhida() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function Sidebar() {
  const { user, signOut } = useAuth();
  const { totalDeClientes } = useTriagem();
  const [recolhida, setRecolhida] = useState(lerPreferenciaRecolhida);

  function alternarRecolhida() {
    const proximoValor = !recolhida;

    setRecolhida(proximoValor);

    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(proximoValor));
    } catch {
      // preferência só vale para a sessão atual
    }
  }

  const BotaoAlternar = recolhida ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col overflow-x-hidden overflow-y-auto bg-sidebar py-[22px] transition-[width] duration-200',
        recolhida ? 'w-[76px] px-3' : 'w-[262px] px-4',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-[11px] pt-1.5 pb-5',
          recolhida ? 'flex-col px-0' : 'px-2',
        )}
      >
        <LogoEscritorio className="size-9 shrink-0 shadow-[0_4px_12px_rgba(0,0,0,.28)]" />

        {!recolhida && (
          <div className="min-w-0">
            <div className="text-[15px] leading-[1.05] font-bold text-white">
              Eric Melo
            </div>
            <div className="text-[10.5px] font-medium tracking-[.4px] text-sidebar-dim uppercase">
              CRM Jurídico
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={alternarRecolhida}
          title={recolhida ? 'Expandir menu' : 'Recolher menu'}
          aria-label={recolhida ? 'Expandir menu' : 'Recolher menu'}
          className={cn(
            'rounded-lg p-2 text-sidebar-dim transition-colors hover:bg-white/5 hover:text-sidebar-user',
            !recolhida && 'ml-auto',
          )}
        >
          <BotaoAlternar className="size-4" />
        </button>
      </div>

      {recolhida ? (
        <div className="mx-auto my-3 h-px w-8 bg-white/[.07]" />
      ) : (
        <div className={tituloDeSecao}>Operação</div>
      )}

      <nav className="flex flex-col gap-[3px]">
        {navegacaoPrincipal.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={recolhida ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-[11px] rounded-[9px] px-[11px] py-2.5 text-[13.5px] transition-colors',
                recolhida && 'justify-center',
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
                {!recolhida && <span>{item.label}</span>}

                {item.comContador && (
                  <span
                    className={cn(
                      'rounded-[20px] px-[7px] py-px text-[10.5px] font-extrabold',
                      recolhida
                        ? 'absolute -top-1 -right-1 px-[5px] text-[9.5px]'
                        : 'ml-auto',
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

      {recolhida ? (
        <div className="mx-auto my-3 h-px w-8 bg-white/[.07]" />
      ) : (
        <div className={tituloDeSecao}>Próximas etapas</div>
      )}

      <nav className="flex flex-col gap-[3px]">
        {listaDeFeaturesFuturas.map((feature) => (
          <NavLink
            key={feature.id}
            to={`/em-breve/${feature.id}`}
            title={recolhida ? `${feature.label} (em breve)` : undefined}
            className={cn(
              'flex items-center gap-[11px] rounded-[9px] px-[11px] py-2.5 text-[13px] font-medium text-sidebar-dim',
              recolhida && 'justify-center',
            )}
          >
            <feature.icon
              className="size-[17px] shrink-0 text-sidebar-dash"
              strokeWidth={1.75}
            />
            {!recolhida && (
              <>
                <span>{feature.label}</span>

                <span className="ml-auto rounded-[20px] border border-[rgba(124,111,232,.28)] whitespace-nowrap bg-[rgba(124,111,232,.14)] px-1.5 py-0.5 text-[9px] font-extrabold tracking-[.4px] text-future uppercase">
                  Em breve
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div
        className={cn(
          'mt-auto flex items-center gap-1.5 border-t border-white/[.07] pt-3.5 pb-0.5',
          recolhida ? 'flex-col px-0' : 'px-1',
        )}
      >
        <NavLink
          to="/conta"
          title="Minha conta"
          className={({ isActive }) =>
            cn(
              'flex min-w-0 items-center gap-2.5 rounded-[10px] p-1 transition-colors hover:bg-white/5',
              isActive && 'bg-white/[.08]',
            )
          }
        >
          <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-sidebar-avatar text-[13px] font-bold text-sidebar-avatar-ink">
            {user ? iniciaisDe(user.name) : 'EM'}
          </div>

          {!recolhida && (
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-semibold text-sidebar-user">
                {user?.name ?? 'Dr. Eric Melo'}
              </div>
              <div className="text-[11px] text-sidebar-dim">Minha conta</div>
            </div>
          )}
        </NavLink>

        <button
          type="button"
          onClick={signOut}
          title="Sair"
          className={cn(
            !recolhida && 'ml-auto',
            'rounded-lg p-2 text-sidebar-dim transition-colors hover:bg-white/5 hover:text-sidebar-user',
          )}
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  );
}
