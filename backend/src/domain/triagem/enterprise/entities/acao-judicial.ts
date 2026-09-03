import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface AcaoJudicialProps {
  name: string;
  base: string;
  ordem: number;
}

export class AcaoJudicial extends Entity<AcaoJudicialProps> {
  get name() {
    return this.props.name;
  }

  get base() {
    return this.props.base;
  }

  get ordem() {
    return this.props.ordem;
  }

  static create(props: AcaoJudicialProps, id?: UniqueEntityID) {
    const acaoJudicial = new AcaoJudicial(props, id);

    return acaoJudicial;
  }
}
