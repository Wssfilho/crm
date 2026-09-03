import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ExecucaoDiaria } from '@/domain/triagem/enterprise/entities/execucao-diaria';
import { ExecucaoDiaria as PrismaExecucaoDiaria } from '@/generated/prisma/client';

export class PrismaExecucaoDiariaMapper {
  static toDomain(raw: PrismaExecucaoDiaria): ExecucaoDiaria {
    return ExecucaoDiaria.create(
      {
        data: raw.data,
        comAcao: raw.comAcao,
        semIrregularidade: raw.semIrregularidade,
      },
      new UniqueEntityID(raw.id),
    );
  }
}
