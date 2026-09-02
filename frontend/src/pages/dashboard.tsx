import { useAuth } from '@/hooks/use-auth';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Painel</h1>
        <p className="text-sm text-slate-500">
          Bem-vindo, {user?.name}. Os módulos do CRM entram aqui.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">Nenhum módulo publicado ainda.</p>
      </div>
    </div>
  );
}
