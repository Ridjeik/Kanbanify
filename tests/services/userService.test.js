
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '../../src/services/userService';

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

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    localStorage.clear();
    userService = new UserService();
    vi.spyOn(Date, 'now').mockImplementation(() => 1234567890);
  });

  it('should generate a unique ID', () => {
    const id = userService.generateId();
    expect(id).toMatch(/user-\d+-.+/);
  });

  it('should get all users', () => {
    localStorage.setItem('kanbanify_users', JSON.stringify([{ id: 'user1', name: 'Test User' }]));
    const users = userService.getAllUsers();
    expect(users.length).toBe(1);
    expect(users[0].name).toBe('Test User');
  });

  it('should get a user by ID', () => {
    localStorage.setItem('kanbanify_users', JSON.stringify([{ id: 'user1', name: 'Test User' }]));
    const user = userService.getUserById('user1');
    expect(user.name).toBe('Test User');
  });

  it('should get the current user', () => {
    localStorage.setItem('kanbanify_users', JSON.stringify([{ id: 'user1', name: 'Test User' }]));
    localStorage.setItem('kanbanify_current_user', 'user1');
    const user = userService.getCurrentUser();
    expect(user.name).toBe('Test User');
  });

  it('should set the current user', () => {
    localStorage.setItem('kanbanify_users', JSON.stringify([{ id: 'user1', name: 'Test User' }]));
    const result = userService.setCurrentUser('user1');
    expect(result).toBe(true);
    expect(localStorage.getItem('kanbanify_current_user')).toBe('user1');
  });

  it('should create a new user', () => {
    const newUser = userService.createUser('New User');
    expect(newUser.name).toBe('New User');
    const users = userService.getAllUsers();
    expect(users.length).toBe(1);
  });

  it('should update a user', () => {
    const newUser = userService.createUser('Old Name');
    const updatedUser = userService.updateUser(newUser.id, { name: 'New Name' });
    expect(updatedUser.name).toBe('New Name');
  });

  it('should delete a user', () => {
    const newUser = userService.createUser('Test User');
    const result = userService.deleteUser(newUser.id);
    expect(result).toBe(true);
    const users = userService.getAllUsers();
    expect(users.length).toBe(0);
  });

  it('should get or create a default user', () => {
    const defaultUser = userService.getOrCreateDefaultUser();
    expect(defaultUser.name).toBe('Default User');
    const users = userService.getAllUsers();
    expect(users.length).toBe(1);
  });

  it('should initialize and return the current user', () => {
    const currentUser = userService.initialize();
    expect(currentUser).not.toBe(null);
  });
});
