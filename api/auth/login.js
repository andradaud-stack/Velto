import jwt from 'jsonwebtoken';
import { getDb } from '../_db.js';

const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'andrasyahdand@gmail.com').toLowerCase();
const JWT_SECRET = process.env.JWT_SECRET || 'velto_super_secure_jwt_secret_key_2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, fullName, isRegister } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'Email wajib diisi' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const isOwner = normalizedEmail === OWNER_EMAIL;
  const userId = isOwner ? 'owner_andra' : `user_${Buffer.from(normalizedEmail).toString('hex').slice(0, 16)}`;
  const userName = isOwner ? 'Andra Syahdan Daud' : (fullName || normalizedEmail.split('@')[0]);

  try {
    const db = getDb();

    // 1. Upsert / Pastikan record user ada di TiDB
    await db.execute(`
      INSERT INTO users (id, email, name, role)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = COALESCE(VALUES(name), name),
        role = VALUES(role),
        updated_at = CURRENT_TIMESTAMP
    `, [userId, normalizedEmail, userName, isOwner ? 'owner' : 'user']);

    // 2. Jika Owner dan wallets belum ada, lakukan initial seed
    if (isOwner) {
      const existingWallets = await db.execute(`
        SELECT COUNT(*) as count FROM wallets WHERE user_id = ?
      `, [userId]);

      const count = Number(
        Array.isArray(existingWallets)
          ? existingWallets[0]?.count
          : (existingWallets?.rows?.[0]?.count || 0)
      );

      if (count === 0) {
        const ownerWallets = [
          ['jago', userId, 'Jago Syariah', 'bank', 400000, 0, 0, null, null],
          ['mandiri', userId, 'Mandiri Debit Gold', 'bank', 1000, 0, 0, null, null],
          ['dana', userId, 'DANA', 'ewallet', 0, 0, 0, null, null],
          ['emas', userId, 'DANA eMAS', 'investment', 0, 0, 0, null, null],
          ['bibit', userId, 'Investasi Bibit', 'investment', 10000, 10000, 0, null, null],
          ['cash', userId, 'Uang Cash', 'liquid', 450000, 0, 0, null, null],
          ['parfum', userId, 'Laba Bisnis Parfum', 'business', 0, 0, 0, null, null]
        ];

        for (const w of ownerWallets) {
          await db.execute(`
            INSERT INTO wallets (id, user_id, name, type, balance, invested_capital, gold_grams, photo_url, color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              name = VALUES(name),
              type = VALUES(type),
              balance = VALUES(balance)
          `, w);
        }

        await db.execute(`
          INSERT INTO settings (user_id, setting_key, setting_value)
          VALUES (?, 'studentName', 'Andra Syahdan Daud'),
                 (?, 'user_profile_name', 'Andra Syahdan Daud')
          ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        `, [userId, userId]);
      }
    }

    // 3. Issue JWT Token (30 hari aktif)
    const token = jwt.sign(
      {
        id: userId,
        email: normalizedEmail,
        name: isOwner ? 'Andra Syahdan Daud' : userName,
        role: isOwner ? 'owner' : 'user'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: userId,
        email: normalizedEmail,
        name: isOwner ? 'Andra Syahdan Daud' : userName,
        role: isOwner ? 'owner' : 'user'
      }
    });
  } catch (err) {
    console.error('[Login API Error]', err);
    return res.status(500).json({ error: err.message || 'Login gagal pada database TiDB.' });
  }
}
