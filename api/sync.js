import { getDb } from './_db.js';
import { verifyToken } from './_auth.js';

function authenticateRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

export default async function handler(req, res) {
  const user = authenticateRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = user.id;

  try {
    const db = getDb();

    // GET: Fetch all data for this specific user
    if (req.method === 'GET') {
      // Auto-correct any leftover hardcoded seed balances to Rp 0 for owner & unify legacy user_id
      if (userId === 'owner_andra') {
        try {
          await db.execute("UPDATE wallets SET user_id = 'owner_andra' WHERE user_id = 'andra'");
          await db.execute("UPDATE transactions SET user_id = 'owner_andra' WHERE user_id = 'andra'");
          await db.execute("UPDATE goals SET user_id = 'owner_andra' WHERE user_id = 'andra'");

          const jagoCheck = await db.execute("SELECT balance FROM wallets WHERE user_id = ? AND id = 'jago' LIMIT 1", [userId]);
          const jagoRows = Array.isArray(jagoCheck) ? jagoCheck : (jagoCheck?.rows || []);
          if (Number(jagoRows[0]?.balance || 0) === 400000) {
            await db.execute("UPDATE wallets SET balance = 0, invested_capital = 0, gold_grams = 0 WHERE user_id = ?", [userId]);
            await db.execute("DELETE FROM transactions WHERE user_id = ? AND (id LIKE '%init%' OR title LIKE '%Saldo Awal%')", [userId]);
          }
        } catch (e) {
          console.warn('[Auto-reset check warning]', e);
        }
      }

      const [
        walletsRes,
        txRes,
        goalsRes,
        batchesRes,
        salesRes,
        settingsRes
      ] = await Promise.all([
        db.execute('SELECT * FROM wallets WHERE user_id = ? ORDER BY created_at ASC', [userId]),
        db.execute('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 500', [userId]),
        db.execute('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC', [userId]),
        db.execute('SELECT * FROM parfum_batches WHERE user_id = ? ORDER BY created_at DESC', [userId]),
        db.execute('SELECT * FROM parfum_sales WHERE user_id = ? ORDER BY created_at DESC', [userId]),
        db.execute('SELECT * FROM settings WHERE user_id = ?', [userId])
      ]);

      const getRows = (r) => (Array.isArray(r) ? r : (r?.rows || []));

      const formattedWallets = getRows(walletsRes).map(w => ({
        id: w.id,
        name: w.name,
        type: w.type,
        balance: Number(w.balance || 0),
        investedCapital: Number(w.invested_capital || 0),
        goldGrams: Number(w.gold_grams || 0),
        photoUrl: w.photo_url,
        color: w.color,
        userId: w.user_id
      }));

      const formattedTx = getRows(txRes).map(t => ({
        id: t.id,
        title: t.title,
        amount: Number(t.amount || 0),
        type: t.type,
        category: t.category,
        walletId: t.wallet_id,
        destinationWalletId: t.destination_wallet_id,
        details: t.details,
        date: t.date,
        userId: t.user_id
      }));

      const formattedGoals = getRows(goalsRes).map(g => ({
        id: g.id,
        title: g.title,
        targetAmount: Number(g.target_amount || 0),
        currentSaved: Number(g.current_saved || 0),
        deadline: g.deadline,
        description: g.description,
        connectedWalletIds: typeof g.connected_wallet_ids === 'string' ? JSON.parse(g.connected_wallet_ids || '[]') : (g.connected_wallet_ids || []),
        image: g.image,
        lastDepositDate: g.last_deposit_date,
        userId: g.user_id
      }));

      const formattedBatches = getRows(batchesRes).map(b => ({
        id: b.id,
        batchCode: b.batch_code,
        brand: b.brand,
        variant: b.variant,
        qtyReceived: Number(b.qty_received || 0),
        qtyRemaining: Number(b.qty_remaining || 0),
        costPerBottle: Number(b.cost_per_bottle || 0),
        restockDate: b.restock_date,
        status: b.status,
        userId: b.user_id
      }));

      const formattedSales = getRows(salesRes).map(s => ({
        id: s.id,
        brand: s.brand,
        variant: s.variant,
        qtySold: Number(s.qty_sold || 0),
        sellingPrice: Number(s.selling_price || 0),
        cogs: Number(s.cogs || 0),
        profit: Number(s.profit || 0),
        destinationWalletId: s.destination_wallet_id,
        saleDate: s.sale_date,
        userId: s.user_id
      }));

      const settingsMap = {};
      getRows(settingsRes).forEach(st => {
        settingsMap[st.setting_key] = st.setting_value;
      });

      return res.status(200).json({
        success: true,
        data: {
          wallets: formattedWallets,
          transactions: formattedTx,
          goals: formattedGoals,
          parfumBatches: formattedBatches,
          parfumSales: formattedSales,
          settings: settingsMap
        }
      });
    }

    // POST: Save or batch sync mutations
    if (req.method === 'POST') {
      const { type, action, item, items } = req.body;

      // Reset all cards to clean Rp 0 balance
      if (action === 'reset_to_zero') {
        await db.execute("UPDATE wallets SET balance = 0, invested_capital = 0, gold_grams = 0 WHERE user_id = ?", [userId]);
        await db.execute("DELETE FROM transactions WHERE user_id = ?", [userId]);
        return res.status(200).json({ success: true, message: 'All wallets reset to Rp 0' });
      }

      // Batch Sync (Full push from active device)
      if (action === 'batch_sync' && items) {
        const { wallets = [], transactions = [], goals = [] } = items;

        for (const w of wallets) {
          await db.execute(`
            INSERT INTO wallets (id, user_id, name, type, balance, invested_capital, gold_grams, photo_url, color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              name = VALUES(name),
              type = VALUES(type),
              balance = VALUES(balance),
              invested_capital = VALUES(invested_capital),
              gold_grams = VALUES(gold_grams),
              photo_url = VALUES(photo_url),
              color = VALUES(color),
              updated_at = CURRENT_TIMESTAMP
          `, [
            w.id,
            userId,
            w.name,
            w.type || 'bank',
            w.balance || 0,
            w.investedCapital || 0,
            w.goldGrams || 0,
            w.photoUrl || null,
            w.color || null
          ]);
        }

        for (const t of transactions) {
          await db.execute(`
            INSERT INTO transactions (id, user_id, title, amount, type, category, wallet_id, destination_wallet_id, details, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              title = VALUES(title),
              amount = VALUES(amount),
              type = VALUES(type),
              category = VALUES(category),
              wallet_id = VALUES(wallet_id),
              destination_wallet_id = VALUES(destination_wallet_id),
              details = VALUES(details),
              date = VALUES(date)
          `, [
            t.id,
            userId,
            t.title,
            t.amount || 0,
            t.type,
            t.category || null,
            t.walletId || null,
            t.destinationWalletId || null,
            t.details || null,
            t.date || new Date().toISOString()
          ]);
        }

        return res.status(200).json({ success: true, message: 'Batch synced' });
      }

      if (type === 'wallet') {
        if (action === 'save' || action === 'update') {
          await db.execute(`
            INSERT INTO wallets (id, user_id, name, type, balance, invested_capital, gold_grams, photo_url, color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              name = VALUES(name),
              type = VALUES(type),
              balance = VALUES(balance),
              invested_capital = VALUES(invested_capital),
              gold_grams = VALUES(gold_grams),
              photo_url = VALUES(photo_url),
              color = VALUES(color),
              updated_at = CURRENT_TIMESTAMP
          `, [
            item.id,
            userId,
            item.name,
            item.type || 'bank',
            item.balance || 0,
            item.investedCapital || 0,
            item.goldGrams || 0,
            item.photoUrl || null,
            item.color || null
          ]);
        } else if (action === 'delete') {
          await db.execute('DELETE FROM wallets WHERE id = ? AND user_id = ?', [item.id, userId]);
        }
      }

      if (type === 'transaction') {
        if (action === 'add' || action === 'save') {
          await db.execute(`
            INSERT INTO transactions (id, user_id, title, amount, type, category, wallet_id, destination_wallet_id, details, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              title = VALUES(title),
              amount = VALUES(amount),
              type = VALUES(type),
              category = VALUES(category),
              wallet_id = VALUES(wallet_id),
              destination_wallet_id = VALUES(destination_wallet_id),
              details = VALUES(details),
              date = VALUES(date)
          `, [
            item.id,
            userId,
            item.title,
            item.amount || 0,
            item.type,
            item.category || null,
            item.walletId || null,
            item.destinationWalletId || null,
            item.details || null,
            item.date || new Date().toISOString()
          ]);
        } else if (action === 'delete') {
          await db.execute('DELETE FROM transactions WHERE id = ? AND user_id = ?', [item.id, userId]);
        }
      }

      if (type === 'goal') {
        if (action === 'save' || action === 'add') {
          await db.execute(`
            INSERT INTO goals (id, user_id, title, target_amount, current_saved, deadline, description, connected_wallet_ids, image, last_deposit_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              title = VALUES(title),
              target_amount = VALUES(target_amount),
              current_saved = VALUES(current_saved),
              deadline = VALUES(deadline),
              description = VALUES(description),
              connected_wallet_ids = VALUES(connected_wallet_ids),
              image = VALUES(image),
              last_deposit_date = VALUES(last_deposit_date)
          `, [
            item.id,
            userId,
            item.title,
            item.targetAmount || 0,
            item.currentSaved || 0,
            item.deadline || null,
            item.description || null,
            JSON.stringify(item.connectedWalletIds || []),
            item.image || null,
            item.lastDepositDate || null
          ]);
        } else if (action === 'delete') {
          await db.execute('DELETE FROM goals WHERE id = ? AND user_id = ?', [item.id, userId]);
        }
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[Sync Error]', error?.message || 'Sync operation failed');
    return res.status(500).json({ error: 'Sinkronisasi data gagal. Silakan coba kembali.' });
  }
}
