import { ProdutosRepository } from '@/domain/triagem/application/repositories/produtos-repository';
import { Produto } from '@/domain/triagem/enterprise/entities/produto';

export class InMemoryProdutosRepository implements ProdutosRepository {
  public items: Produto[] = [];

  async findById(id: string) {
    const produto = this.items.find((item) => item.id.toString() === id);

    if (!produto) {
      return null;
    }

    return produto;
  }

  async findMany() {
    return this.items;
  }
}
