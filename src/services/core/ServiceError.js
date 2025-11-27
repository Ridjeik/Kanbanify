export const ERROR_CODES = {
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  STORAGE: 'STORAGE_ERROR',
  AUTH: 'AUTH_ERROR',
  INTERNAL: 'INTERNAL_ERROR'
};

export class ServiceError extends Error {
  constructor(message, code = ERROR_CODES.INTERNAL) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }
}

