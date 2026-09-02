import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';

const signInFormSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
});

type SignInFormSchema = z.infer<typeof signInFormSchema>;

export function SignIn() {
  const [requestError, setRequestError] = useState<string | null>(null);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormSchema>({
    resolver: zodResolver(signInFormSchema),
  });

  async function handleSignIn({ email, password }: SignInFormSchema) {
    setRequestError(null);

    try {
      await signIn({ email, password });

      navigate('/', { replace: true });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        setRequestError('E-mail ou senha inválidos.');
        return;
      }

      setRequestError('Não foi possível entrar. Tente novamente.');
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSignIn)} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Entrar</h2>
        <p className="text-sm text-slate-500">Acesse com sua conta.</p>
      </div>

      <FormField label="E-mail" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="voce@escritorio.com.br"
          {...register('email')}
        />
      </FormField>

      <FormField
        label="Senha"
        htmlFor="password"
        error={errors.password?.message}
      >
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...register('password')}
        />
      </FormField>

      {requestError && <p className="text-sm text-red-600">{requestError}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Não tem conta?{' '}
        <Link to="/sign-up" className="font-medium text-brand-600">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
