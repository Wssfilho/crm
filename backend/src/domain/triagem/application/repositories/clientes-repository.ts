import { Cliente } from '@/domain/triagem/enterprise/entities/cliente';

export abstract class ClientesRepository {
  abstract findById(id: string): Promise<Cliente | null>;
  abstract findByCpf(cpf: string): Promise<Cliente | null>;
  abstract findMany(): Promise<Cliente[]>;
  abstract save(cliente: Cliente): Promise<void>;
  abstract create(cliente: Cliente): Promise<void>;
  abstract delete(cliente: Cliente): Promise<void>;
}
