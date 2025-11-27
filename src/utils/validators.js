import { ServiceError, ERROR_CODES } from '../services/core/ServiceError';

/**
 * Validates that a string is not null, undefined, or empty.
 * @param {string} value - The value to check
 * @param {string} fieldName - The name of the field for the error message
 * @throws {ServiceError}
 */
export const validateString = (value, fieldName) => {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw new ServiceError(
      `${fieldName} cannot be empty or null`, 
      ERROR_CODES.VALIDATION
    );
  }
};

