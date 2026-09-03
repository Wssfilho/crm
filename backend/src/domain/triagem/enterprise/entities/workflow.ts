import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface WorkflowProps {
  nome: string;
  ativo: boolean;
  sincronizadoEm?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export class Workflow extends Entity<WorkflowProps> {
  get nome() {
    return this.props.nome;
  }

  get ativo() {
    return this.props.ativo;
  }

  get sincronizadoEm() {
    return this.props.sincronizadoEm;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  alternar() {
    this.props.ativo = !this.props.ativo;
    this.touch();
  }

  static create(
    props: Optional<WorkflowProps, 'ativo' | 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const workflow = new Workflow(
      {
        ...props,
        ativo: props.ativo ?? true,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return workflow;
  }
}
