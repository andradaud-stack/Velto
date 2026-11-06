import { db } from '../db/database';

class CloudSyncService {
  constructor() {
    this.token = localStorage.getItem('velto_auth_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('velto_auth_token', token);
    } else {
      localStorage.removeItem('velto_auth_token');
    }
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('velto_auth_token');
    }
    return this.token;
  }

  // Pull all data from TiDB for authenticated user and sync into Dexie
  async pullFromCloud() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/sync', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          this.setToken(null);
        }
        return null;
      }

      const json = await res.json();
      if (!json.success || !json.data) return null;

      const { wallets, transactions, goals, parfumBatches, parfumSales, settings } = json.data;

      // Update Dexie database tables for current user
      if (wallets && wallets.length > 0) {
        await db.wallets.clear();
        await db.wallets.bulkPut(wallets);
      }

      if (transactions) {
        await db.transactions.clear();
        if (transactions.length > 0) {
          await db.transactions.bulkPut(transactions);
        }
      }

      if (goals) {
        await db.goals.clear();
        if (goals.length > 0) {
          await db.goals.bulkPut(goals);
        }
      }

      if (parfumBatches && db.parfumBatches) {
        await db.parfumBatches.clear();
        if (parfumBatches.length > 0) {
          await db.parfumBatches.bulkPut(parfumBatches);
        }
      }

      if (parfumSales && db.parfumSales) {
        await db.parfumSales.clear();
        if (parfumSales.length > 0) {
          await db.parfumSales.bulkPut(parfumSales);
        }
      }

      if (settings && db.settings) {
        for (const [key, value] of Object.entries(settings)) {
          await db.settings.put({ key, value });
        }
      }

      return json.data;
    } catch (err) {
      console.warn('[CloudSync pull error (running offline-first)]', err);
      return null;
    }
  }

  // Push an item to TiDB
  async pushItem(type, action, item) {
    const token = this.getToken();
    if (!token) return;

    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type, action, item })
      });
    } catch (err) {
      console.warn('[CloudSync push error]', err);
    }
  }
}

export const cloudSyncService = new CloudSyncService();
