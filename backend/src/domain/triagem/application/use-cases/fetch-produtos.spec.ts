import { InMemoryProdutosRepository } from 'test/repositories/in-memory-produtos-repository';
import { makeProduto } from 'test/factories/make-produto';
import { FetchProdutosUseCase } from './fetch-produtos';

let inMemoryProdutosRepository: InMemoryProdutosRepository;
let sut: FetchProdutosUseCase;

describe('Fetch Produtos', () => {
  beforeEach(() => {
    inMemoryProdutosRepository = new InMemoryProdutosRepository();

    sut = new FetchProdutosUseCase(inMemoryProdutosRepository);
  });

  it('should be able to fetch the tese catalog', async () => {
    inMemoryProdutosRepository.items.push(
      makeProduto({ slug: 'excluidos', name: 'Excluídos 2021/2022' }),
      makeProduto({ slug: 'ativos', name: 'Consignados Ativos' }),
    );

    const result = await sut.execute();

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(result.value.produtos).toHaveLength(2);
      expect(result.value.produtos[0].slug).toBe('excluidos');
    }
  });
});
