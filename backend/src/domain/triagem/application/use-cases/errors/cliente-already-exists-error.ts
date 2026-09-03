import { UseCaseError } from '@/core/errors/use-case-error';

export class ClienteAlreadyExistsError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`Cliente "${identifier}" already exists`);
  }
}
