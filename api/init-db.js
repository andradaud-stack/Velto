import { getDb } from './_db.js';

export default async function handler(req, res) {
  try {
    const db = getDb();

    // 1. Users
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(191) NOT NULL UNIQUE,
        name VARCHAR(191),
        avatar_url TEXT,
        role ENUM('owner', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 2. Wallets
    await db.execute(`
      CREATE TABLE IF NOT EXISTS wallets (
        id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64) NOT NULL,
        name VARCHAR(191) NOT NULL,
        type VARCHAR(64) NOT NULL,
        balance DECIMAL(15, 2) DEFAULT 0,
        invested_capital DECIMAL(15, 2) DEFAULT 0,
        gold_grams DECIMAL(10, 4) DEFAULT 0,
        photo_url TEXT,
        color VARCHAR(64),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, id),
        INDEX idx_wallets_user (user_id)
      )
    `);

    // 3. Transactions
    await db.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        type VARCHAR(32) NOT NULL,
        category VARCHAR(64),
        wallet_id VARCHAR(64),
        destination_wallet_id VARCHAR(64),
        details TEXT,
        date VARCHAR(64) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, id),
        INDEX idx_tx_user_date (user_id, date)
      )
    `);

    // 4. Goals
    await db.execute(`
      CREATE TABLE IF NOT EXISTS goals (
        id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64) NOT NULL,
        title VARCHAR(191) NOT NULL,
        target_amount DECIMAL(15, 2) NOT NULL,
        current_saved DECIMAL(15, 2) DEFAULT 0,
        deadline VARCHAR(64),
        description TEXT,
        connected_wallet_ids JSON,
        image TEXT,
        last_deposit_date VARCHAR(64),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, id),
        INDEX idx_goals_user (user_id)
      )
    `);

    // 5. Parfum Batches
    await db.execute(`
      CREATE TABLE IF NOT EXISTS parfum_batches (
        id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64) NOT NULL,
        batch_code VARCHAR(64) NOT NULL,
        brand VARCHAR(128) NOT NULL,
        variant VARCHAR(128) NOT NULL,
        qty_received INT NOT NULL,
        qty_remaining INT NOT NULL,
        cost_per_bottle DECIMAL(15, 2) NOT NULL,
        restock_date VARCHAR(64),
        status VARCHAR(32) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, id),
        INDEX idx_parfum_batches_user (user_id)
      )
    `);

    // 6. Parfum Sales
    await db.execute(`
      CREATE TABLE IF NOT EXISTS parfum_sales (
        id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64) NOT NULL,
        brand VARCHAR(128) NOT NULL,
        variant VARCHAR(128) NOT NULL,
        qty_sold INT NOT NULL,
        selling_price DECIMAL(15, 2) NOT NULL,
        cogs DECIMAL(15, 2) NOT NULL,
        profit DECIMAL(15, 2) NOT NULL,
        destination_wallet_id VARCHAR(64),
        sale_date VARCHAR(64),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, id),
        INDEX idx_parfum_sales_user (user_id)
      )
    `);

    // 7. Settings
    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        user_id VARCHAR(64) NOT NULL,
        setting_key VARCHAR(128) NOT NULL,
        setting_value TEXT,
        PRIMARY KEY (user_id, setting_key)
      )
    `);

    return res.status(200).json({
      success: true,
      message: 'TiDB database tables successfully initialized for Velto Finance multi-tenancy.'
    });
  } catch (error) {
    console.error('[TiDB Init Error]', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
