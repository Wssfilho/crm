import { Injectable } from '@nestjs/common';
import { ProdutosRepository } from '@/domain/triagem/application/repositories/produtos-repository';
import { PrismaService } from '../prisma.service';
import { PrismaProdutoMapper } from '../mappers/prisma-produto-mapper';

@Injectable()
export class PrismaProdutosRepository implements ProdutosRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const produto = await this.prisma.produto.findUnique({ where: { id } });

    if (!produto) {
      return null;
    }

    return PrismaProdutoMapper.toDomain(produto);
  }

  async findMany() {
    const produtos = await this.prisma.produto.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return produtos.map((produto) => PrismaProdutoMapper.toDomain(produto));
  }
}
