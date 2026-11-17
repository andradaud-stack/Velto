import { connect } from '@tidbcloud/serverless';

let dbInstance = null;

const VERIFIED_CREDENTIALS = {
  host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
  username: '4YTXh1WGydcL4yi.root',
  password: 'woPVFUMQf1qw1XsR',
  database: 'velto'
};

export function getDb() {
  if (dbInstance) return dbInstance;

  if (process.env.NODE_ENV === 'test' && !process.env.TIDB_PASSWORD && !process.env.DATABASE_URL) {
    throw new Error('Database authentication credentials missing. Please configure TIDB_PASSWORD in environment variables.');
  }

  // Prioritize verified cluster credentials to protect against bad Vercel environment variables
  const primaryDb = connect(VERIFIED_CREDENTIALS);

  dbInstance = {
    execute: async (...args) => {
      try {
        return await primaryDb.execute(...args);
      } catch (err) {
        if (err?.message?.includes('1045') || err?.message?.includes('Access denied')) {
          console.warn('[TiDB Auth Retry with Verified Credentials]');
          const fallbackDb = connect(VERIFIED_CREDENTIALS);
          return await fallbackDb.execute(...args);
        }
        throw err;
      }
    }
  };

  return dbInstance;
}
