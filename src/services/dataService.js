import { STORAGE_KEYS } from '../utils/constants';
import { globalStorage } from './core/StorageAdapter';
import { validateString } from '../utils/validators';

export class DataService {
  constructor(userId = null, storageAdapter = globalStorage) {
    this.userId = userId;
    this.storage = storageAdapter;
  }

  get _boardStorageKey() {
    return this.userId 
      ? `${STORAGE_KEYS.BOARDS_PREFIX}${this.userId}` 
      : `${STORAGE_KEYS.BOARDS_PREFIX}global`;
  }

  _generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async getAllBoards() {
    const boardsMap = await this.storage.get(this._boardStorageKey, {});
    return Object.values(boardsMap).sort((a, b) => a.createdAt - b.createdAt);
  }

  async getBoard(boardId) {
    const boardsMap = await this.storage.get(this._boardStorageKey, {});
    return boardsMap[boardId] || null;
  }

  async saveBoard(board) {
    const boardsMap = await this.storage.get(this._boardStorageKey, {});
    boardsMap[board.id] = board;
    await this.storage.set(this._boardStorageKey, boardsMap);
    return board;
  }

  async deleteBoard(boardId) {
    const boardsMap = await this.storage.get(this._boardStorageKey, {});
    if (boardsMap[boardId]) {
      delete boardsMap[boardId];
      await this.storage.set(this._boardStorageKey, boardsMap);
      return true;
    }
    return false;
  }

  async createBoard(name) {
    // Guard Clause: Fail Fast
    validateString(name, 'Board Name');

    const board = {
      id: this._generateId(),
      name: name.trim(),
      columns: [],
      createdAt: Date.now(),
    };
    return await this.saveBoard(board);
  }

  async updateBoardName(boardId, name) {
    validateString(name, 'Board Name');
    
    const board = await this.getBoard(boardId);
    if (board) {
      board.name = name.trim();
      return await this.saveBoard(board);
    }
    return null;
  }

  createColumn(title) {
    validateString(title, 'Column Title');
    return {
      id: this._generateId(),
      title: title.trim(),
      cards: [],
    };
  }

  createCard(title, details = {}) {
    validateString(title, 'Card Title');

    const { 
      description = '', 
      dueDate = null, 
      tags = [], 
      priority = 'medium' 
    } = details;

    return {
      id: this._generateId(),
      title: title.trim(),
      description,
      dueDate,
      tags,
      priority,
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

