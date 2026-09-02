import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-bold text-slate-900">
        Página não encontrada
      </h1>

      <Link to="/" className="text-sm font-medium text-brand-600">
        Voltar para o painel
      </Link>
    </div>
  );
}
