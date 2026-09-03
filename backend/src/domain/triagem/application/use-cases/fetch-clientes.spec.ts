import { InMemoryClientesRepository } from 'test/repositories/in-memory-clientes-repository';
import { makeCliente } from 'test/factories/make-cliente';
import { FetchClientesUseCase } from './fetch-clientes';

let inMemoryClientesRepository: InMemoryClientesRepository;
let sut: FetchClientesUseCase;

describe('Fetch Clientes', () => {
  beforeEach(() => {
    inMemoryClientesRepository = new InMemoryClientesRepository();

    sut = new FetchClientesUseCase(inMemoryClientesRepository);
  });

  it('should be able to fetch the whole portfolio', async () => {
    inMemoryClientesRepository.items.push(
      makeCliente({ name: 'José Raimundo dos Santos' }),
      makeCliente({ name: 'Terezinha Gomes Barreto' }),
    );

    const result = await sut.execute();

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(result.value.clientes).toHaveLength(2);
      expect(result.value.clientes[0].name).toBe('José Raimundo dos Santos');
    }
  });

  it('should return an empty list when there is no cliente', async () => {
    const result = await sut.execute();

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(result.value.clientes).toEqual([]);
    }
  });
});
