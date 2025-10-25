
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../src/services/authService';

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

describe('AuthService', () => {
  let authService;

  beforeEach(() => {
    localStorage.clear();
    authService = new AuthService();
    vi.spyOn(Date, 'now').mockImplementation(() => 1234567890);
  });

  it('should initialize with demo users if none exist', () => {
    authService.initialize();
    const users = authService.getAllAuthUsers();
    expect(users.length).toBe(3);
    expect(users[0].username).toBe('admin');
  });

  it('should not initialize with demo users if users already exist', () => {
    authService.createAuthUser('testuser', 'password', 'Test User');
    authService.initialize();
    const users = authService.getAllAuthUsers();
    expect(users.length).toBe(1);
    expect(users[0].username).toBe('testuser');
  });

  it('should create a new auth user', () => {
    const newUser = authService.createAuthUser('testuser', 'password', 'Test User');
    expect(newUser.username).toBe('testuser');
    const users = authService.getAllAuthUsers();
    expect(users.length).toBe(1);
  });

  it('should throw an error if username already exists', () => {
    authService.createAuthUser('testuser', 'password', 'Test User');
    expect(() => authService.createAuthUser('testuser', 'password', 'Another User')).toThrow('Username already exists');
  });

  it('should login a user with correct credentials', () => {
    authService.createAuthUser('testuser', 'password', 'Test User');
    const result = authService.login('testuser', 'password');
    expect(result.success).toBe(true);
    expect(result.user.username).toBe('testuser');
  });

  it('should not login a user with incorrect credentials', () => {
    authService.createAuthUser('testuser', 'password', 'Test User');
    const result = authService.login('testuser', 'wrongpassword');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid username or password');
  });

  it('should logout a user', () => {
    authService.createAuthUser('testuser', 'password', 'Test User');
    authService.login('testuser', 'password');
    const result = authService.logout();
    expect(result).toBe(true);
    expect(authService.getCurrentSession()).toBe(null);
  });

  it('should get the current session', () => {
    authService.createAuthUser('testuser', 'password', 'Test User');
    authService.login('testuser', 'password');
    const session = authService.getCurrentSession();
    expect(session.username).toBe('testuser');
  });

  it('should return null if no session exists', () => {
    const session = authService.getCurrentSession();
    expect(session).toBe(null);
  });

  it('should check if a user is authenticated', () => {
    authService.createAuthUser('testuser', 'password', 'Test User');
    authService.login('testuser', 'password');
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('should check if a user is not authenticated', () => {
    expect(authService.isAuthenticated()).toBe(false);
  });

  it('should get the current user from session', () => {
    authService.createAuthUser('testuser', 'password', 'Test User');
    authService.login('testuser', 'password');
    const user = authService.getCurrentUser();
    expect(user.username).toBe('testuser');
  });

  it('should return null if no user is in session', () => {
    const user = authService.getCurrentUser();
    expect(user).toBe(null);
  });
});
