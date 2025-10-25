import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { authService } from '../../src/services/authService';
import { createDataService } from '../../src/services/dataService';

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    authService.initialize();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should successfully complete the authentication flow with data initialization', async () => {
    // 1. Login with demo credentials
    const loginResult = authService.login('admin', 'admin123');
    expect(loginResult.success).toBe(true);
    expect(loginResult.user).toBeDefined();
    expect(loginResult.user.username).toBe('admin');

    // 2. Check if user is authenticated
    expect(authService.isAuthenticated()).toBe(true);

    // 3. Get current user and create data service
    const currentUser = authService.getCurrentUser();
    expect(currentUser).toBeDefined();
    expect(currentUser.username).toBe('admin');

    const dataService = createDataService(currentUser.id);
    expect(dataService).toBeDefined();

    // 4. Create a test board
    const board = await dataService.createBoard('Test Board');
    expect(board).toBeDefined();
    expect(board.name).toBe('Test Board');

    // 5. Verify board is saved and retrievable
    const savedBoard = await dataService.getBoard(board.id);
    expect(savedBoard).toBeDefined();
    expect(savedBoard.name).toBe('Test Board');

    // 6. Logout
    const logoutResult = authService.logout();
    expect(logoutResult).toBe(true);
    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.getCurrentUser()).toBe(null);
  });

  it('should maintain data isolation between users', async () => {
    // 1. Create and login as first user
    const user1Login = authService.login('user1', 'password');
    expect(user1Login.success).toBe(true);
    const user1 = authService.getCurrentUser();
    const dataService1 = createDataService(user1.id);
    
    // Create board for user1
    const board1 = await dataService1.createBoard('User 1 Board');
    expect(board1.name).toBe('User 1 Board');

    // Logout user1
    authService.logout();

    // 2. Login as second user
    const user2Login = authService.login('user2', 'password');
    expect(user2Login.success).toBe(true);
    const user2 = authService.getCurrentUser();
    const dataService2 = createDataService(user2.id);

    // Create board for user2
    const board2 = await dataService2.createBoard('User 2 Board');
    expect(board2.name).toBe('User 2 Board');

    // 3. Verify data isolation
    const user2Boards = await dataService2.getAllBoards();
    expect(user2Boards.length).toBe(1);
    expect(user2Boards[0].name).toBe('User 2 Board');
    expect(user2Boards.find(b => b.name === 'User 1 Board')).toBeUndefined();
  });

  it('should handle invalid login attempts gracefully', () => {
    // 1. Try logging in with invalid credentials
    const invalidLogin = authService.login('admin', 'wrongpassword');
    expect(invalidLogin.success).toBe(false);
    expect(invalidLogin.error).toBe('Invalid username or password');
    expect(authService.isAuthenticated()).toBe(false);

    // 2. Try logging in with non-existent user
    const nonExistentLogin = authService.login('nonexistent', 'password');
    expect(nonExistentLogin.success).toBe(false);
    expect(nonExistentLogin.error).toBe('Invalid username or password');
    expect(authService.isAuthenticated()).toBe(false);
  });

  it('should handle session persistence correctly', () => {
    // 1. Login and verify session is saved
    const loginResult = authService.login('admin', 'admin123');
    expect(loginResult.success).toBe(true);
    
    // 2. Verify session is stored in localStorage
    const session = JSON.parse(localStorage.getItem('kanbanify_session'));
    expect(session).toBeDefined();
    expect(session.username).toBe('admin');

    // 3. Create new auth service instance to simulate page reload
    const newAuthService = new authService.constructor();
    expect(newAuthService.isAuthenticated()).toBe(true);
    expect(newAuthService.getCurrentUser().username).toBe('admin');
  });
});