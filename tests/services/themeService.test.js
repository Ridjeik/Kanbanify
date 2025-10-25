
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeService, THEMES } from '../../src/services/themeService';

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

// Mock documentElement
Object.defineProperty(document, 'documentElement', {
  value: {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  },
});

describe('ThemeService', () => {
  let themeService;

  beforeEach(() => {
    localStorage.clear();
    themeService = new ThemeService();
    vi.clearAllMocks();
  });

  it('should get the theme from localStorage', () => {
    localStorage.setItem('kanbanify_theme', THEMES.LIGHT);
    const theme = themeService.getTheme();
    expect(theme).toBe(THEMES.LIGHT);
  });

  it('should default to dark theme if no theme is set', () => {
    const theme = themeService.getTheme();
    expect(theme).toBe(THEMES.DARK);
  });

  it('should set the theme', () => {
    themeService.setTheme(THEMES.LIGHT);
    expect(localStorage.getItem('kanbanify_theme')).toBe(THEMES.LIGHT);
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
  });

  it('should not set an invalid theme', () => {
    const result = themeService.setTheme('invalid-theme');
    expect(result).toBe(false);
    expect(localStorage.getItem('kanbanify_theme')).toBe(null);
  });

  it('should apply the dark theme', () => {
    themeService.applyTheme(THEMES.DARK);
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
  });

  it('should apply the light theme', () => {
    themeService.applyTheme(THEMES.LIGHT);
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
  });

  it('should toggle the theme', () => {
    themeService.setTheme(THEMES.DARK);
    const newTheme = themeService.toggleTheme();
    expect(newTheme).toBe(THEMES.LIGHT);
    expect(localStorage.getItem('kanbanify_theme')).toBe(THEMES.LIGHT);
  });

  it('should initialize the theme', () => {
    localStorage.setItem('kanbanify_theme', THEMES.LIGHT);
    const theme = themeService.initialize();
    expect(theme).toBe(THEMES.LIGHT);
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
  });
});
