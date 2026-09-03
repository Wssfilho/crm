import { ClientesRepository } from '@/domain/triagem/application/repositories/clientes-repository';
import { Cliente } from '@/domain/triagem/enterprise/entities/cliente';

export class InMemoryClientesRepository implements ClientesRepository {
  public items: Cliente[] = [];

  async findById(id: string) {
    const cliente = this.items.find((item) => item.id.toString() === id);

    if (!cliente) {
      return null;
    }

    return cliente;
  }

  async findByCpf(cpf: string) {
    const cliente = this.items.find((item) => item.cpf === cpf);

    if (!cliente) {
      return null;
    }

    return cliente;
  }

  async findMany() {
    return this.items;
  }

  async save(cliente: Cliente) {
    const itemIndex = this.items.findIndex((item) =>
      item.id.equals(cliente.id),
    );

    this.items[itemIndex] = cliente;
  }

  async create(cliente: Cliente) {
    this.items.push(cliente);
  }

  async delete(cliente: Cliente) {
    const itemIndex = this.items.findIndex((item) =>
      item.id.equals(cliente.id),
    );

    this.items.splice(itemIndex, 1);
  }
}
