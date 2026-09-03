import { Produto } from '@/domain/triagem/enterprise/entities/produto';

export abstract class ProdutosRepository {
  abstract findById(id: string): Promise<Produto | null>;
  abstract findMany(): Promise<Produto[]>;
}
