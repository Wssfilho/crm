import { Injectable } from '@nestjs/common';
import { ExecucoesRepository } from '@/domain/triagem/application/repositories/execucoes-repository';
import { PrismaService } from '../prisma.service';
import { PrismaExecucaoDiariaMapper } from '../mappers/prisma-execucao-diaria-mapper';

@Injectable()
export class PrismaExecucoesRepository implements ExecucoesRepository {
  constructor(private prisma: PrismaService) {}

  async findMany() {
    const execucoes = await this.prisma.execucaoDiaria.findMany({
      orderBy: { data: 'asc' },
    });

    return execucoes.map((execucao) =>
      PrismaExecucaoDiariaMapper.toDomain(execucao),
    );
  }
}
