/**
 * Storage Key Builder Utilities
 * Centralized functions for building localStorage keys
 */

import { STORAGE_KEYS } from './constants';

/**
 * Build a user-specific board key for localStorage
 * @param {string} userId - The user ID
 * @returns {string} The storage key for the user's last board
 */
export const buildUserLastBoardKey = (userId) => {
  return `${STORAGE_KEYS.BOARDS_PREFIX}last_${userId}`;
};
