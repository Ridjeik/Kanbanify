import { LocalStorageService } from './localStorageService';

/**
 * Data service that provides business logic and uses the storage service
 * This is where you'd add validation, transformations, etc.
 * Supports user-scoped data
 */
export class DataService {
  constructor(userId = null, storageService = null) {
    this.userId = userId;
    this.storageService = storageService || new LocalStorageService(userId);
  }

  /**
   * Set the current user ID and update storage accordingly
   * @param {string} userId - The user ID
   */
  setUserId(userId) {
    this.userId = userId;
    if (this.storageService.setUserId) {
      this.storageService.setUserId(userId);
    }
  }

  /**
   * Generate a unique ID
   * @returns {string} A unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get or create the default board for the current user
   * @returns {Promise<Object>} The board object
   */
  async getOrCreateBoard() {
    const boardId = `default-board-${this.userId || 'global'}`;
    let board = await this.storageService.getBoard(boardId);
    
    if (!board) {
      board = {
        id: boardId,
        name: 'My Kanban Board',
        columns: [],
        createdAt: Date.now(),
      };
      await this.storageService.saveBoard(board);
    }
    
    return board;
  }

  /**
   * Get all boards
   * @returns {Promise<Array>} Array of all boards
   */
  async getAllBoards() {
    const boardsObject = await this.storageService.getAllBoards();
    return Object.values(boardsObject).sort((a, b) => a.createdAt - b.createdAt);
  }

  /**
   * Get a specific board by ID
   * @param {string} boardId - The board ID
   * @returns {Promise<Object|null>} The board object or null
   */
  async getBoard(boardId) {
    return await this.storageService.getBoard(boardId);
  }

  /**
   * Create a new board
   * @param {string} name - The board name
   * @returns {Promise<Object>} The created board
   */
  async createBoard(name) {
    const board = {
      id: this.generateId(),
      name: name || 'New Board',
      columns: [],
      createdAt: Date.now(),
    };
    await this.storageService.saveBoard(board);
    return board;
  }

  /**
   * Update board name
   * @param {string} boardId - The board ID
   * @param {string} name - The new board name
   * @returns {Promise<Object|null>} The updated board or null
   */
  async updateBoardName(boardId, name) {
    const board = await this.storageService.getBoard(boardId);
    if (board) {
      board.name = name;
      await this.storageService.saveBoard(board);
      return board;
    }
    return null;
  }

  /**
   * Delete a board
   * @param {string} boardId - The board ID to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteBoard(boardId) {
    return await this.storageService.deleteBoard(boardId);
  }

  /**
   * Save the board
   * @param {Object} board - The board to save
   * @returns {Promise<Object>} The saved board
   */
  async saveBoard(board) {
    return await this.storageService.saveBoard(board);
  }

  /**
   * Add a new column
   * @param {Object} board - The board
   * @param {string} title - The column title
   * @returns {Object} The new column
   */
  createColumn(title) {
    return {
      id: this.generateId(),
      title,
      cards: [],
    };
  }

  /**
   * Create a new card
   * @param {string} title - The card title
   * @param {Object} details - Additional card details
   * @returns {Object} The new card
   */
  createCard(title, details = {}) {
    return {
      id: this.generateId(),
      title,
      description: details.description || '',
      dueDate: details.dueDate || null,
      tags: details.tags || [],
      createdAt: Date.now(),
    };
  }

  /**
   * Find a card in the board
   * @param {Object} board - The board
   * @param {string} cardId - The card ID
   * @returns {Object|null} Object with column and card, or null
   */
  findCard(board, cardId) {
    for (const column of board.columns) {
      const card = column.cards.find(c => c.id === cardId);
      if (card) {
        return { column, card };
      }
    }
    return null;
  }

  /**
   * Find a column in the board
   * @param {Object} board - The board
   * @param {string} columnId - The column ID
   * @returns {Object|null} The column or null
   */
  findColumn(board, columnId) {
    return board.columns.find(c => c.id === columnId) || null;
  }
}

// Note: We no longer export a singleton since each user needs their own instance
// Instead, create instances in the App with the current user's ID
export const createDataService = (userId) => new DataService(userId);

