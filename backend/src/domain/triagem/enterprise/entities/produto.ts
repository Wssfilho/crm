import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export interface ProdutoProps {
  slug: string;
  name: string;
  mono: string;
  gradiente: string;
}

export class Produto extends Entity<ProdutoProps> {
  get slug() {
    return this.props.slug;
  }

  get name() {
    return this.props.name;
  }

  get mono() {
    return this.props.mono;
  }

  get gradiente() {
    return this.props.gradiente;
  }

  static create(props: ProdutoProps, id?: UniqueEntityID) {
    const produto = new Produto(props, id);

    return produto;
  }
}
