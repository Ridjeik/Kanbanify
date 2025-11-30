/**
 * User Mapping Utilities
 * Transform session data to user objects
 */

/**
 * Maps a session object to a user object
 * @param {Object} session - The session object from AuthService
 * @returns {Object|null} User object or null if session is invalid
 */
export const mapSessionToUser = (session) => {
  if (!session || !session.userId) {
    return null;
  }

  return {
    id: session.userId,
    name: session.name,
    color: session.color,
    username: session.username,
  };
};
