/**
 * ID Generation Utilities
 * Centralized ID generation logic to avoid duplication across services
 */

/**
 * Generate a unique ID with a given prefix
 * @param {string} prefix - The prefix for the ID (e.g., 'user', 'board', 'card')
 * @returns {string} A unique ID string
 */
export const generateId = (prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
};

/**
 * Generate a unique user ID
 * @returns {string} A unique user ID
 */
export const generateUserId = () => generateId('user');

/**
 * Generate a unique board/card/column ID
 * @returns {string} A unique ID without prefix
 */
export const generateBoardId = () => generateId();
