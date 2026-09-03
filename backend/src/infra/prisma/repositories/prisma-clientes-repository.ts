import { Injectable } from '@nestjs/common';
import { ClientesRepository } from '@/domain/triagem/application/repositories/clientes-repository';
import { Cliente } from '@/domain/triagem/enterprise/entities/cliente';
import { PrismaService } from '../prisma.service';
import { PrismaClienteMapper } from '../mappers/prisma-cliente-mapper';

@Injectable()
export class PrismaClientesRepository implements ClientesRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: { acoes: { orderBy: { ordem: 'asc' } } },
    });

    if (!cliente) {
      return null;
    }

    return PrismaClienteMapper.toDomain(cliente);
  }

  async findByCpf(cpf: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { cpf },
      include: { acoes: { orderBy: { ordem: 'asc' } } },
    });

    if (!cliente) {
      return null;
    }

    return PrismaClienteMapper.toDomain(cliente);
  }

  async findMany() {
    const clientes = await this.prisma.cliente.findMany({
      include: { acoes: { orderBy: { ordem: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });

    return clientes.map((cliente) => PrismaClienteMapper.toDomain(cliente));
  }

  async save(cliente: Cliente) {
    const data = PrismaClienteMapper.toPrisma(cliente);

    await this.prisma.cliente.update({
      where: { id: cliente.id.toString() },
      data,
    });
  }

  async create(cliente: Cliente) {
    const data = PrismaClienteMapper.toPrismaCreate(cliente);

    await this.prisma.cliente.create({ data });
  }

  async delete(cliente: Cliente) {
    await this.prisma.cliente.delete({
      where: { id: cliente.id.toString() },
    });
  }
}
