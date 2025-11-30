import { STORAGE_KEYS, HASH_PARAMS } from '../utils/constants';
import { globalStorage } from './core/StorageAdapter';
import { generateUserId } from '../utils/idGenerator';
import { ServiceError, ERROR_CODES } from './core/ServiceError';

export class AuthService {
  constructor(storageAdapter = globalStorage) {
    this.storage = storageAdapter;
  }

  _hashPassword(password) {
    // Simple hash for demo purposes (In production, use a library like bcrypt)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << HASH_PARAMS.SHIFT) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(HASH_PARAMS.RADIX);
  }

  async initialize() {
    const users = await this.getAllAuthUsers();
    if (users.length === 0) {
      await this.createAuthUser('admin', 'admin123', 'Admin User', '#3B82F6');
      await this.createAuthUser('user1', 'password', 'John Doe', '#10B981');
    }
  }

  async getAllAuthUsers() {
    return await this.storage.get(STORAGE_KEYS.AUTH_USERS, []);
  }

  async createAuthUser(username, password, displayName, color = '#3B82F6') {
    const users = await this.getAllAuthUsers();
    
    if (users.find(u => u.username === username)) {
      throw new ServiceError('Username already exists', ERROR_CODES.DUPLICATE_USER);
    }

    const newUser = {
      id: generateUserId(),
      username,
      passwordHash: this._hashPassword(password),
      name: displayName,
      color,
      createdAt: Date.now(),
    };

    users.push(newUser);
    await this.storage.set(STORAGE_KEYS.AUTH_USERS, users);
    return newUser;
  }

  async login(username, password) {
    const users = await this.getAllAuthUsers();
    const passwordHash = this._hashPassword(password);
    
    const user = users.find(
      u => u.username === username && u.passwordHash === passwordHash
    );

    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    const session = {
      userId: user.id,
      username: user.username,
      name: user.name,
      color: user.color,
      loginTime: Date.now(),
    };

    await this.storage.set(STORAGE_KEYS.SESSION, session);
    return { success: true, user: session };
  }

  async logout() {
    return await this.storage.remove(STORAGE_KEYS.SESSION);
  }

  async getCurrentSession() {
    return await this.storage.get(STORAGE_KEYS.SESSION);
  }

  async isAuthenticated() {
    const session = await this.getCurrentSession();
    return session !== null;
  }

  /**
   * Build user object from session data
   * @private
   * @param {Object} session - The session object
   * @returns {Object} User object
   */
  _buildUserFromSession(session) {
    return {
      id: session.userId,
      name: session.name,
      color: session.color,
      username: session.username,
    };
  }

  /**
   * Get current user info from session
   */
  async getCurrentUser() {
    const session = await this.getCurrentSession();
    if (!session) return null;

    return this._buildUserFromSession(session);
  }
}

// Export singleton instance
export const authService = new AuthService();

