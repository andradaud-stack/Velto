import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { getDb } from '../_db.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '104560933562-fq59domirr6lj1dee565l92d7a7ib86b.apps.googleusercontent.com';
const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'andrasyahdand@gmail.com').toLowerCase();
const JWT_SECRET = process.env.JWT_SECRET || 'velto_super_secure_jwt_secret_key_2026';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { idToken, accessToken } = req.body || {};
  if (!idToken && !accessToken) {
    return res.status(400).json({ error: 'Missing idToken or accessToken' });
  }

  try {
    let payload = null;

    if (accessToken) {
      // Verify via Google UserInfo endpoint
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!userRes.ok) {
        throw new Error('Failed to fetch userinfo with access token');
      }
      payload = await userRes.json();
    } else if (idToken) {
      // Verify token with Google Library or tokeninfo
      try {
        const ticket = await client.verifyIdToken({
          idToken,
          audience: GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
      } catch (tokenErr) {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        if (!verifyRes.ok) {
          throw new Error('Google token verification failed');
        }
        payload = await verifyRes.json();
      }
    }

    if (!payload || !payload.email) {
      throw new Error('Invalid user payload from Google');
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || payload.given_name || 'User';
    const avatarUrl = payload.picture || null;
    const isOwner = email === OWNER_EMAIL;
    const userId = isOwner ? 'owner_andra' : `user_${payload.sub}`;

    const db = getDb();

    // 1. Upsert user record in TiDB
    await db.execute(`
      INSERT INTO users (id, email, name, avatar_url, role)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        avatar_url = VALUES(avatar_url),
        role = VALUES(role),
        updated_at = CURRENT_TIMESTAMP
    `, [userId, email, isOwner ? 'Andra Syahdan Daud' : name, avatarUrl, isOwner ? 'owner' : 'user']);

    // 2. Multi-tenancy Isolation:
    // If OWNER: Bind/Seed complete pre-existing wallets and settings
    if (isOwner) {
      const existingWallets = await db.execute(`
        SELECT COUNT(*) as count FROM wallets WHERE user_id = ?
      `, [userId]);

      const count = Number(existingWallets.rows?.[0]?.count || 0);

      if (count === 0) {
        // Seed authentic owner wallets
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
          `, w);
        }

        // Settings for owner
        await db.execute(`
          INSERT INTO settings (user_id, setting_key, setting_value)
          VALUES (?, 'studentName', 'Andra Syahdan Daud'),
                 (?, 'user_profile_name', 'Andra Syahdan Daud')
          ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        `, [userId, userId]);
      }
    } else {
      // Normal / Other users: They get a clean, fresh, empty state (0 balance, 0 transactions, 0 goals)
    }

    // 3. Issue secure JWT token
    const token = jwt.sign(
      {
        id: userId,
        email,
        name: isOwner ? 'Andra Syahdan Daud' : name,
        avatarUrl,
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
        email,
        name: isOwner ? 'Andra Syahdan Daud' : name,
        avatarUrl,
        role: isOwner ? 'owner' : 'user'
      }
    });
  } catch (error) {
    console.error('[Google Auth Error]', error);
    return res.status(500).json({ error: error.message || 'Authentication failed' });
  }
}
