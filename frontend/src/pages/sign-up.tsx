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
import { api } from '@/lib/api';

const signUpFormSchema = z.object({
  name: z.string().min(3, 'Informe o nome completo'),
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
});

type SignUpFormSchema = z.infer<typeof signUpFormSchema>;

export function SignUp() {
  const [requestError, setRequestError] = useState<string | null>(null);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormSchema>({
    resolver: zodResolver(signUpFormSchema),
  });

  async function handleSignUp({ name, email, password }: SignUpFormSchema) {
    setRequestError(null);

    try {
      await api.post('/accounts', { name, email, password });
      await signIn({ email, password });

      navigate('/', { replace: true });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setRequestError('Já existe uma conta com esse e-mail.');
        return;
      }

      setRequestError('Não foi possível criar a conta. Tente novamente.');
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Criar conta</h2>
        <p className="text-sm text-slate-500">Cadastre o seu acesso.</p>
      </div>

      <FormField label="Nome" htmlFor="name" error={errors.name?.message}>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Seu nome"
          {...register('name')}
        />
      </FormField>

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
          autoComplete="new-password"
          placeholder="••••••••"
          {...register('password')}
        />
      </FormField>

      {requestError && <p className="text-sm text-red-600">{requestError}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Criando...' : 'Criar conta'}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Já tem conta?{' '}
        <Link to="/sign-in" className="font-medium text-brand-600">
          Entrar
        </Link>
      </p>
    </form>
  );
}
