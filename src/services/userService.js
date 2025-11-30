import { STORAGE_KEYS, DEFAULT_COLORS } from '../utils/constants';
import { globalStorage } from './core/StorageAdapter';
import { validateString } from '../utils/validators';
import { generateUserId } from '../utils/idGenerator';

// Pure helper function for color assignment
const getNextUserColor = (userCount) => {
  return DEFAULT_COLORS[userCount % DEFAULT_COLORS.length];
};

export class UserService {
  constructor(storageAdapter = globalStorage) {
    this.storage = storageAdapter;
  }

  async getAllUsers() {
    return await this.storage.get(STORAGE_KEYS.USERS, []);
  }

  async getUserById(userId) {
    const users = await this.getAllUsers();
    return users.find(u => u.id === userId) || null;
  }

  async getCurrentUser() {
    const userId = await this.storage.get(STORAGE_KEYS.CURRENT_USER);
    if (!userId) return null;
    return await this.getUserById(userId);
  }

  async setCurrentUser(userId) {
    const user = await this.getUserById(userId);
    if (!user) {
      return false;
    }
    
    await this.storage.set(STORAGE_KEYS.CURRENT_USER, userId);
    return true;
  }

  async createUser(name, color = null) {
    // Guard Clause with Custom Error
    validateString(name, 'User Name');

    const users = await this.getAllUsers();
    const assignedColor = color || getNextUserColor(users.length);

    const newUser = {
      id: generateUserId(),
      name: name.trim(),
      color: assignedColor,
      createdAt: Date.now(),
    };

    users.push(newUser);
    await this.storage.set(STORAGE_KEYS.USERS, users);
    
    return newUser;
  }

  async deleteUser(userId) {
    const users = await this.getAllUsers();
    const filteredUsers = users.filter(u => u.id !== userId);

    if (filteredUsers.length === users.length) return false;

    await this.storage.set(STORAGE_KEYS.USERS, filteredUsers);

    // If deleting current user, clear session
    const currentUserId = await this.storage.get(STORAGE_KEYS.CURRENT_USER);
    if (currentUserId === userId) {
      await this.storage.remove(STORAGE_KEYS.CURRENT_USER);
    }

    // Cleanup user boards
    await this.storage.remove(`${STORAGE_KEYS.BOARDS_PREFIX}${userId}`);
    return true;
  }

  async initialize() {
    let currentUser = await this.getCurrentUser();
    if (currentUser) {
      return currentUser;
    }

    const users = await this.getAllUsers();
    if (users.length > 0) {
      await this.setCurrentUser(users[0].id);
      return users[0];
    }
    
    return null;
  }
}

// Export a singleton instance
export const userService = new UserService();

