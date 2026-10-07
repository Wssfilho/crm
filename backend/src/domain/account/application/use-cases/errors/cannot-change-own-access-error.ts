import { UseCaseError } from '@/core/errors/use-case-error';

export class CannotChangeOwnAccessError extends Error implements UseCaseError {
  constructor() {
    super('Administrators cannot remove their own access');
  }
}
