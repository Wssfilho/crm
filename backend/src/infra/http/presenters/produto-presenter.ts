import { Produto } from '@/domain/triagem/enterprise/entities/produto';

export class ProdutoPresenter {
  static toHTTP(produto: Produto) {
    return {
      id: produto.id.toString(),
      slug: produto.slug,
      name: produto.name,
      mono: produto.mono,
      gradiente: produto.gradiente,
    };
  }
}
