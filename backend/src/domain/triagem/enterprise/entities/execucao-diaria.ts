import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface ExecucaoDiariaProps {
  data: Date;
  comAcao: number;
  semIrregularidade: number;
}

export class ExecucaoDiaria extends Entity<ExecucaoDiariaProps> {
  get data() {
    return this.props.data;
  }

  get comAcao() {
    return this.props.comAcao;
  }

  get semIrregularidade() {
    return this.props.semIrregularidade;
  }

  static create(props: ExecucaoDiariaProps, id?: UniqueEntityID) {
    const execucaoDiaria = new ExecucaoDiaria(props, id);

    return execucaoDiaria;
  }
}
