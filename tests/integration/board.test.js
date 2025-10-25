import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { authService } from '../../src/services/authService';
import { createDataService } from '../../src/services/dataService';

describe('Board Management Integration Tests', () => {
  let dataService;
  let currentUser;

  beforeEach(() => {
    localStorage.clear();
    authService.initialize();
    const loginResult = authService.login('admin', 'admin123');
    currentUser = loginResult.user;
    dataService = createDataService(currentUser.userId);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should manage a complete board lifecycle', async () => {
    // 1. Create a new board
    const board = await dataService.createBoard('Project Alpha');
    expect(board.name).toBe('Project Alpha');
    expect(board.columns).toEqual([]);

    // 2. Add columns to the board
    const todoColumn = dataService.createColumn('To Do');
    const inProgressColumn = dataService.createColumn('In Progress');
    const doneColumn = dataService.createColumn('Done');

    board.columns = [todoColumn, inProgressColumn, doneColumn];
    await dataService.saveBoard(board);

    // 3. Verify columns are saved
    const updatedBoard = await dataService.getBoard(board.id);
    expect(updatedBoard.columns.length).toBe(3);
    expect(updatedBoard.columns[0].title).toBe('To Do');

    // 4. Add a card to the To Do column
    const card = dataService.createCard('Implement Feature X', {
      description: 'New feature implementation',
      tags: [{ label: 'feature', color: 'blue' }]
    });
    updatedBoard.columns[0].cards = [card];
    await dataService.saveBoard(updatedBoard);

    // 5. Verify card is saved
    const boardWithCard = await dataService.getBoard(board.id);
    expect(boardWithCard.columns[0].cards.length).toBe(1);
    expect(boardWithCard.columns[0].cards[0].title).toBe('Implement Feature X');

    // 6. Move card to In Progress
    const movedCard = boardWithCard.columns[0].cards[0];
    boardWithCard.columns[0].cards = [];
    boardWithCard.columns[1].cards = [movedCard];
    await dataService.saveBoard(boardWithCard);

    // 7. Verify card movement
    const boardAfterMove = await dataService.getBoard(board.id);
    expect(boardAfterMove.columns[0].cards.length).toBe(0);
    expect(boardAfterMove.columns[1].cards.length).toBe(1);
    expect(boardAfterMove.columns[1].cards[0].title).toBe('Implement Feature X');

    // 8. Delete the board
    const deleteResult = await dataService.deleteBoard(board.id);
    expect(deleteResult).toBe(true);

    // 9. Verify board is deleted
    const deletedBoard = await dataService.getBoard(board.id);
    expect(deletedBoard).toBe(null);
  });

  it('should handle multiple boards and cross-board operations', async () => {
    // 1. Create multiple boards
    const board1 = await dataService.createBoard('Board 1');
    const board2 = await dataService.createBoard('Board 2');

    // 2. Get all boards
    const allBoards = await dataService.getAllBoards();
    expect(allBoards.length).toBe(2);
    expect(allBoards.map(b => b.name)).toContain('Board 1');
    expect(allBoards.map(b => b.name)).toContain('Board 2');

    // 3. Add columns to both boards
    const board1Column = dataService.createColumn('Board 1 Column');
    board1.columns = [board1Column];
    await dataService.saveBoard(board1);

    const board2Column = dataService.createColumn('Board 2 Column');
    board2.columns = [board2Column];
    await dataService.saveBoard(board2);

    // 4. Verify each board maintains its own columns
    const updatedBoard1 = await dataService.getBoard(board1.id);
    const updatedBoard2 = await dataService.getBoard(board2.id);

    expect(updatedBoard1.columns[0].title).toBe('Board 1 Column');
    expect(updatedBoard2.columns[0].title).toBe('Board 2 Column');
  });

  it('should handle board updates and column management', async () => {
    // 1. Create a board with columns
    const board = await dataService.createBoard('Test Board');
    const column1 = dataService.createColumn('Column 1');
    const column2 = dataService.createColumn('Column 2');
    board.columns = [column1, column2];
    await dataService.saveBoard(board);

    // 2. Update board name
    const updatedBoard = await dataService.updateBoardName(board.id, 'Updated Board');
    expect(updatedBoard.name).toBe('Updated Board');
    expect(updatedBoard.columns.length).toBe(2);

    // 3. Add a card to first column
    const card = dataService.createCard('Test Card');
    updatedBoard.columns[0].cards = [card];
    await dataService.saveBoard(updatedBoard);

    // 4. Find card in the board
    const result = dataService.findCard(updatedBoard, card.id);
    expect(result).toBeDefined();
    expect(result.card.id).toBe(card.id);
    expect(result.column.id).toBe(updatedBoard.columns[0].id);

    // 5. Find column in the board
    const foundColumn = dataService.findColumn(updatedBoard, column1.id);
    expect(foundColumn).toBeDefined();
    expect(foundColumn.id).toBe(column1.id);
    expect(foundColumn.title).toBe('Column 1');
  });

  it('should handle card management and updates', async () => {
    // 1. Create a board with a column
    const board = await dataService.createBoard('Card Test Board');
    const column = dataService.createColumn('Test Column');
    board.columns = [column];
    await dataService.saveBoard(board);

    // 2. Create a card with tags and description
    const card = dataService.createCard('Test Card', {
      description: 'Card description',
      tags: [
        { label: 'bug', color: 'red' },
        { label: 'feature', color: 'blue' }
      ],
      dueDate: '2025-12-31'
    });

    // 3. Add card to column
    board.columns[0].cards = [card];
    await dataService.saveBoard(board);

    // 4. Verify card details
    const updatedBoard = await dataService.getBoard(board.id);
    const savedCard = updatedBoard.columns[0].cards[0];
    expect(savedCard.title).toBe('Test Card');
    expect(savedCard.description).toBe('Card description');
    expect(savedCard.tags.length).toBe(2);
    expect(savedCard.dueDate).toBe('2025-12-31');

    // 5. Update card
    savedCard.title = 'Updated Card';
    savedCard.tags.push({ label: 'priority', color: 'yellow' });
    await dataService.saveBoard(updatedBoard);

    // 6. Verify updates
    const finalBoard = await dataService.getBoard(board.id);
    const finalCard = finalBoard.columns[0].cards[0];
    expect(finalCard.title).toBe('Updated Card');
    expect(finalCard.tags.length).toBe(3);
  });
});