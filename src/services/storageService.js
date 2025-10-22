/**
 * Abstract storage interface
 * This allows us to easily swap storage implementations (localStorage, API, etc.)
 */
export class StorageService {
  /**
   * Get a board by ID
   * @param {string} boardId - The board ID
   * @returns {Promise<Object|null>} The board object or null if not found
   */
  async getBoard(boardId) {
    throw new Error('Method not implemented');
  }

  /**
   * Save a board
   * @param {Object} board - The board object to save
   * @returns {Promise<Object>} The saved board
   */
  async saveBoard(board) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a board
   * @param {string} boardId - The board ID to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteBoard(boardId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get all boards
   * @returns {Promise<Array>} Array of all boards
   */
  async getAllBoards() {
    throw new Error('Method not implemented');
  }
}

