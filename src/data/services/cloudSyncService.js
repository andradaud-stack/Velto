import { db } from '../db/database';

class CloudSyncService {
  constructor() {
    this.token = localStorage.getItem('velto_auth_token') || null;
    this.autoSyncTimer = null;
    this.isSyncing = false;
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
    if (!token || this.isSyncing) return null;

    this.isSyncing = true;
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
        await db.wallets.bulkPut(wallets);
      }

      if (transactions) {
        if (transactions.length > 0) {
          await db.transactions.bulkPut(transactions);
        }
      }

      if (goals) {
        if (goals.length > 0) {
          await db.goals.bulkPut(goals);
        }
      }

      if (parfumBatches && db.parfumBatches && parfumBatches.length > 0) {
        await db.parfumBatches.bulkPut(parfumBatches);
      }

      if (parfumSales && db.parfumSales && parfumSales.length > 0) {
        await db.parfumSales.bulkPut(parfumSales);
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
    } finally {
      this.isSyncing = false;
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

  // Sync current local state to cloud TiDB (Push full snapshot)
  async syncLocalToCloud() {
    const token = this.getToken();
    if (!token) return;

    try {
      const wallets = await db.wallets.toArray();
      const transactions = await db.transactions.toArray();
      const goals = await db.goals.toArray();

      await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'batch_sync',
          items: {
            wallets,
            transactions,
            goals
          }
        })
      });
    } catch (err) {
      console.warn('[CloudSync syncLocalToCloud error]', err);
    }
  }

  // Real-time synchronization across devices (polling + focus events)
  startAutoSync() {
    if (this.autoSyncTimer) return;

    // Pull immediately on start
    this.pullFromCloud();

    // Poll every 12 seconds
    this.autoSyncTimer = setInterval(() => {
      this.pullFromCloud();
    }, 12000);

    // Pull immediately whenever user switches back to this tab / unlocks phone
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => this.pullFromCloud());
      window.addEventListener('online', () => this.pullFromCloud());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.pullFromCloud();
        }
      });
    }
  }

  stopAutoSync() {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
    }
  }
}

export const cloudSyncService = new CloudSyncService();
