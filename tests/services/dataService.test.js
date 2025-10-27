
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataService } from '../../src/services/dataService';
import { LocalStorageService } from '../../src/services/localStorageService';

vi.mock('../../src/services/localStorageService');

describe('DataService', () => {
  let dataService;
  let storageService;

  beforeEach(() => {
    storageService = new LocalStorageService();
    dataService = new DataService('test-user', storageService);
    vi.spyOn(Date, 'now').mockImplementation(() => 1234567890);
  });

  it('should set user ID and update storage service', () => {
    const setUserIdSpy = vi.spyOn(storageService, 'setUserId');
    dataService.setUserId('new-user');
    expect(dataService.userId).toBe('new-user');
    expect(setUserIdSpy).toHaveBeenCalledWith('new-user');
  });

  it('should generate a unique ID', () => {
    const id = dataService.generateId();
    expect(id).toMatch(/\d+-.+/);
  });

  it('should get or create a default board', async () => {
    storageService.getBoard.mockResolvedValue(null);
    storageService.saveBoard.mockResolvedValue({});
    const board = await dataService.getOrCreateBoard();
    expect(board.name).toBe('My Kanban Board');
    expect(storageService.getBoard).toHaveBeenCalled();
    expect(storageService.saveBoard).toHaveBeenCalled();
  });

  it('should get an existing default board', async () => {
    const existingBoard = { id: 'default-board-test-user', name: 'Existing Board' };
    storageService.getBoard.mockResolvedValue(existingBoard);
    const board = await dataService.getOrCreateBoard();
    expect(board.name).toBe('Existing Board');
    expect(storageService.getBoard).toHaveBeenCalled();
  });

  it('should get all boards', async () => {
    const boards = { board1: { createdAt: 1 }, board2: { createdAt: 2 } };
    storageService.getAllBoards.mockResolvedValue(boards);
    const result = await dataService.getAllBoards();
    expect(result.length).toBe(2);
    expect(result[0].createdAt).toBe(1);
  });

  it('should get a board by ID', async () => {
    const board = { id: 'board1', name: 'Test Board' };
    storageService.getBoard.mockResolvedValue(board);
    const result = await dataService.getBoard('board1');
    expect(result.name).toBe('Test Board');
  });

  it('should create a new board', async () => {
    storageService.saveBoard.mockResolvedValue({});
    const board = await dataService.createBoard('New Board');
    expect(board.name).toBe('New Board');
    expect(storageService.saveBoard).toHaveBeenCalled();
  });

  it('should update a board name', async () => {
    const board = { id: 'board1', name: 'Old Name' };
    storageService.getBoard.mockResolvedValue(board);
    storageService.saveBoard.mockResolvedValue({});
    const updatedBoard = await dataService.updateBoardName('board1', 'New Name');
    expect(updatedBoard.name).toBe('New Name');
    expect(storageService.saveBoard).toHaveBeenCalledWith(updatedBoard);
  });

  it('should return null when updating a non-existent board', async () => {
    storageService.getBoard.mockResolvedValue(null);
    const result = await dataService.updateBoardName('board1', 'New Name');
    expect(result).toBe(null);
  });

  it('should delete a board', async () => {
    storageService.deleteBoard.mockResolvedValue(true);
    const result = await dataService.deleteBoard('board1');
    expect(result).toBe(true);
  });

  it('should save a board', async () => {
    const board = { id: 'board1', name: 'Test Board' };
    storageService.saveBoard.mockResolvedValue(board);
    const result = await dataService.saveBoard(board);
    expect(result.name).toBe('Test Board');
  });

  it('should create a column', () => {
    const column = dataService.createColumn('New Column');
    expect(column.title).toBe('New Column');
    expect(column.cards).toEqual([]);
  });

  it('should create a card', () => {
    const card = dataService.createCard('New Card', { description: 'Test' });
    expect(card.title).toBe('New Card');
    expect(card.description).toBe('Test');
  });

  it('should create a card with default medium priority', () => {
    const card = dataService.createCard('New Card');
    expect(card.priority).toBe('medium');
  });

  it('should create a card with specified priority', () => {
    const card = dataService.createCard('High Priority Task', { 
      description: 'Important task',
      priority: 'high'
    });
    expect(card.priority).toBe('high');
    expect(card.title).toBe('High Priority Task');
  });

  it('should create a card with low priority', () => {
    const card = dataService.createCard('Low Priority Task', { priority: 'low' });
    expect(card.priority).toBe('low');
  });

  it('should create a card with critical priority', () => {
    const card = dataService.createCard('Critical Task', { priority: 'critical' });
    expect(card.priority).toBe('critical');
  });

  it('should create a card with all details including priority', () => {
    const cardDetails = {
      description: 'Test description',
      dueDate: '2025-12-31',
      tags: [{ label: 'urgent', color: 'red' }],
      priority: 'high'
    };
    const card = dataService.createCard('Complete Task', cardDetails);
    expect(card.title).toBe('Complete Task');
    expect(card.description).toBe('Test description');
    expect(card.dueDate).toBe('2025-12-31');
    expect(card.tags).toEqual([{ label: 'urgent', color: 'red' }]);
    expect(card.priority).toBe('high');
  });

  it('should find a card in the board', () => {
    const board = {
      columns: [
        { id: 'col1', cards: [{ id: 'card1' }] },
        { id: 'col2', cards: [{ id: 'card2' }] },
      ],
    };
    const result = dataService.findCard(board, 'card2');
    expect(result.card.id).toBe('card2');
    expect(result.column.id).toBe('col2');
  });

  it('should return null when card is not found', () => {
    const board = { columns: [] };
    const result = dataService.findCard(board, 'card1');
    expect(result).toBe(null);
  });

  it('should find a column in the board', () => {
    const board = { columns: [{ id: 'col1' }, { id: 'col2' }] };
    const result = dataService.findColumn(board, 'col2');
    expect(result.id).toBe('col2');
  });

  it('should return null when column is not found', () => {
    const board = { columns: [] };
    const result = dataService.findColumn(board, 'col1');
    expect(result).toBe(null);
  });
});
