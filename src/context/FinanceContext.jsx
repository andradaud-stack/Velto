import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeDatabase } from '../data/db/database';
import { notificationService } from '../data/services/notificationService';
import { fetchLiveGoldPrice } from '../data/services/goldPriceService';
import { googleSheetService } from '../data/services/googleSheetService';
import { waNotificationService } from '../data/services/waNotificationService';
import { INITIAL_WALLETS, INITIAL_GOAL, INITIAL_TRANSACTIONS } from '../core/constants/initialData';
import { useAuth } from './AuthContext';
import { isAndraUser, getUserScopeId } from '../core/utils/userScope';
import {
  addRestock as _addRestock,
  recordSale as _recordSale,
  deleteSale as _deleteSale,
  getDashboardStats as _getDashboardStats,
  getAllSales as _getAllSales,
  getBatches as _getBatches,
  getAllVariants as _getAllVariants
} from '../data/services/parfumFifoService';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const { user } = useAuth();
  const [isDbReady, setIsDbReady] = useState(false);
  const [goldMarketInfo, setGoldMarketInfo] = useState({
    price: 2415631,
    buyback: 2335969,
    source: 'treasury_live',
    sourceName: 'DANA x Treasury',
    fluctuation: -0.01,
    lastUpdated: new Date().toISOString(),
    isUpdating: false
  });

  const isOwner = useMemo(() => isAndraUser(user), [user]);
  const activeUserId = useMemo(() => getUserScopeId(user), [user]);

  // Dexie live queries (scoped to active user: new users start completely at 0)
  const wallets = useLiveQuery(async () => {
    if (!db.wallets) return [];
    const all = await db.wallets.toArray();
    if (isOwner) {
      return all.filter(w => !w.userId || w.userId === 'andra');
    }
    return all.filter(w => w.userId === activeUserId);
  }, [user?.id, user?.email, isOwner, activeUserId], []);

  const transactions = useLiveQuery(async () => {
    if (!db.transactions) return [];
    const all = await db.transactions.reverse().sortBy('date');
    if (isOwner) {
      return all.filter(t => !t.userId || t.userId === 'andra');
    }
    return all.filter(t => t.userId === activeUserId);
  }, [user?.id, user?.email, isOwner, activeUserId], []);

  const goals = useLiveQuery(async () => {
    if (!db.goals) return [];
    const all = await db.goals.toArray();
    if (isOwner) {
      return all.filter(g => !g.userId || g.userId === 'andra');
    }
    return all.filter(g => g.userId === activeUserId);
  }, [user?.id, user?.email, isOwner, activeUserId], []);

  const settingsList = useLiveQuery(() => db.settings ? db.settings.toArray() : [], [], []);

  // Parfum live queries (safely fallback so it never crashes React)
  const parfumBatches = useLiveQuery(async () => {
    try {
      if (!db.parfumBatches) return [];
      const all = await db.parfumBatches.toArray();
      if (isOwner) {
        return all.filter(p => !p.userId || p.userId === 'andra');
      }
      return all.filter(p => p.userId === activeUserId);
    } catch (e) {
      console.warn('[Dexie] parfumBatches liveQuery error:', e);
      return [];
    }
  }, [user?.id, user?.email, isOwner, activeUserId], []);

  const parfumSalesLive = useLiveQuery(async () => {
    try {
      if (!db.parfumSales) return [];
      const list = await db.parfumSales.toArray();
      const filtered = isOwner 
        ? list.filter(s => !s.userId || s.userId === 'andra')
        : list.filter(s => s.userId === activeUserId);
      return filtered.sort((a, b) => new Date(b.dateSold || b.createdAt || 0) - new Date(a.dateSold || a.createdAt || 0));
    } catch (e) {
      console.warn('[Dexie] parfumSales liveQuery error:', e);
      return [];
    }
  }, [user?.id, user?.email, isOwner, activeUserId], []);

  // Initialize DB once on mount & fetch live Treasury gold rate with background interval
  useEffect(() => {
    let mounted = true;
    initializeDatabase().then(() => {
      if (mounted) setIsDbReady(true);
    });

    const updateGoldRate = async () => {
      try {
        const result = await fetchLiveGoldPrice();
        if (mounted && result?.price) {
          setGoldMarketInfo({
            price: result.price,
            buyback: result.buyback,
            fluctuation: result.fluctuation,
            source: result.source,
            sourceName: result.sourceName,
            lastUpdated: result.timestamp,
            history: result.history,
            isUpdating: false
          });
        }
      } catch (err) {
        console.warn('[FinanceContext] Gold sync error:', err);
      }
    };

    // Immediate initial sync
    updateGoldRate();

    // Background interval: auto-refresh every 60s
    const goldInterval = setInterval(updateGoldRate, 60000);

    return () => {
      mounted = false;
      clearInterval(goldInterval);
    };
  }, []);

  // Wallets mapping for instant ID lookup
  const walletMap = useMemo(() => {
    const map = {};
    (wallets || []).forEach(w => {
      map[w.id] = w;
    });
    return map;
  }, [wallets]);

  // Net Worth & Capital Gain Formulas (AC-03 Isolation)
  // Net Worth = sum(Non-investment wallets) + sum(Market value of investment wallets)
  // Capital Gain is ONLY calculated for 'investment' type wallets. Non-investment wallets strictly gain = 0.
  const { totalNetWorth, totalInvestedCapital, totalCapitalGain, investmentGainPercent } = useMemo(() => {
    if (!wallets || wallets.length === 0) {
      return { totalNetWorth: 0, totalInvestedCapital: 0, totalCapitalGain: 0, investmentGainPercent: 0 };
    }

    let netWorth = 0;
    let investedCapital = 0;
    let investmentCurrentVal = 0;
    let investmentInvestedVal = 0;

    wallets.forEach(w => {
      netWorth += (w.balance || 0);
      investedCapital += (w.investedCapital || 0);

      if (w.type === 'investment') {
        investmentCurrentVal += (w.balance || 0);
        investmentInvestedVal += (w.investedCapital || 0);
      }
    });

    const capitalGain = investmentCurrentVal - investmentInvestedVal;
    const gainPercent = investmentInvestedVal > 0 
      ? (capitalGain / investmentInvestedVal) * 100 
      : 0;

    return {
      totalNetWorth: netWorth,
      totalInvestedCapital: investedCapital,
      totalCapitalGain: capitalGain,
      investmentGainPercent: gainPercent
    };
  }, [wallets]);

  // Calculate progress for all goals
  const calculatedGoals = useMemo(() => {
    if (!goals || goals.length === 0) return [];
    return goals.map(goal => {
      const isManual = goal.mode === 'manual' || !goal.connectedWalletIds || goal.connectedWalletIds.length === 0;
      let currentSaved = 0;

      if (isManual) {
        // Mode Manual: saldo tersimpan dicatat langsung di record goal (goal.currentSaved)
        currentSaved = goal.currentSaved || 0;
      } else {
        // Mode Terhubung (Auto Tracking): jumlah saldo dari kantong-kantong terhubung
        goal.connectedWalletIds.forEach(id => {
          const w = walletMap[id];
          if (w) currentSaved += (w.balance || 0);
        });
      }

      const target = goal.targetAmount || 1500000;
      const progressPercent = Math.min(100, Math.round((currentSaved / target) * 100));
      const remaining = Math.max(0, target - currentSaved);
      const estimatedWeeksLeft = Math.ceil(remaining / 50000);

      return {
        ...goal,
        isManual,
        currentSaved,
        progressPercent,
        remaining,
        estimatedWeeksLeft
      };
    });
  }, [goals, walletMap]);

  // Saving Goal Progress Calculation: jago + bibit + emas
  const primaryGoal = useMemo(() => {
    if (!calculatedGoals || calculatedGoals.length === 0) return null;
    return calculatedGoals[0];
  }, [calculatedGoals]);

  // Uang Saku Rutin: Menambah +Rp 100.000 ke Dompet Cash (pengeluaran dicatat manual oleh pengguna)
  const executeWeeklyAllowance = async () => {
    try {
      await db.transaction('rw', [db.wallets, db.transactions], async () => {
        const cashWallet = await db.wallets.get('cash');

        if (!cashWallet) {
          throw new Error('Kantong Dompet Cash tidak ditemukan.');
        }

        // 1. Update Dompet Cash: Masuk penuh +Rp 100.000
        await db.wallets.update('cash', {
          balance: (cashWallet.balance || 0) + 100000,
          investedCapital: (cashWallet.investedCapital || 0) + 100000,
          updatedAt: new Date().toISOString()
        });

        // 2. Record Transaksi Pemasukan Uang Saku (+Rp 100.000)
        const now = new Date().toISOString();
        await db.transactions.add({
          id: `tx_${Date.now()}_allowance_in`,
          type: 'allowance_in',
          title: 'Uang Saku Masuk (+Rp 100k)',
          amount: 100000,
          category: 'Uang Saku',
          date: now,
          walletId: 'cash',
          details: 'Penerimaan uang saku mingguan penuh (pengeluaran harian dicatat manual)',
          status: 'success'
        });
      });

      // Background real-time append to Google Spreadsheet
      googleSheetService.appendTransaction({
        id: `tx_${Date.now()}`,
        date: new Date().toISOString(),
        type: 'income',
        title: 'Uang Saku Masuk (+Rp 100k)',
        amount: 100000,
        category: 'Uang Saku',
        details: 'Uang saku mingguan masuk ke Dompet Cash'
      }, 'Dompet Cash');

      // Background real-time notification to WhatsApp
      waNotificationService.notifyNewTransaction({
        type: 'income',
        title: 'Uang Saku Masuk (+Rp 100k)',
        amount: 100000,
        walletName: 'Dompet Cash',
        category: 'Uang Saku'
      });

      notificationService.success(
        'Uang saku Rp 100.000 berhasil ditambahkan penuh ke Dompet Cash!',
        'Uang Saku Diterima'
      );
      return { success: true };
    } catch (error) {
      console.error('Error executing weekly allowance:', error);
      notificationService.error(error.message, 'Gagal Eksekusi Uang Saku');
      return { success: false, error: error.message };
    }
  };

  // Profit Parfum Quick Action
  const recordParfumProfit = async ({ amount, note, targetWalletId = 'parfum' }) => {
    try {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Nominal keuntungan parfum tidak valid.');
      }

      await db.transaction('rw', [db.wallets, db.transactions], async () => {
        const wallet = await db.wallets.get(targetWalletId);
        if (!wallet) throw new Error('Kantong tujuan tidak ditemukan.');

        await db.wallets.update(targetWalletId, {
          balance: (wallet.balance || 0) + numAmount,
          investedCapital: (wallet.investedCapital || 0) + numAmount,
          updatedAt: new Date().toISOString()
        });

        await db.transactions.add({
          id: `tx_${Date.now()}_parfum`,
          type: 'business',
          title: 'Laba Bisnis Parfum',
          amount: numAmount,
          category: 'Side Hustle',
          date: new Date().toISOString(),
          walletId: targetWalletId,
          details: note || 'Penjualan produk parfum',
          status: 'success'
        });
      });

      notificationService.success(
        `Laba Parfum Rp ${new Intl.NumberFormat('id-ID').format(numAmount)} berhasil ditambahkan ke ${targetWalletId === 'parfum' ? 'Profit Parfum' : 'Kantong'}!`,
        'Catat Penjualan'
      );
      return { success: true };
    } catch (error) {
      notificationService.error(error.message, 'Gagal Mencatat Parfum');
      return { success: false, error: error.message };
    }
  };

  // AC-03: Mark-to-Market (MTM) Sync Pasar
  // Adjusts balance WITHOUT altering investedCapital. Capital Gain = balance - investedCapital.
  const syncMarketRevaluation = async ({ walletId, newMarketValue, goldPrice }) => {
    try {
      await db.transaction('rw', [db.wallets, db.transactions, db.settings], async () => {
        const wallet = await db.wallets.get(walletId);
        if (!wallet) throw new Error('Kantong investasi tidak ditemukan.');

        const oldBalance = wallet.balance || 0;
        const diff = Number(newMarketValue) - oldBalance;

        const updateData = {
          balance: Number(newMarketValue),
          updatedAt: new Date().toISOString()
        };

        // If eMAS and goldPrice is provided, update gold grams or price
        if (walletId === 'emas' && goldPrice) {
          updateData.goldGrams = Number((Number(newMarketValue) / goldPrice).toFixed(4));
        }

        await db.wallets.update(walletId, updateData);

        // Record MTM Revaluation event
        await db.transactions.add({
          id: `tx_${Date.now()}_mtm_${walletId}`,
          type: 'mtm_sync',
          title: `Revaluasi Pasar ${wallet.name} (MTM)`,
          amount: Math.abs(diff),
          category: 'Mark-to-Market',
          date: new Date().toISOString(),
          walletId: walletId,
          details: `Revaluasi AC-03: Saldo disesuaikan dari Rp ${new Intl.NumberFormat('id-ID').format(oldBalance)} ke Rp ${new Intl.NumberFormat('id-ID').format(newMarketValue)} (Gain: ${diff >= 0 ? '+' : ''}${new Intl.NumberFormat('id-ID').format(diff)})`,
          status: 'success'
        });

        await db.settings.put({
          key: 'lastMarketSync',
          value: new Date().toISOString()
        });
      });

      notificationService.success(
        `Nilai pasar ${walletId} berhasil disinkronkan ke Rp ${new Intl.NumberFormat('id-ID').format(newMarketValue)}. Modal pokok tetap terisolasi!`,
        'Sync Pasar (AC-03)'
      );
      return { success: true };
    } catch (error) {
      notificationService.error(error.message, 'Gagal Sinkronisasi Pasar');
      return { success: false, error: error.message };
    }
  };

  // Create a brand new wallet
  const createNewWallet = async ({ 
    name, 
    type = 'bank', 
    initialBalance = 0, 
    color = '#6633EE', 
    icon = 'CreditCard', 
    photoUrl = '' 
  }) => {
    try {
      const id = 'wallet_' + Date.now().toString(36);
      const balanceNum = Number(initialBalance) || 0;

      await db.transaction('rw', [db.wallets, db.transactions], async () => {
        await db.wallets.add({
          id,
          name,
          type,
          balance: balanceNum,
          investedCapital: balanceNum,
          goldGrams: 0,
          color: color || '#6633EE',
          bgColor: color ? `${color}15` : '#F3EEFF',
          icon: icon || 'CreditCard',
          photoUrl: photoUrl || '',
          userId: activeUserId,
          updatedAt: new Date().toISOString()
        });

        if (balanceNum > 0) {
          await db.transactions.add({
            id: `tx_${Date.now()}_init_wallet`,
            type: 'income',
            title: `Saldo Awal ${name}`,
            amount: balanceNum,
            category: 'Pemasukan Awal',
            date: new Date().toISOString(),
            walletId: id,
            details: `Pembukaan kantong baru ${name}`,
            status: 'success',
            userId: activeUserId
          });
        }
      });

      notificationService.success(`Kantong baru "${name}" berhasil dibuat!`, 'Kantong Ditambahkan');
      return { success: true, id };
    } catch (err) {
      notificationService.error(err.message, 'Gagal Tambah Kantong');
      return { success: false, error: err.message };
    }
  };

  // Update wallet name, color, icon, photo, or type
  const updateWallet = async (walletId, updateData) => {
    try {
      const wallet = await db.wallets.get(walletId);
      if (!wallet) throw new Error('Kantong tidak ditemukan.');

      const payload = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      if (updateData.color) {
        payload.bgColor = `${updateData.color}15`;
      }

      await db.wallets.update(walletId, payload);
      notificationService.success(`Kantong "${updateData.name || wallet.name}" berhasil diperbarui!`, 'Tersimpan');
      return { success: true };
    } catch (err) {
      notificationService.error(err.message, 'Gagal Update Kantong');
      return { success: false, error: err.message };
    }
  };

  // Delete a wallet permanently and clean up related records
  const deleteWallet = async (walletId) => {
    try {
      const wallet = await db.wallets.get(walletId);
      if (!wallet) throw new Error('Kantong tidak ditemukan.');

      await db.transaction('rw', [db.wallets, db.transactions, db.goals], async () => {
        // Delete wallet
        await db.wallets.delete(walletId);

        // Delete associated transactions
        const txs = await db.transactions.toArray();
        for (const tx of txs) {
          if (tx.walletId === walletId || tx.sourceWalletId === walletId || tx.targetWalletId === walletId) {
            await db.transactions.delete(tx.id);
          }
        }

        // Decouple goals targeting this wallet
        const allGoals = await db.goals.toArray();
        for (const g of allGoals) {
          if (g.targetWalletId === walletId) {
            await db.goals.update(g.id, { targetWalletId: null });
          }
        }
      });

      notificationService.success(`Kantong "${wallet.name}" berhasil dihapus.`, 'Kantong Dihapus');
      return { success: true };
    } catch (err) {
      notificationService.error(err.message, 'Gagal Hapus Kantong');
      return { success: false, error: err.message };
    }
  };

  // Transfer antar kantong
  const transferBetweenWallets = async ({ sourceWalletId, targetWalletId, amount, note, customGoldPrice }) => {
    try {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Nominal transfer harus lebih besar dari 0.');
      }
      if (sourceWalletId === targetWalletId) {
        throw new Error('Kantong asal dan tujuan tidak boleh sama.');
      }

      await db.transaction('rw', [db.wallets, db.transactions], async () => {
        const source = await db.wallets.get(sourceWalletId);
        const target = await db.wallets.get(targetWalletId);

        if (!source || !target) throw new Error('Kantong tidak ditemukan.');
        if ((source.balance || 0) < numAmount) {
          throw new Error(`Saldo ${source.name} tidak mencukupi (Rp ${new Intl.NumberFormat('id-ID').format(source.balance)}).`);
        }

        // Deduct from source
        await db.wallets.update(sourceWalletId, {
          balance: source.balance - numAmount,
          investedCapital: source.type !== 'investment' 
            ? Math.max(0, (source.investedCapital || 0) - numAmount) 
            : source.investedCapital,
          updatedAt: new Date().toISOString()
        });

        // Add to target
        const targetUpdate = {
          balance: (target.balance || 0) + numAmount,
          updatedAt: new Date().toISOString()
        };

        if (target.type === 'investment') {
          targetUpdate.investedCapital = (target.investedCapital || 0) + numAmount;
          if (targetWalletId === 'emas') {
            const goldPrice = Number(customGoldPrice) || goldMarketInfo.price || 2415631;
            const extraGrams = numAmount / goldPrice;
            targetUpdate.goldGrams = Number(((target.goldGrams || 0) + extraGrams).toFixed(4));
          }
        } else {
          targetUpdate.investedCapital = (target.investedCapital || 0) + numAmount;
        }

        await db.wallets.update(targetWalletId, targetUpdate);

        const activeGoldPrice = Number(customGoldPrice) || goldMarketInfo.price || 2415631;
        const txTitle = (sourceWalletId === 'dana' && targetWalletId === 'emas')
          ? `Beli Emas Rp ${new Intl.NumberFormat('id-ID').format(numAmount)} (dari Saldo DANA)`
          : `Transfer ${source.name} → ${target.name}`;

        await db.transactions.add({
          id: `tx_${Date.now()}_transfer`,
          type: 'transfer',
          title: txTitle,
          amount: numAmount,
          category: targetWalletId === 'emas' ? 'Tabungan Emas' : 'Transfer Antar Kantong',
          date: new Date().toISOString(),
          sourceWalletId,
          targetWalletId,
          details: note || (targetWalletId === 'emas' 
            ? `Beli emas dari saldo ${source.name} (+${((numAmount / activeGoldPrice)).toFixed(4)} gram @${formatRupiah(activeGoldPrice)}/gr)`
            : `Pemindahan dana dari ${source.name} ke ${target.name}`),
          status: 'success'
        });
      });

      // Background real-time notification to WhatsApp
      waNotificationService.notifyNewTransaction({
        type: 'transfer',
        title: (sourceWalletId === 'dana' && targetWalletId === 'emas') ? 'Beli Emas via DANA' : 'Transfer Antar Kantong',
        amount: numAmount,
        walletName: `${walletMap[sourceWalletId]?.name || 'DANA'} → ${walletMap[targetWalletId]?.name || 'eMAS'}`,
        category: targetWalletId === 'emas' ? 'Tabungan Emas' : 'Transfer'
      });

      notificationService.success(
        targetWalletId === 'emas' 
          ? `Berhasil beli emas Rp ${new Intl.NumberFormat('id-ID').format(numAmount)}! Saldo DANA berkurang & gram emas bertambah.`
          : `Transfer Rp ${new Intl.NumberFormat('id-ID').format(numAmount)} sukses!`,
        targetWalletId === 'emas' ? 'Beli Emas Sukses' : 'Transfer Berhasil'
      );
      return { success: true };
    } catch (error) {
      notificationService.error(error.message, 'Gagal Transfer');
      return { success: false, error: error.message };
    }
  };

  // Add Custom Transaction
  const addTransaction = async ({ type, title, amount, walletId, category, details }) => {
    try {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) throw new Error('Nominal tidak valid.');

      await db.transaction('rw', [db.wallets, db.transactions], async () => {
        const wallet = await db.wallets.get(walletId);
        if (!wallet) throw new Error('Kantong tidak ditemukan.');

        const isIncome = type === 'income' || type === 'business';
        const newBalance = isIncome 
          ? (wallet.balance || 0) + numAmount 
          : (wallet.balance || 0) - numAmount;

        if (!isIncome && (wallet.balance || 0) < numAmount) {
          throw new Error(`Saldo ${wallet.name} tidak mencukupi untuk pengeluaran ini.`);
        }

        const updateData = {
          balance: newBalance,
          updatedAt: new Date().toISOString()
        };

        if (wallet.type !== 'investment') {
          updateData.investedCapital = Math.max(0, isIncome ? (wallet.investedCapital || 0) + numAmount : (wallet.investedCapital || 0) - numAmount);
        }

        await db.wallets.update(walletId, updateData);

        await db.transactions.add({
          id: `tx_${Date.now()}_custom`,
          type,
          title,
          amount: numAmount,
          category: category || 'Umum',
          date: new Date().toISOString(),
          walletId,
          details: details || '',
          status: 'success'
        });
      });

      // Background real-time append to Google Spreadsheet
      googleSheetService.appendTransaction({
        id: `tx_${Date.now()}`,
        date: new Date().toISOString(),
        type,
        title,
        amount: numAmount,
        category: category || 'Umum',
        details
      }, walletMap[walletId]?.name || 'Kantong');

      // Background real-time notification to WhatsApp
      waNotificationService.notifyNewTransaction({
        type,
        title,
        amount: numAmount,
        walletName: walletMap[walletId]?.name || 'Kantong',
        category
      });

      notificationService.success('Transaksi berhasil dicatat!', 'Sukses');
      return { success: true };
    } catch (error) {
      notificationService.error(error.message, 'Gagal Tambah Transaksi');
      return { success: false, error: error.message };
    }
  };

  // Add New Goal (Supports Mode: 'connected' or 'manual')
  const addNewSavingGoal = async ({ title, targetAmount, connectedWalletIds, deadline, description, image, mode = 'connected', initialDeposit = 0, initialWalletId = null }) => {
    try {
      const newGoalId = `goal_${Date.now()}`;
      const isManual = mode === 'manual' || !connectedWalletIds || connectedWalletIds.length === 0;

      await db.transaction('rw', [db.goals, db.wallets, db.transactions], async () => {
        let initialSaved = 0;

        // If manual and user set an initial deposit from a wallet
        if (isManual && initialDeposit > 0 && initialWalletId) {
          const w = await db.wallets.get(initialWalletId);
          if (w) {
            if ((w.balance || 0) < initialDeposit) {
              throw new Error(`Saldo di ${w.name} tidak mencukupi untuk setoran awal.`);
            }
            await db.wallets.update(initialWalletId, {
              balance: (w.balance || 0) - initialDeposit,
              updatedAt: new Date().toISOString()
            });
            initialSaved = initialDeposit;

            await db.transactions.add({
              id: `tx_${Date.now()}_goal_deposit`,
              type: 'expense',
              title: `Setor Target: ${title}`,
              amount: initialDeposit,
              category: 'Tabungan Target',
              walletId: initialWalletId,
              date: new Date().toISOString(),
              details: `Setoran awal target manual ${title}`,
              status: 'success'
            });
          }
        }

        await db.goals.add({
          id: newGoalId,
          title: title || 'Target Baru',
          targetAmount: Number(targetAmount) || 1000000,
          mode: isManual ? 'manual' : 'connected',
          connectedWalletIds: isManual ? [] : connectedWalletIds,
          currentSaved: initialSaved,
          deadline: deadline || null,
          description: description || '',
          image: image || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });

      notificationService.success('Target tabungan baru berhasil ditambahkan!', 'Target Baru');
      return { success: true, id: newGoalId };
    } catch (error) {
      notificationService.error(error.message, 'Gagal Menambah Target');
      return { success: false, error: error.message };
    }
  };

  // Deposit or Withdraw from a Goal manually (Dipotong dari kantong pilihan)
  const depositToGoal = async ({ goalId, walletId, amount, type = 'deposit', note = '' }) => {
    try {
      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) throw new Error('Nominal tidak valid.');

      await db.transaction('rw', [db.goals, db.wallets, db.transactions], async () => {
        const goal = await db.goals.get(goalId);
        const wallet = await db.wallets.get(walletId);

        if (!goal) throw new Error('Target tabungan tidak ditemukan.');
        if (!wallet) throw new Error('Kantong tidak ditemukan.');

        const isDeposit = type === 'deposit';

        if (isDeposit) {
          // Cek saldo kantong
          if ((wallet.balance || 0) < numAmount) {
            throw new Error(`Saldo di ${wallet.name} (${new Intl.NumberFormat('id-ID').format(wallet.balance)}) tidak cukup.`);
          }

          // Potong saldo kantong
          await db.wallets.update(walletId, {
            balance: (wallet.balance || 0) - numAmount,
            updatedAt: new Date().toISOString()
          });

          // Tambah simpanan di target goal
          await db.goals.update(goalId, {
            currentSaved: (goal.currentSaved || 0) + numAmount,
            updatedAt: new Date().toISOString()
          });

          // Catat transaksi mutasi pengeluaran ke target
          await db.transactions.add({
            id: `tx_${Date.now()}_goal_in`,
            type: 'expense',
            title: `Nabung Target: ${goal.title}`,
            amount: numAmount,
            category: 'Tabungan Target',
            walletId: walletId,
            date: new Date().toISOString(),
            details: note || `Disetor dari ${wallet.name} ke target ${goal.title}`,
            status: 'success'
          });

          // Background real-time append to Google Spreadsheet
          googleSheetService.appendTransaction({
            id: `tx_${Date.now()}_goal`,
            date: new Date().toISOString(),
            type: 'expense',
            title: `Nabung Target: ${goal.title}`,
            amount: numAmount,
            category: 'Tabungan Target',
            details: note || `Disetor dari ${wallet.name}`
          }, wallet.name);

          // Background real-time notification to WhatsApp
          const newCurrentSaved = (goal.currentSaved || 0) + numAmount;
          const target = goal.targetAmount || 1500000;
          const newPercent = Math.min(100, Math.round((newCurrentSaved / target) * 100));
          waNotificationService.notifyGoalDeposit({
            goalTitle: goal.title,
            amount: numAmount,
            walletName: wallet.name,
            currentSaved: newCurrentSaved,
            targetAmount: target,
            progressPercent: newPercent
          });

          notificationService.success(`Berhasil menyetor Rp ${new Intl.NumberFormat('id-ID').format(numAmount)} dari ${wallet.name} ke ${goal.title}!`, 'Setoran Berhasil');
        } else {
          // Tarik dari goal dan kembalikan ke kantong
          if ((goal.currentSaved || 0) < numAmount) {
            throw new Error(`Simpanan di target ${goal.title} hanya tersisa Rp ${new Intl.NumberFormat('id-ID').format(goal.currentSaved || 0)}.`);
          }

          // Tambah saldo kantong
          await db.wallets.update(walletId, {
            balance: (wallet.balance || 0) + numAmount,
            updatedAt: new Date().toISOString()
          });

          // Kurangi simpanan di target goal
          await db.goals.update(goalId, {
            currentSaved: Math.max(0, (goal.currentSaved || 0) - numAmount),
            updatedAt: new Date().toISOString()
          });

          // Catat transaksi mutasi pemasukan dari target
          await db.transactions.add({
            id: `tx_${Date.now()}_goal_out`,
            type: 'income',
            title: `Tarik dari Target: ${goal.title}`,
            amount: numAmount,
            category: 'Tabungan Target',
            walletId: walletId,
            date: new Date().toISOString(),
            details: note || `Ditarik dari target ${goal.title} ke ${wallet.name}`,
            status: 'success'
          });

          notificationService.success(`Berhasil menarik Rp ${new Intl.NumberFormat('id-ID').format(numAmount)} dari ${goal.title} ke ${wallet.name}.`, 'Penarikan Selesai');
        }
      });

      return { success: true };
    } catch (error) {
      notificationService.error(error.message, 'Gagal Proses Dana');
      return { success: false, error: error.message };
    }
  };

  // Delete Goal
  const deleteSavingGoal = async (id) => {
    try {
      await db.goals.delete(id);
      notificationService.success('Target tabungan berhasil dihapus.', 'Target Dihapus');
      return { success: true };
    } catch (error) {
      notificationService.error(error.message, 'Gagal Menghapus Target');
      return { success: false, error: error.message };
    }
  };

  // Update Goal
  const updateSavingGoal = async ({ id, title, targetAmount, connectedWalletIds, deadline, description, image }) => {
    try {
      const updates = {
        title,
        targetAmount: Number(targetAmount),
        connectedWalletIds,
        deadline,
        description,
        updatedAt: new Date().toISOString()
      };
      if (image !== undefined) {
        updates.image = image;
      }
      await db.goals.update(id, updates);
      notificationService.success('Target tabungan berhasil diperbarui!', 'Target Disimpan');
      return { success: true };
    } catch (error) {
      notificationService.error(error.message, 'Gagal Update Target');
      return { success: false, error: error.message };
    }
  };

  // ─── PARFUM FIFO FUNCTIONS ───────────────────────────────────────────────────

  const addParfumRestock = async (batchData) => {
    try {
      const { sourceWalletId, ...restockPayload } = batchData;
      const id = await _addRestock({ ...restockPayload, sourceWalletId });

      // Potong saldo kantong sumber jika dipilih (bukan 'none')
      if (sourceWalletId && sourceWalletId !== 'none') {
        const sourceWallet = await db.wallets.get(sourceWalletId);
        if (sourceWallet) {
          const currentBal = sourceWallet.balance || 0;
          const newBal = Math.max(0, currentBal - batchData.totalModalBelanja);
          await db.wallets.update(sourceWalletId, {
            balance: newBal,
            updatedAt: new Date().toISOString()
          });

          // Catat transaksi pengeluaran di Velto
          const txId = `restock-parfum-${Date.now()}`;
          await db.transactions.add({
            id: txId,
            type: 'expense',
            walletId: sourceWalletId,
            category: 'Belanja Stok Parfum',
            description: `Restock ${batchData.qtyReceived} botol ${batchData.brand} - ${batchData.variant} (${batchData.batchCode})`,
            amount: batchData.totalModalBelanja,
            date: batchData.dateRestocked || new Date().toISOString()
          });

          // Notifikasi WA
          waNotificationService.notifyNewTransaction({
            type: 'expense',
            category: 'Belanja Stok Parfum',
            amount: batchData.totalModalBelanja,
            walletId: sourceWalletId,
            description: `Restock ${batchData.qtyReceived} botol ${batchData.brand} - ${batchData.variant} via ${sourceWallet.name}`
          });

          // Sinkronisasi Google Spreadsheet
          googleSheetService.appendTransaction({
            type: 'expense',
            category: 'Belanja Stok Parfum',
            amount: batchData.totalModalBelanja,
            walletId: sourceWalletId,
            description: `Restock ${batchData.qtyReceived}x ${batchData.brand}-${batchData.variant} (${batchData.batchCode})`,
            date: batchData.dateRestocked
          });
        }
      }

      notificationService.success(
        `Batch ${batchData.batchCode} (${batchData.qtyReceived} botol) berhasil ditambahkan!`,
        'Restock Parfum Berhasil'
      );
      return { success: true, id };
    } catch (err) {
      notificationService.error(err.message, 'Gagal Restock');
      return { success: false, error: err.message };
    }
  };

  const recordParfumSale = async (saleData) => {
    try {
      const result = await _recordSale(saleData);
      if (!result.success) {
        notificationService.error(result.error, 'Gagal Catat Penjualan');
        return result;
      }

      // Masukkan uang full yang dibayar pembeli (Omzet) ke dompet yang dipilih (misal: DANA)
      const targetWalletId = saleData.destinationWalletId || 'dana';
      const targetWallet = await db.wallets.get(targetWalletId);
      const incomingAmount = result.omzet;

      if (targetWallet) {
        const newBalance = (targetWallet.balance || 0) + incomingAmount;
        await db.wallets.update(targetWalletId, {
          balance: newBalance,
          updatedAt: new Date().toISOString()
        });

        // Catat transaksi pendapatan di dompet tersebut (misal DANA)
        const txId = `parfum-sale-${Date.now()}`;
        await db.transactions.add({
          id: txId,
          type: 'income',
          walletId: targetWalletId,
          category: 'Penjualan Parfum',
          description: `Penjualan ${saleData.qtySold} botol ${saleData.brand} - ${saleData.variant} (Untung: Rp ${result.labaBersih.toLocaleString('id-ID')})`,
          amount: incomingAmount,
          date: saleData.dateSold || new Date().toISOString()
        });
      }

      notificationService.success(
        `+${incomingAmount.toLocaleString('id-ID')} masuk ke ${targetWallet?.name || 'DANA'} | Untung: Rp ${result.labaBersih.toLocaleString('id-ID')}`,
        'Penjualan Dicatat!'
      );

      // WA notification
      waNotificationService.notifyNewTransaction({
        type: 'income',
        category: 'Penjualan Parfum',
        amount: incomingAmount,
        walletId: targetWalletId,
        description: `${saleData.qtySold} botol ${saleData.brand} - ${saleData.variant} via ${targetWallet?.name || 'DANA'} | Untung: Rp ${result.labaBersih.toLocaleString('id-ID')}`
      });

      // Google Sheet sync
      googleSheetService.appendTransaction({
        type: 'income',
        category: 'Penjualan Parfum',
        amount: incomingAmount,
        walletId: targetWalletId,
        description: `${saleData.qtySold}x ${saleData.brand}-${saleData.variant} via ${targetWallet?.name || 'DANA'} (Untung Rp ${result.labaBersih.toLocaleString('id-ID')})`,
        date: saleData.dateSold
      });

      return result;
    } catch (err) {
      notificationService.error(err.message, 'Gagal Catat Penjualan');
      return { success: false, error: err.message };
    }
  };

  const deleteParfumSale = async (saleId) => {
    try {
      const result = await _deleteSale(saleId);
      if (!result.success) {
        notificationService.error(result.error, 'Gagal Hapus Transaksi');
        return result;
      }

      // Tarik kembali uang omzet dari dompet penerima (misal DANA)
      if (result.destinationWalletId && result.omzet) {
        const targetWallet = await db.wallets.get(result.destinationWalletId);
        if (targetWallet) {
          await db.wallets.update(result.destinationWalletId, {
            balance: Math.max(0, (targetWallet.balance || 0) - result.omzet),
            updatedAt: new Date().toISOString()
          });
        }
      }

      notificationService.success('Transaksi dihapus, saldo & stok telah dikembalikan.', 'Rollback Berhasil');
      return result;
    } catch (err) {
      notificationService.error(err.message, 'Gagal Hapus Transaksi');
      return { success: false, error: err.message };
    }
  };

  const getParfumDashboard = async () => _getDashboardStats();
  const getParfumVariants = async () => _getAllVariants();

  // Refresh Gold Price
  const refreshGoldPrice = async () => {
    setGoldMarketInfo(prev => ({ ...prev, isUpdating: true }));
    const result = await fetchLiveGoldPrice();
    setGoldMarketInfo({
      price: result.price,
      buyback: result.buyback,
      fluctuation: result.fluctuation,
      source: result.source,
      sourceName: result.sourceName,
      lastUpdated: result.timestamp,
      history: result.history,
      isUpdating: false
    });
    return result;
  };

  // Reset to clean 0 balance
  const resetToFactoryDefaults = async () => {
    try {
      await db.transaction('rw', [db.wallets, db.goals, db.transactions, db.settings], async () => {
        await db.wallets.clear();
        await db.goals.clear();
        await db.transactions.clear();
        await db.settings.clear();

        await db.wallets.bulkAdd(INITIAL_WALLETS);
        if (INITIAL_GOAL) await db.goals.add(INITIAL_GOAL);
        if (INITIAL_TRANSACTIONS && INITIAL_TRANSACTIONS.length > 0) {
          await db.transactions.bulkAdd(INITIAL_TRANSACTIONS);
        }
        await db.settings.bulkAdd([
          { key: 'theme', value: 'lavender' },
          { key: 'lastMarketSync', value: new Date().toISOString() },
          { key: 'goldPricePerGram', value: 1300000 },
          { key: 'studentName', value: 'Andra Syahdan Daud' },
          { key: 'user_profile_name', value: 'Andra Syahdan Daud' },
          { key: 'isOfflineFirst', value: true },
          { key: 'cleared_to_zero_v2', value: true }
        ]);
      });
      notificationService.success('Seluruh saldo & data berhasil direset ke 0', 'Reset Selesai');
      return { success: true };
    } catch (err) {
      notificationService.error(err.message, 'Gagal Reset');
      return { success: false };
    }
  };

  const value = {
    isDbReady,
    wallets,
    walletMap,
    transactions,
    goals: calculatedGoals,
    primaryGoal,
    goldMarketInfo,
    totalNetWorth,
    totalInvestedCapital,
    totalCapitalGain,
    investmentGainPercent,
    executeWeeklyAllowance,
    createNewWallet,
    updateWallet,
    deleteWallet,
    recordParfumProfit,
    syncMarketRevaluation,
    transferBetweenWallets,
    addTransaction,
    addNewSavingGoal,
    depositToGoal,
    deleteSavingGoal,
    updateSavingGoal,
    refreshGoldPrice,
    resetToFactoryDefaults,
    // Parfum FIFO
    parfumBatches,
    parfumSalesLive,
    addParfumRestock,
    recordParfumSale,
    deleteParfumSale,
    getParfumDashboard,
    getParfumVariants
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
