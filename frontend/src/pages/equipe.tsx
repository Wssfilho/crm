import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { KeyRound, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { SeloDePapel } from '@/components/crm/selo-de-papel';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import type { AuthenticatedUser, UserRole } from '@/contexts/auth-context';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/use-users';
import { api } from '@/lib/api';
import { papeis, rotuloDoPapel } from '@/lib/papeis';
import { queryKeys } from '@/lib/query-keys';
import { iniciaisDe } from '@/lib/triagem';
import { cn } from '@/lib/utils';

const novoUsuarioFormSchema = z.object({
  name: z.string().trim().min(3, 'Informe o nome completo'),
  email: z.string().trim().email('Informe um e-mail válido'),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
  role: z.enum(['ADMIN', 'USER']),
});

type NovoUsuarioFormSchema = z.infer<typeof novoUsuarioFormSchema>;

const novaSenhaFormSchema = z.object({
  newPassword: z.string().min(6, 'Mínimo de 6 caracteres'),
});

type NovaSenhaFormSchema = z.infer<typeof novaSenhaFormSchema>;

const cartao = 'rounded-2xl border border-line bg-white';

const seletor =
  'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

function FormularioDeNovoUsuario({ aoConcluir }: { aoConcluir: () => void }) {
  const [requestError, setRequestError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { mostrarToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NovoUsuarioFormSchema>({
    resolver: zodResolver(novoUsuarioFormSchema),
    defaultValues: { name: '', email: '', password: '', role: 'USER' },
  });

  async function handleCriarUsuario(dados: NovoUsuarioFormSchema) {
    setRequestError(null);

    try {
      await api.post('/users', dados);
      await queryClient.invalidateQueries({ queryKey: queryKeys.users });

      mostrarToast(`${dados.name} foi adicionado à equipe`);
      aoConcluir();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setRequestError('Já existe uma conta com esse e-mail.');
        return;
      }

      setRequestError('Não foi possível criar o usuário. Tente novamente.');
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleCriarUsuario)}
      className={cn(cartao, 'space-y-4 px-6 py-5')}
    >
      <div>
        <h2 className="text-sm font-extrabold text-ink-strong">Novo usuário</h2>
        <p className="mt-0.5 text-xs text-ink-dim">
          Passe a senha provisória para a pessoa; ela pode trocá-la em Minha
          conta.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Nome" htmlFor="name" error={errors.name?.message}>
          <Input id="name" placeholder="Nome completo" {...register('name')} />
        </FormField>

        <FormField label="E-mail" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="pessoa@escritorio.com.br"
            {...register('email')}
          />
        </FormField>

        <FormField
          label="Senha provisória"
          htmlFor="password"
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('password')}
          />
        </FormField>

        <FormField label="Papel" htmlFor="role">
          <select id="role" className={seletor} {...register('role')}>
            {papeis.map((papel) => (
              <option key={papel} value={papel}>
                {rotuloDoPapel[papel]}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {requestError && <p className="text-sm text-red-600">{requestError}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={aoConcluir}>
          Cancelar
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando...' : 'Criar usuário'}
        </Button>
      </div>
    </form>
  );
}

function FormularioDeNovaSenha({
  usuario,
  aoConcluir,
}: {
  usuario: AuthenticatedUser;
  aoConcluir: () => void;
}) {
  const { mostrarToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NovaSenhaFormSchema>({
    resolver: zodResolver(novaSenhaFormSchema),
    defaultValues: { newPassword: '' },
  });

  async function handleRedefinirSenha({ newPassword }: NovaSenhaFormSchema) {
    try {
      await api.patch(`/users/${usuario.id}/password`, { newPassword });

      mostrarToast(`Senha de ${usuario.name} redefinida`);
      aoConcluir();
    } catch {
      mostrarToast('Não foi possível redefinir a senha.');
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleRedefinirSenha)}
      className="flex flex-wrap items-start gap-2 border-t border-line-soft bg-panel-subtle px-5 py-3"
    >
      <div className="min-w-[220px] flex-1">
        <Input
          type="password"
          autoComplete="new-password"
          placeholder={`Nova senha para ${usuario.name}`}
          autoFocus
          {...register('newPassword')}
        />
        {errors.newPassword && (
          <p className="mt-1 text-xs text-red-600">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <Button type="button" variant="ghost" onClick={aoConcluir}>
        Cancelar
      </Button>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
      </Button>
    </form>
  );
}

function LinhaDeUsuario({
  usuario,
  ehVoce,
}: {
  usuario: AuthenticatedUser;
  ehVoce: boolean;
}) {
  const [acao, setAcao] = useState<'senha' | 'excluir' | null>(null);

  const queryClient = useQueryClient();
  const { mostrarToast } = useToast();

  const { mutate: trocarPapel, isPending: trocandoPapel } = useMutation({
    mutationFn: (role: UserRole) =>
      api.patch(`/users/${usuario.id}/role`, { role }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
      mostrarToast(`Papel de ${usuario.name} atualizado`);
    },
    onError: () => mostrarToast('Não foi possível alterar o papel.'),
  });

  const { mutate: excluir, isPending: excluindo } = useMutation({
    mutationFn: () => api.delete(`/users/${usuario.id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users });
      mostrarToast(`${usuario.name} foi removido da equipe`);
    },
    onError: () => mostrarToast('Não foi possível excluir o usuário.'),
  });

  return (
    <li className="border-b border-line-soft last:border-b-0">
      <div className="flex items-center gap-3 px-5 py-3.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-avatar text-[12.5px] font-bold text-sidebar-avatar-ink">
          {iniciaisDe(usuario.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13.5px] font-bold text-ink-strong">
              {usuario.name}
            </span>
            {ehVoce && (
              <span className="text-[11px] font-semibold text-ink-pale">
                (você)
              </span>
            )}
          </div>
          <div className="truncate text-xs text-ink-dim">{usuario.email}</div>
        </div>

        {ehVoce ? (
          <SeloDePapel role={usuario.role} />
        ) : (
          <select
            value={usuario.role}
            disabled={trocandoPapel}
            onChange={(event) => trocarPapel(event.target.value as UserRole)}
            aria-label={`Papel de ${usuario.name}`}
            className="h-8 rounded-lg border border-line-strong bg-white px-2 text-xs font-semibold text-ink-soft outline-none focus:border-brand-500"
          >
            {papeis.map((papel) => (
              <option key={papel} value={papel}>
                {rotuloDoPapel[papel]}
              </option>
            ))}
          </select>
        )}

        {!ehVoce && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setAcao(acao === 'senha' ? null : 'senha')}
              title="Redefinir senha"
              className="flex size-8 cursor-pointer items-center justify-center rounded-[9px] text-ink-pale transition-colors hover:bg-line-faint hover:text-ink"
            >
              <KeyRound className="size-[15px]" />
            </button>

            <button
              type="button"
              onClick={() => setAcao(acao === 'excluir' ? null : 'excluir')}
              title="Excluir usuário"
              className="flex size-8 cursor-pointer items-center justify-center rounded-[9px] text-ink-pale transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="size-[15px]" />
            </button>
          </div>
        )}
      </div>

      {acao === 'senha' && (
        <FormularioDeNovaSenha
          usuario={usuario}
          aoConcluir={() => setAcao(null)}
        />
      )}

      {acao === 'excluir' && (
        <div className="flex flex-wrap items-center gap-2 border-t border-red-100 bg-red-50 px-5 py-3">
          <p className="flex-1 text-xs text-red-700">
            <strong>{usuario.name}</strong> perde o acesso ao CRM. Essa ação não
            pode ser desfeita.
          </p>

          <Button type="button" variant="ghost" onClick={() => setAcao(null)}>
            Cancelar
          </Button>

          <Button
            type="button"
            disabled={excluindo}
            onClick={() => excluir()}
            className="bg-red-600 hover:bg-red-700"
          >
            {excluindo ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      )}
    </li>
  );
}

export function Equipe() {
  const [criando, setCriando] = useState(false);

  const { user } = useAuth();
  const { data: usuarios = [], isLoading, isError } = useUsers();

  const totalDeAdmins = usuarios.filter(
    (usuario) => usuario.role === 'ADMIN',
  ).length;

  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-[18px]">
      <div className="flex items-end gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-ink-strong">
            Pessoas com acesso ao CRM
          </h2>
          <p className="mt-0.5 text-xs text-ink-dim">
            {usuarios.length} {usuarios.length === 1 ? 'pessoa' : 'pessoas'} ·{' '}
            {totalDeAdmins}{' '}
            {totalDeAdmins === 1 ? 'administrador' : 'administradores'}
          </p>
        </div>

        {!criando && (
          <Button className="ml-auto" onClick={() => setCriando(true)}>
            <UserPlus className="size-4" />
            Novo usuário
          </Button>
        )}
      </div>

      {criando && (
        <FormularioDeNovoUsuario aoConcluir={() => setCriando(false)} />
      )}

      <div className={cn(cartao, 'overflow-hidden')}>
        {isLoading && (
          <p className="px-5 py-6 text-sm text-ink-dim">Carregando equipe...</p>
        )}

        {isError && (
          <p className="px-5 py-6 text-sm text-red-600">
            Não foi possível carregar a equipe.
          </p>
        )}

        <ul>
          {usuarios.map((usuario) => (
            <LinhaDeUsuario
              key={usuario.id}
              usuario={usuario}
              ehVoce={usuario.id === user?.id}
            />
          ))}
        </ul>
      </div>

      <p className="text-xs leading-[1.6] text-ink-pale">
        Administradores gerenciam a equipe, excluem clientes e exportam a
        carteira em CSV. Usuários trabalham na triagem e no kanban.
      </p>
    </div>
  );
}
