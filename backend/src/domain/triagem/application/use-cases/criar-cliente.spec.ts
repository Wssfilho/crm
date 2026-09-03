import { InMemoryClientesRepository } from 'test/repositories/in-memory-clientes-repository';
import { makeCliente } from 'test/factories/make-cliente';
import { CriarClienteUseCase } from './criar-cliente';
import { ClienteAlreadyExistsError } from './errors/cliente-already-exists-error';

let inMemoryClientesRepository: InMemoryClientesRepository;
let sut: CriarClienteUseCase;

const dadosValidos = {
  name: 'José Raimundo dos Santos',
  cpf: '042.318.765-11',
  nb: '128.456.789-0',
};

describe('Criar Cliente', () => {
  beforeEach(() => {
    inMemoryClientesRepository = new InMemoryClientesRepository();

    sut = new CriarClienteUseCase(inMemoryClientesRepository);
  });

  it('should be able to create a cliente', async () => {
    const result = await sut.execute(dadosValidos);

    expect(result.isRight()).toBe(true);
    expect(inMemoryClientesRepository.items).toHaveLength(1);
    expect(inMemoryClientesRepository.items[0].name).toBe(
      'José Raimundo dos Santos',
    );
  });

  it('should keep a draft in the cadastro column', async () => {
    await sut.execute(dadosValidos);

    const cliente = inMemoryClientesRepository.items[0];

    expect(cliente.status).toBe('PENDENTE');
    expect(cliente.coluna).toBe('NOVO');
    expect(cliente.docs).toBe(0);
    expect(cliente.valorEmCentavos).toBe(0);
    expect(cliente.acoes).toEqual([]);
  });

  it('should create a cliente without a produto, since the tese is defined later', async () => {
    await sut.execute(dadosValidos);

    expect(inMemoryClientesRepository.items[0].produtoId).toBeUndefined();
  });

  it('should send a cliente straight to the n8n analysis column', async () => {
    await sut.execute({ ...dadosValidos, enviarParaAnalise: true });

    expect(inMemoryClientesRepository.items[0].coluna).toBe('ANALISE');
  });

  it('should derive docs from the attached documents', async () => {
    await sut.execute({
      ...dadosValidos,
      procuracao: true,
      extratoBeneficio: true,
    });

    expect(inMemoryClientesRepository.items[0].docs).toBe(2);
  });

  it('should derive idade from the birth date', async () => {
    const nascimento = new Date();
    nascimento.setFullYear(nascimento.getFullYear() - 72);

    await sut.execute({ ...dadosValidos, nascimento });

    expect(inMemoryClientesRepository.items[0].idade).toBe(72);
  });

  it('should leave idade undefined without a birth date', async () => {
    await sut.execute(dadosValidos);

    expect(inMemoryClientesRepository.items[0].idade).toBeUndefined();
  });

  it('should not be able to create a cliente with a duplicated cpf', async () => {
    inMemoryClientesRepository.items.push(
      makeCliente({ cpf: '042.318.765-11' }),
    );

    const result = await sut.execute(dadosValidos);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ClienteAlreadyExistsError);
    expect(inMemoryClientesRepository.items).toHaveLength(1);
  });
});
