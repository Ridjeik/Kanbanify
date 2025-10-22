/**
 * Authentication Service
 * Manages user authentication and session
 */

// Simple hash function for password (not production-grade, just for demo)
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

export class AuthService {
  constructor() {
    this.usersKey = 'kanbanify_auth_users';
    this.sessionKey = 'kanbanify_session';
  }

  /**
   * Initialize auth system with demo users
   */
  initialize() {
    const users = this.getAllAuthUsers();
    
    // Create demo users if none exist
    if (users.length === 0) {
      this.createAuthUser('admin', 'admin123', 'Admin User', '#3B82F6');
      this.createAuthUser('user1', 'password', 'John Doe', '#10B981');
      this.createAuthUser('user2', 'password', 'Jane Smith', '#F59E0B');
    }
  }

  /**
   * Get all authentication users
   */
  getAllAuthUsers() {
    try {
      const data = localStorage.getItem(this.usersKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading auth users:', error);
      return [];
    }
  }

  /**
   * Create a new user with authentication
   */
  createAuthUser(username, password, displayName, color = '#3B82F6') {
    try {
      const users = this.getAllAuthUsers();
      
      // Check if username already exists
      if (users.find(u => u.username === username)) {
        throw new Error('Username already exists');
      }

      const newUser = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        username,
        passwordHash: simpleHash(password),
        name: displayName,
        color,
        createdAt: Date.now(),
      };

      users.push(newUser);
      localStorage.setItem(this.usersKey, JSON.stringify(users));
      
      return newUser;
    } catch (error) {
      console.error('Error creating auth user:', error);
      throw error;
    }
  }

  /**
   * Authenticate user with username and password
   */
  login(username, password) {
    try {
      const users = this.getAllAuthUsers();
      const passwordHash = simpleHash(password);
      
      const user = users.find(
        u => u.username === username && u.passwordHash === passwordHash
      );

      if (!user) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Create session
      const session = {
        userId: user.id,
        username: user.username,
        name: user.name,
        color: user.color,
        loginTime: Date.now(),
      };

      localStorage.setItem(this.sessionKey, JSON.stringify(session));

      return { success: true, user: session };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  /**
   * Logout current user
   */
  logout() {
    try {
      localStorage.removeItem(this.sessionKey);
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  }

  /**
   * Get current session
   */
  getCurrentSession() {
    try {
      const data = localStorage.getItem(this.sessionKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading session:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.getCurrentSession() !== null;
  }

  /**
   * Get current user info from session
   */
  getCurrentUser() {
    const session = this.getCurrentSession();
    if (!session) return null;

    return {
      id: session.userId,
      name: session.name,
      color: session.color,
      username: session.username,
    };
  }
}

// Export singleton instance
export const authService = new AuthService();

