
import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageService } from '../../src/services/localStorageService';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('LocalStorageService', () => {
  let storageService;

  beforeEach(() => {
    localStorage.clear();
    storageService = new LocalStorageService('test-user');
  });

  it('should set user ID and update storage key', () => {
    storageService.setUserId('new-user');
    expect(storageService.userId).toBe('new-user');
    expect(storageService.storageKey).toBe('kanbanify_boards_new-user');
  });

  it('should get all boards', async () => {
    localStorage.setItem('kanbanify_boards_test-user', JSON.stringify({ board1: { name: 'Test Board' } }));
    const boards = await storageService.getAllBoards();
    expect(boards.board1.name).toBe('Test Board');
  });

  it('should return an empty object if no boards exist', async () => {
    const boards = await storageService.getAllBoards();
    expect(boards).toEqual({});
  });

  it('should get a board by ID', async () => {
    localStorage.setItem('kanbanify_boards_test-user', JSON.stringify({ board1: { name: 'Test Board' } }));
    const board = await storageService.getBoard('board1');
    expect(board.name).toBe('Test Board');
  });

  it('should return null if board is not found', async () => {
    const board = await storageService.getBoard('board2');
    expect(board).toBe(null);
  });

  it('should save a board', async () => {
    const board = { id: 'board1', name: 'Test Board' };
    await storageService.saveBoard(board);
    const boards = JSON.parse(localStorage.getItem('kanbanify_boards_test-user'));
    expect(boards.board1.name).toBe('Test Board');
  });

  it('should delete a board', async () => {
    localStorage.setItem('kanbanify_boards_test-user', JSON.stringify({ board1: { name: 'Test Board' } }));
    const result = await storageService.deleteBoard('board1');
    expect(result).toBe(true);
    const boards = JSON.parse(localStorage.getItem('kanbanify_boards_test-user'));
    expect(boards.board1).toBeUndefined();
  });

  it('should return false when deleting a non-existent board', async () => {
    const result = await storageService.deleteBoard('board2');
    expect(result).toBe(false);
  });
});
