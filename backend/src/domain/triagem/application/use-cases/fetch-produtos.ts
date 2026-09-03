import { Either, right } from '@/core/either';
import { Produto } from '@/domain/triagem/enterprise/entities/produto';
import { ProdutosRepository } from '../repositories/produtos-repository';

type FetchProdutosUseCaseResponse = Either<
  null,
  {
    produtos: Produto[];
  }
>;

export class FetchProdutosUseCase {
  constructor(private produtosRepository: ProdutosRepository) {}

  async execute(): Promise<FetchProdutosUseCaseResponse> {
    const produtos = await this.produtosRepository.findMany();

    return right({
      produtos,
    });
  }
}
