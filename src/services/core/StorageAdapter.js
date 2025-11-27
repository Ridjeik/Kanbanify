/**
 * Generic Storage Adapter
 * Encapsulates low-level storage operations (localStorage) and error handling.
 */
export class StorageAdapter {
  constructor(storage = window.localStorage) {
    this.storage = storage;
  }

  async get(key, defaultValue = null) {
    try {
      const value = this.storage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.warn(`[StorageAdapter] Error reading key "${key}":`, error);
      return defaultValue;
    }
  }

  async set(key, value) {
    try {
      const stringValue = JSON.stringify(value);
      this.storage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error(`[StorageAdapter] Error writing key "${key}":`, error);
      return false;
    }
  }

  async remove(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[StorageAdapter] Error removing key "${key}":`, error);
      return false;
    }
  }
}

export const globalStorage = new StorageAdapter();

