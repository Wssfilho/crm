import { featuresFuturas, type FeatureFuturaId } from '@/data/features-futuras';

export function tituloDaRota(pathname: string): string {
  if (pathname.startsWith('/em-breve/')) {
    const id = pathname.split('/')[2] as FeatureFuturaId;

    return featuresFuturas[id]?.title ?? 'Feature futura';
  }

  return 'Andamento';
}
