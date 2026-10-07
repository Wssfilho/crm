import { featuresFuturas, type FeatureFuturaId } from '@/data/features-futuras';

export function tituloDaRota(pathname: string): string {
  if (pathname.startsWith('/kanban')) {
    return 'Kanban de triagem';
  }

  if (pathname.startsWith('/painel')) {
    return 'Painel n8n';
  }

  if (pathname.startsWith('/equipe')) {
    return 'Equipe';
  }

  if (pathname.startsWith('/conta')) {
    return 'Minha conta';
  }

  if (pathname.startsWith('/em-breve/')) {
    const id = pathname.split('/')[2] as FeatureFuturaId;

    return featuresFuturas[id]?.title ?? 'Feature futura';
  }

  return 'Clientes';
}
