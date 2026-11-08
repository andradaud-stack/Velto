import Dexie from 'dexie';
import { INITIAL_WALLETS, INITIAL_GOAL, INITIAL_TRANSACTIONS } from '../../core/constants/initialData';

export const db = new Dexie('AndraFinanceDB');

db.version(1).stores({
  wallets: 'id, name, type, balance, investedCapital, updatedAt',
  transactions: 'id, type, date, walletId, sourceWalletId, targetWalletId, category, amount',
  goals: 'id, title, targetAmount',
  settings: 'key, value'
});

// Version 2: Add Parfum FIFO tables
db.version(2).stores({
  wallets: 'id, name, type, balance, investedCapital, updatedAt',
  transactions: 'id, type, date, walletId, sourceWalletId, targetWalletId, category, amount',
  goals: 'id, title, targetAmount',
  settings: 'key, value',
  parfumBatches: '++id, brand, variant, batchCode, dateRestocked, qtyReceived, qtyRemaining, totalModalBelanja, costPerUnit, createdAt',
  parfumSales: '++id, dateSold, brand, variant, qtySold, hargaJualPerBottle, biayaOperasional, cogs, omzet, labaBersih, createdAt'
});

/**
 * Initializes the database with clean 0 balance for all wallets.
 * Total Net Worth starts at Rp 0.
 */
export async function initializeDatabase() {
  try {
    await db.open();
    const walletCount = await db.wallets.count();
    
    if (walletCount === 0) {
      console.log('[Dexie] Initializing fresh database with clean 0 balance...');
      await db.transaction('rw', [db.wallets, db.goals, db.transactions, db.settings], async () => {
        await db.wallets.bulkPut(INITIAL_WALLETS);
        await db.settings.bulkPut([
          { key: 'theme', value: 'lavender' },
          { key: 'lastMarketSync', value: new Date().toISOString() },
          { key: 'goldPricePerGram', value: 1300000 },
          { key: 'studentName', value: 'Andra Syahdan Daud' },
          { key: 'user_profile_name', value: 'Andra Syahdan Daud' },
          { key: 'isOfflineFirst', value: true },
          { key: 'cleared_to_zero_v2', value: true },
          { key: 'reset_all_tabs_keep_wallets_v2', value: true }
        ]);
      });
      console.log('[Dexie] Database initialized with Rp 0 Net Worth');
    } else {
      // Auto-migrate: One-time reset to 0 for existing databases holding old dummy seeds
      const isCleared = await db.settings.get('cleared_to_zero_v2');
      if (!isCleared) {
        await db.transaction('rw', [db.wallets, db.goals, db.transactions, db.settings], async () => {
          const allWallets = await db.wallets.toArray();
          for (const w of allWallets) {
            await db.wallets.update(w.id, {
              balance: 0,
              investedCapital: 0,
              goldGrams: 0,
              updatedAt: new Date().toISOString()
            });
          }
          // Remove old preset dummy transactions & dummy goal
          await db.transactions.where('id').anyOf(['tx_init_1', 'tx_init_2', 'tx_init_3']).delete();
          await db.goals.where('id').equals('kuliah_smk').delete();
          await db.settings.put({ key: 'cleared_to_zero_v2', value: true });
        });
        console.log('[Dexie] Migrated existing data to clean Rp 0 balance');
      }

      // Auto-migrate: ensure Bank Mandiri & DANA exist in existing databases
      const mandiriExists = await db.wallets.get('mandiri');
      if (!mandiriExists) {
        await db.wallets.add({
          id: 'mandiri',
          name: 'Bank Mandiri',
          type: 'bank',
          balance: 0,
          investedCapital: 0,
          goldGrams: 0,
          userId: 'andra',
          updatedAt: new Date().toISOString()
        });
      }
      const danaExists = await db.wallets.get('dana');
      if (!danaExists) {
        await db.wallets.add({
          id: 'dana',
          name: 'DANA',
          type: 'ewallet',
          balance: 0,
          investedCapital: 0,
          goldGrams: 0,
          userId: 'andra',
          updatedAt: new Date().toISOString()
        });
      }

      // Ensure all pre-existing seed wallets belong to 'andra'
      const existingWallets = await db.wallets.toArray();
      for (const w of existingWallets) {
        if (!w.userId) {
          await db.wallets.update(w.id, { userId: 'andra' });
        }
      }

      // Auto-migrate: Reset all non-wallet tabs (mutasi, goals, parfum) EXCEPT wallets
      const isAllTabsReset = await db.settings.get('reset_all_tabs_keep_wallets_v2');
      if (!isAllTabsReset) {
        await db.transaction('rw', [db.transactions, db.goals, db.parfumBatches, db.parfumSales, db.settings], async () => {
          await db.transactions.clear();
          await db.goals.clear();
          if (db.parfumBatches) await db.parfumBatches.clear();
          if (db.parfumSales) await db.parfumSales.clear();
          await db.settings.put({ key: 'reset_all_tabs_keep_wallets_v2', value: true });
          await db.settings.put({ key: 'studentName', value: 'Andra Syahdan Daud' });
          await db.settings.put({ key: 'user_profile_name', value: 'Andra Syahdan Daud' });
        });
        console.log('[Dexie] Reset all non-wallet tabs (mutasi, goals, parfum) while preserving wallets');
      }
    }
  } catch (error) {
    console.error('[Dexie] Initialization error:', error);
  }
}
