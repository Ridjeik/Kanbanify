/**
 * User Service
 * Manages user creation, selection, and persistence
 */
export class UserService {
  constructor(storageKey = 'kanbanify_users') {
    this.storageKey = storageKey;
    this.currentUserKey = 'kanbanify_current_user';
  }

  /**
   * Generate a unique ID for a user
   * @returns {string} A unique ID
   */
  generateId() {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all users from localStorage
   * @returns {Array} Array of user objects
   */
  getAllUsers() {
    try {
      const data = localStorage.getItem(this.storageKey);
      const users = data ? JSON.parse(data) : [];
      return users;
    } catch (error) {
      console.error('Error reading users from localStorage:', error);
      return [];
    }
  }

  /**
   * Get a user by ID
   * @param {string} userId - The user ID
   * @returns {Object|null} The user object or null if not found
   */
  getUserById(userId) {
    const users = this.getAllUsers();
    return users.find(u => u.id === userId) || null;
  }

  /**
   * Get the current active user
   * @returns {Object|null} The current user object or null
   */
  getCurrentUser() {
    try {
      const userId = localStorage.getItem(this.currentUserKey);
      if (!userId) return null;
      return this.getUserById(userId);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Set the current active user
   * @param {string} userId - The user ID to set as current
   * @returns {boolean} True if successful
   */
  setCurrentUser(userId) {
    try {
      const user = this.getUserById(userId);
      if (user) {
        localStorage.setItem(this.currentUserKey, userId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting current user:', error);
      return false;
    }
  }

  /**
   * Create a new user
   * @param {string} name - The user name
   * @param {string} color - Optional color for the user (for UI display)
   * @returns {Object} The created user object
   */
  createUser(name, color = null) {
    try {
      const users = this.getAllUsers();
      
      // Generate a color if not provided
      if (!color) {
        const colors = [
          '#3B82F6', // blue
          '#10B981', // green
          '#F59E0B', // amber
          '#EF4444', // red
          '#8B5CF6', // purple
          '#EC4899', // pink
          '#14B8A6', // teal
          '#F97316', // orange
        ];
        color = colors[users.length % colors.length];
      }

      const newUser = {
        id: this.generateId(),
        name: name || 'New User',
        color: color,
        createdAt: Date.now(),
      };

      users.push(newUser);
      localStorage.setItem(this.storageKey, JSON.stringify(users));
      
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update a user's information
   * @param {string} userId - The user ID
   * @param {Object} updates - Object with fields to update
   * @returns {Object|null} The updated user or null
   */
  updateUser(userId, updates) {
    try {
      const users = this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) return null;
      
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem(this.storageKey, JSON.stringify(users));
      
      return users[userIndex];
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  /**
   * Delete a user
   * @param {string} userId - The user ID to delete
   * @returns {boolean} True if deleted successfully
   */
  deleteUser(userId) {
    try {
      const users = this.getAllUsers();
      const filteredUsers = users.filter(u => u.id !== userId);
      
      if (filteredUsers.length === users.length) {
        return false; // User not found
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(filteredUsers));
      
      // If this was the current user, clear the current user
      const currentUserId = localStorage.getItem(this.currentUserKey);
      if (currentUserId === userId) {
        localStorage.removeItem(this.currentUserKey);
      }
      
      // Also delete all boards for this user
      localStorage.removeItem(`kanbanify_boards_${userId}`);
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  /**
   * Get or create a default user
   * Useful for migration from single-user to multi-user
   * @returns {Object} The default user object
   */
  getOrCreateDefaultUser() {
    let users = this.getAllUsers();
    
    // Check if we already have a default user
    let defaultUser = users.find(u => u.id === 'default-user');
    
    if (!defaultUser) {
      // Create a default user
      defaultUser = {
        id: 'default-user',
        name: 'Default User',
        color: '#3B82F6',
        createdAt: Date.now(),
      };
      users.push(defaultUser);
      localStorage.setItem(this.storageKey, JSON.stringify(users));
    }
    
    return defaultUser;
  }

  /**
   * Initialize user system (migrate from single-user if needed)
   * @returns {Object} The current user (either existing or newly created default)
   */
  initialize() {
    let currentUser = this.getCurrentUser();
    
    if (!currentUser) {
      // Check if there are any users at all
      const users = this.getAllUsers();
      
      if (users.length === 0) {
        // No users exist - check if we have old board data to migrate
        const oldBoards = localStorage.getItem('kanbanify_boards');
        
        if (oldBoards) {
          // Migrate old data to default user
          const defaultUser = this.getOrCreateDefaultUser();
          localStorage.setItem(`kanbanify_boards_${defaultUser.id}`, oldBoards);
          localStorage.removeItem('kanbanify_boards');
          this.setCurrentUser(defaultUser.id);
          currentUser = defaultUser;
        } else {
          // Create a default user for fresh installation
          const defaultUser = this.getOrCreateDefaultUser();
          this.setCurrentUser(defaultUser.id);
          currentUser = defaultUser;
        }
      } else {
        // Users exist but no current user selected - select the first one
        this.setCurrentUser(users[0].id);
        currentUser = users[0];
      }
    }
    
    return currentUser;
  }
}

// Export a singleton instance
export const userService = new UserService();

