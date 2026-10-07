import { FileText, Layers, Wallet, type LucideIcon } from 'lucide-react';

export type FeatureFuturaId = 'produtos' | 'peticoes' | 'financeiro';

export interface FeatureFutura {
  id: FeatureFuturaId;
  label: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  tags: string[];
}

export const featuresFuturas: Record<FeatureFuturaId, FeatureFutura> = {
  produtos: {
    id: 'produtos',
    label: 'Seleção de produtos',
    title: 'Seleção de produtos',
    desc: 'Catálogo de teses onde a equipe escolhe o produto antes de rodar a triagem. Enquanto não existe, o cliente entra na fila sem tese definida e ela é atribuída durante a análise.',
    icon: Layers,
    tags: [
      'Catálogo de teses',
      'Regras de elegibilidade',
      'Versionamento de tese',
    ],
  },
  peticoes: {
    id: 'peticoes',
    label: 'Petições iniciais',
    title: 'Petições iniciais',
    desc: 'Geração das peças a partir da carteira triada. A produção segue fora do CRM nesta fase — o CRM entrega a lista de clientes aptos e os dados já validados.',
    icon: FileText,
    tags: ['Modelos por tese', 'Fila de protocolo', 'Exportação .docx'],
  },
  financeiro: {
    id: 'financeiro',
    label: 'Financeiro',
    title: 'Financeiro',
    desc: 'Acompanhamento de honorários e êxito por cliente e por produto.',
    icon: Wallet,
    tags: ['Contratos de honorários', 'Êxito por tese', 'Repasses'],
  },
};

export const listaDeFeaturesFuturas = Object.values(featuresFuturas);
