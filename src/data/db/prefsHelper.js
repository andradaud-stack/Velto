import { db } from './database';

export const prefsHelper = {
  async get(key, defaultValue = null) {
    try {
      const item = await db.settings.get(key);
      return item ? item.value : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  async set(key, value) {
    try {
      await db.settings.put({ key, value });
      return true;
    } catch (err) {
      console.error('Failed to set setting:', key, err);
      return false;
    }
  },

  async getAll() {
    try {
      const items = await db.settings.toArray();
      const result = {};
      items.forEach(i => { result[i.key] = i.value; });
      return result;
    } catch {
      return {};
    }
  }
};
