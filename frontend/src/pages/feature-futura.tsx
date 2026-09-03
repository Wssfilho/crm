import { Navigate, useParams } from 'react-router-dom';
import { featuresFuturas, type FeatureFuturaId } from '@/data/features-futuras';

export function FeatureFutura() {
  const { feature } = useParams<{ feature: FeatureFuturaId }>();

  const conteudo = feature ? featuresFuturas[feature] : undefined;

  if (!conteudo) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto my-[60px] flex max-w-[640px] flex-col items-center gap-3.5 text-center">
      <div className="flex size-16 items-center justify-center rounded-[18px] border-[1.5px] border-dashed border-ink-outline text-2xl font-extrabold text-ink-ghost">
        ›
      </div>

      <div className="text-[10.5px] font-extrabold tracking-[.8px] text-future uppercase">
        Feature futura
      </div>

      <div className="text-[22px] font-extrabold tracking-[-.5px] text-ink-strong">
        {conteudo.title}
      </div>

      <div className="max-w-[470px] text-[13.5px] leading-[1.65] text-ink-body">
        {conteudo.desc}
      </div>

      <div className="mt-1.5 flex flex-wrap justify-center gap-[9px]">
        {conteudo.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-[20px] border border-line-strong bg-white px-[13px] py-[7px] text-[11.5px] font-bold text-ink-soft"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
