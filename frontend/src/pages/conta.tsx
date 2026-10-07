import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { KeyRound, UserRound } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import type { AuthenticatedUser } from '@/contexts/auth-context';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { iniciaisDe } from '@/lib/triagem';

const perfilFormSchema = z.object({
  name: z.string().trim().min(3, 'Informe o nome completo'),
  email: z.string().trim().email('Informe um e-mail válido'),
});

type PerfilFormSchema = z.infer<typeof perfilFormSchema>;

const senhaFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((dados) => dados.newPassword === dados.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

type SenhaFormSchema = z.infer<typeof senhaFormSchema>;

const dataPorExtenso = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

interface SecaoProps {
  icone: ReactNode;
  titulo: string;
  descricao: string;
  children: ReactNode;
}

function Secao({ icone, titulo, descricao, children }: SecaoProps) {
  return (
    <section className="rounded-2xl border border-line bg-white px-6 py-5">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-50 text-brand-600">
          {icone}
        </div>

        <div>
          <h2 className="text-sm font-extrabold text-ink-strong">{titulo}</h2>
          <p className="mt-0.5 text-xs text-ink-dim">{descricao}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

function FormularioDePerfil({ user }: { user: AuthenticatedUser }) {
  const [requestError, setRequestError] = useState<string | null>(null);

  const { updateUser } = useAuth();
  const { mostrarToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PerfilFormSchema>({
    resolver: zodResolver(perfilFormSchema),
    defaultValues: { name: user.name, email: user.email },
  });

  async function handleSalvarPerfil({ name, email }: PerfilFormSchema) {
    setRequestError(null);

    try {
      const response = await api.patch<{ user: AuthenticatedUser }>('/me', {
        name,
        email,
      });

      updateUser(response.data.user);
      reset({ name: response.data.user.name, email: response.data.user.email });
      mostrarToast('Dados da conta atualizados');
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setRequestError('Já existe uma conta com esse e-mail.');
        return;
      }

      setRequestError('Não foi possível salvar. Tente novamente.');
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSalvarPerfil)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Nome" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" {...register('name')} />
        </FormField>

        <FormField label="E-mail" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
          />
        </FormField>
      </div>

      {requestError && <p className="text-sm text-red-600">{requestError}</p>}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          disabled={!isDirty || isSubmitting}
          onClick={() => reset()}
        >
          Descartar
        </Button>

        <Button type="submit" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}

function FormularioDeSenha() {
  const [requestError, setRequestError] = useState<string | null>(null);

  const { mostrarToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SenhaFormSchema>({
    resolver: zodResolver(senhaFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function handleTrocarSenha({
    currentPassword,
    newPassword,
  }: SenhaFormSchema) {
    setRequestError(null);

    try {
      await api.patch('/me/password', { currentPassword, newPassword });

      reset();
      mostrarToast('Senha alterada com sucesso');
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        setRequestError('A senha atual está incorreta.');
        return;
      }

      setRequestError('Não foi possível alterar a senha. Tente novamente.');
    }
  }

  return (
    <form onSubmit={handleSubmit(handleTrocarSenha)} className="space-y-4">
      <FormField
        label="Senha atual"
        htmlFor="currentPassword"
        error={errors.currentPassword?.message}
      >
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="sm:max-w-[calc(50%-8px)]"
          {...register('currentPassword')}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Nova senha"
          htmlFor="newPassword"
          error={errors.newPassword?.message}
        >
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('newPassword')}
          />
        </FormField>

        <FormField
          label="Confirmar nova senha"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('confirmPassword')}
          />
        </FormField>
      </div>

      {requestError && <p className="text-sm text-red-600">{requestError}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Alterando...' : 'Alterar senha'}
        </Button>
      </div>
    </form>
  );
}

export function Conta() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-[18px]">
      <div className="flex items-center gap-4 rounded-2xl border border-line bg-white px-6 py-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-sidebar-avatar text-lg font-bold text-sidebar-avatar-ink">
          {iniciaisDe(user.name)}
        </div>

        <div className="min-w-0">
          <div className="truncate text-lg font-extrabold text-ink-strong">
            {user.name}
          </div>
          <div className="truncate text-sm text-ink-dim">{user.email}</div>
          <div className="mt-1 text-xs text-ink-pale">
            Conta criada em {dataPorExtenso.format(new Date(user.createdAt))}
          </div>
        </div>
      </div>

      <Secao
        icone={<UserRound className="size-[18px]" />}
        titulo="Dados pessoais"
        descricao="Nome e e-mail usados para entrar no CRM."
      >
        <FormularioDePerfil key={user.id} user={user} />
      </Secao>

      <Secao
        icone={<KeyRound className="size-[18px]" />}
        titulo="Segurança"
        descricao="Troque a sua senha de acesso."
      >
        <FormularioDeSenha />
      </Secao>
    </div>
  );
}
