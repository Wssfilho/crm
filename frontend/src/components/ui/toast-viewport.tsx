import { useToast } from '@/hooks/use-toast';

export function ToastViewport() {
  const { mensagem } = useToast();

  if (!mensagem) {
    return null;
  }

  return (
    <div className="fixed bottom-[26px] left-1/2 z-60 flex -translate-x-1/2 items-center gap-2.5 rounded-xl bg-ink-strong px-5 py-[13px] text-[13px] font-semibold text-white shadow-[0_18px_40px_-14px_rgba(0,0,0,.6)]">
      <span className="size-2 shrink-0 rounded-full bg-green-500" />
      {mensagem}
    </div>
  );
}
