/**
 * Theme Service
 * Manages theme preferences (light/dark mode)
 * Theme preference is stored globally in localStorage and persists across user sessions
 */

const THEME_KEY = 'kanbanify_theme';

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export class ThemeService {
  /**
   * Get the current theme from localStorage
   * @returns {string} The current theme ('light' or 'dark')
   */
  getTheme() {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      // Default to dark theme if not set
      return savedTheme || THEMES.DARK;
    } catch (error) {
      console.error('Error reading theme from localStorage:', error);
      return THEMES.DARK;
    }
  }

  /**
   * Set the theme in localStorage
   * @param {string} theme - The theme to set ('light' or 'dark')
   * @returns {boolean} True if successful
   */
  setTheme(theme) {
    try {
      if (theme !== THEMES.LIGHT && theme !== THEMES.DARK) {
        console.error('Invalid theme:', theme);
        return false;
      }
      localStorage.setItem(THEME_KEY, theme);
      this.applyTheme(theme);
      return true;
    } catch (error) {
      console.error('Error setting theme:', error);
      return false;
    }
  }

  /**
   * Apply the theme to the document
   * @param {string} theme - The theme to apply
   */
  applyTheme(theme) {
    const root = document.documentElement;
    if (theme === THEMES.DARK) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  /**
   * Toggle between light and dark themes
   * @returns {string} The new theme
   */
  toggleTheme() {
    const currentTheme = this.getTheme();
    const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    this.setTheme(newTheme);
    return newTheme;
  }

  /**
   * Initialize the theme on app startup
   * @returns {string} The current theme
   */
  initialize() {
    const theme = this.getTheme();
    this.applyTheme(theme);
    return theme;
  }
}

// Export a singleton instance
export const themeService = new ThemeService();

