import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../../src/services/storageService';

describe('StorageService', () => {
  let storageService;

  beforeEach(() => {
    storageService = new StorageService();
  });

  it('should get a board by ID', async () => {
    await expect(storageService.getBoard('board1')).resolves.toEqual({ id: 'board1' });
  });

  it('should save a board', async () => {
    const board = { id: 'board1', name: 'Test Board' };
    await expect(storageService.saveBoard(board)).resolves.toEqual(board);
  });

  it('should delete a board', async () => {
    await expect(storageService.deleteBoard('board1')).resolves.toBe(true);
  });

  it('should get all boards', async () => {
    await expect(storageService.getAllBoards()).resolves.toEqual([]);
  });
});