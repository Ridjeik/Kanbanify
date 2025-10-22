import { StorageService } from './storageService';

/**
 * LocalStorage implementation of StorageService
 * Supports user-scoped storage
 */
export class LocalStorageService extends StorageService {
  constructor(userId = null) {
    super();
    this.userId = userId;
    this.storageKey = userId ? `kanbanify_boards_${userId}` : 'kanbanify_boards';
  }

  /**
   * Set the current user ID and update storage key
   * @param {string} userId - The user ID
   */
  setUserId(userId) {
    this.userId = userId;
    this.storageKey = userId ? `kanbanify_boards_${userId}` : 'kanbanify_boards';
  }

  /**
   * Get all boards from localStorage
   * @returns {Promise<Object>} Object with board IDs as keys
   */
  async getAllBoards() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return {};
    }
  }

  /**
   * Get a board by ID
   * @param {string} boardId - The board ID
   * @returns {Promise<Object|null>} The board object or null if not found
   */
  async getBoard(boardId) {
    const boards = await this.getAllBoards();
    return boards[boardId] || null;
  }

  /**
   * Save a board
   * @param {Object} board - The board object to save
   * @returns {Promise<Object>} The saved board
   */
  async saveBoard(board) {
    try {
      const boards = await this.getAllBoards();
      boards[board.id] = board;
      localStorage.setItem(this.storageKey, JSON.stringify(boards));
      return board;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw error;
    }
  }

  /**
   * Delete a board
   * @param {string} boardId - The board ID to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteBoard(boardId) {
    try {
      const boards = await this.getAllBoards();
      if (boards[boardId]) {
        delete boards[boardId];
        localStorage.setItem(this.storageKey, JSON.stringify(boards));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
      return false;
    }
  }
}

