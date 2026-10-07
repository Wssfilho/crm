import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export type UserRole = 'ADMIN' | 'USER';

export interface UserProps {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt?: Date;
}

export class User extends Entity<UserProps> {
  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get password() {
    return this.props.password;
  }

  get role() {
    return this.props.role;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get isAdmin() {
    return this.props.role === 'ADMIN';
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  set name(name: string) {
    this.props.name = name;
    this.touch();
  }

  set email(email: string) {
    this.props.email = email;
    this.touch();
  }

  set password(password: string) {
    this.props.password = password;
    this.touch();
  }

  set role(role: UserRole) {
    this.props.role = role;
    this.touch();
  }

  static create(
    props: Optional<UserProps, 'role' | 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const user = new User(
      {
        ...props,
        role: props.role ?? 'USER',
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return user;
  }
}
